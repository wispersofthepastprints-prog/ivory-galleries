-- Ivory Galleries 002 — monetization layer + bug fixes
-- Run AFTER 001_initial_schema.sql

-- Per-gallery access controls
alter table galleries add column if not exists access_mode text not null default 'preview'
  check (access_mode in ('preview', 'full'));
alter table galleries add column if not exists preview_limit integer not null default 20;
alter table galleries add column if not exists unlock_price_cents integer;

-- Paid unlock purchases (clients buying full gallery access)
create table if not exists gallery_purchases (
  id uuid primary key default uuid_generate_v4(),
  gallery_id uuid not null references galleries(id) on delete cascade,
  email text not null,
  amount_cents integer not null,
  stripe_session_id text not null unique,
  created_at timestamp with time zone default now()
);
alter table gallery_purchases enable row level security;
create policy "Owners see their gallery purchases" on gallery_purchases
  for select using (exists (
    select 1 from galleries g where g.id = gallery_id and g.photographer_id = auth.uid()));

-- IvoryOS sync events (IvoryOS emits booking.completed; sync creates draft gallery)
create table if not exists ivoryos_events (
  id uuid primary key default uuid_generate_v4(),
  photographer_id uuid not null references photographers(id) on delete cascade,
  external_event_id text,
  title text not null,
  client_name text,
  start_time timestamp with time zone,
  is_synced boolean not null default false,
  gallery_id uuid references galleries(id) on delete set null,
  created_at timestamp with time zone default now()
);
alter table ivoryos_events enable row level security;
create policy "Owners manage their IvoryOS events" on ivoryos_events
  for all using (photographer_id = auth.uid()) with check (photographer_id = auth.uid());
create unique index if not exists ivoryos_events_external_idx
  on ivoryos_events (photographer_id, external_event_id) where external_event_id is not null;

-- FIX: storage usage trigger broke on every photo delete (NEW is unassigned in DELETE)
create or replace function update_photographer_storage()
returns trigger as $$
declare
  photographer_id uuid;
  size_delta bigint;
begin
  if tg_op = 'DELETE' then
    photographer_id := old.photographer_id;
    size_delta := -old.file_size_bytes;
  else
    photographer_id := new.photographer_id;
    size_delta := new.file_size_bytes - coalesce(old.file_size_bytes, 0);
  end if;

  update photographers
  set storage_used_bytes = greatest(0, storage_used_bytes + size_delta)
  where id = photographer_id;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

-- Storage policies: public read, photographers write only inside their own folder
insert into storage.buckets (id, name, public) values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "Public read access to photos"
  on storage.objects for select using (bucket_id = 'photos');
create policy "Photographers upload to own folder"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Photographers update own files"
  on storage.objects for update to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Photographers delete own files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
