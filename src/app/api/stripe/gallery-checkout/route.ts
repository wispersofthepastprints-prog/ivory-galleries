import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/src/lib/stripe'
import { supabaseAdmin } from '@/src/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const { slug } = await req.json()
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

  const { data: gallery } = await supabaseAdmin
    .from('galleries').select('*').eq('slug', slug).eq('status', 'published').single()
  if (!gallery) return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
  if (!gallery.unlock_price_cents || gallery.unlock_price_cents <= 0) {
    return NextResponse.json({ error: 'This gallery is not for sale' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: gallery.unlock_price_cents,
        product_data: { name: `Full gallery: ${gallery.title}` },
      },
      quantity: 1,
    }],
    metadata: { gallery_id: gallery.id, slug: gallery.slug, type: 'gallery_unlock' },
    success_url: `${appUrl}/api/stripe/gallery-verify?session_id={CHECKOUT_SESSION_ID}&slug=${slug}`,
    cancel_url: `${appUrl}/g/${slug}`,
  })

  return NextResponse.json({ url: session.url })
}
