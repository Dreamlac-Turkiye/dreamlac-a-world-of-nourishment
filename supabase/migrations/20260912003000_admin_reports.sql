-- Read-only reporting snapshot. All aggregates remain scoped to one market.
CREATE OR REPLACE FUNCTION public.admin_get_reports(
  p_actor_id uuid,
  p_market_code text DEFAULT 'TR',
  p_from_date date DEFAULT (current_date - 29),
  p_to_date date DEFAULT current_date
) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_market uuid; v_timezone text; v_result jsonb;
BEGIN
  IF NOT public.has_permission(p_actor_id,'reports.read') THEN
    RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='FORBIDDEN';
  END IF;
  IF p_from_date > p_to_date OR p_to_date-p_from_date > 366 THEN
    RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='INVALID_REPORT_RANGE';
  END IF;
  SELECT id,timezone INTO v_market,v_timezone FROM public.markets WHERE code=upper(p_market_code);
  IF v_market IS NULL THEN RAISE EXCEPTION USING ERRCODE='P0002',MESSAGE='MARKET_NOT_FOUND'; END IF;

  SELECT jsonb_build_object(
    'fromDate',p_from_date,'toDate',p_to_date,'currency','TRY',
    'summary',jsonb_build_object(
      'orders',(SELECT count(*) FROM public.commerce_orders o WHERE o.market_id=v_market AND (o.created_at AT TIME ZONE v_timezone)::date BETWEEN p_from_date AND p_to_date),
      'paidOrders',(SELECT count(*) FROM public.commerce_orders o WHERE o.market_id=v_market AND o.status IN ('paid','fulfilment_pending','fulfilled') AND (o.created_at AT TIME ZONE v_timezone)::date BETWEEN p_from_date AND p_to_date),
      'revenueMinor',(SELECT coalesce(sum(o.grand_total_minor),0) FROM public.commerce_orders o WHERE o.market_id=v_market AND o.status IN ('paid','fulfilment_pending','fulfilled') AND (o.created_at AT TIME ZONE v_timezone)::date BETWEEN p_from_date AND p_to_date),
      'discountMinor',(SELECT coalesce(sum(o.discount_minor),0) FROM public.commerce_orders o WHERE o.market_id=v_market AND o.status IN ('paid','fulfilment_pending','fulfilled') AND (o.created_at AT TIME ZONE v_timezone)::date BETWEEN p_from_date AND p_to_date),
      'newCustomers',(SELECT count(DISTINCT o.user_id) FROM public.commerce_orders o WHERE o.market_id=v_market AND o.user_id IS NOT NULL AND (o.created_at AT TIME ZONE v_timezone)::date BETWEEN p_from_date AND p_to_date),
      'openTickets',(SELECT count(*) FROM public.support_tickets t WHERE t.market_id=v_market AND t.status NOT IN ('resolved','closed')),
      'lowStock',(SELECT count(*) FROM public.inventory_balances b JOIN public.warehouses w ON w.id=b.warehouse_id WHERE w.market_id=v_market AND w.active AND b.on_hand-b.reserved<=b.reorder_point)
    ),
    'daily',(SELECT coalesce(jsonb_agg(jsonb_build_object('date',d.day,'orders',coalesce(x.orders,0),'revenueMinor',coalesce(x.revenue,0)) ORDER BY d.day),'[]'::jsonb)
      FROM generate_series(p_from_date,p_to_date,'1 day'::interval) d(day)
      LEFT JOIN (SELECT (o.created_at AT TIME ZONE v_timezone)::date AS day,count(*) AS orders,coalesce(sum(o.grand_total_minor) FILTER(WHERE o.status IN ('paid','fulfilment_pending','fulfilled')),0) revenue FROM public.commerce_orders o WHERE o.market_id=v_market AND (o.created_at AT TIME ZONE v_timezone)::date BETWEEN p_from_date AND p_to_date GROUP BY 1)x ON x.day=d.day::date),
    'statuses',(SELECT coalesce(jsonb_agg(jsonb_build_object('status',x.status,'count',x.count) ORDER BY x.count DESC),'[]'::jsonb) FROM (SELECT o.status::text status,count(*) count FROM public.commerce_orders o WHERE o.market_id=v_market AND (o.created_at AT TIME ZONE v_timezone)::date BETWEEN p_from_date AND p_to_date GROUP BY o.status)x),
    'products',(SELECT coalesce(jsonb_agg(jsonb_build_object('sku',x.sku,'name',x.product_name,'quantity',x.quantity,'revenueMinor',x.revenue) ORDER BY x.quantity DESC),'[]'::jsonb) FROM (SELECT i.sku,max(i.product_name) product_name,sum(i.quantity) quantity,sum(i.line_total_minor) revenue FROM public.commerce_order_items i JOIN public.commerce_orders o ON o.id=i.order_id WHERE o.market_id=v_market AND o.status IN ('paid','fulfilment_pending','fulfilled') AND (o.created_at AT TIME ZONE v_timezone)::date BETWEEN p_from_date AND p_to_date GROUP BY i.sku LIMIT 20)x),
    'support',(SELECT coalesce(jsonb_agg(jsonb_build_object('category',x.category,'count',x.count) ORDER BY x.count DESC),'[]'::jsonb) FROM (SELECT t.category,count(*) count FROM public.support_tickets t WHERE t.market_id=v_market AND (t.created_at AT TIME ZONE v_timezone)::date BETWEEN p_from_date AND p_to_date GROUP BY t.category)x)
  ) INTO v_result;
  RETURN v_result;
END $$;

REVOKE ALL ON FUNCTION public.admin_get_reports(uuid,text,date,date) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_reports(uuid,text,date,date) TO service_role;
