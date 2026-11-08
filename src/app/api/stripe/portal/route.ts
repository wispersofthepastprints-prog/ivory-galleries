import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/src/lib/stripe'
import { createSupabaseRouteHandler } from '@/src/lib/supabase-server'

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseRouteHandler()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', req.url))

  const { data: photographer } = await supabase
    .from('photographers')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!photographer?.stripe_customer_id) {
    return NextResponse.redirect(new URL('/dashboard/settings?tab=billing', req.url))
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: photographer.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin}/dashboard/settings?tab=billing`,
  })
  return NextResponse.redirect(portalSession.url, 303)
}
