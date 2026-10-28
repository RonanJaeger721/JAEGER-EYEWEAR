# JAEGER EYEWEAR

Original Next.js storefront and private catalogue workspace for Collection 001. **Pre-launch preview: not approved for commercial launch.** JAEGER remains provisional pending trademark clearance.

## Run locally

Requires Node.js 24 and npm. From this repository:

```text
npm ci
```

Copy `.env.example` to `.env.local`, generate a cryptographically random `AUTH_SECRET`, and run:

```text
npm run dev -- --port 3002
```

With no `DATABASE_URL`, the app uses persistent local SQLite in `.data/store.sqlite`. That file, uploaded images, local credentials, and environment files are ignored by Git. Never use SQLite as Vercel order storage. Hosted mutations fail closed without PostgreSQL.

Create the first admin with `ADMIN_EMAIL`, `ADMIN_NAME`, and a strong `ADMIN_PASSWORD` (16+ characters) in your operator environment, then `npm run bootstrap`. Bootstrap never overwrites existing accounts. Passwords are salted with scrypt; Auth.js handles encrypted signed sessions and its CSRF-protected sign-in. Every privileged API request reloads the current user and role from storage.

## Storefront

Home, all eyewear, sunglasses, optical, new arrivals, collections, individual collections, product detail, search, bag, manual checkout, account, orders, story, contact, FAQ, sizing, shipping/returns, privacy and terms are implemented. Unknown routes return 404.

Filters for category, shape, colour, lens, material, maximum USD price and availability update real catalogue results and URL parameters. Sorting and pagination are supported. Product galleries support thumbnails, enlargement and touch swipes when photographs are available. The sample frames each have one illustration: no true 360-degree claim is made.

The bag preserves variant IDs and quantities in local storage. Real stock restrictions apply in the UI and are independently enforced on the server. Prices are integer USD cents. Null is an unconfirmed price, never a zero-dollar product.

## Management

`/admin` requires an admin or editor role. Ordinary account registration only creates customers.

- Admin: overview, verified revenue, low stock, product/variant/pricing/stock/gallery management, collections, orders, payment evidence, fulfilment, customer order records, consent records, enquiries, policies, contacts, delivery and launch settings.
- Editor: catalogue, collections and editorial content. Cannot access customers/orders or change commercial settings.
- Products can be archived. Content/collection ordering and assignments are persisted.
- Image uploads validate MIME, size and decoded image content, strip metadata by re-encoding to WebP, and enforce role access. Local images save to `public/uploads`; hosted uploads require `BLOB_READ_WRITE_TOKEN`.

## PostgreSQL and Vercel

The Vercel project is `jaeger-eyewear`, linked to `RonanJaeger721/JAEGER-EYEWEAR`.

The PostgreSQL adapter uses parameterized queries and a transactional `SELECT ... FOR UPDATE` on one versioned store document. Stock reservation, order creation, idempotency and payment reference checks are serialized. This is intentionally a compact initial architecture; split into normalized tables and background reservation processing when volume warrants it. Migration: `migrations/001_store.sql`. Empty databases initialize with the concept catalogue once; later admin edits persist.

Required hosted setup:

1. Connect a PostgreSQL database and set `DATABASE_URL`. Neon provisioning was attempted but Vercel requires the owner to accept the provider terms. No database was silently substituted.
2. Set a fresh `AUTH_SECRET` and `AUTH_TRUST_HOST=true` in Vercel. Set `NEXT_PUBLIC_SITE_URL` to the final canonical origin.
3. Connect Vercel Blob for image uploads using `BLOB_READ_WRITE_TOKEN`.
4. Bootstrap the owner against the intended PostgreSQL database from a trusted local operator environment. Never expose a public bootstrap endpoint.
5. Replace concept drawings with approved exact-variant photographs, verified prices and stock. Only mark supplier data verified when supported. Product JSON-LD is emitted only for verified, priced, non-concept products.
6. Approve brand clearance, policies, delivery and payment operations before enabling launch approval and manual ordering.

Vercel project protection remains intact. A successful deployment is a pre-launch review build, not commercial approval. Robots disallow indexing and pre-launch sitemap is empty. Review SEO indexing deliberately before commercial release.

## Payments and reservations

No live gateway or merchant account is assumed. The provider contract is in `lib/commerce.ts`. An unconfigured online webhook returns 503. No card details are collected.

Manual orders require a customer session, verified non-concept inventory, a valid delivery rule and open commercial ordering. The server snapshots product names, variants and prices, calculates totals, reserves stock for 24 hours, and always starts at `pending_payment`. The customer may then open a contextual WhatsApp message; no message is sent automatically. Admin verification requires an independent evidence reference, normalized and protected from reuse. Customers and editors cannot verify payments. Fulfilment requires paid status.

Expired unpaid orders release stock once, on the next store read/mutation. Cancelled pending orders also release it. Paid orders do not expire. Retries with the same customer and idempotency key return the original order. Refunds, chargebacks and expired-order recovery require a future merchant-provider workflow; the admin cannot mark those as paid automatically.

Before enabling a gateway, implement signature validation on the raw webhook body, validate amount/currency/order identity against the immutable order snapshot, store a unique provider event/reference inside the transaction, and test success/failure/replay paths. Return non-success for unsupported providers. Never use a browser confirmation as payment evidence.

## Assets and content provenance

- Original supplied `crown logo.png` is copied byte-for-byte. CSS changes display polarity on light surfaces; its deliberately incomplete geometry is preserved. It is used with plain text JAEGER EYEWEAR as explicitly instructed by Ronan.
- Original founder showroom photograph is used editorially. The eyewear in that photograph is a third-party reference, not JAEGER inventory.
- Hero/campaign portrait is an AI-generated original campaign **concept**, based on Ronan's supplied portrait. It is not an approved product photograph. Labels remain visible.
- All 20 supplied showroom photographs were inspected, including duplicate images. Both videos were sampled. Third-party marks were not erased or repurposed as JAEGER merchandise. Those showroom assets are not included as sellable product imagery.
- Fifteen original SVG silhouette studies cover five proposed shapes and three colour directions each. All are labelled concepts, with no fabricated stock, price, dimensions, UV protection, certification or manufacturing claims.
- Packaging is a CSS design study, subject to approval and costing.
- User-confirmed contacts: `+263780774428`, `ronanjaeger721@gmail.com`. Instagram and TikTok are omitted until real account URLs are supplied.
- Reference principles were studied from https://www.hillseyewear.com/ and https://lindberg.com/en. No code or imagery was copied.
- `scripts/assets.mjs` optionally regenerates assets using `CROWN_SOURCE`, `FOUNDER_SOURCE`, and `CAMPAIGN_SOURCE` paths. These are not required to build; all public derivatives are tracked.

## Verification

```text
npm run typecheck
npm test
npm run build
npm audit --omit=dev
```

`scripts/qa-local.ts` exercises the running local API: registration/session, unauthorized access, role boundaries, validation, inventory, idempotency, totals, payment status, admin verification, fulfilment, newsletter consent, contact persistence, media upload and origin checks. Run with `npx tsx scripts/qa-local.ts` (default `http://localhost:3002`; override `QA_URL`). It refuses Vercel/remote databases and removes its temporary fixtures in a finally block.

Customer-support messages are saved for the team; no outgoing email service or automatic transactional emails are claimed. Account recovery currently uses the published support email; automated password recovery and email verification must be configured before commercial launch. Public production traffic also needs infrastructure-level abuse controls, monitoring, backup/restore tests and operational review.
