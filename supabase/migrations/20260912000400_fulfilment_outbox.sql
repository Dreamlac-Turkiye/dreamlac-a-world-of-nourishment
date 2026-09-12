-- Reliable fulfilment, invoicing, notification and outbox worker primitives.

ALTER TABLE public.outbox_events ADD COLUMN locked_by text;

ALTER TABLE public.shipments ADD COLUMN idempotency_key text;
UPDATE public.shipments SET idempotency_key = id::text WHERE idempotency_key IS NULL;
ALTER TABLE public.shipments ALTER COLUMN idempotency_key SET NOT NULL;
ALTER TABLE public.shipments ADD CONSTRAINT shipments_order_idempotency_unique
  UNIQUE (order_id, idempotency_key);

CREATE TABLE public.notification_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.commerce_orders(id) ON DELETE RESTRICT,
  channel text NOT NULL CHECK (channel IN ('email', 'sms')),
  template_key text NOT NULL,
  recipient_hash text NOT NULL,
  provider text NOT NULL,
  provider_reference text,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'failed', 'dead')),
  idempotency_key text NOT NULL,
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  UNIQUE (channel, idempotency_key)
);
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.notification_deliveries TO service_role;
CREATE INDEX notification_deliveries_status_idx
  ON public.notification_deliveries (status, created_at) WHERE status IN ('queued', 'failed');
