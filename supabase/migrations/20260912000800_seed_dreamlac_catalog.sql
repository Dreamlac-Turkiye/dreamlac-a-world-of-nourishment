-- Stable catalog identities bridge the storefront to the commerce core.
INSERT INTO public.catalog_products (id, brand, slug, status, product_type)
VALUES
  ('10000000-0000-4000-8000-000000000001', 'Dreamlac', 'dreamlac-1', 'active', 'infant_formula'),
  ('10000000-0000-4000-8000-000000000002', 'Dreamlac', 'dreamlac-2', 'active', 'follow_on_formula'),
  ('10000000-0000-4000-8000-000000000003', 'Dreamlac', 'dreamlac-3', 'active', 'young_child_formula')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, updated_at = now();

INSERT INTO public.catalog_variants (id, product_id, sku, weight_grams, attributes, active)
VALUES
  ('10000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000001',
   'DREAMLAC-1-400G', 400, '{"stage":1}'::jsonb, true),
  ('10000000-0000-4000-8000-000000000012', '10000000-0000-4000-8000-000000000002',
   'DREAMLAC-2-400G', 400, '{"stage":2}'::jsonb, true),
  ('10000000-0000-4000-8000-000000000013', '10000000-0000-4000-8000-000000000003',
   'DREAMLAC-3-400G', 400, '{"stage":3}'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET active = EXCLUDED.active, updated_at = now();

INSERT INTO public.warehouses (id, market_id, code, name, active)
SELECT '10000000-0000-4000-8000-000000000021', id, 'TR-MAIN', 'Türkiye Ana Depo', true
FROM public.markets WHERE code = 'TR'
ON CONFLICT (id) DO UPDATE SET active = EXCLUDED.active, updated_at = now();

INSERT INTO public.inventory_balances (warehouse_id, variant_id, on_hand, reserved)
VALUES
  ('10000000-0000-4000-8000-000000000021', '10000000-0000-4000-8000-000000000011', 0, 0),
  ('10000000-0000-4000-8000-000000000021', '10000000-0000-4000-8000-000000000012', 0, 0),
  ('10000000-0000-4000-8000-000000000021', '10000000-0000-4000-8000-000000000013', 0, 0)
ON CONFLICT (warehouse_id, variant_id) DO NOTHING;

INSERT INTO public.market_listings (
  market_id, variant_id, locale, name, description, currency_code,
  unit_price_minor, tax_category, sale_enabled, published_at
)
SELECT m.id, source.variant_id, 'tr-TR', source.name, source.description, 'TRY',
  coalesce(ps.price_kurus, 0), 'formula', false, NULL
FROM public.markets m
CROSS JOIN (VALUES
  ('10000000-0000-4000-8000-000000000011'::uuid, 'dreamlac-1',
   'Dreamlac 1 Bebek Sütü', 'Doğumdan itibaren ilk 6 aya yönelik bebek formülü.'),
  ('10000000-0000-4000-8000-000000000012'::uuid, 'dreamlac-2',
   'Dreamlac 2 Devam Sütü', '6-12 aylık döneme yönelik devam formülü.'),
  ('10000000-0000-4000-8000-000000000013'::uuid, 'dreamlac-3',
   'Dreamlac 3 Devam Sütü', '12-36 aylık döneme yönelik devam formülü.')
) AS source(variant_id, slug, name, description)
LEFT JOIN public.product_settings ps ON ps.slug = source.slug
WHERE m.code = 'TR'
ON CONFLICT (market_id, variant_id, locale) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description,
  unit_price_minor = EXCLUDED.unit_price_minor, updated_at = now();

CREATE OR REPLACE FUNCTION public.sync_product_setting_to_listing()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_variant_id uuid;
BEGIN
  SELECT cv.id INTO v_variant_id FROM public.catalog_variants cv
  JOIN public.catalog_products cp ON cp.id = cv.product_id
  WHERE cp.slug = NEW.slug AND cv.active ORDER BY cv.created_at LIMIT 1;
  IF v_variant_id IS NULL THEN RETURN NEW; END IF;
  UPDATE public.market_listings ml
  SET unit_price_minor = coalesce(NEW.price_kurus, 0),
      sale_enabled = NEW.direct_sale_enabled AND NEW.price_kurus IS NOT NULL
        AND NEW.stock = 'in_stock',
      published_at = CASE
        WHEN NEW.direct_sale_enabled AND NEW.price_kurus IS NOT NULL AND NEW.stock = 'in_stock'
        THEN coalesce(ml.published_at, now()) ELSE NULL END,
      updated_at = now()
  FROM public.markets m
  WHERE ml.market_id = m.id AND m.code = 'TR' AND ml.variant_id = v_variant_id;
  RETURN NEW;
END;
$$;
CREATE TRIGGER product_settings_sync_commerce
AFTER INSERT OR UPDATE OF price_kurus, stock, direct_sale_enabled
ON public.product_settings FOR EACH ROW EXECUTE FUNCTION public.sync_product_setting_to_listing();
