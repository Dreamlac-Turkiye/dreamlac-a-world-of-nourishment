ALTER TABLE public.inventory_balances
  ADD COLUMN reorder_point integer NOT NULL DEFAULT 20 CHECK (reorder_point >= 0);

CREATE TABLE public.inventory_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id uuid NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  variant_id uuid NOT NULL REFERENCES public.catalog_variants(id) ON DELETE RESTRICT,
  operation_type text NOT NULL CHECK (operation_type IN ('receipt','adjustment','count','return','damage')),
  quantity_input integer NOT NULL,
  quantity_delta integer NOT NULL CHECK (quantity_delta <> 0),
  reason text NOT NULL CHECK (char_length(reason) BETWEEN 3 AND 500),
  idempotency_key text NOT NULL,
  actor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (warehouse_id, idempotency_key)
);
ALTER TABLE public.inventory_operations ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.inventory_operations TO service_role;

CREATE OR REPLACE FUNCTION public.admin_list_inventory(p_actor_id uuid, p_market_code text DEFAULT 'TR')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_result jsonb;
BEGIN
  IF NOT public.has_permission(p_actor_id, 'inventory.manage') THEN RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='FORBIDDEN'; END IF;
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'warehouseId',w.id,'warehouseCode',w.code,'warehouseName',w.name,'variantId',v.id,
    'sku',v.sku,'productName',coalesce(ml.name,p.slug),'onHand',ib.on_hand,
    'reserved',ib.reserved,'available',ib.on_hand-ib.reserved,'reorderPoint',ib.reorder_point,
    'lowStock',(ib.on_hand-ib.reserved)<=ib.reorder_point,'updatedAt',ib.updated_at
  ) ORDER BY w.code,v.sku),'[]'::jsonb) INTO v_result
  FROM public.inventory_balances ib JOIN public.warehouses w ON w.id=ib.warehouse_id
  JOIN public.markets m ON m.id=w.market_id JOIN public.catalog_variants v ON v.id=ib.variant_id
  JOIN public.catalog_products p ON p.id=v.product_id LEFT JOIN public.market_listings ml
    ON ml.market_id=m.id AND ml.variant_id=v.id AND ml.locale=m.default_locale
  WHERE m.code=upper(p_market_code);
  RETURN v_result;
