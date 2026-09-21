# Ivory Galleries — Web-First Client Photo Delivery

Picflow-style client gallery platform for professional photographers.

## Stack
- **Frontend**: Next.js 14 + Tailwind CSS + TypeScript
- **Backend**: Supabase (Auth, PostgreSQL, Storage, Edge Functions)
- **Payments**: Stripe Subscriptions
- **Mobile**: Expo WebView wrapper

## Quick Start

```bash
npm install
npm run dev
```

## Environment
Copy `.env.example` to `.env` and fill in your keys:
- Supabase URL + Anon Key + Service Role Key
- Stripe Secret Key + Webhook Secret + Publishable Key
- App URL

## Supabase Setup
1. Create project at supabase.com
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL Editor
3. Enable Storage bucket named `photos`
4. Set up auth with email/password enabled

## Stripe Setup
1. Create products in Stripe Dashboard:
   - Pro Monthly: $19.99
   - Studio Monthly: $49.99
   - Agency Monthly: $99.99
2. Add Price IDs to `src/lib/stripe.ts`
3. Set webhook endpoint to `https://yourdomain.com/api/stripe/webhook`
4. Add webhook signing secret to `.env`

## Deploy
```bash
npm run build
# Deploy to Vercel
```

## Monetization
| Tier | Price | Key Features |
|------|-------|-------------|
| Free | $0 | 3 galleries, 5GB, watermark branding |
| Pro | $19.99/mo | Unlimited, 50GB, custom branding |
| Studio | $49.99/mo | +Print store, album builder, IvoryOS sync |
| Agency | $99.99/mo | +White-label, 500GB, multi-photographer |

## Mobile Wrapper
The `mobile-wrapper/` folder is a thin Expo WebView app. Build it with EAS when you're ready for App Store presence.


## Launch checklist (2026-09-15 build)

1. `npm install`, then `npm run dev` — confirm `/` (landing), `/login`, `/register`, `/dashboard` all render
2. `npm run build` must pass before deploying (route groups removed; `(dashboard)` is now a real `/dashboard` segment)
3. Supabase SQL editor, in order: `supabase/migrations/001_initial_schema.sql` then `002_monetization.sql` (002 creates the public `photos` bucket + storage policies)
4. Stripe dashboard → Developers → Webhooks → add endpoint `https://<your-domain>/api/stripe/webhook` with events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`; copy the signing secret into `STRIPE_WEBHOOK_SECRET`
5. Replace placeholder Price IDs in `src/lib/stripe.ts` with real ones (the API now refuses placeholders with a clear 503)
6. Set `NEXT_PUBLIC_APP_URL` to your deployed URL
7. End-to-end test: create gallery → upload 25 photos → set access_mode=preview, preview_limit=20, unlock_price_cents → publish → open `/g/<slug>` in an incognito window → confirm 20 shown + 5 blurred teasers + unlock CTA → Stripe test card `4242 4242 4242 4242` → redirected back with full gallery + purchase row in `gallery_purchases`
