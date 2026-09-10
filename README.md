# Renish Collections

A production ecommerce platform for Renish Collections, starting with sarees
and architected to expand into Men, Women, Kids, Jewellery and Accessories
without redesigning the system. Built with Next.js (App Router), TypeScript,
Tailwind CSS, PostgreSQL and Prisma ORM.

## Status

This is under active development. Built and working end-to-end:

- Project architecture (`app/`, `components/`, `lib/`, `services/`, `actions/`, `schemas/`, `types/`)
- Full Prisma schema — Users/Roles, Categories, Products, Variants, Cart, Wishlist, Orders, Payments, Coupons, Reviews, Banners, Shipping Zones, Notifications, Audit Log, Site Settings
- Customer auth: sign up, log in, log out, forgot/reset password, role-based sessions
- Home, Shop (search/filter/sort/pagination), category & subcategory pages, product detail pages
- SEO: per-page metadata, canonical URLs, Open Graph, Product/Breadcrumb/Organization/WebSite JSON-LD, 301 redirects for changed product slugs
- Cart (guest + logged-in, server-verified pricing, guest→user merge on login) and Wishlist (same pattern)
- Customer account area: profile, orders (list), wishlist, addresses (CRUD), settings
- Product reviews (customer submission, admin-approval flow, verified-purchase detection)
- Seed script with realistic demo data

Not yet built — the next milestones:

- Admin panel (dashboard, product/category/order/customer/coupon/banner management, CSV import, audit log UI)
- Checkout flow and payment gateway integration (Razorpay/Stripe/Cashfree)
- Order creation, status updates, tracking
- `sitemap.xml`, `robots.ts`, PWA manifest
- Analytics wiring (GA4/GTM)

## Tech Stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript** (strict mode)
- **Tailwind CSS v4** for styling
- **PostgreSQL** + **Prisma ORM 6** (classic migration workflow — see note below)
- **NextAuth v5** (Credentials provider, JWT sessions, role-based access control)
- **Zod** for validation, **React Hook Form** where needed
- **Cloudinary** for product images/video (configure before using the admin product editor)
- **decimal.js** for all monetary math — never floating point
- **nodemailer** for transactional email (falls back to console logging if SMTP isn't configured)

> **Why Prisma 6, not 7:** Prisma 7's CLI moved to a cloud-native "Composer"
> platform (services, RPC contracts, Prisma Cloud deploy targets) that assumes
> a very different architecture than a self-hosted Next.js monolith talking
> directly to Postgres. This project uses Prisma 6, the last release with the
> classic `schema.prisma` + `prisma migrate` + `prisma db seed` workflow that
> matches a plain `DATABASE_URL` deployment (Vercel, Railway, a VPS, etc.).

## Getting Started

### 1. Prerequisites

- Node.js 20.9+ (project developed on Node 24)
- A PostgreSQL database (local via Homebrew/Docker, or a hosted instance)

### 2. Install dependencies

```bash
npm install
```

> If you hit an `ERESOLVE` peer-dependency error mentioning `nodemailer` and
> `next-auth`, it's because next-auth's optional Email-provider peer range
> hasn't caught up to nodemailer's latest major version. This project already
> pins a compatible nodemailer version, so a plain `npm install` should work;
> if you bump it yourself, expect to need `--legacy-peer-deps`.

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in at minimum:

- `DATABASE_URL` — your Postgres connection string
- `AUTH_SECRET` — generate with `npx auth secret`
- `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` for local dev

Cloudinary, payment provider, SMTP, and analytics variables can stay blank
for local development — those features degrade gracefully (email logs to the
console instead of sending; images just won't be optimizable until Cloudinary
is configured).

### 4. Set up the database

```bash
npm run db:migrate   # applies prisma/migrations, creates the schema
npm run db:seed      # loads demo categories, products, admin user, etc.
```

The seed script creates a `SUPER_ADMIN` user from `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD` in your `.env` (defaults to
`admin@renishcollections.com` / `ChangeMe123!` if unset) and a
`demo.customer@renishcollections.com` / `Demo1234!` test customer. **Change
or remove these before ever seeding a production database** — the seed
script is for local development and demos only.

### 5. Run the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Useful Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:migrate` | Create/apply a migration (dev) |
| `npm run db:deploy` | Apply migrations without prompting (CI/production) |
| `npm run db:seed` | Run `prisma/seed.ts` |
| `npm run db:studio` | Open Prisma Studio |

## Architecture Notes

- **Categories are fully database-driven.** Main navigation and the shop
  filters read from the `Category` table — adding "Men", "Women", etc. is a
  data change, not a code change (the seed script already creates them,
  unpublished, to prove this out).
- **Product URLs** are clean and SEO-friendly: `/sarees/kanchipuram-silk-saree`
  rather than `/product?id=123`. The `[categorySlug]/[slug]` route resolves
  to either a subcategory listing or a product page server-side, and
  `ProductSlugRedirect` gives changed slugs a 301 instead of a 404.
- **Wholesale/cost price is never selected in any customer-facing query** —
  see `PUBLIC_PRODUCT_SELECT` in `services/product.service.ts`. Admin-only
  queries (once the admin panel is built) must use a separate select.
- **Cart pricing is always computed server-side** from the database, never
  trusted from the client — see `services/cart.service.ts`. Guest carts are
  stored as an httpOnly cookie containing only product/variant ids and
  quantities, never prices; a logged-in user's cart lives in Postgres and a
  guest cart merges into it on login.
- **Authorization is defense-in-depth.** `proxy.ts` (Next 16's renamed
  `middleware.ts`) redirects unauthenticated page navigations away from
  `/admin` and `/account`, but Server Actions and Route Handlers are not
  guaranteed to pass through it — every mutation independently re-checks the
  session via `lib/authorization.ts`.

## Deployment

Not yet documented in detail — will be filled in alongside the checkout/
payment work, since production deployment needs a real payment provider and
Cloudinary account configured. In short: any Node.js host that can run
`next build` / `next start` against a Postgres database will work (Vercel,
Railway, Render, a VPS). Run `npm run db:deploy` (not `db:migrate`) as part
of your deploy pipeline.
