import { NextRequest, NextResponse } from 'next/server'
import { ANALYTICS_EVENTS, safeAnalyticsPath } from '@/src/lib/analytics'
import { supabaseAdmin } from '@/src/lib/supabase-admin'
import { createSupabaseRouteHandler } from '@/src/lib/supabase-server'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const eventName = body?.eventName
  const pagePath = typeof body?.pagePath === 'string' ? safeAnalyticsPath(body.pagePath) : null
  if (!ANALYTICS_EVENTS.includes(eventName) || !pagePath) {
    return NextResponse.json({ error: 'Invalid event' }, { status: 400 })
  }

  let photographerId: string | null = null
  if (eventName !== 'page_view' && eventName !== 'gallery_unlock_started') {
    const supabase = await createSupabaseRouteHandler()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    photographerId = user.id
  }

  const cleanAcquisition = (value: unknown) => typeof value === 'string'
    ? value.toLowerCase().replace(/[^a-z0-9_.-]/g, '').slice(0, 60) || null
    : null
  const source = cleanAcquisition(body?.source)
  const medium = cleanAcquisition(body?.medium)
  const { error } = await supabaseAdmin.from('analytics_events').insert({
    event_name: eventName,
    page_path: pagePath,
    photographer_id: photographerId,
    acquisition_source: source,
    acquisition_medium: medium,
  })

  if (error) return NextResponse.json({ error: 'Event not recorded' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
