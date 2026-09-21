import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseRouteHandler } from '@/src/lib/supabase-server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createSupabaseRouteHandler()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL('/dashboard', req.url))
}
