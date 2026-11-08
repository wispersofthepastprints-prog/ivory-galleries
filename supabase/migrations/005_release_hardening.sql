-- Ivory Galleries release hardening. Apply before deploying the signed-media app.
-- 004_private_photos.sql remains a separate step after signed-media verification.

alter table public.galleries
  add column if not exists watermark_enabled boolean not null default false;

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  event_name text not null check (event_name in (
    'page_view', 'signup_completed', 'gallery_created', 'gallery_published',
    'gallery_shared', 'upgrade_started', 'gallery_unlock_started'
  )),
  page_path text not null check (
    length(page_path) <= 80 and page_path like '/%' and page_path !~ '[?#]'
  ),
  photographer_id uuid references public.photographers(id) on delete set null,
  acquisition_source text check (acquisition_source is null or length(acquisition_source) <= 60),
  acquisition_medium text check (acquisition_medium is null or length(acquisition_medium) <= 60),
  created_at timestamptz not null default now()
);
create index if not exists analytics_events_created_idx on public.analytics_events (created_at);
create index if not exists analytics_events_funnel_idx on public.analytics_events (event_name, photographer_id, created_at);
alter table public.analytics_events enable row level security;
revoke all on table public.analytics_events from anon, authenticated;
grant all on table public.analytics_events to service_role;
grant usage, select on sequence public.analytics_events_id_seq to service_role;

create table if not exists public.gallery_password_attempts (
  id bigint generated always as identity primary key,
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  attempt_key text not null,
  attempted_at timestamptz not null default now()
);
create index if not exists gallery_password_attempts_lookup_idx
  on public.gallery_password_attempts (gallery_id, attempt_key, attempted_at);
alter table public.gallery_password_attempts enable row level security;
revoke all on table public.gallery_password_attempts from anon, authenticated;
grant all on table public.gallery_password_attempts to service_role;
grant usage, select on sequence public.gallery_password_attempts_id_seq to service_role;

-- Profiles are created by the auth trigger. Client-side profile updates cannot
-- alter plan, Stripe, or storage-accounting fields.
create or replace function public.prepare_photographer_profile()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    new.subscription_tier := 'free';
    new.subscription_status := 'active';
    new.subscription_expires_at := null;
    new.stripe_customer_id := null;
    new.stripe_subscription_id := null;
    new.total_storage_bytes := 0;
    new.storage_limit_bytes := 5368709120;
    return new;
  end if;

  if auth.uid() = old.id and pg_trigger_depth() = 1 then
    if new.subscription_tier is distinct from old.subscription_tier
      or new.subscription_status is distinct from old.subscription_status
      or new.subscription_expires_at is distinct from old.subscription_expires_at
      or new.stripe_customer_id is distinct from old.stripe_customer_id
      or new.stripe_subscription_id is distinct from old.stripe_subscription_id
      or new.total_storage_bytes is distinct from old.total_storage_bytes
      or new.storage_limit_bytes is distinct from old.storage_limit_bytes then
      raise exception 'Billing and storage accounting fields are server-managed';
    end if;
  end if;

  if new.subscription_tier is distinct from old.subscription_tier then
    new.storage_limit_bytes := case new.subscription_tier
      when 'pro' then 53687091200
      when 'studio' then 214748364800
      when 'agency' then 214748364800
      else 5368709120
    end;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists photographers_profile_guard on public.photographers;
