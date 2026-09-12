-- Customer-owned profile/address commands are service-only. The application
-- authenticates the caller before forwarding the immutable auth user id.
create or replace function public.customer_get_account(p_user_id uuid)
returns jsonb language sql security definer set search_path = public stable as $$
  select jsonb_build_object(
    'profile', (select jsonb_build_object('fullName', p.full_name, 'phone', p.phone, 'locale', p.locale) from public.customer_profiles p where p.user_id = p_user_id),
    'addresses', coalesce((select jsonb_agg(jsonb_build_object('id', a.id, 'label', a.label, 'recipientName', a.recipient_name, 'phone', a.phone, 'address', a.address, 'isDefault', a.is_default) order by a.is_default desc, a.created_at desc) from public.customer_addresses a where a.user_id = p_user_id), '[]'::jsonb)
  );
$$;

create or replace function public.customer_upsert_profile(p_user_id uuid, p_full_name text, p_phone text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_market uuid;
begin
  if char_length(trim(p_full_name)) not between 2 and 120 or char_length(trim(p_phone)) not between 7 and 24 then
    raise exception using errcode='22023', message='INVALID_PROFILE';
  end if;
  select id into v_market from public.markets where code='TR';
  insert into public.customer_profiles(user_id, default_market_id, full_name, phone, locale)
  values(p_user_id, v_market, trim(p_full_name), trim(p_phone), 'tr-TR')
  on conflict(user_id) do update set full_name=excluded.full_name, phone=excluded.phone, updated_at=now();
end;
$$;

create or replace function public.customer_save_address(p_user_id uuid, p_address_id uuid, p_label text, p_recipient_name text, p_phone text, p_address jsonb, p_is_default boolean)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare v_market uuid; v_id uuid;
begin
  if char_length(trim(p_recipient_name)) not between 2 and 120 or char_length(trim(p_phone)) not between 7 and 24
    or jsonb_typeof(p_address) <> 'object' or coalesce(char_length(p_address->>'city'),0) < 2
    or coalesce(char_length(p_address->>'district'),0) < 2 or coalesce(char_length(p_address->>'line1'),0) < 10 then
    raise exception using errcode='22023', message='INVALID_ADDRESS';
  end if;
  select id into v_market from public.markets where code='TR';
  if p_address_id is null then
    insert into public.customer_addresses(user_id,market_id,label,recipient_name,phone,address,is_default)
    values(p_user_id,v_market,nullif(trim(p_label),''),trim(p_recipient_name),trim(p_phone),p_address,coalesce(p_is_default,false)) returning id into v_id;
  else
    update public.customer_addresses set label=nullif(trim(p_label),''), recipient_name=trim(p_recipient_name), phone=trim(p_phone), address=p_address, is_default=coalesce(p_is_default,false), updated_at=now()
    where id=p_address_id and user_id=p_user_id returning id into v_id;
    if v_id is null then raise exception using errcode='42501', message='ADDRESS_NOT_FOUND'; end if;
  end if;
  if p_is_default then update public.customer_addresses set is_default=false where user_id=p_user_id and id<>v_id; end if;
  return v_id;
end;
$$;

create or replace function public.customer_delete_address(p_user_id uuid, p_address_id uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin delete from public.customer_addresses where id=p_address_id and user_id=p_user_id; end;
$$;

revoke all on function public.customer_get_account(uuid), public.customer_upsert_profile(uuid,text,text), public.customer_save_address(uuid,uuid,text,text,text,jsonb,boolean), public.customer_delete_address(uuid,uuid) from public, anon, authenticated;
grant execute on function public.customer_get_account(uuid), public.customer_upsert_profile(uuid,text,text), public.customer_save_address(uuid,uuid,text,text,text,jsonb,boolean), public.customer_delete_address(uuid,uuid) to service_role;

