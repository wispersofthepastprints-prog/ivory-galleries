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
1. Products in Stripe Dashboard (one product per tier, two currencies each):
   - Ivory Galleries Pro: A$15/mo or A$150/yr (AUD) + US$15/mo or US$150/yr (USD)
   - Ivory Galleries Studio: A$39/mo or A$390/yr (AUD) + US$39/mo or US$390/yr (USD)
   - AUD IDs live in `TIER_PRICES`, USD IDs in `TIER_PRICES_USD` (both in `src/lib/stripe.ts`)
   - Currency is chosen automatically: Australia → AUD, rest of world → USD
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
| Pro | A$15/mo (AU) or US$15/mo | Unlimited, 50GB, custom branding |
| Studio | A$39/mo (AU) or US$39/mo | +Print store, album builder, IvoryOS sync |

Australia is charged in AUD, the rest of the world in USD. Gallery unlock sales are always AUD.

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


