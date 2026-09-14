CREATE TABLE IF NOT EXISTS public.admin_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_audit_events_created_at_idx
  ON public.admin_audit_events (created_at DESC);

CREATE OR REPLACE FUNCTION public.capture_admin_audit_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.admin_audit_events(actor_id, action, table_name, record_id, before_data, after_data)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE((to_jsonb(NEW)->>'id'), (to_jsonb(OLD)->>'id'), (to_jsonb(NEW)->>'slug'), (to_jsonb(OLD)->>'slug')),
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS product_settings_audit_trigger ON public.product_settings;
CREATE TRIGGER product_settings_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.product_settings
  FOR EACH ROW EXECUTE FUNCTION public.capture_admin_audit_event();

DROP TRIGGER IF EXISTS integration_settings_audit_trigger ON public.integration_settings;
CREATE TRIGGER integration_settings_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.integration_settings
  FOR EACH ROW EXECUTE FUNCTION public.capture_admin_audit_event();

DROP TRIGGER IF EXISTS legal_documents_audit_trigger ON public.legal_documents;
CREATE TRIGGER legal_documents_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.legal_documents
  FOR EACH ROW EXECUTE FUNCTION public.capture_admin_audit_event();

REVOKE ALL ON public.admin_audit_events FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.admin_audit_events TO service_role;
