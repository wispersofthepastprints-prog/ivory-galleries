import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseRouteHandler } from '@/src/lib/supabase-server'
import { supabaseAdmin } from '@/src/lib/supabase-admin'
import { createSignedPhotoUrl } from '@/src/lib/photo-delivery'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const photoIds = Array.isArray(body?.photoIds)
    ? body.photoIds.filter((id: unknown): id is string => typeof id === 'string' && /^[a-f0-9-]{36}$/i.test(id)).slice(0, 200)
    : []
  if (photoIds.length === 0) return NextResponse.json({ urls: {} })

  const supabase = await createSupabaseRouteHandler()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: photos, error } = await supabaseAdmin
    .from('photos')
    .select('id, original_url, display_url, thumbnail_url')
    .eq('photographer_id', user.id)
    .in('id', photoIds)
    .limit(200)

  if (error) return NextResponse.json({ error: 'Unable to load photos' }, { status: 500 })

  const entries = await Promise.all((photos || []).map(async (photo) => {
    const source = photo.display_url || photo.original_url || photo.thumbnail_url
    const url = source ? await createSignedPhotoUrl(source) : null
    return [photo.id, url] as const
  }))

  return NextResponse.json({
    urls: Object.fromEntries(entries.filter((entry): entry is readonly [string, string] => Boolean(entry[1]))),
  })
}
