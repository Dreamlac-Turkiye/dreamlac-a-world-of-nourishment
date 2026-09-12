-- Permission-based commerce administration and auditable inventory operations.

CREATE TABLE public.role_permissions (
  role public.app_role NOT NULL,
  permission text NOT NULL CHECK (permission ~ '^[a-z]+\.[a-z_]+$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (role, permission)
);
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
CREATE POLICY "Admins can read permissions" ON public.role_permissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.role_permissions (role, permission) VALUES
  ('admin', 'orders.read'), ('admin', 'orders.manage'), ('admin', 'payments.refund'),
  ('admin', 'fulfilment.manage'), ('admin', 'inventory.manage'), ('admin', 'catalog.manage'),
  ('admin', 'customers.read'), ('admin', 'operations.read'),
  ('editor', 'catalog.manage');

CREATE OR REPLACE FUNCTION public.has_permission(p_user_id uuid, p_permission text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role = ur.role
    WHERE ur.user_id = p_user_id AND rp.permission = p_permission
  )
$$;
REVOKE ALL ON FUNCTION public.has_permission(uuid,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid,text) TO service_role;

CREATE TABLE public.inventory_adjustment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id uuid NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  variant_id uuid NOT NULL REFERENCES public.catalog_variants(id) ON DELETE RESTRICT,
  quantity_delta integer NOT NULL CHECK (quantity_delta <> 0),
  reason text NOT NULL CHECK (char_length(reason) BETWEEN 3 AND 500),
  idempotency_key text NOT NULL,
  actor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (warehouse_id, idempotency_key)
);
ALTER TABLE public.inventory_adjustment_requests ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.inventory_adjustment_requests TO service_role;

