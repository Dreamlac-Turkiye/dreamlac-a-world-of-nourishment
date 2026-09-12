-- Customer order views are service-only RPCs; the caller identity is validated by server middleware.
CREATE OR REPLACE FUNCTION public.customer_list_commerce_orders(p_user_id uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'orderNumber', o.order_number,
    'status', o.status,
    'createdAt', o.created_at,
    'totalKurus', o.grand_total_minor,
    'itemCount', (SELECT coalesce(sum(i.quantity), 0) FROM public.commerce_order_items i
      WHERE i.order_id = o.id)
  ) ORDER BY o.created_at DESC), '[]'::jsonb)
  FROM public.commerce_orders o WHERE o.user_id = p_user_id;
$$;
REVOKE ALL ON FUNCTION public.customer_list_commerce_orders(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.customer_list_commerce_orders(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.customer_get_commerce_order(
  p_user_id uuid, p_order_number text
)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT jsonb_build_object(
    'orderNumber', o.order_number,
    'status', o.status,
    'createdAt', o.created_at,
    'fullName', o.shipping_address->>'fullName',
    'phone', o.customer_phone,
    'email', o.customer_email,
    'city', o.shipping_address->>'city',
    'district', o.shipping_address->>'district',
    'addressLine', o.shipping_address->>'line1',
    'note', o.customer_note,
    'shippingOptionTitle', 'Hazırlanıyor',
    'paymentMethodTitle', 'Ödeme bekleniyor',
    'subtotalKurus', o.subtotal_minor,
    'shippingKurus', o.shipping_minor,
    'totalKurus', o.grand_total_minor,
    'itemCount', (SELECT coalesce(sum(i.quantity), 0) FROM public.commerce_order_items i
      WHERE i.order_id = o.id),
    'items', (SELECT coalesce(jsonb_agg(jsonb_build_object(
      'productId', i.variant_id,
      'productSlug', i.snapshot->>'productSlug',
      'productName', i.product_name,
      'stage', NULL,
      'quantity', i.quantity,
      'unitPriceKurus', i.unit_price_minor,
      'lineTotalKurus', i.line_total_minor
    ) ORDER BY i.created_at), '[]'::jsonb) FROM public.commerce_order_items i
      WHERE i.order_id = o.id)
  )
  FROM public.commerce_orders o
  WHERE o.user_id = p_user_id AND o.order_number = p_order_number;
$$;
REVOKE ALL ON FUNCTION public.customer_get_commerce_order(uuid,text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.customer_get_commerce_order(uuid,text) TO service_role;

