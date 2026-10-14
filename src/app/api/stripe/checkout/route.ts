import { NextRequest, NextResponse } from 'next/server'
import { stripe, priceTableFor, detectCurrency } from '@/src/lib/stripe'
import { createSupabaseRouteHandler } from '@/src/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const tier = searchParams.get('tier') as 'pro' | 'studio'
    const billing = searchParams.get('billing') || 'monthly'

    if (!tier || !priceTableFor('aud')[tier]) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    const currency = detectCurrency(req.headers, searchParams.get('currency'))
    const table = priceTableFor(currency)
    const priceId = billing === 'yearly' ? table[tier].yearly : table[tier].monthly
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin

    const sessionStripe = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard/settings?tab=billing&success=true`,
      cancel_url: `${appUrl}/dashboard/settings?tab=billing&canceled=true`,
      customer_email: session.user.email ?? undefined,
      subscription_data: { metadata: { tier, user_id: session.user.id, currency } },
    })

    return NextResponse.redirect(sessionStripe.url!, 303)
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.redirect(new URL('/dashboard/settings?tab=billing&error=checkout_failed', req.url))
  }
}