CREATE OR REPLACE FUNCTION public.adjust_inventory(
  p_actor_id uuid, p_warehouse_id uuid, p_variant_id uuid,
  p_quantity_delta integer, p_reason text, p_idempotency_key text
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_request public.inventory_adjustment_requests%ROWTYPE; v_balance public.inventory_balances%ROWTYPE;
BEGIN
  IF NOT public.has_permission(p_actor_id, 'inventory.manage') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'FORBIDDEN';
  END IF;
  IF p_quantity_delta = 0 OR coalesce(char_length(p_reason),0) NOT BETWEEN 3 AND 500
    OR coalesce(char_length(p_idempotency_key),0) NOT BETWEEN 16 AND 200 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVALID_INVENTORY_ADJUSTMENT';
  END IF;
  SELECT * INTO v_request FROM public.inventory_adjustment_requests
  WHERE warehouse_id = p_warehouse_id AND idempotency_key = p_idempotency_key;
  IF FOUND THEN
    IF v_request.variant_id <> p_variant_id OR v_request.quantity_delta <> p_quantity_delta
      OR v_request.reason <> p_reason THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVENTORY_IDEMPOTENCY_CONFLICT';
    END IF;
    SELECT * INTO v_balance FROM public.inventory_balances
    WHERE warehouse_id = p_warehouse_id AND variant_id = p_variant_id;
    RETURN jsonb_build_object('requestId',v_request.id,'onHand',v_balance.on_hand,
      'reserved',v_balance.reserved,'available',v_balance.on_hand-v_balance.reserved);
  END IF;

  UPDATE public.inventory_balances
  SET on_hand = on_hand + p_quantity_delta, version = version + 1, updated_at = now()
  WHERE warehouse_id = p_warehouse_id AND variant_id = p_variant_id
    AND on_hand + p_quantity_delta >= reserved AND on_hand + p_quantity_delta >= 0
  RETURNING * INTO v_balance;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'ADJUSTMENT_WOULD_INVALIDATE_STOCK';
  END IF;
  INSERT INTO public.inventory_adjustment_requests
    (warehouse_id,variant_id,quantity_delta,reason,idempotency_key,actor_id)
  VALUES (p_warehouse_id,p_variant_id,p_quantity_delta,p_reason,p_idempotency_key,p_actor_id)
  RETURNING * INTO v_request;
  INSERT INTO public.inventory_ledger
    (warehouse_id,variant_id,event_type,quantity_delta,on_hand_delta,reserved_delta,reason,actor_id)
  VALUES (p_warehouse_id,p_variant_id,'adjustment',p_quantity_delta,p_quantity_delta,0,p_reason,p_actor_id);
  INSERT INTO public.audit_events (actor_id,actor_type,action,resource_type,resource_id,metadata)
  VALUES (p_actor_id,'admin','inventory.adjusted','variant',p_variant_id::text,
    jsonb_build_object('warehouseId',p_warehouse_id,'delta',p_quantity_delta,'reason',p_reason));
  RETURN jsonb_build_object('requestId',v_request.id,'onHand',v_balance.on_hand,
    'reserved',v_balance.reserved,'available',v_balance.on_hand-v_balance.reserved);
END;
$$;
REVOKE ALL ON FUNCTION public.adjust_inventory(uuid,uuid,uuid,integer,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_inventory(uuid,uuid,uuid,integer,text,text) TO service_role;

CREATE OR REPLACE FUNCTION public.admin_search_orders(
  p_actor_id uuid, p_market_code text DEFAULT 'TR', p_status text DEFAULT NULL,
  p_query text DEFAULT NULL, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_result jsonb;
BEGIN
  IF NOT public.has_permission(p_actor_id,'orders.read') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'FORBIDDEN';
  END IF;
  IF p_limit NOT BETWEEN 1 AND 200 OR p_offset < 0 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVALID_PAGINATION';
  END IF;
  SELECT jsonb_build_object(
    'items',coalesce(jsonb_agg(row_data ORDER BY created_at DESC),'[]'::jsonb),
    'limit',p_limit,'offset',p_offset
  ) INTO v_result FROM (
    SELECT o.created_at, jsonb_build_object(
      'id',o.id,'orderNumber',o.order_number,'status',o.status,'currency',o.currency_code,
      'grandTotalMinor',o.grand_total_minor,'customerEmail',o.customer_email,
      'customerPhone',o.customer_phone,'createdAt',o.created_at,
      'paymentStatus',(SELECT pa.status FROM public.payment_attempts pa WHERE pa.order_id=o.id ORDER BY pa.created_at DESC LIMIT 1),
      'shipmentStatus',(SELECT s.status FROM public.shipments s WHERE s.order_id=o.id ORDER BY s.created_at DESC LIMIT 1),
      'invoiceStatus',(SELECT i.status FROM public.invoices i WHERE i.order_id=o.id LIMIT 1)
    ) AS row_data
    FROM public.commerce_orders o JOIN public.markets m ON m.id=o.market_id
    WHERE m.code=upper(p_market_code)
      AND (p_status IS NULL OR o.status::text=p_status)
      AND (p_query IS NULL OR p_query='' OR o.order_number ILIKE '%'||p_query||'%'
        OR o.customer_email ILIKE '%'||p_query||'%' OR o.customer_phone ILIKE '%'||p_query||'%')
    ORDER BY o.created_at DESC LIMIT p_limit OFFSET p_offset
  ) rows;
  RETURN v_result;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_search_orders(uuid,text,text,text,integer,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_search_orders(uuid,text,text,text,integer,integer) TO service_role;

CREATE OR REPLACE FUNCTION public.admin_get_order(p_actor_id uuid,p_order_number text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_order public.commerce_orders%ROWTYPE;
BEGIN
  IF NOT public.has_permission(p_actor_id,'orders.read') THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='FORBIDDEN';
  END IF;
  SELECT * INTO v_order FROM public.commerce_orders WHERE order_number=p_order_number;
  IF NOT FOUND THEN RETURN NULL; END IF;
  RETURN jsonb_build_object(
    'order',to_jsonb(v_order)-'billing_address'-'shipping_address',
    'billingAddress',v_order.billing_address,'shippingAddress',v_order.shipping_address,
    'items',(SELECT coalesce(jsonb_agg(to_jsonb(x) ORDER BY x.created_at),'[]'::jsonb) FROM public.commerce_order_items x WHERE x.order_id=v_order.id),
    'payments',(SELECT coalesce(jsonb_agg(to_jsonb(x) ORDER BY x.created_at),'[]'::jsonb) FROM public.payment_attempts x WHERE x.order_id=v_order.id),
    'shipments',(SELECT coalesce(jsonb_agg(to_jsonb(x) ORDER BY x.created_at),'[]'::jsonb) FROM public.shipments x WHERE x.order_id=v_order.id),
    'invoice',(SELECT to_jsonb(x) FROM public.invoices x WHERE x.order_id=v_order.id LIMIT 1),
    'history',(SELECT coalesce(jsonb_agg(to_jsonb(x) ORDER BY x.created_at),'[]'::jsonb) FROM public.order_status_history x WHERE x.order_id=v_order.id)
  );
END;
$$;
REVOKE ALL ON FUNCTION public.admin_get_order(uuid,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_order(uuid,text) TO service_role;
