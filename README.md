# Ivory Galleries — Client Photo Delivery

Client gallery hosting, controlled photo delivery, and Studio-only paid gallery unlocks for professional photographers.

## Stack
- **Application:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Runtime:** Node.js 22 or newer
- **Backend:** Supabase Auth, PostgreSQL, Storage, and row-level security
- **Payments:** Stripe subscriptions and per-gallery unlock Checkout Sessions
- **Mobile wrapper:** Expo WebView source in `mobile-wrapper/`

## Quick Start

```bash
npm install
npm run dev
```

Before a release, run:

```bash
npm run lint
npm run typecheck
npm audit --omit=dev
npm run build
```

## Environment

Copy `.env.example` to `.env.local` and provide the Supabase, Stripe, and application URL values. Never commit real service-role or Stripe secret keys.

## Supabase Setup

For a new installation, apply migrations in filename order. For the existing production project, migrations through `003_access_security.sql` are already applied.

The repaired release uses this order:

1. Apply `005_release_hardening.sql` and verify the migration completed.
2. Deploy the application that contains signed public and owner media delivery.
3. Verify public galleries, password access, paid access, and owner previews on the deployed site.
4. Only after those checks pass, apply `004_private_photos.sql` to remove public object reads.
5. Repeat the signed-media smoke tests after the bucket becomes private.

Migration 005 adds server-side plan and ownership enforcement, signup profile creation, storage quotas, upload limits, privacy-conscious analytics, password-attempt throttling, and the gallery watermark field. It deliberately leaves public Storage reads in place until step 4.

## Stripe Setup

Subscription products use these public prices:

- **Pro:** A$15/month or A$150/year in Australia; US$15/month or US$150/year elsewhere.
- **Studio:** A$39/month or A$390/year in Australia; US$39/month or US$390/year elsewhere.

The corresponding price IDs are configured in `src/lib/stripe.ts`. Gallery unlock purchases are always priced in AUD and require an active Studio plan.

Configure the Stripe webhook at `https://galleries.whispersofthepast.co/api/stripe/webhook` for:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

Set the webhook signing secret as `STRIPE_WEBHOOK_SECRET`.

## Deploy

The production host is `https://galleries.whispersofthepast.co`. A successful local build is not proof that the deployed product works; complete the live checks in `TESTING.md` before marketing the repaired release.

## Current Plans

| Tier | Price | Key Features |
|------|-------|--------------|
| Free | $0 | 3 galleries, 5 GB storage, Ivory Galleries branding |
| Pro | A$15/month or US$15/month | Unlimited galleries, 50 GB, studio branding, passwords, expiry controls |
| Studio | A$39/month or US$39/month | 200 GB and paid gallery unlocks |

Unfinished print-order, album-builder, and IvoryOS integration features are not part of the current product or its public claims.
