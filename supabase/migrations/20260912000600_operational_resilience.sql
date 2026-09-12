-- Abuse protection and operational recovery primitives.

CREATE TABLE public.rate_limit_buckets (
  scope text NOT NULL,
  subject_hash text NOT NULL,
  window_started_at timestamptz NOT NULL,
  request_count integer NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  expires_at timestamptz NOT NULL,
  PRIMARY KEY (scope, subject_hash, window_started_at)
);
ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.rate_limit_buckets TO service_role;
CREATE INDEX rate_limit_buckets_expiry_idx ON public.rate_limit_buckets (expires_at);

CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_scope text, p_subject_hash text, p_limit integer, p_window_seconds integer
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_window timestamptz; v_count integer;
BEGIN
  IF p_scope !~ '^[a-z0-9_.:-]{2,80}$'
    OR p_subject_hash !~ '^[a-f0-9]{64}$'
    OR p_limit NOT BETWEEN 1 AND 10000
    OR p_window_seconds NOT BETWEEN 1 AND 86400 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVALID_RATE_LIMIT';
  END IF;
  v_window := to_timestamp(floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds);
  INSERT INTO public.rate_limit_buckets
    (scope, subject_hash, window_started_at, request_count, expires_at)
  VALUES (p_scope, p_subject_hash, v_window, 1, v_window + make_interval(secs => p_window_seconds * 2))
  ON CONFLICT (scope, subject_hash, window_started_at)
  DO UPDATE SET request_count = public.rate_limit_buckets.request_count + 1
  RETURNING request_count INTO v_count;
  RETURN jsonb_build_object(
    'allowed', v_count <= p_limit,
    'remaining', greatest(0, p_limit - v_count),
    'retryAfterSeconds', greatest(1, ceil(extract(epoch FROM
      (v_window + make_interval(secs => p_window_seconds) - now())))::integer)
  );
END;
$$;
REVOKE ALL ON FUNCTION public.consume_rate_limit(text,text,integer,integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text,text,integer,integer) TO service_role;

CREATE OR REPLACE FUNCTION public.admin_operational_health(p_actor_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF NOT public.has_permission(p_actor_id, 'operations.read') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'FORBIDDEN';
  END IF;
  RETURN jsonb_build_object(
    'generatedAt', now(),
    'outbox', jsonb_build_object(
      'pending', (SELECT count(*) FROM public.outbox_events WHERE status = 'pending'),
      'failed', (SELECT count(*) FROM public.outbox_events WHERE status = 'failed'),
      'dead', (SELECT count(*) FROM public.outbox_events WHERE status = 'dead'),
      'oldestReadyAt', (SELECT min(available_at) FROM public.outbox_events
        WHERE status IN ('pending','failed'))
    ),
    'payments', jsonb_build_object(
      'pendingOver15m', (SELECT count(*) FROM public.payment_attempts
        WHERE status = 'pending' AND created_at < now() - interval '15 minutes'),
      'failed24h', (SELECT count(*) FROM public.payment_attempts
        WHERE status = 'failed' AND created_at >= now() - interval '24 hours')
    ),
    'webhooks', jsonb_build_object(
      'failed', (SELECT count(*) FROM public.webhook_events WHERE processing_status = 'failed'),
      'unprocessedOver5m', (SELECT count(*) FROM public.webhook_events
        WHERE processing_status = 'received' AND received_at < now() - interval '5 minutes')
    )
  );
END;
$$;
REVOKE ALL ON FUNCTION public.admin_operational_health(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_operational_health(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.admin_retry_outbox_event(p_actor_id uuid, p_event_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF NOT public.has_permission(p_actor_id, 'operations.read') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'FORBIDDEN';
  END IF;
  UPDATE public.outbox_events SET status = 'pending', available_at = now(),
    locked_at = NULL, locked_by = NULL, last_error = NULL
  WHERE id = p_event_id AND status IN ('failed','dead');
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'EVENT_NOT_RETRYABLE';
  END IF;
  INSERT INTO public.audit_events
    (actor_id, actor_type, action, resource_type, resource_id)
  VALUES (p_actor_id, 'admin', 'outbox.retry_requested', 'outbox_event', p_event_id::text);
END;
$$;
REVOKE ALL ON FUNCTION public.admin_retry_outbox_event(uuid,uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_retry_outbox_event(uuid,uuid) TO service_role;

