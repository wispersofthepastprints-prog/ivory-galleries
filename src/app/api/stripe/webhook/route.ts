import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe, tierForPriceId } from '@/src/lib/stripe'
import { supabaseAdmin } from '@/src/lib/supabase-admin'

function webhookFailure(message: string, error?: unknown) {
  console.error(message, error)
  return NextResponse.json({ error: message }, { status: 500 })
}

async function provisionSubscription(session: Stripe.Checkout.Session) {
  let tier = session.metadata?.tier
  let userId = session.metadata?.user_id || session.client_reference_id

  if ((!tier || !userId) && session.subscription) {
    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    tier = tier || subscription.metadata?.tier
    userId = userId || subscription.metadata?.user_id
  }

  if (!userId || (tier !== 'pro' && tier !== 'studio')) {
    return webhookFailure('Subscription provisioning metadata missing')
  }

  const { data, error } = await supabaseAdmin.from('photographers')
    .update({
      subscription_tier: tier,
      subscription_status: 'active',
      stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id,
      stripe_subscription_id: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id,
    })
    .eq('id', userId)
    .select('id')
    .maybeSingle()

  if (error || !data) return webhookFailure('Unable to provision subscription', error)
  return null
}

async function updateSubscription(subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0]?.price.id
  const tier = subscription.metadata?.tier === 'pro' || subscription.metadata?.tier === 'studio'
    ? subscription.metadata.tier
    : tierForPriceId(priceId)
  const status = subscription.status === 'incomplete_expired'
    ? 'canceled'
    : subscription.status === 'paused'
      ? 'unpaid'
      : subscription.status

  const { error } = await supabaseAdmin.from('photographers')
    .update({
      subscription_status: status,
      ...(tier ? { subscription_tier: tier } : {}),
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) return webhookFailure('Unable to update subscription', error)
  return null
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')
  if (!signature) return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    if (session.metadata?.type === 'gallery_unlock' && session.payment_status === 'paid') {
      if (!session.metadata.gallery_id) return webhookFailure('Gallery unlock metadata missing')
      const { error } = await supabaseAdmin.from('gallery_purchases').upsert({
        gallery_id: session.metadata.gallery_id,
        email: session.customer_details?.email || 'not supplied',
        amount_cents: session.amount_total ?? 0,
        stripe_session_id: session.id,
      }, { onConflict: 'stripe_session_id' })
      if (error) return webhookFailure('Unable to record gallery unlock', error)
    }
    if (session.mode === 'subscription') {
      const failure = await provisionSubscription(session)
      if (failure) return failure
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const failure = await updateSubscription(event.data.object)
    if (failure) return failure
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object
    const { error } = await supabaseAdmin.from('photographers')
      .update({ subscription_tier: 'free', subscription_status: 'canceled', stripe_subscription_id: null })
      .eq('stripe_subscription_id', subscription.id)
    if (error) return webhookFailure('Unable to cancel subscription', error)
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object
    const subscription = invoice.parent?.type === 'subscription_details'
      ? invoice.parent.subscription_details?.subscription
      : null
    const subscriptionId = typeof subscription === 'string' ? subscription : subscription?.id
    if (!subscriptionId) return NextResponse.json({ received: true })
    const { error } = await supabaseAdmin.from('photographers')
      .update({ subscription_status: 'past_due' })
      .eq('stripe_subscription_id', subscriptionId)
    if (error) return webhookFailure('Unable to mark subscription past due', error)
  }

  return NextResponse.json({ received: true })
}
