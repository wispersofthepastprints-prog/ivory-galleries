import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseRouteHandler } from '@/src/lib/supabase-server'
import { supabaseAdmin } from '@/src/lib/supabase-admin'
import { hashGalleryPassword } from '@/src/lib/gallery-password'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const galleryId = body?.galleryId
  const enabled = body?.enabled === true
  const password = body?.password
  if (typeof galleryId !== 'string' || !/^[a-f0-9-]{36}$/i.test(galleryId)) {
    return NextResponse.json({ error: 'Invalid gallery' }, { status: 400 })
  }
  if (enabled && (typeof password !== 'string' || password.length < 8 || password.length > 200)) {
    return NextResponse.json({ error: 'Use a password between 8 and 200 characters.' }, { status: 400 })
  }

  const supabase = await createSupabaseRouteHandler()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: photographer } = await supabaseAdmin
    .from('photographers')
    .select('subscription_tier, subscription_status')
    .eq('id', user.id)
    .single()
  const planAllowsPassword = ['pro', 'studio', 'agency'].includes(photographer?.subscription_tier || '') && ['active', 'trialing'].includes(photographer?.subscription_status || '')
  if (enabled && !planAllowsPassword) {
    return NextResponse.json({ error: 'Password protection requires an active Pro or Studio plan.' }, { status: 403 })
  }

  const { data: gallery } = await supabaseAdmin
    .from('galleries')
    .select('id')
    .eq('id', galleryId)
    .eq('photographer_id', user.id)
    .maybeSingle()
  if (!gallery) return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })

  const { error } = await supabaseAdmin
    .from('galleries')
    .update({
      is_password_protected: enabled,
      password_hash: enabled ? hashGalleryPassword(password) : null,
    })
    .eq('id', galleryId)
    .eq('photographer_id', user.id)

  if (error) return NextResponse.json({ error: 'Unable to save password settings' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
