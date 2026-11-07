import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/src/lib/stripe'
import { supabaseAdmin } from '@/src/lib/supabase-admin'

function webhookFailure(message: string, error?: unknown) {
  console.error(message, error)
  return NextResponse.json({ error: message }, { status: 500 })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any

    if (session.metadata?.type === 'gallery_unlock' && session.payment_status === 'paid') {
      if (!session.metadata.gallery_id) return webhookFailure('Gallery unlock metadata missing')

      const { error } = await supabaseAdmin.from('gallery_purchases').upsert({
        gallery_id: session.metadata.gallery_id,
        email: session.customer_details?.email || 'unknown',
        amount_cents: session.amount_total ?? 0,
        stripe_session_id: session.id,
      }, { onConflict: 'stripe_session_id' })

      if (error) return webhookFailure('Unable to record gallery unlock', error)
    }

    if (session.mode === 'subscription') {
      let tier = session.metadata?.tier
      let userId = session.metadata?.user_id

      // Older Checkout Sessions stored these fields only on the Subscription.
      if ((!tier || !userId) && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription)
        tier = tier || subscription.metadata?.tier
        userId = userId || subscription.metadata?.user_id
      }

      if (!userId || !['pro', 'studio'].includes(tier)) {
        return webhookFailure('Subscription provisioning metadata missing')
      }

      const { error } = await supabaseAdmin.from('photographers')
        .update({
          subscription_tier: tier,
          subscription_status: 'active',
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
        })
        .eq('id', userId)

      if (error) return webhookFailure('Unable to provision subscription', error)
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as any
    const updates: Record<string, unknown> = {
      subscription_status: sub.status === 'incomplete_expired'
        ? 'canceled'
        : sub.status === 'paused'
          ? 'unpaid'
          : sub.status,
    }

    if (['pro', 'studio'].includes(sub.metadata?.tier)) {
      updates.subscription_tier = sub.metadata.tier
    }

    const { error } = await supabaseAdmin.from('photographers')
      .update(updates)
      .eq('stripe_subscription_id', sub.id)

    if (error) return webhookFailure('Unable to update subscription', error)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as any
    const { error } = await supabaseAdmin.from('photographers')
      .update({ subscription_tier: 'free', subscription_status: 'canceled', stripe_subscription_id: null })
      .eq('stripe_subscription_id', sub.id)

    if (error) return webhookFailure('Unable to cancel subscription', error)
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as any
    if (!invoice.subscription) return NextResponse.json({ received: true })

    const { error } = await supabaseAdmin.from('photographers')
      .update({ subscription_status: 'past_due' })
      .eq('stripe_subscription_id', invoice.subscription)

    if (error) return webhookFailure('Unable to mark subscription past due', error)
  }

  return NextResponse.json({ received: true })
}
