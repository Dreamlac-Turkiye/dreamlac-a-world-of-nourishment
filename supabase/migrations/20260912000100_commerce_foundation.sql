-- Dreamlac multi-market commerce foundation.
-- Additive only: the legacy preview orders remain untouched until controlled data migration.

CREATE TYPE public.commerce_order_status AS ENUM (
  'draft', 'awaiting_payment', 'payment_processing', 'paid', 'fulfilment_pending',
  'fulfilled', 'cancelled', 'refunded', 'failed'
);
CREATE TYPE public.commerce_payment_status AS ENUM (
  'created', 'pending', 'requires_action', 'authorized', 'captured', 'failed',
  'cancelled', 'partially_refunded', 'refunded'
);
CREATE TYPE public.commerce_reservation_status AS ENUM ('active', 'consumed', 'released', 'expired');
CREATE TYPE public.commerce_shipment_status AS ENUM (
  'pending', 'ready', 'shipped', 'in_transit', 'delivered', 'exception', 'cancelled', 'returned'
);
CREATE TYPE public.commerce_invoice_status AS ENUM ('queued', 'issued', 'failed', 'cancelled', 'credited');

CREATE TABLE public.markets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE CHECK (code ~ '^[A-Z]{2}$'),
  name text NOT NULL,
  primary_domain text NOT NULL UNIQUE,
  default_locale text NOT NULL,
  currency_code text NOT NULL CHECK (currency_code ~ '^[A-Z]{3}$'),
  timezone text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(settings) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.legal_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid NOT NULL REFERENCES public.markets(id) ON DELETE RESTRICT,
  registered_name text NOT NULL,
  tax_identifier text,
  tax_office text,
  trade_registry_number text,
  mersis_number text,
  registered_address jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(registered_address) = 'object'),
  support_email text,
  support_phone text,
  active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (market_id, registered_name)
);

CREATE TABLE public.catalog_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL DEFAULT 'Dreamlac',
  slug text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  product_type text NOT NULL DEFAULT 'infant_formula',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.catalog_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.catalog_products(id) ON DELETE RESTRICT,
  sku text NOT NULL UNIQUE,
  barcode text UNIQUE,
  weight_grams integer NOT NULL CHECK (weight_grams > 0),
  attributes jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(attributes) = 'object'),
  active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.market_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid NOT NULL REFERENCES public.markets(id) ON DELETE RESTRICT,
  variant_id uuid NOT NULL REFERENCES public.catalog_variants(id) ON DELETE RESTRICT,
  locale text NOT NULL,
  name text NOT NULL,
  description text,
  currency_code text NOT NULL CHECK (currency_code ~ '^[A-Z]{3}$'),
  unit_price_minor bigint NOT NULL CHECK (unit_price_minor >= 0),
  compare_at_price_minor bigint CHECK (
    compare_at_price_minor IS NULL OR compare_at_price_minor >= unit_price_minor
  ),
  tax_category text NOT NULL,
  sale_enabled boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (market_id, variant_id, locale)
);

CREATE TABLE public.warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid NOT NULL REFERENCES public.markets(id) ON DELETE RESTRICT,
  code text NOT NULL,
  name text NOT NULL,
  address jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(address) = 'object'),
  active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (market_id, code)
);

CREATE TABLE public.inventory_balances (
  warehouse_id uuid NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  variant_id uuid NOT NULL REFERENCES public.catalog_variants(id) ON DELETE RESTRICT,
  on_hand integer NOT NULL DEFAULT 0 CHECK (on_hand >= 0),
  reserved integer NOT NULL DEFAULT 0 CHECK (reserved >= 0 AND reserved <= on_hand),
  version bigint NOT NULL DEFAULT 0 CHECK (version >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (warehouse_id, variant_id)
);

CREATE TABLE public.customer_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  default_market_id uuid REFERENCES public.markets(id) ON DELETE SET NULL,
  full_name text,
  phone text,
  locale text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.customer_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  market_id uuid NOT NULL REFERENCES public.markets(id) ON DELETE RESTRICT,
  label text,
  recipient_name text NOT NULL,
  phone text NOT NULL,
  address jsonb NOT NULL CHECK (jsonb_typeof(address) = 'object'),
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.commerce_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid NOT NULL REFERENCES public.markets(id) ON DELETE RESTRICT,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number text NOT NULL UNIQUE,
  status public.commerce_order_status NOT NULL DEFAULT 'draft',
  currency_code text NOT NULL CHECK (currency_code ~ '^[A-Z]{3}$'),
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  billing_address jsonb NOT NULL CHECK (jsonb_typeof(billing_address) = 'object'),
  shipping_address jsonb NOT NULL CHECK (jsonb_typeof(shipping_address) = 'object'),
  subtotal_minor bigint NOT NULL CHECK (subtotal_minor >= 0),
  discount_minor bigint NOT NULL DEFAULT 0 CHECK (discount_minor >= 0),
  tax_minor bigint NOT NULL DEFAULT 0 CHECK (tax_minor >= 0),
  shipping_minor bigint NOT NULL DEFAULT 0 CHECK (shipping_minor >= 0),
  grand_total_minor bigint NOT NULL CHECK (grand_total_minor >= 0),
  terms_version text NOT NULL,
  privacy_version text NOT NULL,
  customer_note text CHECK (char_length(customer_note) <= 1000),
  placed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (grand_total_minor = subtotal_minor - discount_minor + tax_minor + shipping_minor),
  CHECK (discount_minor <= subtotal_minor)
);