END; $$;
REVOKE ALL ON FUNCTION public.admin_list_inventory(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_inventory(uuid,text) TO service_role;

CREATE OR REPLACE FUNCTION public.admin_record_inventory_operation(
  p_actor_id uuid,p_warehouse_id uuid,p_variant_id uuid,p_operation_type text,
  p_quantity integer,p_reason text,p_reorder_point integer,p_idempotency_key text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_balance public.inventory_balances%ROWTYPE; v_delta integer; v_existing public.inventory_operations%ROWTYPE; v_event text;
BEGIN
  IF NOT public.has_permission(p_actor_id,'inventory.manage') THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='FORBIDDEN'; END IF;
  IF p_operation_type NOT IN ('receipt','adjustment','count','return','damage') OR coalesce(char_length(p_reason),0) NOT BETWEEN 3 AND 500
    OR coalesce(char_length(p_idempotency_key),0) NOT BETWEEN 16 AND 200 OR p_reorder_point<0 THEN
    RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='INVALID_INVENTORY_OPERATION';
  END IF;
  SELECT * INTO v_existing FROM public.inventory_operations WHERE warehouse_id=p_warehouse_id AND idempotency_key=p_idempotency_key;
  IF FOUND THEN RETURN jsonb_build_object('operationId',v_existing.id,'duplicate',true); END IF;
  SELECT * INTO v_balance FROM public.inventory_balances WHERE warehouse_id=p_warehouse_id AND variant_id=p_variant_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE='P0002',MESSAGE='INVENTORY_NOT_FOUND'; END IF;
  v_delta:=CASE WHEN p_operation_type='count' THEN p_quantity-v_balance.on_hand WHEN p_operation_type='damage' THEN -abs(p_quantity)
    WHEN p_operation_type IN ('receipt','return') THEN abs(p_quantity) ELSE p_quantity END;
  IF v_delta=0 OR v_balance.on_hand+v_delta<v_balance.reserved OR v_balance.on_hand+v_delta<0 THEN
    RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='INVALID_STOCK_RESULT';
  END IF;
  UPDATE public.inventory_balances SET on_hand=on_hand+v_delta,reorder_point=p_reorder_point,version=version+1,updated_at=now()
    WHERE warehouse_id=p_warehouse_id AND variant_id=p_variant_id RETURNING * INTO v_balance;
  INSERT INTO public.inventory_operations(warehouse_id,variant_id,operation_type,quantity_input,quantity_delta,reason,idempotency_key,actor_id)
    VALUES(p_warehouse_id,p_variant_id,p_operation_type,p_quantity,v_delta,p_reason,p_idempotency_key,p_actor_id) RETURNING * INTO v_existing;
  v_event:=CASE WHEN p_operation_type='count' THEN 'adjustment' ELSE p_operation_type END;
  INSERT INTO public.inventory_ledger(warehouse_id,variant_id,event_type,quantity_delta,on_hand_delta,reserved_delta,reason,actor_id)
    VALUES(p_warehouse_id,p_variant_id,v_event,v_delta,v_delta,0,p_reason,p_actor_id);
  INSERT INTO public.audit_events(actor_id,actor_type,action,resource_type,resource_id,metadata) VALUES
    (p_actor_id,'admin','inventory.'||p_operation_type,'variant',p_variant_id::text,jsonb_build_object('warehouseId',p_warehouse_id,'delta',v_delta,'reorderPoint',p_reorder_point));
  RETURN jsonb_build_object('operationId',v_existing.id,'onHand',v_balance.on_hand,'reserved',v_balance.reserved,'available',v_balance.on_hand-v_balance.reserved,'duplicate',false);
END; $$;
REVOKE ALL ON FUNCTION public.admin_record_inventory_operation(uuid,uuid,uuid,text,integer,text,integer,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_record_inventory_operation(uuid,uuid,uuid,text,integer,text,integer,text) TO service_role;

CREATE OR REPLACE FUNCTION public.admin_list_inventory_movements(p_actor_id uuid,p_market_code text DEFAULT 'TR',p_query text DEFAULT NULL,p_limit integer DEFAULT 50)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_result jsonb;
BEGIN
  IF NOT public.has_permission(p_actor_id,'inventory.manage') THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='FORBIDDEN'; END IF;
  IF p_limit NOT BETWEEN 1 AND 200 THEN RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='INVALID_LIMIT'; END IF;
  SELECT coalesce(jsonb_agg(x.row_data ORDER BY x.created_at DESC),'[]'::jsonb) INTO v_result FROM (
    SELECT io.created_at,jsonb_build_object('id',io.id,'operationType',io.operation_type,'quantityDelta',io.quantity_delta,
      'reason',io.reason,'createdAt',io.created_at,'sku',v.sku,'productName',coalesce(ml.name,p.slug),'warehouseName',w.name) row_data
    FROM public.inventory_operations io JOIN public.warehouses w ON w.id=io.warehouse_id JOIN public.markets m ON m.id=w.market_id
    JOIN public.catalog_variants v ON v.id=io.variant_id JOIN public.catalog_products p ON p.id=v.product_id
    LEFT JOIN public.market_listings ml ON ml.market_id=m.id AND ml.variant_id=v.id AND ml.locale=m.default_locale
    WHERE m.code=upper(p_market_code) AND (coalesce(p_query,'')='' OR v.sku ILIKE '%'||p_query||'%' OR io.reason ILIKE '%'||p_query||'%' OR coalesce(ml.name,p.slug) ILIKE '%'||p_query||'%')
    ORDER BY io.created_at DESC LIMIT p_limit
  ) x;
  RETURN v_result;
END; $$;
REVOKE ALL ON FUNCTION public.admin_list_inventory_movements(uuid,text,text,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_inventory_movements(uuid,text,text,integer) TO service_role;
