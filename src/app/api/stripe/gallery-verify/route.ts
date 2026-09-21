import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/src/lib/stripe'
import { supabaseAdmin } from '@/src/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')
  const slug = req.nextUrl.searchParams.get('slug')
  if (!sessionId || !slug) return NextResponse.redirect(new URL('/', req.url))

  const session = await stripe.checkout.sessions.retrieve(sessionId)
  if (session.payment_status !== 'paid' || session.metadata?.slug !== slug) {
    return NextResponse.redirect(new URL(`/g/${slug}`, req.url))
  }

  await supabaseAdmin.from('gallery_purchases').upsert({
    gallery_id: session.metadata!.gallery_id,
    email: session.customer_details?.email || 'unknown',
    amount_cents: session.amount_total ?? 0,
    stripe_session_id: sessionId,
  }, { onConflict: 'stripe_session_id' })

  const res = NextResponse.redirect(new URL(`/g/${slug}?unlocked=1`, req.url))
  res.cookies.set(`unlocked_${session.metadata!.gallery_id}`, '1', {
    httpOnly: true, maxAge: 60 * 60 * 24 * 365, path: '/',
  })
  return res
}
