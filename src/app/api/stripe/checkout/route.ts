import { NextRequest, NextResponse } from 'next/server'
import { stripe, TIER_PRICES } from '@/src/lib/stripe'
import { createSupabaseRouteHandler } from '@/src/lib/supabase-server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tier = searchParams.get('tier') as 'pro' | 'studio' | 'agency'
  const billing = searchParams.get('billing') || 'monthly'

  if (!tier || !TIER_PRICES[tier]) {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
  }

  const priceId = billing === 'yearly' ? TIER_PRICES[tier].yearly : TIER_PRICES[tier].monthly
  if (!/^price_[A-Za-z0-9]{20,}$/.test(priceId)) {
    return NextResponse.json(
      { error: 'Billing not configured: add real Stripe Price IDs in src/lib/stripe.ts' },
      { status: 503 },
    )
  }
  const supabase = createSupabaseRouteHandler()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const sessionStripe = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing&success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing&canceled=true`,
    customer_email: session.user.email,
    subscription_data: { metadata: { tier, user_id: session.user.id } },
  })

  return NextResponse.redirect(sessionStripe.url!, 303)
}
