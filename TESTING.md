# Pre-Launch Test Checklist
Run every line. Tick only when seen with your own eyes.

## Auth & app shell
- [ ] `/register` creates an account and lands on `/dashboard`
- [ ] Email validation rejects bad emails; password < 8 chars rejected
- [ ] Visiting `/dashboard` logged OUT redirects to `/login`
- [ ] Visiting `/login` while logged IN redirects to `/dashboard`
- [ ] Sidebar links: Dashboard, Galleries, Uploads, Store, Settings all load

## Galleries
- [ ] Create gallery → appears in list
- [ ] Upload 25 photos to a gallery → thumbnails appear in gallery detail
- [ ] Lightbox opens on photo click; arrows navigate; X closes
- [ ] Delete a photo → disappears and (check Supabase Storage) file removed
- [ ] Publish → status shows Published; public link copies to clipboard

## Client access (the money path)
- [ ] Client Access card: save Preview + paid unlock with price → green "Saved"
- [ ] Incognito: public link shows exactly N preview photos + blurred locked cards
- [ ] Unlock button → Stripe Checkout page (test mode)
- [ ] Pay with 4242… → redirected back → ALL photos visible, no locked cards
- [ ] Refresh incognito window → still unlocked (cookie persists)
- [ ] Different browser (no cookie) → locked again
- [ ] Supabase `gallery_purchases` has the row with correct amount
- [ ] Dashboard → Store shows lifetime earnings = that amount
- [ ] Gallery detail → Client Access card shows "1 unlock · $X.XX earned"

## Password gate
- [ ] Enable password on a gallery → incognito shows password form
- [ ] Wrong password → error message, stays gated
- [ ] Correct password → gallery opens; revisit in same browser stays open

## Watermark & free tier
- [ ] Watermark ON → preview photos show tiled business-name watermark
- [ ] Watermark OFF → clean images
- [ ] Free-tier photographer → public gallery shows "Delivered with Ivory Galleries" bar

## Subscriptions
- [ ] Subscribe (test card) → webhook fires → `photographers.subscription_tier` = pro
- [ ] Cancel subscription in Stripe → tier returns to free
- [ ] Placeholder Price IDs → checkout returns clear 503 message (not a 500)

## Storage guardrails
- [ ] Try uploading as user A into user B's folder path → rejected (RLS policy)
- [ ] Public (logged-out) can view photos via URL but not list storage
