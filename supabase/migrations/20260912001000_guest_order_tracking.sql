-- Privacy-preserving guest order tracking. The RPC is service-only and returns
-- fulfilment state without exposing addresses, line items, email, or phone.
create or replace function public.track_commerce_order(
  p_order_number text,
  p_email text,
  p_phone_last4 text
)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'orderNumber', o.order_number,
    'status', o.status,
    'createdAt', o.created_at,
    'updatedAt', o.updated_at,
    'totalKurus', o.total_kurus,
    'itemCount', coalesce((select sum(oi.quantity) from public.commerce_order_items oi where oi.order_id = o.id), 0),
    'shipmentStatus', s.status,
    'carrierName', s.provider,
    'trackingNumber', s.tracking_number
  )
  from public.commerce_orders o
  left join lateral (
    select sh.status, sh.provider, sh.tracking_number
    from public.shipments sh
    where sh.order_id = o.id
    order by sh.created_at desc
    limit 1
  ) s on true
  where upper(trim(o.order_number)) = upper(trim(p_order_number))
    and lower(trim(o.customer_email)) = lower(trim(p_email))
    and right(regexp_replace(o.customer_phone, '[^0-9]', '', 'g'), 4) = regexp_replace(p_phone_last4, '[^0-9]', '', 'g')
    and length(regexp_replace(p_phone_last4, '[^0-9]', '', 'g')) = 4
  limit 1;
$$;

revoke all on function public.track_commerce_order(text, text, text) from public, anon, authenticated;
grant execute on function public.track_commerce_order(text, text, text) to service_role;
