import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './database.types'

// Modern @supabase/ssr pattern for Route Handlers (replaces removed createRouteHandlerClient)
export function createSupabaseRouteHandler() {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
         setAll: (cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options))
          } catch {
            // Called from a Server Component context — session refresh not possible there
          }
        },
      },
    }
  )
}
