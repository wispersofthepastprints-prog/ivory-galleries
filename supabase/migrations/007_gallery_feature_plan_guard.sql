-- Enforce paid gallery features at the database boundary, not only in the UI/API.
-- This prevents direct authenticated REST writes from bypassing plan restrictions.

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

  if coalesce(new.unlock_price_cents, 0) > 0
    or coalesce(new.is_password_protected, false)
    or coalesce(new.is_favorites_enabled, false) then
    select subscription_tier, subscription_status
      into owner_tier, owner_status
      from public.photographers where id = new.photographer_id;

    if coalesce(new.is_password_protected, false)
      and (owner_tier not in ('pro', 'studio', 'agency') or owner_status not in ('active', 'trialing')) then
      raise exception 'Password protection requires an active Pro or Studio plan';
    end if;

    if coalesce(new.is_favorites_enabled, false)
      and (owner_tier not in ('pro', 'studio', 'agency') or owner_status not in ('active', 'trialing')) then
      raise exception 'Client favourites require an active Pro or Studio plan';
    end if;

    if coalesce(new.unlock_price_cents, 0) > 0
      and (owner_tier not in ('studio', 'agency') or owner_status not in ('active', 'trialing')) then
      raise exception 'Paid gallery unlocks require an active Studio plan';
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

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

  if new.subscription_tier not in ('pro', 'studio', 'agency')
    or new.subscription_status not in ('active', 'trialing') then
    update public.galleries
      set is_password_protected = false,
          is_favorites_enabled = false,
          password_hash = null
      where photographer_id = new.id
        and (is_password_protected or is_favorites_enabled or password_hash is not null);
  end if;
  return new;
end;
$$;
