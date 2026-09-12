CREATE OR REPLACE FUNCTION public.admin_list_inventory(
  p_actor_id uuid,
  p_market_code text DEFAULT 'TR'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT public.has_permission(p_actor_id, 'inventory.manage') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'FORBIDDEN';
  END IF;

  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'warehouseId', w.id,
    'warehouseCode', w.code,
    'warehouseName', w.name,
    'variantId', v.id,
    'sku', v.sku,
    'productName', coalesce(ml.name, p.slug),
    'onHand', ib.on_hand,
    'reserved', ib.reserved,
    'available', ib.on_hand - ib.reserved,
    'updatedAt', ib.updated_at
  ) ORDER BY w.code, v.sku), '[]'::jsonb)
  INTO v_result
  FROM public.inventory_balances ib
  JOIN public.warehouses w ON w.id = ib.warehouse_id
  JOIN public.markets m ON m.id = w.market_id
  JOIN public.catalog_variants v ON v.id = ib.variant_id
  JOIN public.catalog_products p ON p.id = v.product_id
  LEFT JOIN public.market_listings ml
    ON ml.market_id = m.id AND ml.variant_id = v.id AND ml.locale = m.default_locale
  WHERE m.code = p_market_code;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_inventory(uuid,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_inventory(uuid,text) TO service_role;
