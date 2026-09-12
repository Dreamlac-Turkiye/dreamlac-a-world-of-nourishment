-- Provider-neutral payment state machine and inventory settlement.

ALTER TABLE public.inventory_ledger
  ADD COLUMN on_hand_delta integer NOT NULL DEFAULT 0,
  ADD COLUMN reserved_delta integer NOT NULL DEFAULT 0;

ALTER TABLE public.inventory_ledger
  DROP CONSTRAINT IF EXISTS inventory_ledger_quantity_delta_check;
ALTER TABLE public.inventory_ledger
  ALTER COLUMN quantity_delta SET DEFAULT 0;
ALTER TABLE public.inventory_ledger
  ADD CONSTRAINT inventory_ledger_has_effect CHECK (
    quantity_delta <> 0 OR on_hand_delta <> 0 OR reserved_delta <> 0
  );

COMMENT ON COLUMN public.inventory_ledger.quantity_delta IS
  'Legacy available-to-promise delta. New reporting uses on_hand_delta and reserved_delta.';

CREATE OR REPLACE FUNCTION public.populate_inventory_ledger_deltas()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.on_hand_delta = 0 AND NEW.reserved_delta = 0 THEN
    IF NEW.event_type = 'reservation' THEN
      NEW.reserved_delta := abs(NEW.quantity_delta);
    ELSIF NEW.event_type = 'reservation_release' THEN
      NEW.reserved_delta := -abs(NEW.quantity_delta);
    ELSIF NEW.event_type IN ('receipt', 'return') THEN
      NEW.on_hand_delta := abs(NEW.quantity_delta);
    ELSIF NEW.event_type IN ('sale', 'damage') THEN
      NEW.on_hand_delta := -abs(NEW.quantity_delta);
    ELSIF NEW.event_type = 'adjustment' THEN
      NEW.on_hand_delta := NEW.quantity_delta;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER inventory_ledger_populate_deltas
BEFORE INSERT ON public.inventory_ledger
FOR EACH ROW EXECUTE FUNCTION public.populate_inventory_ledger_deltas();

REVOKE ALL ON FUNCTION public.populate_inventory_ledger_deltas() FROM PUBLIC, anon, authenticated;

UPDATE public.inventory_ledger
SET reserved_delta = CASE
  WHEN event_type = 'reservation' THEN abs(quantity_delta)
  WHEN event_type = 'reservation_release' THEN -abs(quantity_delta)
  ELSE reserved_delta
END,
on_hand_delta = CASE
  WHEN event_type IN ('receipt', 'return') THEN abs(quantity_delta)
  WHEN event_type IN ('sale', 'damage') THEN -abs(quantity_delta)
  WHEN event_type = 'adjustment' THEN quantity_delta
  ELSE on_hand_delta
END;

