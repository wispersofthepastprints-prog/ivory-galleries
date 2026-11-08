# Release Test Checklist

Tick an item only after observing it in the stated environment. Local compilation does not prove the production signup, Storage, or Stripe paths work.

## Local release gates

- [x] ESLint passes with no errors or warnings.
- [x] TypeScript passes with strict checking.
- [x] Production dependency audit reports zero known vulnerabilities.
- [x] Next.js production build completes with placeholder build-time environment values.
- [ ] Production build is repeated from the exact commit being deployed.

## Auth and application shell

- [ ] `/register` creates an account; if email confirmation is enabled, the page clearly asks the user to confirm it.
- [ ] The signup database trigger creates a Free photographer profile without a client-side profile insert.
- [ ] Invalid email addresses and passwords shorter than eight characters are rejected.
- [ ] Visiting `/dashboard` logged out redirects to `/login`.
- [ ] Visiting `/login` while logged in redirects to `/dashboard`.
- [ ] Sidebar links Dashboard, Galleries, Uploads, Sales, and Settings all load.

## Galleries and owner media

- [ ] Create a gallery and see it in the gallery list.
- [ ] Upload JPG, PNG, and WebP files up to 25 MB; owner thumbnails appear through signed URLs.
- [ ] Reject an unsupported file type, an empty file, and a file larger than 25 MB.
- [ ] Open the owner lightbox; arrow keys navigate and Escape or the close button closes it.
- [ ] Delete a photo and confirm both its row and Storage object are removed.
- [ ] Save business name, accent colour, download, favourite, watermark, expiry, and password settings.
- [ ] Publish a gallery and copy its public link.

## Public signed-media delivery

Complete these checks after migration 005 and application deployment, before migration 004:

- [ ] A published public gallery displays every photo the visitor is allowed to see.
- [ ] Image URLs are short-lived signed URLs, not permanent public object URLs.
- [ ] Preview mode serialises and signs only the visible preview photos; locked photo URLs are absent from the page payload.
- [ ] Password-protected galleries show no photo URLs until the correct password is entered.
- [ ] Expired, draft, archived, and unknown galleries do not expose photos.

Then apply `004_private_photos.sql` and repeat all checks in this section. Also confirm direct unsigned object requests fail and owner previews still load.

## Client access and paid unlocks

- [ ] Free and Pro accounts cannot enable a paid unlock price; Studio can.
- [ ] Preview mode shows exactly the configured number of photos and the correct locked count.
- [ ] The unlock button opens Stripe Checkout with the configured AUD amount.
- [ ] Stripe test payment returns to the gallery, records the purchase once, and reveals all photos.
- [ ] Refreshing the same browser retains access through the server-verifiable cookie.
- [ ] A different browser remains locked.
- [ ] Sales and the gallery access card show the same real gross AUD amount, before Stripe fees.
- [ ] Replaying or tampering with a success URL does not grant access without a paid Stripe Session.

## Password gate

- [ ] Enable a password on a paid plan; an incognito window shows the password form.
- [ ] Wrong passwords stay gated and repeated attempts are throttled.
- [ ] Correct password opens the gallery and remains valid in the same browser.
- [ ] Existing legacy hashes still authenticate once and are upgraded to scrypt.
- [ ] Disabling the password removes the gate.

## Plans and enforcement

- [ ] A Free account cannot create a fourth gallery through either the UI or a direct database request.
- [ ] A client-side profile update cannot change plan, Stripe, or storage-accounting fields.
- [ ] A user cannot insert a photo into another user's gallery or Storage folder.
- [ ] Storage usage matches actual photo rows after uploads, deletions, and gallery deletion.
- [ ] Exceeding the plan storage quota rejects the upload.
- [ ] Downgrading from Studio clears paid unlock prices and removes paid-unlock eligibility.
- [ ] Subscribe with a Stripe test card; the webhook provisions the correct plan.
- [ ] Cancellation and payment failure update access and paid-unlock behaviour correctly.

## Privacy-conscious measurement

- [ ] Page paths contain only allowlisted static routes or `/g/:slug` and `/dashboard/galleries/:id` placeholders.
- [ ] No query strings, gallery names, client names, real slugs, or client identifiers are stored.
- [ ] UTM source and medium contain only normalised lowercase safe characters.
- [ ] Owner-only funnel events require an authenticated user; analytics failure never blocks product use.
