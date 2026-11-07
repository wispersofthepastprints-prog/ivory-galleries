import { NextRequest, NextResponse } from 'next/server'
import { createHash, timingSafeEqual } from 'crypto'
import { supabaseAdmin } from '@/src/lib/supabase-admin'
import { issueGalleryAccess } from '@/src/lib/gallery-access'

function passwordsMatch(password: string, storedHash: string) {
  const candidate = createHash('sha256').update(password).digest('hex')
  const expected = Buffer.from(storedHash, 'utf8')
  const actual = Buffer.from(candidate, 'utf8')
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const galleryId = body?.galleryId
  const password = body?.password

  if (typeof galleryId !== 'string' || typeof password !== 'string' || !password) {
    return NextResponse.json({ error: 'Gallery and password are required' }, { status: 400 })
  }

  const { data: gallery, error } = await supabaseAdmin
    .from('galleries')
    .select('id, password_hash, is_password_protected')
    .eq('id', galleryId)
    .single()

  if (error || !gallery) return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
  if (!gallery.is_password_protected) return NextResponse.json({ ok: true })
  if (!gallery.password_hash || !passwordsMatch(password, gallery.password_hash)) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  try {
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
