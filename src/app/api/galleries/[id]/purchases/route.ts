import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/src/lib/supabase-admin'
import { createSupabaseRouteHandler } from '@/src/lib/supabase-server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseRouteHandler()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: gallery } = await supabaseAdmin
    .from('galleries').select('photographer_id').eq('id', id).maybeSingle()
  if (!gallery || gallery.photographer_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: purchases, error } = await supabaseAdmin
    .from('gallery_purchases').select('amount_cents').eq('gallery_id', id)
  if (error) return NextResponse.json({ error: 'Unable to load sales' }, { status: 500 })

  const rows = purchases || []
  return NextResponse.json({
    count: rows.length,
    cents: rows.reduce((sum, row) => sum + (row.amount_cents || 0), 0),
  })
}
