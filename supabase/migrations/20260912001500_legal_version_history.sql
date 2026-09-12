create table public.legal_document_versions (
  id uuid primary key default gen_random_uuid(),
  legal_document_id uuid not null references public.legal_documents(id) on delete restrict,
  slug text not null,
  version integer not null,
  title text not null,
  summary text,
  body text not null,
  effective_date date,
  review_status text not null,
  approved_at timestamptz,
  approved_by uuid,
  archived_at timestamptz not null default now(),
  unique(legal_document_id,version)
);
alter table public.legal_document_versions enable row level security;
grant all on public.legal_document_versions to service_role;

create or replace function public.version_legal_document()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if (new.title,new.summary,new.body,new.effective_date) is distinct from (old.title,old.summary,old.body,old.effective_date) then
    insert into public.legal_document_versions(legal_document_id,slug,version,title,summary,body,effective_date,review_status,approved_at,approved_by)
    values(old.id,old.slug,old.version,old.title,old.summary,old.body,old.effective_date,old.review_status,old.approved_at,old.approved_by)
    on conflict(legal_document_id,version) do nothing;
    new.version := old.version + 1;
    new.review_status := 'review_required';
    new.approved_at := null;
    new.approved_by := null;
  end if;
  if new.review_status='approved' and (new.approved_at is null or new.approved_by is null) then
    raise exception using errcode='22023',message='LEGAL_APPROVAL_METADATA_REQUIRED';
  end if;
  return new;
end;
$$;

drop trigger if exists legal_documents_version_history on public.legal_documents;
create trigger legal_documents_version_history before update on public.legal_documents
for each row execute function public.version_legal_document();

