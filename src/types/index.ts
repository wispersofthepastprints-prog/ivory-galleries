export interface Photographer {
  id: string;
  email: string;
  display_name: string | null;
  business_name: string | null;
  avatar_url: string | null;
  branding_colors: {
    primary: string;
    accent: string;
    background: string;
  };
  subscription_tier: 'free' | 'pro' | 'studio' | 'agency';
  subscription_status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'incomplete';
  subscription_expires_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  total_storage_bytes: number;
  storage_limit_bytes: number;
  print_markup_percent: number;
  album_markup_percent: number;
  ivoryos_sync_enabled: boolean;
  ivoryos_calendar_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Gallery {
  id: string;
  photographer_id: string;
  title: string;
  slug: string;
  client_name: string | null;
  client_email: string | null;
  event_date: string | null;
  event_type: string;
  cover_image_url: string | null;
  password_hash: string | null;
  is_password_protected: boolean;
  is_downloadable: boolean;
  is_favorites_enabled: boolean;
  is_comments_enabled: boolean;
  is_print_store_enabled: boolean;
  is_album_upsell_enabled: boolean;
  expiry_date: string | null;
  view_count: number;
  download_count: number;
  status: 'draft' | 'published' | 'archived';
  custom_domain: string | null;
  seo_title: string | null;
  seo_description: string | null;
  metadata: Record<string, any>;
  // Monetization fields (migration 002)
  access_mode?: 'preview' | 'full';
  preview_limit?: number;
  unlock_price_cents?: number;
  watermark_enabled?: boolean;
  // Aliases used by public gallery components
  password?: string | null;
  expires_at?: string | null;
  is_published?: boolean;
  created_at: string;
  updated_at: string;
  photos?: Photo[];
  photographer?: Photographer;
}

export interface Photo {
  id: string;
  gallery_id: string;
  photographer_id: string;
  filename: string;
  original_url: string;
  display_url: string;
  thumbnail_url: string;
  watermark_url: string | null;
  file_size_bytes: number;
  width: number | null;
  height: number | null;
  sort_order: number;
  is_highlight: boolean;
  created_at: string;
}

export interface PrintProduct {
  id: string;
  name: string;
  description: string | null;
  category: string;
  base_price_cents: number;
  suggested_retail_cents: number;
  is_active: boolean;
  created_at: string;
}

export interface PrintOrder {
  id: string;
  gallery_id: string;
  photographer_id: string;
  client_email: string;
  status: string;
  total_cents: number;
  photographer_markup_cents: number;
  stripe_payment_intent_id: string | null;
  created_at: string;
}

export interface UploadQueueItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

export type SubscriptionTier = 'free' | 'pro' | 'studio' | 'agency';