import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { supabaseAdmin } from '@/src/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const { galleryId, password } = await req.json()

  const { data: gallery } = await supabaseAdmin
    .from('galleries').select('id, password_hash, is_password_protected').eq('id', galleryId).single()
  if (!gallery) return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
  if (!gallery.is_password_protected) return NextResponse.json({ ok: true })

  const hash = createHash('sha256').update(password).digest('hex')
  if (hash !== gallery.password_hash) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(`gp_${galleryId}`, '1', { httpOnly: true, maxAge: 60 * 60 * 24 * 30, path: '/' })
  return res
}
