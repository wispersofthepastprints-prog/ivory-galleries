# Ivory Galleries — Launch Guide
Follow in order. Each step assumes the previous one works. Total time: ~1 day.

## Step 0 — Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier fine) — https://supabase.com
- A Stripe account — https://stripe.com (activate it; AU supported)
- Optional: Vercel account for deploy — https://vercel.com

## Step 1 — Local run (30 min)
1. Unzip this folder, open a terminal inside it
2. `npm install`
3. `cp .env.example .env` and fill in the three Supabase values (get them from
   Supabase → Project Settings → API: Project URL, anon/public key, service_role key)
4. `npm run dev` → open http://localhost:3000
   - `/` landing renders, `/register` and `/login` render
   - Create an account → you land on `/dashboard`
5. `npm run build` — must complete without errors before you go further.
   If it fails, the error message names the file; fix or paste the error to your build log.

## Step 2 — Database (20 min)
In Supabase → SQL Editor, run IN ORDER:
1. Paste `supabase/migrations/001_initial_schema.sql` → Run
2. Paste `supabase/migrations/002_monetization.sql` → Run
   (002 creates the public `photos` storage bucket and its policies — no manual bucket step)
3. Supabase → Authentication → Providers: enable Email (disable "Confirm email"
   for now, or account creation will pause at confirmation)
4. Regenerate typed schema (optional but recommended):
   `npx supabase gen types typescript --project-id <your-project-ref> > src/lib/database.types.ts`

## Step 3 — Stripe (30 min)
1. Developers → API keys: copy Publishable + Secret keys into `.env`
   (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`)
2. Products → create two Prices for the Pro subscription (one monthly, one yearly).
   Use your real prices. Copy both Price IDs (`price_1N...`) into `src/lib/stripe.ts`
   replacing the placeholders.
3. Developers → Webhooks → Add endpoint:
   URL: `http://localhost:3000/api/stripe/webhook` (local test) — later your domain
   Events: `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`, `invoice.payment_failed`
4. Copy the webhook's Signing secret into `.env` as `STRIPE_WEBHOOK_SECRET`
5. For local webhook testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

## Step 4 — End-to-end money test (30 min)
1. In the dashboard: create a gallery → Upload 25 photos (Uploads page)
2. Gallery page → **Client Access** card → choose "Preview + paid unlock",
   set Free preview = 20, Unlock price = 1.00 (test), Save
3. Publish the gallery → open the public link in an INCOGNITO window
   → you should see 20 photos + blurred teasers + unlock CTA
4. Click Unlock → Stripe Checkout (test mode) → card `4242 4242 4242 4242`,
   any future date, any CVC/ZIP → Pay
5. You're redirected back — full gallery unlocked
6. Verify in Supabase: Table `gallery_purchases` has a row; Table `galleries`
   view_count incremented; dashboard Store page shows the $1.00
7. Set the real unlock price on the gallery

## Step 5 — Deploy (30 min)
1. Push this folder to GitHub (private repo fine)
2. Vercel → Import repo → Framework: Next.js (auto-detected) → Deploy
3. Add ALL env vars in Vercel → Settings → Environment Variables
4. Set `NEXT_PUBLIC_APP_URL=https://<your-vercel-url>` (needed for Stripe redirects)
5. Stripe → Developers → Webhooks: change/add endpoint to
   `https://<your-vercel-url>/api/stripe/webhook` (same 4 events)
6. Update the Stripe webhook signing secret in Vercel env vars if it changed
7. Custom domain (optional for now): `ivorygalleries.app` → Vercel → Domains

## Step 6 — First real customer
1. Replace Stripe test keys with LIVE keys (toggle in Stripe, update Vercel env, redeploy)
2. Create a gallery for a real shoot, set unlock price $29–$79, publish, send link
3. Screenshot the first paid `gallery_purchases` row — that's your Good Shepherd
   microenterprise loan evidence and your first Centrelink-reportable business income
