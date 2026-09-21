-- Enable RLS

-- PHOTOGRAPHERS
create table photographers (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  display_name text,
  business_name text,
  avatar_url text,
  branding_colors jsonb default '{"primary":"#0A0A0A","accent":"#C9A227","background":"#F8F6F0"}',
  subscription_tier text default 'free' check (subscription_tier in ('free','pro','studio','agency')),
  subscription_status text default 'active' check (subscription_status in ('active','canceled','past_due','unpaid','trialing','incomplete')),
  subscription_expires_at timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  total_storage_bytes bigint default 0,
  storage_limit_bytes bigint default 1073741824,
  print_markup_percent integer default 25,
  album_markup_percent integer default 40,
  ivoryos_sync_enabled boolean default false,
  ivoryos_calendar_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- GALLERIES
create table galleries (
  id uuid default gen_random_uuid() primary key,
  photographer_id uuid references photographers(id) on delete cascade not null,
  title text not null,
  slug text unique not null,
  client_name text,
  client_email text,
  event_date date,
  event_type text default 'wedding',
  cover_image_url text,
  password_hash text,
  is_password_protected boolean default false,
  is_downloadable boolean default true,
  is_favorites_enabled boolean default false,
  is_comments_enabled boolean default false,
  is_print_store_enabled boolean default false,
  is_album_upsell_enabled boolean default false,
  expiry_date date,
  view_count integer default 0,
  download_count integer default 0,
  status text default 'draft' check (status in ('draft','published','archived')),
  custom_domain text,
  seo_title text,
  seo_description text,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PHOTOS
create table photos (
  id uuid default gen_random_uuid() primary key,
  gallery_id uuid references galleries(id) on delete cascade not null,
  photographer_id uuid references photographers(id) on delete cascade not null,
  filename text not null,
  original_url text not null,
  display_url text not null,
  thumbnail_url text not null,
  watermark_url text,
  file_size_bytes bigint not null,
  width integer,
  height integer,
  sort_order integer default 0,
  is_highlight boolean default false,
  created_at timestamptz default now()
);

-- PRINT PRODUCTS
create table print_products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  category text not null,
  base_price_cents integer not null,
  suggested_retail_cents integer not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- PRINT ORDERS
create table print_orders (
  id uuid default gen_random_uuid() primary key,
  gallery_id uuid references galleries(id) on delete cascade not null,
  photographer_id uuid references photographers(id) on delete cascade not null,
  client_email text not null,
  status text default 'pending',
  total_cents integer not null,
  photographer_markup_cents integer not null,
  stripe_payment_intent_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS POLICIES
create policy "Users own their profile"
  on photographers for all using (auth.uid() = id);

create policy "Photographers manage own galleries"
  on galleries for all using (photographer_id = auth.uid());

create policy "Public galleries readable"
  on galleries for select using (status = 'published');

create policy "Photos by photographer or public"
  on photos for select using (
    photographer_id = auth.uid() or
    exists (select 1 from galleries where galleries.id = photos.gallery_id and galleries.status = 'published')
  );

create policy "Photographers manage photos"
  on photos for all using (photographer_id = auth.uid());

-- Functions
create or replace function update_photographer_storage()
returns trigger as $$
begin
  update photographers
  set total_storage_bytes = (select coalesce(sum(file_size_bytes), 0) from photos where photographer_id = NEW.photographer_id)
  where id = NEW.photographer_id;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger photos_storage_update
  after insert or update or delete on photos
  for each row execute function update_photographer_storage();

create or replace function track_gallery_view(gallery_slug text)
returns void as $$
begin
  update galleries set view_count = view_count + 1 where slug = gallery_slug;
end;
$$ language plpgsql security definer;
