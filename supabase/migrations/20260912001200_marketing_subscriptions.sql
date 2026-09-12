create table public.marketing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  market_code text not null default 'TR',
  email text not null,
  status text not null default 'pending' check (status in ('pending','active','unsubscribed','suppressed')),
  consent_version text not null,
  consented_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(market_code,email)
);
alter table public.marketing_subscriptions enable row level security;
grant all on public.marketing_subscriptions to service_role;
create trigger marketing_subscriptions_set_updated_at before update on public.marketing_subscriptions for each row execute function public.set_updated_at();

create or replace function public.request_marketing_subscription(p_market_code text,p_email text,p_consent_version text)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if upper(p_market_code) <> 'TR' or p_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or char_length(p_email)>254 or char_length(p_consent_version) not between 1 and 50 then
    raise exception using errcode='22023',message='INVALID_SUBSCRIPTION';
  end if;
  insert into public.marketing_subscriptions(market_code,email,status,consent_version)
  values(upper(p_market_code),lower(trim(p_email)),'pending',p_consent_version)
  on conflict(market_code,email) do update set status='pending',consent_version=excluded.consent_version,consented_at=now(),unsubscribed_at=null,updated_at=now();
end;
$$;
revoke all on function public.request_marketing_subscription(text,text,text) from public,anon,authenticated;
grant execute on function public.request_marketing_subscription(text,text,text) to service_role;
