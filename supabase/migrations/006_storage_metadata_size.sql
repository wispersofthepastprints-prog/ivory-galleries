-- Supabase Storage 1.89 uses contentLength during the initial upload
-- authorisation write and size on the completed object. Accept either
-- server-supplied value without weakening the existing upload controls.

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

  if coalesce(new.metadata ->> 'size', new.metadata ->> 'contentLength', '') !~ '^[0-9]+$' then
    raise exception 'Invalid photo size';
  end if;
  object_size := coalesce(new.metadata ->> 'size', new.metadata ->> 'contentLength')::bigint;
  mime_type := new.metadata ->> 'mimetype';
  if object_size <= 0 or object_size > 26214400 then raise exception 'Photos must be between 1 byte and 25 MB'; end if;
  if mime_type not in ('image/jpeg', 'image/png', 'image/webp') then raise exception 'Only JPG, PNG, and WebP photos are supported'; end if;

  if tg_op = 'UPDATE' and old.bucket_id = new.bucket_id then
    old_size := coalesce((old.metadata ->> 'size')::bigint, (old.metadata ->> 'contentLength')::bigint, 0);
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
