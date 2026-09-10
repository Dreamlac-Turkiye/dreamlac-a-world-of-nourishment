CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  order_number text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'preview',
  full_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  city text NOT NULL,
  district text NOT NULL,
  address_line text NOT NULL,
  note text,
  shipping_option_id text NOT NULL,
  shipping_option_title text NOT NULL,
  payment_method_id text NOT NULL,
  payment_method_title text NOT NULL,
  subtotal_kurus integer,
  shipping_kurus integer,
  total_kurus integer,
  item_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own orders" ON public.orders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all orders" ON public.orders
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create own orders" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  product_slug text NOT NULL,
  product_name text NOT NULL,
  stage text,
  quantity integer NOT NULL,
  unit_price_kurus integer,
  line_total_kurus integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX orders_user_id_created_at_idx ON public.orders (user_id, created_at DESC);
CREATE INDEX order_items_order_id_idx ON public.order_items (order_id);

GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own order items" ON public.order_items
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
  );
CREATE POLICY "Admins can read all order items" ON public.order_items
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create own order items" ON public.order_items
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
  );