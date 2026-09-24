CREATE OR REPLACE FUNCTION public.defer_outbox_event(
  p_event_id uuid, p_worker_id text, p_reason text, p_retry_after_seconds integer DEFAULT 900
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_retry_after_seconds NOT BETWEEN 60 AND 86400 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVALID_OUTBOX_DEFER';
  END IF;
  UPDATE public.outbox_events
  SET status = 'pending',
      attempt_count = greatest(attempt_count - 1, 0),
      available_at = now() + make_interval(secs => p_retry_after_seconds),
      locked_at = NULL, locked_by = NULL, processed_at = NULL,
      last_error = left(coalesce(p_reason, 'DEFERRED'), 2000)
  WHERE id = p_event_id AND status = 'processing' AND locked_by = p_worker_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'OUTBOX_LEASE_NOT_OWNED';
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.defer_outbox_event(uuid,text,text,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.defer_outbox_event(uuid,text,text,integer) TO service_role;