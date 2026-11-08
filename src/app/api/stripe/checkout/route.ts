import { NextRequest, NextResponse } from 'next/server'
import { stripe, priceTableFor, detectCurrency } from '@/src/lib/stripe'
import { createSupabaseRouteHandler } from '@/src/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const tier = searchParams.get('tier')
    const billing = searchParams.get('billing') || 'monthly'
    if ((tier !== 'pro' && tier !== 'studio') || (billing !== 'monthly' && billing !== 'yearly')) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const currency = detectCurrency(req.headers, searchParams.get('currency'))
    const table = priceTableFor(currency)
    const priceId = billing === 'yearly' ? table[tier].yearly : table[tier].monthly
    if (!/^price_[A-Za-z0-9]{20,}$/.test(priceId)) {
      return NextResponse.json({ error: 'Billing is not configured.' }, { status: 503 })
    }

    const supabase = await createSupabaseRouteHandler()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(new URL('/login', req.url))

    const { data: photographer } = await supabase
      .from('photographers')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin

    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard/settings?tab=billing&success=true`,
      cancel_url: `${appUrl}/dashboard/settings?tab=billing&canceled=true`,
      customer: photographer?.stripe_customer_id || undefined,
      customer_email: photographer?.stripe_customer_id ? undefined : user.email,
      client_reference_id: user.id,
      metadata: { tier, user_id: user.id, currency },
      subscription_data: { metadata: { tier, user_id: user.id, currency } },
    })

    if (!checkout.url) throw new Error('Stripe did not return a Checkout URL')
    return NextResponse.redirect(checkout.url, 303)
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.redirect(new URL('/dashboard/settings?tab=billing&error=checkout_failed', req.url))
  }
}
