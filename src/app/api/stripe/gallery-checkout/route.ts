import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/src/lib/stripe'
import { supabaseAdmin } from '@/src/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const slug = typeof body?.slug === 'string' ? body.slug : ''
  if (!/^[a-z0-9-]{1,160}$/.test(slug)) return NextResponse.json({ error: 'Invalid gallery' }, { status: 400 })

  const { data: gallery } = await supabaseAdmin
    .from('galleries')
    .select('id, title, slug, expiry_date, unlock_price_cents, photographer:photographers(subscription_tier, subscription_status)')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (!gallery) return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
  if (gallery.expiry_date && new Date(gallery.expiry_date) < new Date()) {
    return NextResponse.json({ error: 'Gallery expired' }, { status: 410 })
  }

  const photographer = Array.isArray(gallery.photographer) ? gallery.photographer[0] : gallery.photographer
  const canSell = ['studio', 'agency'].includes(photographer?.subscription_tier || '') && ['active', 'trialing'].includes(photographer?.subscription_status || '')
  if (!canSell) return NextResponse.json({ error: 'Paid unlocks are available on Studio.' }, { status: 403 })
  if (!gallery.unlock_price_cents || gallery.unlock_price_cents <= 0) {
    return NextResponse.json({ error: 'This gallery is not for sale' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'aud',
        unit_amount: gallery.unlock_price_cents,
        product_data: { name: `Full gallery: ${gallery.title}` },
      },
      quantity: 1,
    }],
    metadata: { gallery_id: gallery.id, slug: gallery.slug, type: 'gallery_unlock' },
    success_url: `${appUrl}/api/stripe/gallery-verify?session_id={CHECKOUT_SESSION_ID}&slug=${encodeURIComponent(slug)}`,
    cancel_url: `${appUrl}/g/${encodeURIComponent(slug)}`,
  })

  return NextResponse.json({ url: session.url })
}