create trigger photographers_profile_guard
before insert or update on public.photographers
for each row execute function public.prepare_photographer_profile();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.photographers (id, email, business_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'business_name', ''), split_part(coalesce(new.email, ''), '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.photographers (id, email, business_name)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(nullif(u.raw_user_meta_data ->> 'business_name', ''), split_part(coalesce(u.email, ''), '@', 1))
from auth.users u
left join public.photographers p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

create or replace function public.disable_paid_unlocks_after_downgrade()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.subscription_tier not in ('studio', 'agency')
    or new.subscription_status not in ('active', 'trialing') then
    update public.galleries
      set unlock_price_cents = 0
      where photographer_id = new.id and coalesce(unlock_price_cents, 0) > 0;
  end if;
  return new;
end;
$$;

drop trigger if exists photographers_disable_unlocks on public.photographers;
create trigger photographers_disable_unlocks
after update of subscription_tier, subscription_status on public.photographers
for each row execute function public.disable_paid_unlocks_after_downgrade();

-- Free gallery limit and Studio-only paid unlock configuration.
update public.galleries
  set preview_limit = least(200, greatest(1, coalesce(preview_limit, 20)))
  where preview_limit is null or preview_limit < 1 or preview_limit > 200;
update public.galleries set unlock_price_cents = 0 where coalesce(unlock_price_cents, 0) < 0;
update public.galleries g
  set unlock_price_cents = 0
  from public.photographers p
  where p.id = g.photographer_id
    and coalesce(g.unlock_price_cents, 0) > 0
    and (p.subscription_tier not in ('studio', 'agency') or p.subscription_status not in ('active', 'trialing'));

create or replace function public.enforce_gallery_plan()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  owner_tier text;
  owner_status text;
begin
  if new.access_mode = 'full' then
    new.unlock_price_cents := 0;
  end if;

  if coalesce(new.unlock_price_cents, 0) > 0 then
    select subscription_tier, subscription_status
      into owner_tier, owner_status
      from public.photographers where id = new.photographer_id;
    if owner_tier not in ('studio', 'agency') or owner_status not in ('active', 'trialing') then
      raise exception 'Paid gallery unlocks require an active Studio plan';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists galleries_enforce_plan on public.galleries;
create trigger galleries_enforce_plan
before insert or update on public.galleries
for each row execute function public.enforce_gallery_plan();

create or replace function public.enforce_free_gallery_limit()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  owner_tier text;
begin
  perform pg_advisory_xact_lock(hashtextextended(new.photographer_id::text, 0));
  select subscription_tier into owner_tier from public.photographers where id = new.photographer_id;
  if owner_tier is null then raise exception 'Photographer profile not found'; end if;
  if owner_tier = 'free' and (select count(*) from public.galleries where photographer_id = new.photographer_id) >= 3 then
    raise exception 'Free plan is limited to three galleries';
  end if;
  return new;
end;
$$;

drop trigger if exists galleries_enforce_free_limit on public.galleries;
create trigger galleries_enforce_free_limit
before insert on public.galleries
for each row execute function public.enforce_free_gallery_limit();

alter table public.galleries drop constraint if exists galleries_preview_limit_valid;
alter table public.galleries
  add constraint galleries_preview_limit_valid check (preview_limit between 1 and 200);
alter table public.galleries drop constraint if exists galleries_unlock_price_valid;
alter table public.galleries
  add constraint galleries_unlock_price_valid check (unlock_price_cents is null or unlock_price_cents >= 0);

drop policy if exists "Users own their profile" on public.photographers;
create policy "Users read own profile" on public.photographers
  for select to authenticated using (auth.uid() = id);
create policy "Users insert own free profile" on public.photographers
  for insert to authenticated with check (auth.uid() = id and subscription_tier = 'free');
create policy "Users update own profile" on public.photographers
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Photographers manage own galleries" on public.galleries;
create policy "Users read own galleries" on public.galleries
  for select to authenticated using (photographer_id = auth.uid());
create policy "Users create own galleries" on public.galleries
  for insert to authenticated with check (photographer_id = auth.uid());
create policy "Users update own galleries" on public.galleries
  for update to authenticated using (photographer_id = auth.uid()) with check (photographer_id = auth.uid());
create policy "Users delete own galleries" on public.galleries
  for delete to authenticated using (photographer_id = auth.uid());

drop policy if exists "Photographers manage photos" on public.photos;
drop policy if exists "Photos by photographer or public" on public.photos;
create policy "Users read own photos" on public.photos
  for select to authenticated using (photographer_id = auth.uid());
create policy "Users insert own gallery photos" on public.photos
  for insert to authenticated with check (
    photographer_id = auth.uid()
    and exists (
      select 1 from public.galleries g
      where g.id = gallery_id and g.photographer_id = auth.uid()
    )
  );
create policy "Users update own gallery photos" on public.photos
  for update to authenticated
  using (photographer_id = auth.uid())
  with check (
    photographer_id = auth.uid()
    and exists (
      select 1 from public.galleries g
      where g.id = gallery_id and g.photographer_id = auth.uid()
    )
  );
create policy "Users delete own photos" on public.photos
  for delete to authenticated using (photographer_id = auth.uid());

-- Reconcile usage from photo rows after every change, including owner changes.
create or replace function public.recalculate_photographer_storage(owner_id uuid)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.photographers p
    set total_storage_bytes = coalesce((
      select sum(ph.file_size_bytes) from public.photos ph where ph.photographer_id = owner_id
    ), 0)
    where p.id = owner_id;
$$;
revoke all on function public.recalculate_photographer_storage(uuid) from public;

create or replace function public.update_photographer_storage()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    perform public.recalculate_photographer_storage(old.photographer_id);
  end if;
  if tg_op in ('INSERT', 'UPDATE') then
    perform public.recalculate_photographer_storage(new.photographer_id);
  end if;
  return coalesce(new, old);
end;
$$;

-- The storage object is the first quota boundary. Photo-row totals are
-- reconciled only after the corresponding object has passed these checks.
create or replace function public.enforce_photo_storage_upload()
returns trigger
language plpgsql
security definer
set search_path = public, storage, pg_temp
as $$
declare
  owner_id uuid;
  gallery_id uuid;
  object_size bigint;
  old_size bigint := 0;
  mime_type text;
  used_bytes bigint;
  quota_bytes bigint;
begin
  if new.bucket_id <> 'photos' then return new; end if;
  if (storage.foldername(new.name))[1] !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    or (storage.foldername(new.name))[2] !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    raise exception 'Invalid photo storage path';
  end if;
  owner_id := (storage.foldername(new.name))[1]::uuid;
  gallery_id := (storage.foldername(new.name))[2]::uuid;
  if not exists (select 1 from public.galleries g where g.id = gallery_id and g.photographer_id = owner_id) then
    raise exception 'The target gallery does not belong to this photographer';
  end if;

  if coalesce(new.metadata ->> 'size', '') !~ '^[0-9]+$' then raise exception 'Invalid photo size'; end if;
  object_size := (new.metadata ->> 'size')::bigint;
  mime_type := new.metadata ->> 'mimetype';
  if object_size <= 0 or object_size > 26214400 then raise exception 'Photos must be between 1 byte and 25 MB'; end if;
  if mime_type not in ('image/jpeg', 'image/png', 'image/webp') then raise exception 'Only JPG, PNG, and WebP photos are supported'; end if;

  if tg_op = 'UPDATE' and old.bucket_id = new.bucket_id then
    old_size := coalesce((old.metadata ->> 'size')::bigint, 0);
  end if;

  perform pg_advisory_xact_lock(hashtextextended(owner_id::text, 1));
  select coalesce(p.total_storage_bytes, 0), case p.subscription_tier
    when 'pro' then 53687091200
    when 'studio' then 214748364800
    when 'agency' then 214748364800
    else 5368709120
  end into used_bytes, quota_bytes
  from public.photographers p where p.id = owner_id;
  if not found then raise exception 'Photographer profile not found'; end if;
  if used_bytes + object_size - old_size > quota_bytes then
    raise exception 'Storage limit reached. Upgrade or remove photos before uploading.';
  end if;
  return new;
end;
$$;

drop trigger if exists photos_enforce_upload_limits on storage.objects;
create trigger photos_enforce_upload_limits
before insert or update on storage.objects
for each row execute function public.enforce_photo_storage_upload();

update storage.buckets
  set file_size_limit = 26214400,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
  where id = 'photos';

drop policy if exists "Photographers upload to own folder" on storage.objects;
create policy "Photographers upload to own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Photographers update own files" on storage.objects;
create policy "Photographers update own files" on storage.objects
  for update to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

select public.recalculate_photographer_storage(id) from public.photographers;

create or replace function public.track_gallery_view(gallery_slug text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.galleries
    set view_count = coalesce(view_count, 0) + 1
    where slug = gallery_slug
      and status = 'published'
      and (expiry_date is null or expiry_date >= current_date);
end;
$$;
revoke all on function public.track_gallery_view(text) from public;
grant execute on function public.track_gallery_view(text) to anon, authenticated, service_role;
