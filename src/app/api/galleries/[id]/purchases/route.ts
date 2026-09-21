import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/src/lib/supabase-admin'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: gallery } = await supabaseAdmin
    .from('galleries').select('photographer_id').eq('id', params.id).single()
  if (!gallery || gallery.photographer_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: purchases } = await supabaseAdmin
    .from('gallery_purchases').select('amount_cents').eq('gallery_id', params.id)

  const rows = purchases || []
  return NextResponse.json({
    count: rows.length,
    cents: rows.reduce((sum: number, r: any) => sum + (r.amount_cents || 0), 0),
  })
}
