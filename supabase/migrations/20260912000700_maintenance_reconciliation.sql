-- Bounded maintenance and payment reconciliation scheduling.
CREATE OR REPLACE FUNCTION public.run_commerce_maintenance(
  p_rate_limit_batch integer DEFAULT 5000, p_idempotency_batch integer DEFAULT 1000
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_rate_limits integer; v_idempotency integer; v_reconciliation integer;
BEGIN
  IF p_rate_limit_batch NOT BETWEEN 1 AND 50000 OR p_idempotency_batch NOT BETWEEN 1 AND 10000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVALID_MAINTENANCE_BATCH';
  END IF;
  WITH victims AS (
    SELECT scope, subject_hash, window_started_at FROM public.rate_limit_buckets
    WHERE expires_at < now() ORDER BY expires_at LIMIT p_rate_limit_batch FOR UPDATE SKIP LOCKED
  )
  DELETE FROM public.rate_limit_buckets b USING victims v
  WHERE b.scope = v.scope AND b.subject_hash = v.subject_hash AND b.window_started_at = v.window_started_at;
  GET DIAGNOSTICS v_rate_limits = ROW_COUNT;
  WITH victims AS (
    SELECT scope, idempotency_key FROM public.idempotency_keys
    WHERE expires_at < now() ORDER BY expires_at LIMIT p_idempotency_batch FOR UPDATE SKIP LOCKED
  )
  DELETE FROM public.idempotency_keys i USING victims v
  WHERE i.scope = v.scope AND i.idempotency_key = v.idempotency_key;
  GET DIAGNOSTICS v_idempotency = ROW_COUNT;
  WITH candidates AS (
    SELECT p.id, p.order_id, p.provider, p.provider_reference FROM public.payment_attempts p
    WHERE p.status = 'pending' AND p.created_at < now() - interval '15 minutes'
      AND p.provider_reference IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.outbox_events e WHERE e.aggregate_type = 'payment_attempt'
          AND e.aggregate_id = p.id AND e.event_type = 'payment.reconciliation_requested'
          AND e.status IN ('pending','processing','sent')
      )
    ORDER BY p.created_at LIMIT 500 FOR UPDATE OF p SKIP LOCKED
  ), inserted AS (
    INSERT INTO public.outbox_events (aggregate_type, aggregate_id, event_type, payload)
    SELECT 'payment_attempt', id, 'payment.reconciliation_requested',
      jsonb_build_object('paymentAttemptId', id, 'orderId', order_id,
        'provider', provider, 'providerReference', provider_reference)
    FROM candidates RETURNING 1
  )
  SELECT count(*) INTO v_reconciliation FROM inserted;
  RETURN jsonb_build_object('expiredRateLimitsDeleted', v_rate_limits,
    'expiredIdempotencyKeysDeleted', v_idempotency,
    'paymentReconciliationsQueued', v_reconciliation);
END;
$$;
REVOKE ALL ON FUNCTION public.run_commerce_maintenance(integer,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.run_commerce_maintenance(integer,integer) TO service_role;
