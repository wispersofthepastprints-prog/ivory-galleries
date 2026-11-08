import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { supabaseAdmin } from '@/src/lib/supabase-admin'
import { issueGalleryAccess } from '@/src/lib/gallery-access'
import { hashGalleryPassword, verifyGalleryPassword } from '@/src/lib/gallery-password'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const galleryId = body?.galleryId
  const slug = body?.slug
  const password = body?.password

  if (typeof galleryId !== 'string' || typeof slug !== 'string' || typeof password !== 'string' || !password) {
    return NextResponse.json({ error: 'Gallery and password are required' }, { status: 400 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
  const attemptKey = createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY!).update(`${galleryId}:${ip}`).digest('hex')
  const windowStart = new Date(Date.now() - 15 * 60 * 1000).toISOString()
  const { count } = await supabaseAdmin
    .from('gallery_password_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('gallery_id', galleryId)
    .eq('attempt_key', attemptKey)
    .gte('attempted_at', windowStart)
  if ((count || 0) >= 10) {
    return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 })
  }

  const { data: gallery, error } = await supabaseAdmin
    .from('galleries')
    .select('id, password_hash, is_password_protected, expiry_date')
    .eq('id', galleryId)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error || !gallery) return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
  if (gallery.expiry_date && new Date(gallery.expiry_date) < new Date()) {
    return NextResponse.json({ error: 'Gallery expired' }, { status: 410 })
  }
  if (!gallery.is_password_protected) return NextResponse.json({ ok: true })

  if (!gallery.password_hash || !verifyGalleryPassword(password, gallery.password_hash)) {
    await supabaseAdmin.from('gallery_password_attempts').insert({ gallery_id: galleryId, attempt_key: attemptKey })
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  try {
    if (!gallery.password_hash.startsWith('scrypt$')) {
      await supabaseAdmin.from('galleries').update({ password_hash: hashGalleryPassword(password) }).eq('id', galleryId)
    }
    await supabaseAdmin.from('gallery_password_attempts').delete().eq('gallery_id', galleryId).eq('attempt_key', attemptKey)
    const { token, maxAge } = await issueGalleryAccess(galleryId, 'password')
    const res = NextResponse.json({ ok: true })
    res.cookies.set(`gp_${galleryId}`, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge,
      path: '/',
    })
    return res
  } catch {
    return NextResponse.json({ error: 'Unable to unlock gallery' }, { status: 500 })
  }
}
