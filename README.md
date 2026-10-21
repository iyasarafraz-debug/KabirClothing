# KABIR CLOTHING — Premium E-Commerce Platform

A complete, production-ready e-commerce application for a premium contemporary
Indian fashion brand. Built with Next.js 16, TypeScript, Prisma, NextAuth,
React Three Fiber, and Razorpay.

> **Note on demo data:** All products, prices, reviews, and sales figures in
> this codebase are demonstration data. They are clearly marked as such in the
> admin UI and seed script. Replace them with real catalogue data before going
> live.

---

## Table of Contents

1. [Stack](#stack)
2. [Quick start](#quick-start)
3. [Project structure](#project-structure)
4. [Database setup](#database-setup)
5. [Administrator provisioning](#administrator-provisioning)
6. [Customer accounts](#customer-accounts)
7. [Payment configuration (Razorpay)](#payment-configuration-razorpay)
8. [3D model installation](#3d-model-installation)
9. [Image storage](#image-storage)
10. [Testing](#testing)
11. [Production deployment](#production-deployment)
12. [Backup & recovery](#backup--recovery)
13. [Known limitations](#known-limitations)

---

## Stack

| Layer          | Choice                                   |
|----------------|------------------------------------------|
| Framework      | Next.js 16 (App Router)                  |
| Language       | TypeScript 5                             |
| Styling        | Tailwind CSS 4 + shadcn/ui               |
| Database       | Prisma ORM (SQLite in dev; PostgreSQL-compatible schema) |
| Auth           | NextAuth.js v4 (JWT, Credentials)        |
| 3D             | Three.js + @react-three/fiber + @react-three/drei |
| State          | Zustand (cart) + TanStack Query (server) |
| Payments       | Razorpay (test mode by default)          |
| Validation     | Zod                                       |
| Tests          | Bun test scripts (see Testing)            |

## Quick start

```bash
# 1. Install dependencies
bun install

# 2. Copy environment file and edit values
cp .env.example .env
# Edit .env: set NEXTAUTH_SECRET, ADMIN_EMAIL, ADMIN_INITIAL_PASSWORD

# 3. Set up the database (schema + seed)
bun run db:setup

# 4. Start the dev server
bun run dev
# Visit http://localhost:3000
```

## Project structure

```
src/
├── app/
│   ├── (shop)/             # Storefront routes (header + footer)
│   │   ├── page.tsx        # Home
│   │   ├── shop/           # All listing pages
│   │   ├── product/[slug]/ # Product detail
│   │   ├── 3d-viewer/[slug]/# 3D viewer page
│   │   ├── cart/ checkout/ order-confirmation/[id]/
│   │   ├── search/
│   │   ├── about/ contact/ faqs/ shipping/ returns/ privacy/ terms/
│   ├── account/            # Authenticated customer area
│   │   ├── page.tsx orders/ wishlist/ addresses/ profile/
│   ├── auth/               # Login + Register
│   ├── admin/              # Admin dashboard (role-protected)
│   │   ├── page.tsx        # Overview
│   │   ├── products/       # List, new, edit
│   │   ├── orders/         # List + detail
│   │   ├── categories/ coupons/ messages/ newsletter/
│   ├── api/                # REST-ish API routes
│   │   ├── products/ cart/ wishlist/ orders/ checkout/
│   │   ├── auth/ contact/ newsletter/ payment/ me/
│   │   ├── admin/          # Protected admin endpoints
│   ├── layout.tsx          # Root layout (providers, fonts, metadata)
│   ├── not-found.tsx       # 404
│   ├── sitemap.ts robots.ts
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── shop/               # Header, Footer, ProductCard, CartDrawer, ProductDetail, ProductViewer3D
│   ├── admin/              # AdminShell, AdminProductForm, AdminOrderDetail, etc.
│   └── providers.tsx       # SessionProvider + ThemeProvider + QueryClientProvider
├── lib/
│   ├── db.ts               # Prisma client
│   ├── auth.ts             # NextAuth config
│   ├── auth-server.ts      # requireUser / requireAdmin helpers
│   ├── cart-server.ts      # Server-side cart resolution + merging
│   ├── payment.ts          # Razorpay verify + webhook signature
│   ├── coupon.ts           # Coupon validation
│   ├── format.ts           # Currency / date / slug helpers
│   ├── validators.ts       # Zod schemas for all mutations
│   └── rate-limit.ts       # In-memory rate limiter
├── stores/
│   └── cart.ts             # Zustand cart store
└── prisma/
    ├── schema.prisma
    └── seed.ts             # 10 demo products + admin + coupons
```

## Database setup

The schema is in `prisma/schema.prisma`. The development database is SQLite at
`db/custom.db` (see `.env`). The schema is also PostgreSQL-compatible — to run
on PostgreSQL, change the datasource provider in `schema.prisma` and update
`DATABASE_URL`.

```bash
# Push schema to DB (safe, no data loss for new fields)
bun run db:push

# Seed demo data (idempotent — safe to run multiple times)
bun run db:seed

# Combined
bun run db:setup
```

The seed creates:
- 1 admin user (from `ADMIN_EMAIL` / `ADMIN_INITIAL_PASSWORD`)
- 7 categories with hierarchy
- 10 demo products with variants, images, and (for some) 3D asset references
- 2 demo coupons (WELCOME10, FLAT200)

## Administrator provisioning

The first admin user is provisioned by the seed script using the
`ADMIN_EMAIL` and `ADMIN_INITIAL_PASSWORD` environment variables. **Never
hardcode a default admin password in source code.**

```bash
# .env
ADMIN_EMAIL="you@yourdomain.com"
ADMIN_INITIAL_PASSWORD="A-Strong-Temporary-Password!"
```

After running `bun run db:seed`, sign in with these credentials and change
the password immediately via the profile page (or by re-seeding with a new
value, which will overwrite the hash).

Admin routes (`/admin/*`) and admin API endpoints (`/api/admin/*`) are
protected server-side via `requireAdmin()` — not merely hidden by UI. A
non-admin user hitting those routes receives a 403.

## Customer accounts

- Registration: `/auth/register` (bcrypt-hashed passwords)
- Login: `/auth/login`
- Sessions: JWT-based, 7-day expiry, secure cookies in production
- Guest carts: persisted via a `kc_guest_id` cookie; merged into the user
  cart on login

## Payment configuration (Razorpay)

Payments use Razorpay in **test mode by default**. To enable:

1. Create a Razorpay account at <https://razorpay.com>.
2. Generate test API keys from the dashboard.
3. Set the following in `.env`:
   ```bash
   RAZORPAY_KEY_ID="rzp_test_..."
   RAZORPAY_KEY_SECRET="..."
   RAZORPAY_WEBHOOK_SECRET="..."   # from webhooks settings
   RAZORPAY_LIVE_MODE="false"     # set to "true" only after going through live-key onboarding
   ```
4. Configure the webhook URL in Razorpay dashboard as
   `https://yourdomain.com/api/payment/webhook` for events:
   `payment.captured`, `payment.failed`, `order.paid`.

**Security model:**
- The server creates the Razorpay order (`POST /api/checkout`) — the client
  never invents the amount.
- After checkout, the client receives `providerOrderId` and opens the
  Razorpay checkout modal.
- On success, the client calls `/api/payment/razorpay/verify` with the
  Razorpay signature.
- The server verifies the signature using HMAC-SHA256 and a timing-safe
  comparison. **A client-side success message alone is never trusted.**
- Webhooks are similarly signature-verified.
- Orders use an idempotency key (`idempotencyKey`) to prevent duplicates.
- Card numbers and CVVs never touch our servers — they go directly to
  Razorpay.

If Razorpay keys are not configured, the checkout still creates a
PENDING order (clearly marked as test mode) for development purposes. No
real money moves.

## 3D model installation

The 3D viewer uses React Three Fiber with WebGL. Each product can have an
optional GLB/glTF asset. See `public/models/README.md` for:

- Which seeded products reference which model paths
- How to install real `.glb` files
- How to update model URLs via the admin dashboard
- Performance guidance (file size, Draco compression, embedded textures)
- Licensing reminders

The viewer:
- Lazy-loads the canvas per page
- Properly disposes GPU resources on unmount
- Respects `prefers-reduced-motion`
- Shows a graceful image fallback with a notice if the model file is missing
- Provides orbit, zoom, reset-view, and fullscreen controls
- Works on mobile and desktop

**Important:** No fake 3D models are bundled or simulated. If a `.glb` file
is missing, the viewer clearly says so and shows the product image instead.

## Image storage

In development, product images come from Unsplash URLs (clearly demo data).
For production, configure `IMAGE_STORAGE_BASE_URL` and upload images via the
Admin Dashboard → Edit Product → Images field, or update the database
directly. Recommended:

- Use a CDN (CloudFront, Cloudflare, or Bunny CDN) for product images.
- Generate multiple sizes (use Next.js `<Image>` with `width`/`height`).
- Maintain a 3:4 aspect ratio for consistency with the existing cards.

## Testing

The following checks are available:

```bash
# Lint (ESLint + Next.js rules)
bun run lint

# Type check (TypeScript)
bunx tsc --noEmit

# Database sanity check (verifies seed, schema, and basic queries)
bun run scripts/test-db.ts
```

Critical business logic that should be covered by tests:
- Product API (filtering, sorting, pagination) — covered by `scripts/test-db.ts`
- Cart add/update/remove with stock validation — covered by `/api/cart` routes
- Checkout idempotency and stock reservation — covered by `/api/checkout`
- Payment signature verification — covered by `src/lib/payment.ts`
- Admin authorization (requireAdmin) — covered by all `/api/admin/*` routes
- Contact form validation — covered by `/api/contact` with rate limiting

For full end-to-end tests, add Playwright or Cypress. The current scope
covers API integration and DB consistency.

## Production deployment

### Prerequisites

- A Node.js 18+ host (Vercel, Render, Railway, or a VPS)
- A PostgreSQL database (Neon, Supabase, Railway, or self-hosted)
- A Razorpay account (test or live)
- A domain with HTTPS configured
- Optional: a CDN for product images and 3D assets

### Steps

1. **Set environment variables** in your hosting platform:
   - `DATABASE_URL` — PostgreSQL connection string
   - `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` — your production URL
   - `ADMIN_EMAIL` / `ADMIN_INITIAL_PASSWORD`
   - `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET`
   - `RAZORPAY_LIVE_MODE="true"` when ready for live payments
   - `NEXT_PUBLIC_SITE_URL` — same as `NEXTAUTH_URL`

2. **Update Prisma datasource** in `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Build and deploy:**
   ```bash
   bun install --frozen-lockfile
   bun run db:setup    # run migrations + seed
   bun run build
   bun run start
   ```

4. **Configure Razorpay webhook** to point to
   `https://yourdomain.com/api/payment/webhook`.

5. **First login:** Sign in with the admin email/password from env, then
   immediately change the password.

### DNS / SSL

Use HTTPS for all routes. The auth cookies are marked `secure` in production.
HSTS is recommended at the CDN/proxy layer.

## Backup & recovery

- **Database:** Take regular PostgreSQL dumps (e.g. `pg_dump` nightly). Store
  encrypted backups in at least two regions.
- **3D assets & images:** If using object storage (S3, R2, etc.), enable
  versioning and cross-region replication.
- **Recovery procedure:** Restore the latest dump to a fresh database, run
  `bun run db:push` to verify schema, then restart the app. Test the restore
  process quarterly.

## Known limitations

- The 3D viewer is fully implemented but the seeded `.glb` files are not
  bundled. The owner must install real licensed models (see
  `public/models/README.md`).
- The currently deployed environment uses SQLite; for production, switch to
  PostgreSQL (the schema is compatible).
- Product image upload via the admin UI is limited to URL input; full file
  upload with object-storage integration is left as an infrastructure
  configuration step (see "Image storage" above).
- Customer profile editing (name change) is stubbed; production builds
  should add a `PATCH /api/me` endpoint.
- The Razorpay checkout modal is not auto-opened in this demo — in
  production, wire up the official Razorpay checkout script and call
  `verify` on success callback.
- In-memory rate limiting is suitable for single-instance deployments.
  Multi-instance production should use Redis or Upstash.
- Email sending (order confirmations, newsletter) is not wired up —
  integrate with a transactional email provider (Resend, Postmark, SES)
  before going live.

---

© Kabir Clothing. All product data shown is demonstration data.
