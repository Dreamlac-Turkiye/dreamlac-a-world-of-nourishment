create table public.cookie_consent_receipts (
  id uuid primary key default gen_random_uuid(),
  anonymous_id uuid not null,
  choice text not null check(choice in ('all','necessary')),
  policy_version text not null,
  recorded_at timestamptz not null default now()
);
alter table public.cookie_consent_receipts enable row level security;
grant all on public.cookie_consent_receipts to service_role;
create index cookie_consent_receipts_subject_idx on public.cookie_consent_receipts(anonymous_id,recorded_at desc);

create or replace function public.record_cookie_consent(p_anonymous_id uuid,p_choice text,p_policy_version text)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if p_choice not in ('all','necessary') or char_length(p_policy_version) not between 1 and 50 then
    raise exception using errcode='22023',message='INVALID_COOKIE_CONSENT';
  end if;
  insert into public.cookie_consent_receipts(anonymous_id,choice,policy_version)
  values(p_anonymous_id,p_choice,p_policy_version);
end;
$$;
revoke all on function public.record_cookie_consent(uuid,text,text) from public,anon,authenticated;
grant execute on function public.record_cookie_consent(uuid,text,text) to service_role;

