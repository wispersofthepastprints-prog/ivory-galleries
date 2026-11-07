-- Server-verifiable gallery access grants. Only the service role may read or write them.
create table if not exists public.gallery_access_grants (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  access_type text not null check (access_type in ('password', 'purchase')),
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists gallery_access_grants_lookup_idx
  on public.gallery_access_grants (gallery_id, access_type, token_hash, expires_at);

alter table public.gallery_access_grants enable row level security;
revoke all on table public.gallery_access_grants from anon, authenticated;
grant all on table public.gallery_access_grants to service_role;

-- Public gallery pages use the server-side Supabase admin client. Anonymous API
-- access is unnecessary and exposes gallery metadata and every published photo row.
drop policy if exists "Public galleries readable" on public.galleries;
drop policy if exists "Photos by photographer or public" on public.photos;

-- Reconcile fresh installations with the live storage accounting schema.
alter table public.photographers
  alter column storage_limit_bytes set default 5368709120;

create or replace function public.update_photographer_storage()
returns trigger
language plpgsql
security definer
as $$
declare
  size_delta bigint := 0;
  pid uuid;
begin
  if tg_op = 'INSERT' then
    pid := new.photographer_id;
    size_delta := coalesce(new.file_size_bytes, 0);
  elsif tg_op = 'DELETE' then
    pid := old.photographer_id;
    size_delta := -coalesce(old.file_size_bytes, 0);
  elsif tg_op = 'UPDATE' then
    pid := new.photographer_id;
    size_delta := coalesce(new.file_size_bytes, 0) - coalesce(old.file_size_bytes, 0);
  end if;

  if pid is not null and size_delta <> 0 then
    update public.photographers
      set total_storage_bytes = greatest(0, coalesce(total_storage_bytes, 0) + size_delta)
      where id = pid;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;
