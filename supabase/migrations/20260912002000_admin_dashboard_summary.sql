CREATE OR REPLACE FUNCTION public.admin_dashboard_summary(
  p_actor_id uuid,
  p_market_code text DEFAULT 'TR'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_market public.markets%ROWTYPE;
  v_day date;
BEGIN
  IF NOT public.has_permission(p_actor_id, 'operations.read') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'FORBIDDEN';
  END IF;

  SELECT * INTO v_market FROM public.markets WHERE code = p_market_code;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'MARKET_NOT_FOUND';
  END IF;
  v_day := (now() AT TIME ZONE v_market.timezone)::date;

  RETURN jsonb_build_object(
    'generatedAt', now(),
    'marketCode', v_market.code,
    'currency', v_market.currency_code,
    'today', jsonb_build_object(
      'orders', (SELECT count(*) FROM public.commerce_orders o
        WHERE o.market_id = v_market.id
          AND (coalesce(o.placed_at, o.created_at) AT TIME ZONE v_market.timezone)::date = v_day
          AND o.status NOT IN ('draft','failed')),
      'revenueMinor', (SELECT coalesce(sum(o.grand_total_minor), 0) FROM public.commerce_orders o
        WHERE o.market_id = v_market.id
          AND (coalesce(o.placed_at, o.created_at) AT TIME ZONE v_market.timezone)::date = v_day
          AND o.status IN ('paid','fulfilment_pending','fulfilled')),
      'newCustomers', (SELECT count(*) FROM public.customer_profiles p
        WHERE p.default_market_id = v_market.id
          AND (p.created_at AT TIME ZONE v_market.timezone)::date = v_day)
    ),
    'attention', jsonb_build_object(
      'awaitingPayment', (SELECT count(*) FROM public.commerce_orders o
        WHERE o.market_id = v_market.id AND o.status IN ('awaiting_payment','payment_processing')),
      'toFulfil', (SELECT count(*) FROM public.commerce_orders o
        WHERE o.market_id = v_market.id AND o.status IN ('paid','fulfilment_pending')),
      'openRequests', (SELECT count(*) FROM public.order_service_requests r
        JOIN public.commerce_orders o ON o.id = r.order_id
        WHERE o.market_id = v_market.id AND r.status IN ('submitted','reviewing','approved')),
      'lowStock', (SELECT count(*) FROM public.inventory_balances ib
        JOIN public.warehouses w ON w.id = ib.warehouse_id
        WHERE w.market_id = v_market.id AND w.active
          AND ib.on_hand - ib.reserved <= 10),
      'failedOperations',
        (SELECT count(*) FROM public.outbox_events WHERE status IN ('failed','dead'))
        + (SELECT count(*) FROM public.webhook_events WHERE processing_status = 'failed')
        + (SELECT count(*) FROM public.payment_attempts
            WHERE status = 'failed' AND created_at >= now() - interval '24 hours')
    ),
    'recentOrders', (SELECT coalesce(jsonb_agg(row_data ORDER BY created_at DESC), '[]'::jsonb)
      FROM (
        SELECT jsonb_build_object(
          'orderNumber', o.order_number,
          'status', o.status,
          'customerEmail', o.customer_email,
          'grandTotalMinor', o.grand_total_minor,
          'createdAt', o.created_at
        ) AS row_data, o.created_at
        FROM public.commerce_orders o
        WHERE o.market_id = v_market.id AND o.status <> 'draft'
        ORDER BY o.created_at DESC
        LIMIT 5
      ) recent)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_dashboard_summary(uuid,text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_dashboard_summary(uuid,text) TO service_role;
