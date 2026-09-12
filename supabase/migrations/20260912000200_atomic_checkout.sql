-- Atomic, server-authoritative checkout.
-- This RPC remains unusable while markets.settings.checkout_enabled/providers_ready are false.

CREATE SEQUENCE public.commerce_order_number_seq AS bigint START WITH 100001;
REVOKE ALL ON SEQUENCE public.commerce_order_number_seq FROM PUBLIC, anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.commerce_order_number_seq TO service_role;

CREATE OR REPLACE FUNCTION public.create_commerce_checkout(
  p_market_code text,
  p_user_id uuid,
  p_customer_email text,
  p_customer_phone text,
  p_billing_address jsonb,
  p_shipping_address jsonb,
  p_items jsonb,
  p_terms_version text,
  p_privacy_version text,
  p_idempotency_key text,
  p_customer_note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_market public.markets%ROWTYPE;
  v_request_hash text;
  v_existing public.idempotency_records%ROWTYPE;
  v_order_id uuid;
  v_order_number text;
  v_subtotal bigint;
  v_item_count integer;
  v_input_count integer;
  v_valid_count integer;
  v_warehouse_id uuid;
  v_reservation_id uuid;
  v_reservation_expires_at timestamptz := now() + interval '20 minutes';
  v_line record;
  v_response jsonb;
BEGIN
  IF p_idempotency_key IS NULL OR char_length(p_idempotency_key) < 16
    OR char_length(p_idempotency_key) > 200 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVALID_IDEMPOTENCY_KEY';
  END IF;
  IF p_customer_email IS NULL OR char_length(p_customer_email) > 320
    OR p_customer_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVALID_CUSTOMER_EMAIL';
  END IF;
  IF p_customer_phone IS NULL OR char_length(p_customer_phone) NOT BETWEEN 7 AND 24 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVALID_CUSTOMER_PHONE';
  END IF;
  IF jsonb_typeof(p_billing_address) <> 'object'
    OR jsonb_typeof(p_shipping_address) <> 'object' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVALID_ADDRESS';
  END IF;
  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) NOT BETWEEN 1 AND 50 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVALID_CART';
  END IF;
  IF coalesce(char_length(p_terms_version), 0) = 0
    OR coalesce(char_length(p_privacy_version), 0) = 0 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'CONSENT_VERSION_REQUIRED';
  END IF;
  IF p_customer_note IS NOT NULL AND char_length(p_customer_note) > 1000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'CUSTOMER_NOTE_TOO_LONG';
  END IF;

  SELECT * INTO v_market FROM public.markets
  WHERE code = upper(p_market_code) AND enabled
  FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'MARKET_NOT_AVAILABLE';
  END IF;
  IF coalesce((v_market.settings->>'checkout_enabled')::boolean, false) IS NOT TRUE
    OR coalesce((v_market.settings->>'providers_ready')::boolean, false) IS NOT TRUE THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'CHECKOUT_NOT_READY';
  END IF;

  v_request_hash := md5(
    v_market.id::text || '|' || coalesce(p_user_id::text, '') || '|' || lower(p_customer_email)
    || '|' || p_customer_phone || '|' || p_billing_address::text || '|'
    || p_shipping_address::text || '|' || p_items::text || '|' || p_terms_version || '|'
    || p_privacy_version || '|' || coalesce(p_customer_note, '')
  );

  INSERT INTO public.idempotency_records (
    scope, idempotency_key, request_hash, locked_until, expires_at
  ) VALUES (
    'checkout:' || v_market.code,
    p_idempotency_key,
    v_request_hash,
    now() + interval '2 minutes',
    now() + interval '48 hours'
  )
  ON CONFLICT (scope, idempotency_key) DO NOTHING;

  IF NOT FOUND THEN
    SELECT * INTO v_existing
    FROM public.idempotency_records
    WHERE scope = 'checkout:' || v_market.code
      AND idempotency_key = p_idempotency_key
    FOR UPDATE;

    IF v_existing.request_hash <> v_request_hash THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'IDEMPOTENCY_KEY_REUSED';
    END IF;
    IF v_existing.response_body IS NOT NULL THEN
      RETURN v_existing.response_body;
    END IF;
    RAISE EXCEPTION USING ERRCODE = '55P03', MESSAGE = 'CHECKOUT_ALREADY_PROCESSING';
  END IF;

  WITH parsed AS (
    SELECT (item->>'variantId')::uuid AS variant_id, (item->>'quantity')::integer AS quantity
    FROM jsonb_array_elements(p_items) AS item
  )
  SELECT count(*), coalesce(sum(quantity), 0)
  INTO v_input_count, v_item_count
  FROM parsed
  WHERE quantity BETWEEN 1 AND 100;

  IF v_input_count <> jsonb_array_length(p_items) OR v_item_count > 500 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVALID_ITEM_QUANTITY';
  END IF;

  WITH parsed AS (
    SELECT (item->>'variantId')::uuid AS variant_id, (item->>'quantity')::integer AS quantity
    FROM jsonb_array_elements(p_items) AS item
  )
  SELECT count(*) INTO v_valid_count
  FROM parsed
  GROUP BY variant_id
  HAVING count(*) > 1
  LIMIT 1;
  IF coalesce(v_valid_count, 0) > 0 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'DUPLICATE_CART_ITEM';
  END IF;

  WITH parsed AS (
    SELECT (item->>'variantId')::uuid AS variant_id, (item->>'quantity')::integer AS quantity
    FROM jsonb_array_elements(p_items) AS item
  ), resolved AS (
    SELECT p.variant_id, p.quantity, ml.unit_price_minor
    FROM parsed p
    JOIN public.catalog_variants cv ON cv.id = p.variant_id AND cv.active
    JOIN public.catalog_products cp ON cp.id = cv.product_id AND cp.status = 'active'
    JOIN public.market_listings ml ON ml.variant_id = cv.id
      AND ml.market_id = v_market.id
      AND ml.locale = v_market.default_locale
      AND ml.currency_code = v_market.currency_code
      AND ml.sale_enabled
      AND ml.published_at IS NOT NULL
      AND ml.published_at <= now()
  )
  SELECT count(*), coalesce(sum(unit_price_minor * quantity), 0)
  INTO v_valid_count, v_subtotal
  FROM resolved;

  IF v_valid_count <> v_input_count OR v_subtotal <= 0 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'PRODUCT_NOT_AVAILABLE';
  END IF;

  SELECT id INTO v_warehouse_id
  FROM public.warehouses
  WHERE market_id = v_market.id AND active
  ORDER BY code
  LIMIT 1;
  IF v_warehouse_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'WAREHOUSE_NOT_CONFIGURED';
  END IF;

  v_order_id := gen_random_uuid();
  v_order_number := 'DL-' || v_market.code || '-' || to_char(now(), 'YYYY') || '-'
    || lpad(nextval('public.commerce_order_number_seq')::text, 8, '0');

  INSERT INTO public.commerce_orders (
    id, market_id, user_id, order_number, status, currency_code,
    customer_email, customer_phone, billing_address, shipping_address,
    subtotal_minor, discount_minor, tax_minor, shipping_minor, grand_total_minor,
    terms_version, privacy_version, customer_note, placed_at
  ) VALUES (
    v_order_id, v_market.id, p_user_id, v_order_number, 'awaiting_payment', v_market.currency_code,
    lower(p_customer_email), p_customer_phone, p_billing_address, p_shipping_address,
    v_subtotal, 0, 0, 0, v_subtotal,
    p_terms_version, p_privacy_version, p_customer_note, now()
  );

  FOR v_line IN
    WITH parsed AS (
      SELECT (item->>'variantId')::uuid AS variant_id, (item->>'quantity')::integer AS quantity
      FROM jsonb_array_elements(p_items) AS item
    )
    SELECT p.variant_id, p.quantity, cv.sku, ml.name, ml.unit_price_minor,
      cp.slug, cv.weight_grams, ml.tax_category
    FROM parsed p
    JOIN public.catalog_variants cv ON cv.id = p.variant_id
    JOIN public.catalog_products cp ON cp.id = cv.product_id
    JOIN public.market_listings ml ON ml.variant_id = cv.id
      AND ml.market_id = v_market.id AND ml.locale = v_market.default_locale
    ORDER BY cv.sku
  LOOP
    UPDATE public.inventory_balances
    SET reserved = reserved + v_line.quantity,
        version = version + 1,
        updated_at = now()
    WHERE warehouse_id = v_warehouse_id
      AND variant_id = v_line.variant_id
      AND on_hand - reserved >= v_line.quantity;
    IF NOT FOUND THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'INSUFFICIENT_STOCK';
    END IF;

    INSERT INTO public.commerce_order_items (
      order_id, variant_id, sku, product_name, quantity, unit_price_minor,
      discount_minor, tax_minor, line_total_minor, snapshot
    ) VALUES (
      v_order_id, v_line.variant_id, v_line.sku, v_line.name, v_line.quantity,
      v_line.unit_price_minor, 0, 0, v_line.unit_price_minor * v_line.quantity,
      jsonb_build_object(
        'productSlug', v_line.slug,
        'weightGrams', v_line.weight_grams,
        'taxCategory', v_line.tax_category,
        'locale', v_market.default_locale
      )
    );

    INSERT INTO public.inventory_reservations (
      order_id, warehouse_id, variant_id, quantity, status, expires_at
    ) VALUES (
      v_order_id, v_warehouse_id, v_line.variant_id, v_line.quantity,
      'active', v_reservation_expires_at
    ) RETURNING id INTO v_reservation_id;

    INSERT INTO public.inventory_ledger (
      warehouse_id, variant_id, event_type, quantity_delta, reservation_id, order_id, reason
    ) VALUES (
      v_warehouse_id, v_line.variant_id, 'reservation', -v_line.quantity,
      v_reservation_id, v_order_id, 'checkout'
    );
  END LOOP;

  INSERT INTO public.order_status_history (
    order_id, from_status, to_status, reason, actor_type, actor_id
  ) VALUES (
    v_order_id, NULL, 'awaiting_payment', 'checkout_created',
    'customer', p_user_id
  );

  INSERT INTO public.outbox_events (aggregate_type, aggregate_id, event_type, payload)
  VALUES ('order', v_order_id, 'order.created', jsonb_build_object(
    'orderId', v_order_id,
    'orderNumber', v_order_number,
    'market', v_market.code
  ));

  v_response := jsonb_build_object(
    'orderId', v_order_id,
    'orderNumber', v_order_number,
    'status', 'awaiting_payment',
    'currency', v_market.currency_code,
    'subtotalMinor', v_subtotal,
    'discountMinor', 0,
    'taxMinor', 0,
    'shippingMinor', 0,
    'grandTotalMinor', v_subtotal,
    'itemCount', v_item_count,
    'reservationExpiresAt', v_reservation_expires_at
  );

  UPDATE public.idempotency_records
  SET response_status = 201,
      response_body = v_response,
      resource_id = v_order_id,
      locked_until = NULL,
      updated_at = now()
  WHERE scope = 'checkout:' || v_market.code AND idempotency_key = p_idempotency_key;

  RETURN v_response;