CREATE TRIGGER notification_deliveries_set_updated_at
  BEFORE UPDATE ON public.notification_deliveries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.request_order_fulfilment(
  p_order_id uuid, p_provider text, p_service_code text,
  p_idempotency_key text, p_actor_id uuid
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_order public.commerce_orders%ROWTYPE;
  v_shipment public.shipments%ROWTYPE;
BEGIN
  IF coalesce(char_length(p_provider), 0) NOT BETWEEN 2 AND 50
    OR coalesce(char_length(p_service_code), 0) NOT BETWEEN 1 AND 100
    OR coalesce(char_length(p_idempotency_key), 0) NOT BETWEEN 16 AND 200 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVALID_FULFILMENT_REQUEST';
  END IF;
  SELECT * INTO v_order FROM public.commerce_orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND OR v_order.status NOT IN ('paid', 'fulfilment_pending') THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'ORDER_NOT_READY_FOR_FULFILMENT';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.payment_attempts
    WHERE order_id = v_order.id AND status IN ('captured', 'partially_refunded')
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'CAPTURED_PAYMENT_REQUIRED';
  END IF;

  INSERT INTO public.shipments (order_id, provider, service_code, status, idempotency_key)
  VALUES (v_order.id, p_provider, p_service_code, 'pending', p_idempotency_key)
  ON CONFLICT (order_id, idempotency_key) DO UPDATE
    SET idempotency_key = EXCLUDED.idempotency_key
  RETURNING * INTO v_shipment;
  IF v_shipment.provider <> p_provider OR v_shipment.service_code <> p_service_code THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'FULFILMENT_IDEMPOTENCY_CONFLICT';
  END IF;

  IF v_order.status = 'paid' THEN
    UPDATE public.commerce_orders SET status = 'fulfilment_pending', updated_at = now()
    WHERE id = v_order.id;
    INSERT INTO public.order_status_history (order_id, from_status, to_status, reason, actor_type, actor_id)
    VALUES (v_order.id, 'paid', 'fulfilment_pending', 'fulfilment_requested', 'admin', p_actor_id);
  END IF;
  INSERT INTO public.outbox_events (aggregate_type, aggregate_id, event_type, payload)
  SELECT 'shipment', v_shipment.id, 'shipment.requested', jsonb_build_object(
    'shipmentId', v_shipment.id, 'orderId', v_order.id, 'orderNumber', v_order.order_number,
    'provider', p_provider, 'serviceCode', p_service_code
  ) WHERE NOT EXISTS (
    SELECT 1 FROM public.outbox_events WHERE aggregate_type = 'shipment'
      AND aggregate_id = v_shipment.id AND event_type = 'shipment.requested'
  );
  INSERT INTO public.audit_events (market_id, actor_id, actor_type, action, resource_type, resource_id)
  VALUES (v_order.market_id, p_actor_id, 'admin', 'shipment.requested', 'shipment', v_shipment.id::text);
  RETURN jsonb_build_object('shipmentId', v_shipment.id, 'status', v_shipment.status,
    'orderNumber', v_order.order_number);
END;
$$;
REVOKE ALL ON FUNCTION public.request_order_fulfilment(uuid,text,text,text,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.request_order_fulfilment(uuid,text,text,text,uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.request_order_invoice(
  p_order_id uuid, p_provider text, p_actor_id uuid
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_order public.commerce_orders%ROWTYPE; v_invoice public.invoices%ROWTYPE;
BEGIN
  SELECT * INTO v_order FROM public.commerce_orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND OR v_order.status NOT IN ('paid','fulfilment_pending','fulfilled') THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'ORDER_NOT_INVOICEABLE';
  END IF;
  INSERT INTO public.invoices (order_id, provider, status)
  VALUES (v_order.id, p_provider, 'queued')
  ON CONFLICT (order_id) DO UPDATE SET order_id = EXCLUDED.order_id
  RETURNING * INTO v_invoice;
  IF v_invoice.provider <> p_provider THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVOICE_PROVIDER_CONFLICT';
  END IF;
  INSERT INTO public.outbox_events (aggregate_type, aggregate_id, event_type, payload)
  SELECT 'invoice', v_invoice.id, 'invoice.requested', jsonb_build_object(
    'invoiceId', v_invoice.id, 'orderId', v_order.id, 'orderNumber', v_order.order_number,
    'provider', p_provider, 'amountMinor', v_order.grand_total_minor, 'currency', v_order.currency_code
  ) WHERE NOT EXISTS (
    SELECT 1 FROM public.outbox_events WHERE aggregate_type = 'invoice'
      AND aggregate_id = v_invoice.id AND event_type = 'invoice.requested'
  );
  INSERT INTO public.audit_events (market_id, actor_id, actor_type, action, resource_type, resource_id)
  VALUES (v_order.market_id, p_actor_id, 'admin', 'invoice.requested', 'invoice', v_invoice.id::text);
  RETURN jsonb_build_object('invoiceId', v_invoice.id, 'status', v_invoice.status,
    'orderNumber', v_order.order_number);
END;
$$;
REVOKE ALL ON FUNCTION public.request_order_invoice(uuid,text,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.request_order_invoice(uuid,text,uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.claim_outbox_events(
  p_worker_id text, p_limit integer DEFAULT 50, p_lease_seconds integer DEFAULT 60
)
RETURNS SETOF public.outbox_events
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF coalesce(char_length(p_worker_id), 0) NOT BETWEEN 3 AND 100
    OR p_limit NOT BETWEEN 1 AND 500 OR p_lease_seconds NOT BETWEEN 10 AND 600 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVALID_OUTBOX_CLAIM';
  END IF;
  RETURN QUERY
  WITH candidates AS (
    SELECT id FROM public.outbox_events
    WHERE (status IN ('pending','failed') AND available_at <= now())
       OR (status = 'processing' AND locked_at < now() - make_interval(secs => p_lease_seconds))
    ORDER BY available_at, created_at LIMIT p_limit FOR UPDATE SKIP LOCKED
  )
  UPDATE public.outbox_events AS events
  SET status = 'processing', locked_at = now(), attempt_count = attempt_count + 1,
      last_error = NULL, locked_by = p_worker_id
  FROM candidates WHERE events.id = candidates.id RETURNING events.*;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_outbox_events(text,integer,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_outbox_events(text,integer,integer) TO service_role;

CREATE OR REPLACE FUNCTION public.finish_outbox_event(
  p_event_id uuid, p_worker_id text, p_success boolean, p_error text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.outbox_events
  SET status = CASE WHEN p_success THEN 'sent'
      WHEN attempt_count >= 10 THEN 'dead' ELSE 'failed' END,
      processed_at = CASE WHEN p_success THEN now() ELSE NULL END,
      available_at = CASE WHEN p_success THEN available_at
        ELSE now() + make_interval(secs => least(3600, (power(2, least(attempt_count, 10)) * 5)::integer)) END,
      locked_at = NULL, locked_by = NULL,
      last_error = CASE WHEN p_success THEN NULL ELSE left(coalesce(p_error, 'UNKNOWN'), 2000) END
  WHERE id = p_event_id AND status = 'processing' AND locked_by = p_worker_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'OUTBOX_LEASE_NOT_OWNED';
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.finish_outbox_event(uuid,text,boolean,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finish_outbox_event(uuid,text,boolean,text) TO service_role;

CREATE INDEX outbox_events_processing_lease_idx ON public.outbox_events (locked_at)
  WHERE status = 'processing';
