export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type Relationship<Table extends string, Column extends string> = {
  foreignKeyName: string
  columns: [Column]
  isOneToOne: boolean
  referencedRelation: Table
  referencedColumns: ['id']
}

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>, Relationships = []> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: Relationships
}

export type Database = {
  __InternalSupabase: { PostgrestVersion: '14.17' }
  public: {
    Tables: {
      galleries: Table<{
        access_mode: string
        client_email: string | null
        client_name: string | null
        cover_image_url: string | null
        created_at: string | null
        custom_domain: string | null
        download_count: number | null
        event_date: string | null
        event_type: string | null
        expiry_date: string | null
        id: string
        is_album_upsell_enabled: boolean | null
        is_comments_enabled: boolean | null
        is_downloadable: boolean | null
        is_favorites_enabled: boolean | null
        is_password_protected: boolean | null
        is_print_store_enabled: boolean | null
        metadata: Json | null
        password_hash: string | null
        photographer_id: string
        preview_limit: number
        seo_description: string | null
        seo_title: string | null
        slug: string
        status: string | null
        title: string
        unlock_price_cents: number | null
        updated_at: string | null
        view_count: number | null
        watermark_enabled: boolean
      }, {
        access_mode?: string
        client_email?: string | null
        client_name?: string | null
        cover_image_url?: string | null
        created_at?: string | null
        custom_domain?: string | null
        download_count?: number | null
        event_date?: string | null
        event_type?: string | null
        expiry_date?: string | null
        id?: string
        is_album_upsell_enabled?: boolean | null
        is_comments_enabled?: boolean | null
        is_downloadable?: boolean | null
        is_favorites_enabled?: boolean | null
        is_password_protected?: boolean | null
        is_print_store_enabled?: boolean | null
        metadata?: Json | null
        password_hash?: string | null
        photographer_id: string
        preview_limit?: number
        seo_description?: string | null
        seo_title?: string | null
        slug: string
        status?: string | null
        title: string
        unlock_price_cents?: number | null
        updated_at?: string | null
        view_count?: number | null
        watermark_enabled?: boolean
      }, Record<string, unknown>, [
        Relationship<'photographers', 'photographer_id'>,
        Relationship<'photos', 'id'>,
      ]>
      gallery_access_grants: Table<{
        access_type: string
        created_at: string
        expires_at: string
        gallery_id: string
        id: string
        token_hash: string
      }, {
        access_type: string
        created_at?: string
        expires_at: string
        gallery_id: string
        id?: string
        token_hash: string
      }, Record<string, unknown>, [
        Relationship<'galleries', 'gallery_id'>,
      ]>
      gallery_purchases: Table<{
        amount_cents: number
        created_at: string | null
        email: string
        gallery_id: string
        id: string
        stripe_session_id: string
      }, {
        amount_cents: number
        created_at?: string | null
        email: string
        gallery_id: string
        id?: string
        stripe_session_id: string
      }, Record<string, unknown>, [
        Relationship<'galleries', 'gallery_id'>,
      ]>
      gallery_password_attempts: Table<{
        id: number
        gallery_id: string
        attempt_key: string
        attempted_at: string
      }, {
        id?: number
        gallery_id: string
        attempt_key: string
        attempted_at?: string
      }>
      analytics_events: Table<{
        id: number
        event_name: string
        page_path: string
        photographer_id: string | null
        acquisition_source: string | null
        acquisition_medium: string | null
        created_at: string
      }, {
        id?: number
        event_name: string
        page_path: string
        photographer_id?: string | null
        acquisition_source?: string | null
        acquisition_medium?: string | null
        created_at?: string
      }, Record<string, unknown>, [
        Relationship<'photographers', 'photographer_id'>,
      ]>
      photographers: Table<{
        album_markup_percent: number | null
        avatar_url: string | null
        branding_colors: Json | null
        business_name: string | null
        created_at: string | null
        display_name: string | null
        email: string
        id: string
        ivoryos_calendar_id: string | null
        ivoryos_sync_enabled: boolean | null
        print_markup_percent: number | null
        storage_limit_bytes: number | null
        stripe_customer_id: string | null
        stripe_subscription_id: string | null
        subscription_expires_at: string | null
        subscription_status: string | null
        subscription_tier: string | null
        total_storage_bytes: number | null
        updated_at: string | null
      }, {
        album_markup_percent?: number | null
        avatar_url?: string | null
        branding_colors?: Json | null
        business_name?: string | null
        created_at?: string | null
        display_name?: string | null
        email: string
        id: string
        ivoryos_calendar_id?: string | null
        ivoryos_sync_enabled?: boolean | null
        print_markup_percent?: number | null
        storage_limit_bytes?: number | null
        stripe_customer_id?: string | null
        stripe_subscription_id?: string | null
        subscription_expires_at?: string | null
        subscription_status?: string | null
        subscription_tier?: string | null
        total_storage_bytes?: number | null
        updated_at?: string | null
      }>
      photos: Table<{
        created_at: string | null
        display_url: string
        file_size_bytes: number
        filename: string
        gallery_id: string
        height: number | null
        id: string
        is_highlight: boolean | null
        original_url: string
        photographer_id: string
        sort_order: number | null
        thumbnail_url: string
        watermark_url: string | null
        width: number | null
      }, {
        created_at?: string | null
        display_url: string
        file_size_bytes: number
        filename: string
        gallery_id: string
        height?: number | null
        id?: string
        is_highlight?: boolean | null
        original_url: string
        photographer_id: string
        sort_order?: number | null
        thumbnail_url: string
        watermark_url?: string | null
        width?: number | null
      }, Record<string, unknown>, [
        Relationship<'galleries', 'gallery_id'>,
        Relationship<'photographers', 'photographer_id'>,
      ]>
      ivoryos_events: Table<{
        client_name: string | null
        created_at: string | null
        external_event_id: string | null
        gallery_id: string | null
        id: string
        is_synced: boolean
        photographer_id: string
        start_time: string | null
        title: string
      }, {
        client_name?: string | null
        created_at?: string | null
        external_event_id?: string | null
        gallery_id?: string | null
        id?: string
        is_synced?: boolean
        photographer_id: string
        start_time?: string | null
        title: string
      }, Record<string, unknown>, [
        Relationship<'galleries', 'gallery_id'>,
        Relationship<'photographers', 'photographer_id'>,
      ]>
      print_orders: Table<{
        client_email: string
        created_at: string | null
        gallery_id: string
        id: string
        photographer_id: string
        photographer_markup_cents: number
        status: string | null
        stripe_payment_intent_id: string | null
        total_cents: number
        updated_at: string | null
      }, {
        client_email: string
        created_at?: string | null
        gallery_id: string
        id?: string
        photographer_id: string
        photographer_markup_cents: number
        status?: string | null
        stripe_payment_intent_id?: string | null
        total_cents: number
        updated_at?: string | null
      }, Record<string, unknown>, [
        Relationship<'galleries', 'gallery_id'>,
        Relationship<'photographers', 'photographer_id'>,
      ]>
      print_products: Table<{
        base_price_cents: number
        category: string
        created_at: string | null
        description: string | null
        id: string
        is_active: boolean | null
        name: string
        suggested_retail_cents: number
      }, {
        base_price_cents: number
        category: string
        created_at?: string | null
        description: string | null
        id?: string
        is_active?: boolean | null
        name: string
        suggested_retail_cents: number
      }>
    }
    Views: { [_ in never]: never }
    Functions: {
      track_gallery_view: { Args: { gallery_slug: string }; Returns: undefined }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