END;
$$;

REVOKE ALL ON FUNCTION public.create_commerce_checkout(
  text, uuid, text, text, jsonb, jsonb, jsonb, text, text, text, text
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_commerce_checkout(
  text, uuid, text, text, jsonb, jsonb, jsonb, text, text, text, text
) TO service_role;

-- Called by a trusted scheduled worker. SKIP LOCKED lets multiple workers cooperate safely.
CREATE OR REPLACE FUNCTION public.release_expired_inventory_reservations(p_limit integer DEFAULT 500)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_reservation record;
  v_order record;
  v_released integer := 0;
BEGIN
  IF p_limit NOT BETWEEN 1 AND 5000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVALID_RELEASE_LIMIT';
  END IF;

  FOR v_reservation IN
    SELECT id, order_id, warehouse_id, variant_id, quantity
    FROM public.inventory_reservations
    WHERE status = 'active' AND expires_at <= now()
    ORDER BY expires_at
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  LOOP
    UPDATE public.inventory_balances
    SET reserved = reserved - v_reservation.quantity,
        version = version + 1,
        updated_at = now()
    WHERE warehouse_id = v_reservation.warehouse_id
      AND variant_id = v_reservation.variant_id
      AND reserved >= v_reservation.quantity;
    IF NOT FOUND THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'INVENTORY_BALANCE_INCONSISTENT';
    END IF;

    UPDATE public.inventory_reservations
    SET status = 'expired', updated_at = now()
    WHERE id = v_reservation.id AND status = 'active';

    INSERT INTO public.inventory_ledger (
      warehouse_id, variant_id, event_type, quantity_delta, reservation_id, order_id, reason
    ) VALUES (
      v_reservation.warehouse_id, v_reservation.variant_id, 'reservation_release',
      v_reservation.quantity, v_reservation.id, v_reservation.order_id, 'payment_timeout'
    );

    v_released := v_released + 1;
  END LOOP;

  FOR v_order IN
    SELECT orders.id, orders.status
    FROM public.commerce_orders AS orders
    WHERE orders.status IN ('awaiting_payment', 'payment_processing')
      AND EXISTS (
        SELECT 1 FROM public.inventory_reservations AS reservations
        WHERE reservations.order_id = orders.id AND reservations.status = 'expired'
      )
      AND NOT EXISTS (
        SELECT 1 FROM public.inventory_reservations AS reservations
        WHERE reservations.order_id = orders.id AND reservations.status = 'active'
      )
    FOR UPDATE SKIP LOCKED
  LOOP
    UPDATE public.commerce_orders
    SET status = 'cancelled', updated_at = now()
    WHERE id = v_order.id;

    INSERT INTO public.order_status_history (
      order_id, from_status, to_status, reason, actor_type
    ) VALUES (
      v_order.id, v_order.status, 'cancelled', 'payment_timeout', 'system'
    );

    INSERT INTO public.outbox_events (aggregate_type, aggregate_id, event_type, payload)
    VALUES (
      'order', v_order.id, 'order.cancelled',
      jsonb_build_object('orderId', v_order.id, 'reason', 'payment_timeout')
    );
  END LOOP;

  RETURN v_released;
END;
$$;

REVOKE ALL ON FUNCTION public.release_expired_inventory_reservations(integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.release_expired_inventory_reservations(integer) TO service_role;