CREATE OR REPLACE FUNCTION public.create_payment_attempt(
  p_order_id uuid,
  p_provider text,
  p_idempotency_key text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order public.commerce_orders%ROWTYPE;
  v_attempt public.payment_attempts%ROWTYPE;
BEGIN
  IF p_provider IS NULL OR p_provider !~ '^[a-z0-9][a-z0-9_-]{1,49}$' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVALID_PAYMENT_PROVIDER';
  END IF;
  IF p_idempotency_key IS NULL OR char_length(p_idempotency_key) NOT BETWEEN 16 AND 200 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVALID_IDEMPOTENCY_KEY';
  END IF;

  SELECT * INTO v_order FROM public.commerce_orders
  WHERE id = p_order_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'ORDER_NOT_FOUND';
  END IF;
  IF v_order.status NOT IN ('awaiting_payment', 'payment_processing') THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'ORDER_NOT_PAYABLE';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.inventory_reservations
    WHERE order_id = v_order.id AND status = 'active' AND expires_at > now()
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'RESERVATION_EXPIRED';
  END IF;

  INSERT INTO public.payment_attempts (
    order_id, provider, status, amount_minor, currency_code, idempotency_key
  ) VALUES (
    v_order.id, p_provider, 'created', v_order.grand_total_minor,
    v_order.currency_code, p_idempotency_key
  )
  ON CONFLICT (provider, idempotency_key) DO UPDATE
    SET idempotency_key = EXCLUDED.idempotency_key
  RETURNING * INTO v_attempt;

  IF v_attempt.order_id <> v_order.id
    OR v_attempt.amount_minor <> v_order.grand_total_minor
    OR v_attempt.currency_code <> v_order.currency_code THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'PAYMENT_IDEMPOTENCY_CONFLICT';
  END IF;

  IF v_order.status = 'awaiting_payment' THEN
    UPDATE public.commerce_orders SET status = 'payment_processing', updated_at = now()
    WHERE id = v_order.id;
    INSERT INTO public.order_status_history (
      order_id, from_status, to_status, reason, actor_type
    ) VALUES (v_order.id, 'awaiting_payment', 'payment_processing', 'payment_started', 'system');
  END IF;

  RETURN jsonb_build_object(
    'attemptId', v_attempt.id,
    'orderId', v_order.id,
    'orderNumber', v_order.order_number,
    'provider', v_attempt.provider,
    'status', v_attempt.status,
    'amountMinor', v_attempt.amount_minor,
    'currency', v_attempt.currency_code,
    'customerEmail', v_order.customer_email
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_payment_attempt(uuid, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_payment_attempt(uuid, text, text) TO service_role;

CREATE OR REPLACE FUNCTION public.attach_payment_provider_reference(
  p_attempt_id uuid,
  p_provider_reference text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_provider_reference IS NULL OR char_length(p_provider_reference) NOT BETWEEN 1 AND 200 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVALID_PROVIDER_REFERENCE';
  END IF;
  UPDATE public.payment_attempts
  SET provider_reference = p_provider_reference, status = 'pending', updated_at = now()
  WHERE id = p_attempt_id
    AND status IN ('created', 'pending')
    AND (provider_reference IS NULL OR provider_reference = p_provider_reference);
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'PAYMENT_REFERENCE_CONFLICT';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.attach_payment_provider_reference(uuid, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.attach_payment_provider_reference(uuid, text) TO service_role;

CREATE OR REPLACE FUNCTION public.apply_verified_payment_event(
  p_provider text,
  p_provider_event_id text,
  p_provider_reference text,
  p_event_type text,
  p_payment_status text,
  p_amount_minor bigint,
  p_currency_code text,
  p_payload jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_event public.webhook_events%ROWTYPE;
  v_attempt public.payment_attempts%ROWTYPE;
  v_order public.commerce_orders%ROWTYPE;
  v_reservation record;
  v_target_order_status public.commerce_order_status;
BEGIN
  IF p_provider_event_id IS NULL OR char_length(p_provider_event_id) NOT BETWEEN 1 AND 200
    OR p_provider_reference IS NULL OR char_length(p_provider_reference) NOT BETWEEN 1 AND 200 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVALID_PROVIDER_EVENT';
  END IF;
  IF p_payment_status NOT IN ('authorized', 'captured', 'failed', 'cancelled') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'UNSUPPORTED_PAYMENT_STATUS';
  END IF;
  IF p_amount_minor <= 0 OR p_currency_code !~ '^[A-Z]{3}$'
    OR jsonb_typeof(p_payload) <> 'object' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVALID_PAYMENT_EVENT';
  END IF;

  INSERT INTO public.webhook_events (
    provider, provider_event_id, event_type, signature_valid, payload, processing_status,
    attempt_count
  ) VALUES (
    p_provider, p_provider_event_id, p_event_type, true, p_payload, 'processing', 1
  )
  ON CONFLICT (provider, provider_event_id) DO NOTHING;

  IF NOT FOUND THEN
    SELECT * INTO v_event FROM public.webhook_events
    WHERE provider = p_provider AND provider_event_id = p_provider_event_id;
    RETURN jsonb_build_object(
      'duplicate', true,
      'processingStatus', v_event.processing_status,
      'processedAt', v_event.processed_at
    );
  END IF;

  SELECT * INTO v_attempt FROM public.payment_attempts
  WHERE provider = p_provider AND provider_reference = p_provider_reference
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'PAYMENT_ATTEMPT_NOT_FOUND';
  END IF;

  SELECT * INTO v_order FROM public.commerce_orders
  WHERE id = v_attempt.order_id
  FOR UPDATE;

  IF v_attempt.amount_minor <> p_amount_minor OR v_attempt.currency_code <> p_currency_code
    OR v_order.grand_total_minor <> p_amount_minor OR v_order.currency_code <> p_currency_code THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'PAYMENT_AMOUNT_MISMATCH';
  END IF;

  -- A delayed event must never move a captured payment/order backwards or emit effects twice.
  IF v_attempt.status = 'captured' THEN
    UPDATE public.webhook_events
    SET processing_status = CASE WHEN p_payment_status = 'captured' THEN 'processed' ELSE 'ignored' END,
        processed_at = now()
    WHERE provider = p_provider AND provider_event_id = p_provider_event_id;
    RETURN jsonb_build_object(
      'duplicate', true,
      'orderId', v_order.id,
      'orderNumber', v_order.order_number,
      'orderStatus', v_order.status,
      'paymentStatus', v_attempt.status
    );
  END IF;

  IF p_payment_status = 'captured' THEN
    IF v_order.status NOT IN ('payment_processing', 'paid', 'fulfilment_pending') THEN
      RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'INVALID_CAPTURE_TRANSITION';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM public.inventory_reservations
      WHERE order_id = v_order.id AND status = 'active' AND expires_at > now()
    ) OR EXISTS (
      SELECT 1 FROM public.inventory_reservations
      WHERE order_id = v_order.id AND (status <> 'active' OR expires_at <= now())
    ) THEN
      RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'CAPTURE_AFTER_RESERVATION_EXPIRY';
    END IF;

    FOR v_reservation IN
        SELECT * FROM public.inventory_reservations
        WHERE order_id = v_order.id AND status = 'active'
        ORDER BY variant_id
        FOR UPDATE
      LOOP
        UPDATE public.inventory_balances
        SET on_hand = on_hand - v_reservation.quantity,
            reserved = reserved - v_reservation.quantity,
            version = version + 1,
            updated_at = now()
        WHERE warehouse_id = v_reservation.warehouse_id
          AND variant_id = v_reservation.variant_id
          AND on_hand >= v_reservation.quantity
          AND reserved >= v_reservation.quantity;
        IF NOT FOUND THEN
          RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'INVENTORY_SETTLEMENT_FAILED';
        END IF;

        UPDATE public.inventory_reservations
        SET status = 'consumed', updated_at = now()
        WHERE id = v_reservation.id;

        INSERT INTO public.inventory_ledger (
          warehouse_id, variant_id, event_type, quantity_delta, on_hand_delta,
          reserved_delta, reservation_id, order_id, reason
        ) VALUES (
          v_reservation.warehouse_id, v_reservation.variant_id, 'sale', 0,
          -v_reservation.quantity, -v_reservation.quantity,
          v_reservation.id, v_order.id, 'payment_captured'
        );
    END LOOP;

    UPDATE public.payment_attempts SET status = 'captured', updated_at = now()
    WHERE id = v_attempt.id;
    v_target_order_status := 'paid';
  ELSIF p_payment_status = 'authorized' THEN
    UPDATE public.payment_attempts SET status = 'authorized', updated_at = now()
    WHERE id = v_attempt.id AND status IN ('created', 'pending', 'requires_action', 'authorized');
    v_target_order_status := 'payment_processing';
  ELSE
    UPDATE public.payment_attempts
    SET status = p_payment_status::public.commerce_payment_status, updated_at = now()
    WHERE id = v_attempt.id AND status <> 'captured';
    IF v_attempt.status = 'captured' THEN
      RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'CAPTURE_CANNOT_BE_REVERSED_BY_FAILURE';
    END IF;

    FOR v_reservation IN
      SELECT * FROM public.inventory_reservations
      WHERE order_id = v_order.id AND status = 'active'
      ORDER BY variant_id
      FOR UPDATE
    LOOP
      UPDATE public.inventory_balances
      SET reserved = reserved - v_reservation.quantity,
          version = version + 1,
          updated_at = now()
      WHERE warehouse_id = v_reservation.warehouse_id
        AND variant_id = v_reservation.variant_id
        AND reserved >= v_reservation.quantity;
      IF NOT FOUND THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'INVENTORY_RELEASE_FAILED';
      END IF;
      UPDATE public.inventory_reservations SET status = 'released', updated_at = now()
      WHERE id = v_reservation.id;
      INSERT INTO public.inventory_ledger (
        warehouse_id, variant_id, event_type, quantity_delta, on_hand_delta,
        reserved_delta, reservation_id, order_id, reason
      ) VALUES (
        v_reservation.warehouse_id, v_reservation.variant_id, 'reservation_release',
        v_reservation.quantity, 0, -v_reservation.quantity,
        v_reservation.id, v_order.id, 'payment_' || p_payment_status
      );
    END LOOP;
    v_target_order_status := CASE WHEN p_payment_status = 'cancelled' THEN 'cancelled' ELSE 'failed' END;
  END IF;

  IF v_order.status <> v_target_order_status THEN
    UPDATE public.commerce_orders SET status = v_target_order_status, updated_at = now()
    WHERE id = v_order.id;
    INSERT INTO public.order_status_history (
      order_id, from_status, to_status, reason, actor_type, metadata
    ) VALUES (
      v_order.id, v_order.status, v_target_order_status,
      'payment_' || p_payment_status, 'provider',
      jsonb_build_object('provider', p_provider, 'providerEventId', p_provider_event_id)
    );
  END IF;

  INSERT INTO public.outbox_events (aggregate_type, aggregate_id, event_type, payload)
  VALUES (
    'payment', v_attempt.id, 'payment.' || p_payment_status,
    jsonb_build_object(
      'orderId', v_order.order_number,
      'provider', p_provider,
      'providerReference', p_provider_reference
    )
  );

  UPDATE public.webhook_events
  SET processing_status = 'processed', processed_at = now()
  WHERE provider = p_provider AND provider_event_id = p_provider_event_id;

  RETURN jsonb_build_object(
    'duplicate', false,
    'orderId', v_order.id,
    'orderNumber', v_order.order_number,
    'orderStatus', v_target_order_status,
    'paymentStatus', p_payment_status
  );
END;
$$;

REVOKE ALL ON FUNCTION public.apply_verified_payment_event(
  text, text, text, text, text, bigint, text, jsonb
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_verified_payment_event(
  text, text, text, text, text, bigint, text, jsonb
) TO service_role;

CREATE INDEX payment_attempts_reconciliation_idx
  ON public.payment_attempts (status, updated_at)
  WHERE status IN ('pending', 'authorized', 'failed');

ALTER TABLE public.refunds ADD COLUMN idempotency_key text;
UPDATE public.refunds SET idempotency_key = id::text WHERE idempotency_key IS NULL;
ALTER TABLE public.refunds ALTER COLUMN idempotency_key SET NOT NULL;
ALTER TABLE public.refunds
  ADD CONSTRAINT refunds_attempt_idempotency_unique UNIQUE (payment_attempt_id, idempotency_key);

CREATE OR REPLACE FUNCTION public.request_payment_refund(
  p_order_id uuid,
  p_amount_minor bigint,
  p_reason text,
  p_idempotency_key text,
  p_actor_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_attempt public.payment_attempts%ROWTYPE;
  v_refund public.refunds%ROWTYPE;
  v_committed_refunds bigint;
  v_refund_created boolean := false;
BEGIN
  IF p_amount_minor <= 0 OR coalesce(char_length(p_reason), 0) NOT BETWEEN 3 AND 500
    OR coalesce(char_length(p_idempotency_key), 0) NOT BETWEEN 16 AND 200 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVALID_REFUND_REQUEST';
  END IF;

  SELECT attempts.* INTO v_attempt
  FROM public.payment_attempts AS attempts
  WHERE attempts.order_id = p_order_id
    AND attempts.status IN ('captured', 'partially_refunded', 'refunded')
  ORDER BY attempts.created_at DESC
  LIMIT 1
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'CAPTURED_PAYMENT_NOT_FOUND';
  END IF;

  SELECT * INTO v_refund FROM public.refunds
  WHERE payment_attempt_id = v_attempt.id AND idempotency_key = p_idempotency_key;
  IF FOUND THEN
    IF v_refund.amount_minor <> p_amount_minor OR v_refund.reason <> p_reason THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'REFUND_IDEMPOTENCY_CONFLICT';
    END IF;
    RETURN jsonb_build_object(
      'refundId', v_refund.id,
      'paymentAttemptId', v_attempt.id,
      'status', v_refund.status,
      'amountMinor', v_refund.amount_minor,
      'currency', v_attempt.currency_code
    );
  END IF;

  SELECT coalesce(sum(amount_minor), 0) INTO v_committed_refunds
  FROM public.refunds
  WHERE payment_attempt_id = v_attempt.id AND status IN ('pending', 'succeeded');

  IF p_amount_minor > v_attempt.amount_minor - v_committed_refunds THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'REFUND_EXCEEDS_REMAINING_AMOUNT';
  END IF;

  INSERT INTO public.refunds (
    payment_attempt_id, amount_minor, reason, status, idempotency_key
  ) VALUES (
    v_attempt.id, p_amount_minor, p_reason, 'pending', p_idempotency_key
  )
  ON CONFLICT (payment_attempt_id, idempotency_key) DO NOTHING
  RETURNING * INTO v_refund;

  IF FOUND THEN
    v_refund_created := true;
  ELSE
    SELECT * INTO v_refund FROM public.refunds
    WHERE payment_attempt_id = v_attempt.id AND idempotency_key = p_idempotency_key;
  END IF;

  IF v_refund.amount_minor <> p_amount_minor OR v_refund.reason <> p_reason THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'REFUND_IDEMPOTENCY_CONFLICT';
  END IF;

  IF v_refund_created THEN
    INSERT INTO public.outbox_events (aggregate_type, aggregate_id, event_type, payload)
    VALUES ('refund', v_refund.id, 'refund.requested', jsonb_build_object(
      'refundId', v_refund.id,
      'orderId', p_order_id,
      'paymentAttemptId', v_attempt.id,
      'provider', v_attempt.provider,
      'amountMinor', v_refund.amount_minor,
      'currency', v_attempt.currency_code
    ));

    INSERT INTO public.audit_events (
      actor_id, actor_type, action, resource_type, resource_id, metadata
    ) VALUES (
      p_actor_id, CASE WHEN p_actor_id IS NULL THEN 'system' ELSE 'admin' END,
      'refund.requested', 'refund', v_refund.id::text,
      jsonb_build_object('orderId', p_order_id, 'amountMinor', p_amount_minor)
    );
  END IF;

  RETURN jsonb_build_object(
    'refundId', v_refund.id,
    'paymentAttemptId', v_attempt.id,
    'status', v_refund.status,
    'amountMinor', v_refund.amount_minor,
    'currency', v_attempt.currency_code
  );
END;
$$;

REVOKE ALL ON FUNCTION public.request_payment_refund(uuid, bigint, text, text, uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.request_payment_refund(uuid, bigint, text, text, uuid)
  TO service_role;
