import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

// Safe for browser bundles — uses only NEXT_PUBLIC_* env vars.
// Server-side admin access lives in ./supabase-admin (server-only).
export const supabaseBrowser = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)
