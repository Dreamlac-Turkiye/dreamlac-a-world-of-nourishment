CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE IF NOT EXISTS public.integration_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_key TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('cargo','payment','invoice','sms')),
  display_name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  mode TEXT NOT NULL DEFAULT 'test' CHECK (mode IN ('test','live')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  admin_note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.integration_settings TO authenticated;
GRANT ALL ON public.integration_settings TO service_role;

ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read integration settings" ON public.integration_settings;
CREATE POLICY "Admins can read integration settings" ON public.integration_settings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can insert integration settings" ON public.integration_settings;
CREATE POLICY "Admins can insert integration settings" ON public.integration_settings
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update integration settings" ON public.integration_settings;
CREATE POLICY "Admins can update integration settings" ON public.integration_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete integration settings" ON public.integration_settings;
CREATE POLICY "Admins can delete integration settings" ON public.integration_settings
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS integration_settings_set_updated_at ON public.integration_settings;
CREATE TRIGGER integration_settings_set_updated_at
  BEFORE UPDATE ON public.integration_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.shipment_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL,
  provider_key TEXT NOT NULL,
  tracking_number TEXT,
  status TEXT NOT NULL,
  status_detail TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS shipment_events_order_number_idx ON public.shipment_events (order_number);

GRANT SELECT ON public.shipment_events TO authenticated;
GRANT ALL ON public.shipment_events TO service_role;

ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read shipment events of their own orders" ON public.shipment_events;
CREATE POLICY "Users can read shipment events of their own orders" ON public.shipment_events
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.order_number = shipment_events.order_number AND o.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

INSERT INTO public.integration_settings (provider_key, category, display_name, sort_order) VALUES
  ('yurtici', 'cargo', 'Yurtiçi Kargo', 10),
  ('aras', 'cargo', 'Aras Kargo', 20),
  ('mng', 'cargo', 'MNG Kargo', 30),
  ('ptt', 'cargo', 'PTT Kargo', 40),
  ('hepsijet', 'cargo', 'Hepsijet', 50),
  ('iyzico', 'payment', 'iyzico', 10),
  ('paytr', 'payment', 'PayTR', 20),
  ('param', 'payment', 'Param', 30),
  ('parasut', 'invoice', 'Paraşüt (e-Fatura)', 10),
  ('uyumsoft', 'invoice', 'Uyumsoft (e-Fatura)', 20),
  ('netgsm', 'sms', 'Netgsm SMS', 10)
ON CONFLICT (provider_key) DO NOTHING;
