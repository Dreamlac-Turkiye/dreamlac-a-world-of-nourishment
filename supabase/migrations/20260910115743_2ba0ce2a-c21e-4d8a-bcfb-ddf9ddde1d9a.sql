CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can read own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.product_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  price_kurus integer,
  weight text,
  ingredients text[] NOT NULL DEFAULT '{}',
  stock text NOT NULL DEFAULT 'pending',
  direct_sale_enabled boolean NOT NULL DEFAULT false,
  admin_note text,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_settings_price_positive CHECK (price_kurus IS NULL OR price_kurus >= 0),
  CONSTRAINT product_settings_stock_valid CHECK (stock IN ('in_stock', 'out_of_stock', 'pending'))
);

GRANT SELECT ON public.product_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_settings TO authenticated;
GRANT ALL ON public.product_settings TO service_role;
ALTER TABLE public.product_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product settings are publicly readable"
ON public.product_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can insert product settings"
ON public.product_settings FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product settings"
ON public.product_settings FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product settings"
ON public.product_settings FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER product_settings_set_updated_at
BEFORE UPDATE ON public.product_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.product_settings (slug, stock, direct_sale_enabled)
VALUES ('dreamlac-1', 'pending', false),
       ('dreamlac-2', 'pending', false),
       ('dreamlac-3', 'pending', false);