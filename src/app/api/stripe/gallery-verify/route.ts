import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/src/lib/stripe'
import { supabaseAdmin } from '@/src/lib/supabase-admin'
import { issueGalleryAccess } from '@/src/lib/gallery-access'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')
  const slug = req.nextUrl.searchParams.get('slug')
  if (!sessionId || !slug) return NextResponse.redirect(new URL('/', req.url))

  const session = await stripe.checkout.sessions.retrieve(sessionId)
  const galleryId = session.metadata?.gallery_id
  if (
    session.payment_status !== 'paid' ||
    session.metadata?.type !== 'gallery_unlock' ||
    session.metadata?.slug !== slug ||
    !galleryId
  ) {
    return NextResponse.redirect(new URL(`/g/${slug}`, req.url))
  }

  const { data: gallery } = await supabaseAdmin
    .from('galleries')
    .select('id')
    .eq('id', galleryId)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (!gallery) return NextResponse.redirect(new URL(`/g/${slug}`, req.url))

  const { error: purchaseError } = await supabaseAdmin.from('gallery_purchases').upsert({
    gallery_id: galleryId,
    email: session.customer_details?.email || 'unknown',
    amount_cents: session.amount_total ?? 0,
    stripe_session_id: sessionId,
  }, { onConflict: 'stripe_session_id' })

  if (purchaseError) {
    return NextResponse.json({ error: 'Unable to record gallery purchase' }, { status: 500 })
  }

  try {
    const { token, maxAge } = await issueGalleryAccess(galleryId, 'purchase')
    const res = NextResponse.redirect(new URL(`/g/${slug}`, req.url))
    res.cookies.set(`unlocked_${galleryId}`, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge,
      path: '/',
    })
    return res
  } catch {
    return NextResponse.json({ error: 'Unable to grant gallery access' }, { status: 500 })
  }
}
