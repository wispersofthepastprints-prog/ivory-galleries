import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseRouteHandler } from '@/src/lib/supabase-server'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (code) {
    const supabase = await createSupabaseRouteHandler()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) return NextResponse.redirect(new URL('/login?error=confirmation', req.url))
  }
  return NextResponse.redirect(new URL('/dashboard', req.url))
}
