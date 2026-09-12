create table public.order_service_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.commerce_orders(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  request_type text not null check(request_type in ('cancellation','return')),
  status text not null default 'submitted' check(status in ('submitted','reviewing','approved','rejected','completed')),
  reason text not null check(char_length(reason) between 5 and 1000),
  resolution_note text check(char_length(resolution_note)<=2000),
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.order_service_requests enable row level security;
create policy "Users read own service requests" on public.order_service_requests for select to authenticated using(auth.uid()=user_id);
grant select on public.order_service_requests to authenticated;
grant all on public.order_service_requests to service_role;
create trigger order_service_requests_set_updated_at before update on public.order_service_requests for each row execute function public.set_updated_at();
create unique index order_service_requests_one_open_type on public.order_service_requests(order_id,user_id,request_type) where status in ('submitted','reviewing','approved');

create or replace function public.customer_create_order_request(p_user_id uuid,p_order_number text,p_request_type text,p_reason text)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare v_order public.commerce_orders%rowtype; v_id uuid;
begin
  if p_request_type not in ('cancellation','return') or char_length(trim(p_reason)) not between 5 and 1000 then
    raise exception using errcode='22023',message='INVALID_ORDER_REQUEST';
  end if;
  select * into v_order from public.commerce_orders where order_number=p_order_number and user_id=p_user_id;
  if not found then raise exception using errcode='42501',message='ORDER_NOT_FOUND'; end if;
  if p_request_type='cancellation' and v_order.status not in ('awaiting_payment','paid','fulfilment_pending') then
    raise exception using errcode='55000',message='ORDER_NOT_CANCELLABLE';
  end if;
  if p_request_type='return' and v_order.status not in ('fulfilled') then
    raise exception using errcode='55000',message='ORDER_NOT_RETURNABLE';
  end if;
  insert into public.order_service_requests(order_id,user_id,request_type,reason)
  values(v_order.id,p_user_id,p_request_type,trim(p_reason)) returning id into v_id;
  insert into public.audit_events(market_id,actor_id,actor_type,action,resource_type,resource_id)
  values(v_order.market_id,p_user_id,'customer','order_request.submitted','order_service_request',v_id::text);
  return v_id;
exception when unique_violation then
  raise exception using errcode='23505',message='OPEN_REQUEST_EXISTS';
end;
$$;

create or replace function public.customer_list_order_requests(p_user_id uuid,p_order_number text)
returns jsonb language sql security definer set search_path=public stable as $$
  select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'requestType',r.request_type,'status',r.status,'reason',r.reason,'resolutionNote',r.resolution_note,'createdAt',r.created_at,'resolvedAt',r.resolved_at) order by r.created_at desc),'[]'::jsonb)
  from public.order_service_requests r join public.commerce_orders o on o.id=r.order_id
  where r.user_id=p_user_id and o.order_number=p_order_number;
$$;

create or replace function public.admin_list_order_requests(p_actor_id uuid,p_status text default null)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if not public.has_permission(p_actor_id,'orders.read') then raise exception using errcode='42501',message='FORBIDDEN'; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'orderNumber',o.order_number,'requestType',r.request_type,'status',r.status,'reason',r.reason,'customerEmail',o.customer_email,'createdAt',r.created_at) order by r.created_at desc),'[]'::jsonb) from public.order_service_requests r join public.commerce_orders o on o.id=r.order_id where p_status is null or r.status=p_status);
end;
$$;

create or replace function public.admin_resolve_order_request(p_actor_id uuid,p_request_id uuid,p_status text,p_resolution_note text)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare v_order_id uuid; v_market_id uuid;
begin
  if not public.has_permission(p_actor_id,'orders.manage') then raise exception using errcode='42501',message='FORBIDDEN'; end if;
  if p_status not in ('reviewing','approved','rejected','completed') then raise exception using errcode='22023',message='INVALID_REQUEST_STATUS'; end if;
  update public.order_service_requests set status=p_status,resolution_note=nullif(trim(p_resolution_note),''),resolved_by=case when p_status in ('approved','rejected','completed') then p_actor_id else null end,resolved_at=case when p_status in ('approved','rejected','completed') then now() else null end where id=p_request_id returning order_id into v_order_id;
  if v_order_id is null then raise exception using errcode='P0002',message='REQUEST_NOT_FOUND'; end if;
  select market_id into v_market_id from public.commerce_orders where id=v_order_id;
  insert into public.audit_events(market_id,actor_id,actor_type,action,resource_type,resource_id,metadata) values(v_market_id,p_actor_id,'admin','order_request.status_changed','order_service_request',p_request_id::text,jsonb_build_object('status',p_status));
end;
$$;

revoke all on function public.customer_create_order_request(uuid,text,text,text),public.customer_list_order_requests(uuid,text),public.admin_list_order_requests(uuid,text),public.admin_resolve_order_request(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.customer_create_order_request(uuid,text,text,text),public.customer_list_order_requests(uuid,text),public.admin_list_order_requests(uuid,text),public.admin_resolve_order_request(uuid,uuid,text,text) to service_role;
