import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/src/lib/stripe'
import { supabaseAdmin } from '@/src/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  // Gallery unlock purchases (mode=payment)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    if (session.metadata?.type === 'gallery_unlock' && session.payment_status === 'paid') {
      await supabaseAdmin.from('gallery_purchases').upsert({
        gallery_id: session.metadata.gallery_id,
        email: session.customer_details?.email || 'unknown',
        amount_cents: session.amount_total ?? 0,
        stripe_session_id: session.id,
      }, { onConflict: 'stripe_session_id' })
    }
    if (session.mode === 'subscription') {
      const tier = session.metadata?.tier || 'pro'
      const userId = session.metadata?.user_id
      if (userId) {
        await supabaseAdmin.from('photographers')
          .update({
            subscription_tier: tier,
            subscription_status: 'active',
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
          })
          .eq('id', userId)
      }
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as any
    await supabaseAdmin.from('photographers')
      .update({ subscription_status: sub.status })
      .eq('stripe_subscription_id', sub.id)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as any
    await supabaseAdmin.from('photographers')
      .update({ subscription_tier: 'free', subscription_status: 'canceled', stripe_subscription_id: null })
      .eq('stripe_subscription_id', sub.id)
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as any
    await supabaseAdmin.from('photographers')
      .update({ subscription_status: 'past_due' })
      .eq('stripe_subscription_id', invoice.subscription)
  }

  return NextResponse.json({ received: true })
}