CREATE TABLE public.commerce_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.commerce_orders(id) ON DELETE RESTRICT,
  variant_id uuid NOT NULL REFERENCES public.catalog_variants(id) ON DELETE RESTRICT,
  sku text NOT NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price_minor bigint NOT NULL CHECK (unit_price_minor >= 0),
  discount_minor bigint NOT NULL DEFAULT 0 CHECK (discount_minor >= 0),
  tax_minor bigint NOT NULL DEFAULT 0 CHECK (tax_minor >= 0),
  line_total_minor bigint NOT NULL CHECK (line_total_minor >= 0),
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(snapshot) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (line_total_minor = unit_price_minor * quantity - discount_minor + tax_minor)
);

CREATE TABLE public.inventory_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.commerce_orders(id) ON DELETE RESTRICT,
  warehouse_id uuid NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  variant_id uuid NOT NULL REFERENCES public.catalog_variants(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  status public.commerce_reservation_status NOT NULL DEFAULT 'active',
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_id, warehouse_id, variant_id)
);

CREATE TABLE public.inventory_ledger (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  warehouse_id uuid NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  variant_id uuid NOT NULL REFERENCES public.catalog_variants(id) ON DELETE RESTRICT,
  event_type text NOT NULL CHECK (event_type IN (
    'receipt', 'adjustment', 'reservation', 'reservation_release', 'sale', 'return', 'damage'
  )),
  quantity_delta integer NOT NULL CHECK (quantity_delta <> 0),
  reservation_id uuid REFERENCES public.inventory_reservations(id) ON DELETE RESTRICT,
  order_id uuid REFERENCES public.commerce_orders(id) ON DELETE RESTRICT,
  reason text,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.payment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.commerce_orders(id) ON DELETE RESTRICT,
  provider text NOT NULL,
  provider_reference text,
  status public.commerce_payment_status NOT NULL DEFAULT 'created',
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  currency_code text NOT NULL CHECK (currency_code ~ '^[A-Z]{3}$'),
  idempotency_key text NOT NULL,
  failure_code text,
  failure_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, idempotency_key),
  UNIQUE NULLS NOT DISTINCT (provider, provider_reference)
);

CREATE TABLE public.refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_attempt_id uuid NOT NULL REFERENCES public.payment_attempts(id) ON DELETE RESTRICT,
  provider_reference text,
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.commerce_orders(id) ON DELETE RESTRICT,
  provider text NOT NULL,
  service_code text NOT NULL,
  provider_reference text,
  tracking_number text,
  status public.commerce_shipment_status NOT NULL DEFAULT 'pending',
  label_reference text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE NULLS NOT DISTINCT (provider, provider_reference)
);

CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.commerce_orders(id) ON DELETE RESTRICT,
  provider text NOT NULL,
  provider_reference text,
  status public.commerce_invoice_status NOT NULL DEFAULT 'queued',
  document_reference text,
  issued_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_id),
  UNIQUE NULLS NOT DISTINCT (provider, provider_reference)
);

CREATE TABLE public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  provider_event_id text NOT NULL,
  event_type text NOT NULL,
  signature_valid boolean NOT NULL DEFAULT false,
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  processing_status text NOT NULL DEFAULT 'received' CHECK (
    processing_status IN ('received', 'processing', 'processed', 'failed', 'ignored')
  ),
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  last_error text,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  UNIQUE (provider, provider_event_id)
);

CREATE TABLE public.idempotency_records (
  scope text NOT NULL,
  idempotency_key text NOT NULL,
  request_hash text NOT NULL,
  response_status integer,
  response_body jsonb,
  resource_id uuid,
  locked_until timestamptz,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (scope, idempotency_key)
);

CREATE TABLE public.outbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type text NOT NULL,
  aggregate_id uuid NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'dead')),
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  available_at timestamptz NOT NULL DEFAULT now(),
  locked_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

