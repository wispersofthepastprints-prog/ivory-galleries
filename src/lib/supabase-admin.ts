// SERVER-ONLY — never import this into a 'use client' component or shared module.
// Uses the service_role key, which bypasses all RLS. Browser bundles must not
// contain this file (secret env vars are not exposed to the browser anyway).
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
)