CREATE TABLE public.order_status_history (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.commerce_orders(id) ON DELETE RESTRICT,
  from_status public.commerce_order_status,
  to_status public.commerce_order_status NOT NULL,
  reason text,
  actor_type text NOT NULL CHECK (actor_type IN ('system', 'customer', 'admin', 'provider')),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  market_id uuid REFERENCES public.markets(id) ON DELETE RESTRICT,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_type text NOT NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  correlation_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX market_listings_market_published_idx
  ON public.market_listings (market_id, published_at DESC) WHERE sale_enabled;
CREATE INDEX inventory_reservations_expiry_idx
  ON public.inventory_reservations (expires_at) WHERE status = 'active';
CREATE INDEX commerce_orders_user_created_idx ON public.commerce_orders (user_id, created_at DESC);
CREATE INDEX commerce_orders_market_status_created_idx
  ON public.commerce_orders (market_id, status, created_at DESC);
CREATE INDEX commerce_order_items_order_idx ON public.commerce_order_items (order_id);
CREATE INDEX payment_attempts_order_idx ON public.payment_attempts (order_id, created_at DESC);
CREATE INDEX shipments_order_idx ON public.shipments (order_id);
CREATE INDEX webhook_events_processing_idx
  ON public.webhook_events (processing_status, received_at) WHERE processing_status IN ('received', 'failed');
CREATE INDEX outbox_events_available_idx
  ON public.outbox_events (available_at, created_at) WHERE status IN ('pending', 'failed');
CREATE INDEX order_status_history_order_idx ON public.order_status_history (order_id, created_at);
CREATE INDEX audit_events_resource_idx ON public.audit_events (resource_type, resource_id, created_at DESC);
CREATE TRIGGER markets_set_updated_at BEFORE UPDATE ON public.markets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER legal_entities_set_updated_at BEFORE UPDATE ON public.legal_entities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER catalog_products_set_updated_at BEFORE UPDATE ON public.catalog_products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER catalog_variants_set_updated_at BEFORE UPDATE ON public.catalog_variants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER market_listings_set_updated_at BEFORE UPDATE ON public.market_listings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER warehouses_set_updated_at BEFORE UPDATE ON public.warehouses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER customer_profiles_set_updated_at BEFORE UPDATE ON public.customer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER customer_addresses_set_updated_at BEFORE UPDATE ON public.customer_addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER commerce_orders_set_updated_at BEFORE UPDATE ON public.commerce_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER inventory_reservations_set_updated_at BEFORE UPDATE ON public.inventory_reservations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER payment_attempts_set_updated_at BEFORE UPDATE ON public.payment_attempts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER refunds_set_updated_at BEFORE UPDATE ON public.refunds
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER shipments_set_updated_at BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER invoices_set_updated_at BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER idempotency_records_set_updated_at BEFORE UPDATE ON public.idempotency_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.markets (
  code, name, primary_domain, default_locale, currency_code, timezone, enabled, settings
) VALUES (
  'TR', 'Türkiye', 'dreamlac.com.tr', 'tr-TR', 'TRY', 'Europe/Istanbul', true,
  '{"checkout_enabled": false, "providers_ready": false}'::jsonb
), (
  'SA', 'Saudi Arabia', 'dreamlac.com.sa', 'ar-SA', 'SAR', 'Asia/Riyadh', false,
  '{"checkout_enabled": false, "providers_ready": false}'::jsonb
);

-- RLS is enabled everywhere. Catalog/market data is selectively readable; authoritative writes
-- remain service-role only until dedicated, audited server RPCs are introduced.
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commerce_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commerce_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idempotency_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbox_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enabled markets are publicly readable" ON public.markets FOR SELECT
  USING (enabled);
CREATE POLICY "Active products are publicly readable" ON public.catalog_products FOR SELECT
  USING (status = 'active');
CREATE POLICY "Active variants are publicly readable" ON public.catalog_variants FOR SELECT
  USING (active);
CREATE POLICY "Published listings are publicly readable" ON public.market_listings FOR SELECT
  USING (sale_enabled AND published_at IS NOT NULL AND published_at <= now());
CREATE POLICY "Users read own profile" ON public.customer_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users read own addresses" ON public.customer_addresses FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users read own commerce orders" ON public.commerce_orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users read own commerce order items" ON public.commerce_order_items FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.commerce_orders o WHERE o.id = order_id AND o.user_id = auth.uid()
  ));
CREATE POLICY "Users read own order status" ON public.order_status_history FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.commerce_orders o WHERE o.id = order_id AND o.user_id = auth.uid()
  ));

GRANT SELECT ON public.markets, public.catalog_products, public.catalog_variants, public.market_listings TO anon, authenticated;
GRANT SELECT ON public.customer_profiles, public.customer_addresses, public.commerce_orders,
  public.commerce_order_items, public.order_status_history TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
