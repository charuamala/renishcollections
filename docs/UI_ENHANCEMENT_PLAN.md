# Renish Collections — UI Enhancement Plan

> Single source of truth for elevating every surface of renishcollections (storefront, auth, account, admin).
> **Design authority:** the owner's brief ("Create a modern, premium saree e-commerce website called Renish Collections…") — see §2.5 for the requirement-by-requirement mapping. Where this plan and the brief differ, the brief wins.
> Written to be evaluated and executed by another agent. Every item carries: location (file:line at time of audit), severity, rationale for *this* customer, an exact spec, and a testable acceptance criterion.
> Audit date: 2026-09-25/26 · Codebase: commit `f36b01a` + logo integration (see §0.4) · Stack: Next.js 16.3.4 (App Router, Turbopack), React 19.2, Tailwind v4, Prisma 6, NextAuth v5.

---

## 0. How to read and evaluate this document

### 0.1 Severity legend
| Tag | Meaning | Rule of thumb |
|---|---|---|
| **P0** | Blocking — breaks a task, a trust signal, or leads to a dead end | Fix before any visual polish |
| **P1** | Major — significant conversion/trust/a11y loss or WCAG AA failure | Fix before launch |
| **P2** | Minor — quality gap vs premium peers; a workaround exists | Next pass |
| **P3** | Polish | If time permits |

### 0.2 Evidence base (what was actually inspected)
- **All 100+ UI source files read** (app/, components/, actions/, schemas/, services/ used by UI, prisma/schema.prisma).
- **Live render** at `http://localhost:3001` (Playwright Chromium 1.63, desktop 1440×900 and mobile 390×844 with touch): `/`, `/shop`, `/sarees`, `/cart`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/admin/login`, 404, mobile menu open, mobile filter drawer open, login/signup empty-submit, keyboard focus on home.
- **Route probe**: `/new-arrivals`, `/best-sellers`, `/offers`, `/about`, `/contact`, `/search`, `/checkout` → **HTTP 404** (all linked from header/footer/home/cart/bottom-nav/JSON-LD).
- **Impeccable detector**: CLI over `app/ components/` → **0 findings** (source-level). Browser-injected detector on 5 routes → findings in §13.2 (low-contrast placeholders/muted text, 10px functional text, overused Inter, image hover transform, line length).
- **Contrast computed** for every token pair used (§3.2).
- `npm run typecheck` → pass · `eslint app components` → pass.
- **Not inspected live** (no credentials available in-session; `.env` intentionally not read): logged-in account pages and all admin pages after login → reviewed from source only. **DB state**: categories exist, **0 products** (seed not run to avoid mutating local data) → populated grids/PDP reviewed from source. An evaluator should seed (`npm run db:seed`) and re-verify §5–§9 visually.

### 0.3 Method
Impeccable `critique` + `audit` protocol: isolated design reviews (layout/home/listing; auth/account) + deterministic detector/browser evidence, then synthesis by the lead. Two review sub-agents and the audit sub-agent stalled mid-run; their completed output was used and the remaining surfaces (PDP, cart, account, admin, technical audit) were reviewed first-hand by the lead. The draft was then adversarially critiqued by a separate agent; every correction and how it was resolved is logged in §14.

### 0.4 Already done in this session (do not redo)
Logo integration from the supplied artwork (gold foil RC monogram + "RENISH / COLLECTIONS" on wine):
- Assets derived with a true alpha matte (not a geometric mask): `public/brand/logo-{mark,compact,lockup,stacked}-{maroon,gold,ivory}.png`; `public/logo.png` (512² original, satisfies Organization JSON-LD `logo`); `app/icon.png` (512), `app/apple-icon.png` (180), `app/favicon.ico` (16/32/48 RGBA), `app/opengraph-image.png` + `app/twitter-image.png` (1200×630, gold stacked logo on `#3d0e15`).
- `components/layout/logo.tsx` — `<Logo variant="compact|stacked|mark" tone="maroon|gold|ivory" />`, static-imported (intrinsic size, no CLS), height-class sized.
- Wired into: header (`h-9 sm:h-11`, `loading="eager"` — Next 16 deprecates `priority`, link labelled "Renish Collections home"), footer (stacked `h-24 sm:h-28`), mobile menu drawer header, admin login (gold stacked on `maroon-900`, "Staff login"), admin topbar (compact + "ADMIN" label).
- Fixed duplicate admin title (`Admin Login | Renish Collections | Renish Collections` → template applies once).
- **Remaining brand work** is in §3.8.

Category work (owner photos, second session):
- 7 owner photos → `public/images/categories/banarasi-tissue/banarasi-tissue-01…07.jpg` (EXIF stripped). New published category **Banarasi Tissue Sarees** (`/sarees/banarasi-tissue`); first photo = card image, rest = `Category.galleryImages` (new column, migration `20260926075544_add_category_gallery_images`).
- `npm run db:setup-categories` (prisma/setup-categories.ts, idempotent): creates the brief's categories **hidden** until they get photos, renames `silk-sarees` → `silk`, hides the 6 seeded non-brief categories (nothing deleted), replaces the `sarees` parent placeholder image and SEO copy.
- Storefront: `getSubcategoryCards()` service; home "Saree Categories" = brief card (image, name, description, count, Explore) with a single-category feature layout and hover photo swap; category pages get the breadcrumb (Home › Sarees › {Category}), a photo banner from the gallery, the brief's title/description format and a branded empty state; breadcrumb JSON-LD parent-name bug fixed.
- First product (third session): **Banarasi Dupion Soft Silk Saree with Meenakari Border** (`/sarees/banarasi-dupion-soft-silk-saree-meenakari-border`, SKU RC-DUP-0001, ₹1,099 excl. GST, no strike price, 11 colour variants × 50 stock, 15 photos tagged to their colour variant) created by `npm run db:catalog` (prisma/catalog.ts); Dupion Silk category published using its photos. Owner's WhatsApp copy rewritten into factual product copy (dropped the unverifiable "100% guarantee" claim).
- Store facts (fourth session): SiteSettings gained `legalName, supportHours, grievanceOfficerName, grievanceOfficerEmail, deliveryTime, returnPolicy, codAvailable` (migration `…_store_trust_details`); all hard-coded shipping/returns/payments claims removed and replaced with settings-driven copy on home ("Why Shop With Us"), PDP (delivery/returns box, WhatsApp help link with product pre-filled) and PDP FAQ (questions without a confirmed answer are hidden); footer shows real contact details, legal name/address and Grievance Officer; guessed social handles removed (`DEFAULT_SOCIAL_LINKS` deleted — links render only when set; Instagram section hidden until an account exists); GST line hidden at 0%; `getSiteSettings` deduped per request with React `cache()`; **Admin → Settings save was always failing** (fields absent from the form parsed as `null`) — fixed.
- Fourth product (eleventh session): **Banarasi Warm Soft Silk Saree with Meenakari Border** (RC-WRM-0001, ₹950, 5 colour variants × 50, 13 photos grouped by colour — drape, pallu, folded border; 2 near-duplicate photos dropped; photos resized to 1200×1600); Warm Silk category published.
- Third product (tenth session): **Banarasi Dupion Soft Silk Saree with Running Pallu** (RC-DUP-0002, ₹1,050, 8 colour variants × 50, one photo each; square photos padded to 3:4 with a blurred fill so the gallery doesn't crop the saree; video mute icon cropped from one photo).
- Second product (ninth session): **Banarasi Katan Soft Silk Saree with Ghungroo Work** (RC-KAT-0001, ₹1,099, single colour Wine, stock 50, 2 photos) via `npm run db:catalog` — catalog now supports single-colour products; Katan Silk category published with its photos; cart/WhatsApp colour label falls back to the product colour for single-colour sarees.
- WhatsApp checkout (eighth session): `/checkout` replaces the 404 — server-verified order summary + delivery form (name, +91 mobile normalised, address, PIN, city, state select, note; field-level errors with `aria-invalid`/`aria-describedby`, focus to first error) → opens `wa.me/<SiteSettings WhatsApp number>` with the full order pre-written (items with colour, qty, price, product links, totals, delivery address). Empty cart redirects to `/cart`; unavailable items block sending; saved details offered on return (localStorage, never auto-filled). No DB order is created yet — orders live in the owner's WhatsApp until the checkout/payments project (§5.8).
- PDP zoom (seventh session): desktop hover magnifier (2×, follows cursor, only on hover-capable pointers) + full-screen lightbox on click/tap (portal, `role=dialog`, focus to Close and back to the photo, Esc/←/→, counter, swipe, tap-to-zoom 2.5× centred on the tap with drag-to-pan, pinch allowed; navigating photos keeps the colour selection in sync) — §5.5 lightbox/zoom **done**.
- Header pages + hero slider (sixth session): `/new-arrivals`, `/best-sellers`, `/offers` (shared `CollectionPage`, `collection` filter in `getShopProducts`, honest empty state + latest sarees), `/about`, `/contact` (settings-driven), `/search` → `/shop?q=` redirect (search now also matches category names and variant colours). Home hero replaced by an admin-managed **banner slider** (`components/home/hero-slider.tsx`: whole-image slides over a blurred fill — owner artwork has text baked in; 6s autoplay paused on hover/focus/hidden tab/reduced motion; arrows, dots, swipe; carousel ARIA) + brief headline band (H1 "Elegance Woven for Every Occasion", Shop Sarees / New Arrivals). 3 owner banners via `npm run db:banners` (prisma/banners.ts); seeded stock banner ("Up to 30% Off") deactivated; banner image validation accepts site paths. §5.2.1 single-hero recommendation superseded by the owner's request for a slider (D14 resolved: slider).
- Colour → photo (fifth session): choosing a colour switches the gallery to that colour's first photo and clicking a thumbnail selects its colour (shared `VariantSelectionProvider`, components/products/variant-selection.tsx; §5.5 "variant images" **done**); colour buttons carry a 28×36 photo swatch so the change is visible on mobile where the gallery is above the fold.
- Fixed along the way (plan items now **done**): "Out of Stock" shown before a variant is chosen → "Select color" (§5.6 item 9, partial); server-side add-to-cart validation (variant required, published, stock) + button/Buy Now handle the result (T32, T19 partial — no toast yet); product card and wishlist send variant products to the PDP ("Choose Colour") instead of adding a variant-less line (§5.4 partial); cart line shows the chosen colour and that colour's photo; cart "Tax" → "GST" (D3); PDP horizontal overflow on mobile from long thumbnail rows (`min-w-0`); product image validation accepts site paths; product JSON-LD image URLs made absolute.
- Admin: category form gains a "More Photos" uploader; category image validation now accepts site paths (`/images/…`) as well as Cloudinary URLs (previously saving these categories would fail with "Invalid URL").

---

## 1. Executive summary

### 1.1 Verdict
The codebase is **structurally sound** (clean server/client split, Decimal money, JSON-LD, redirects, typed actions) but the **experience reads as a well-built template, not a premium saree house**. Three things dominate:
1. **Dead ends everywhere (P0):** 7 linked routes 404 — including **Search, Checkout and every "View all"** — and the mobile menu drawer is visually broken on every phone. A trust-sensitive first-time buyer hits a 404 within two taps.
2. **No saree is visible above the footer (P0 content):** the hero is a stock sunset, the only category tile is an airplane placeholder, trust copy is vague, and there are no policy/contact pages — for a category where authenticity, COD, returns and colour accuracy decide the sale.
3. **Systemic interaction gaps (P1):** hover-only add-to-cart that is *invisible but clickable* on touch, "Out of Stock" shown when a variant simply isn't selected yet, errors swallowed silently, no loading/error boundaries, prices shown tax-exclusive then tax added in cart, no review moderation UI (so reviews never appear), admin destructive actions without confirmation.

### 1.2 Scores (baseline — re-score after each phase)
**Nielsen heuristics (0–4)**

| # | Heuristic | Storefront | Auth + Account | Admin | Key issue |
|---|---|---|---|---|---|
| 1 | Visibility of system status | 2 | 2 | 2 | ATC feedback only on the button; no toasts; admin selects commit silently |
| 2 | Match system / real world | 2 | 2 | 3 | Tax added on top of displayed price; raw enums (`OUT_FOR_DELIVERY`) shown to customers |
| 3 | User control & freedom | 2 | 2 | 2 | No undo on cart remove; no filter chips; no cancel on admin inline edits |
| 4 | Consistency & standards | 2 | 3 | 3 | Mixed radii (pill search vs `rounded-sm`), 3 badge dialects, dead links |
| 5 | Error prevention | 1 | 1 | 1 | Ghost ATC tap target; delete with no confirm (category/coupon/banner/address) |
| 6 | Recognition over recall | 2 | 2 | 2 | No breadcrumbs UI, no active nav states anywhere |
| 7 | Flexibility & efficiency | 1 | 1 | 1 | Search broken; no typeahead; admin has no bulk/shortcuts/"save & add another" |
| 8 | Aesthetic & minimalist | 2 | 3 | 3 | Generic icon-circle trust row, empty Instagram band, identical grid stacks |
| 9 | Error recovery | 1 | 1 | 2 | Single error string, values wiped on error, generic 404 |
| 10 | Help & documentation | 1 | 1 | 1 | No policies, contact, FAQ page, size/blouse guide; admin no field help |
| | **Total** | **16/40 (Poor)** | **18/40 (Poor)** | **20/40 (Acceptable)** | |

**Technical audit (0–4)**

| Dimension | Score | Key finding |
|---|---|---|
| Accessibility | 2 | Menu/drawer lack dialog semantics, focus trap, Esc; input borders 1.34:1; muted text 3.3–3.8:1; no `aria-live` feedback; no field-level `aria-invalid` |
| Performance | 2 | No `loading.tsx`/Suspense anywhere (every page blocks on all queries); header + bottom nav each call `auth()` + cart count; customers page loads all users + all orders |
| Responsive | 2 | Drawer clipped by `backdrop-filter` containing block; admin sidebar fixed 224px on phones; 14px inputs trigger iOS zoom; no safe-area insets |
| Theming | 3 | Coherent tokens exist; drift = `text-white/bg-white`, arbitrary `text-[10px]`, gold used as text below contrast |
| Implementation integrity | 1 | 7 dead routes, JSON-LD SearchAction → 404, 3 of 4 banner placements never rendered, review moderation missing, Next starter SVGs left in `/public` |
| **Total** | **10/20 (Acceptable)** | |

*Auth+Account and Admin scores are **provisional** — those screens were reviewed from source only (no login available in-session); re-score after rendering them.*

**Target after this plan:** Storefront ≥ 32/40, Account ≥ 32/40, Admin ≥ 30/40, Audit ≥ 17/20.

### 1.3 Top 18 issues (fix order)
| # | Sev | Issue | Where | §ref |
|---|---|---|---|---|
| 1 | P0 | 7 linked routes 404 (search, checkout, new-arrivals, best-sellers, offers, about, contact) | lib/constants.ts:12-18, footer.tsx:42-64, search-bar.tsx:16, mobile-bottom-nav.tsx:12, cart/page.tsx:83, home page.tsx:40,48, layout.tsx:54 | §4.1 |
| 2 | P0 | Mobile menu drawer clipped to header height (backdrop-filter containing block) | header.tsx:22 + mobile-menu.tsx:23 | §4.2 |
| 3 | P0 | No Shipping/Returns/Privacy/Terms/Cancellation pages, no contact block (payment gateways require them; buyers won't pay without returns policy) | footer.tsx | §6.4 |
| 4 | P0 | Placeholder imagery shipped as real content (stock sunset hero, airplane category tile) — P0 is to **hide** placeholder-dependent sections now; commissioning photography (§3.9) is a dependency, not a code fix | hero-banner.tsx, category-grid.tsx, prisma/seed.ts | §5.2, §3.9 |
| 5 | P1 | Hover-only ATC is invisible but still tappable on touch → accidental adds | product-card.tsx:56-58 | §5.4 |
| 6 | P1 | Variant not selected → button says "Out of Stock" | add-to-cart-button.tsx:44 + variant-selector.tsx:47 | §5.6 |
| 7 | P1 | Add-to-cart/Buy-now ignore action result; failures show "Added" | add-to-cart-button.tsx:36-40, buy-now-button.tsx:28-31 | §5.6 |
| 8 | P1 | Prices displayed tax-exclusive, tax added in cart (Indian MRP norm is inclusive) | cart.service.ts:216-219, cart/page.tsx:74-77 | §4.6 |
| 9 | P1 | Reviews are created `isApproved:false` and no admin UI approves them → reviews never show | review.service.ts:65, no admin route | §9.10 |
| 10 | P1 | No `loading.tsx` / `error.tsx` / `not-found.tsx` anywhere | app/ | §4.4 |
| 11 | P1 | Forms: one error at a time, values wiped on error, no `aria-invalid`, browser bubbles | auth.actions.ts:18-112, all forms | §4.5, §7 |
| 12 | P1 | Destructive admin/account actions without confirm; status selects commit instantly | category-list.tsx:86, coupon-list.tsx:67, banner-list.tsx:67, address-list.tsx:46, order-status-select.tsx:27 | §9 |
| 13 | P1 | Contrast: input borders 1.34:1, `ink-400` text 3.29–3.82:1, gold text 2.90:1 | globals.css tokens, input.tsx:9 | §3.2 |
| 14 | P1 | Admin unusable on phone (fixed 224px sidebar), no order detail page, no filters/bulk | admin layout.tsx:15 | §9.2 |
| 15 | P1 | Cart line omits variant (colour/size) and unit price; checkout CTA → 404 | cart-line-item.tsx, cart/page.tsx:83 | §5.7 |
| 16 | P1 | Server accepts any add-to-cart (no stock/variant/published/qty-cap check) and always returns success | actions/cart.actions.ts:21-33, services/cart.service.ts | §5.6 |
| 17 | P1 | Fabricated trust signals: "Verified Customer" fallback name, guessed social handles, placeholder WhatsApp | review-list.tsx:65, reviews-section.tsx:39, constants.ts:28-33 | §4.7, §5.2.5 |
| 18 | P1 | Category taxonomy differs from the owner brief (9 fabric categories, `/sarees/{slug}`) | prisma/seed.ts:38-44 | §2.6 |

---

## 2. Product truth, audience, and design direction

### 2.1 Product truth (preserve)
- Premium sarees today (silk, cotton, designer, wedding, printed, party wear, traditional); architecture must expand to **Men / Women / Kids / Jewellery / Accessories without redesign** (README). Every navigation, grid and filter spec below is department-agnostic.
- India-only, INR, Decimal money. Guest + logged-in cart/wishlist with merge. Admin is a small team doing **fast daily product entry**.
- Do **not** invent claims. Copy below marked `{{…}}` needs owner-confirmed facts (return window, free-shipping threshold, COD availability, Silk Mark/GI/Handloom marks, GSTIN, grievance officer, phone, address). The code currently asserts dispatch 24–48h, delivery 3–7 business days and 7-day returns (product-detail.tsx:159-163, product-faq.tsx) — this is **unverified template copy**: treat it as `{{…}}` until the owner confirms, and source it from SiteSettings (§4.7) so it cannot drift. Likewise the guessed social handles (constants.ts:28-33) and the placeholder WhatsApp number must not render unless set.

### 2.2 Who is buying
| Persona | Situation | What breaks today |
|---|---|---|
| **Lakshmi, 52** — buying a wedding Kanjivaram for her daughter, on her phone, reading glasses off | Needs: real drape photos, zari/weave facts, "is it pure silk?", blouse piece?, delivery before a date, COD, a human to WhatsApp | Menu broken, search 404, no fabric authenticity, 10–12px text, no contact number, no delivery-by-date |
| **Casey** — distracted mobile shopper, one thumb | Thumb-zone CTAs, persistent cart, no zoom-on-focus | 180px of fixed chrome, ghost ATC taps, iOS zoom, bottom nav search 404 |
| **Jordan** — first-timer, checks legitimacy | Policies, reviews, address, payment marks | No policies, no reviews visible, footer links 404 |
| **Riley** — edge cases | Long names, OOS variants, failures | Silent failures, wrong OOS label, empty home |
| **Alex** — shop owner entering 20 sarees a day | Speed, keyboard, duplication, bulk | One long form, no save-and-add-another, free-text fabric, no bulk |
| **Sam** — keyboard/screen reader | Dialog semantics, live regions | No focus trap/Esc/aria-live; icon-only actions |

### 2.3 Mode per surface (drives how much expression each gets)
| Surface | Mode | Implication |
|---|---|---|
| Home, category landing, campaign/offers, about | **Persuade** | Imagery-led, editorial rhythm, one clear action per band |
| Shop/search listing, cart, checkout, account, auth | **Operate** | Scanability, speed, states, thumb-zone; brand only in details |
| PDP | **Persuade → Operate** | Top half persuades (gallery, story), buy box operates (price, variant, CTA, delivery) |
| Policies, FAQ, care guides | **Read** | 68ch measure, clear headings, anchor links |
| Admin | **Operate** (dense) | Tables, shortcuts, bulk, clear status; minimal ornament |

### 2.4 Direction: **Refine and elevate the incumbent world — not a rebrand**
The supplied logo (gold foil RC monogram with a draped-saree figure, classical Roman caps, wide-tracked "COLLECTIONS" between hairlines, on deep wine) **confirms** the existing wine/gold/ivory token world. Keep it; raise the craft.

**Point of view — "Heirloom house":** the site should feel like being shown sarees in a family silk house: quiet ivory ground, deep wine for authority, **gold used as thread** (hairlines, rules, the logo's flanking lines, focus rings, small marks) — **not as big fills or text**, large portrait photography that shows the full drape and the zari close-up, a classical serif voice with restraint, and trust stated plainly next to the price.

**Anti-references (do not drift toward):** Myntra/Ajio sale energy (red % stickers, countdown clutter); generic Shopify-Dawn template (equal icon-circle trust rows, centered everything); Instagram-story category bubbles; stock lifestyle imagery; gradient text; glass/blur decoration.

**House rules that override any reviewer suggestion elsewhere in this doc:**
- **No eyebrow/kicker labels above headings** (e.g., "NEW SEASON EDIT" above an H2). The heading carries itself. (Impeccable craft floor ban.) This removes the current hero eyebrow (hero-banner.tsx:27) and any suggested section eyebrows.
- No section numbers, no gradient text, no colored thick side borders on cards, no hard offset shadows, no emoji as icons.
- Gold (`gold-400/500`) is never body or UI text on light grounds (2.90:1). Use `gold-700` (new, 5.69:1) when gold-hued text is required.
- One authored motion moment per page (§3.6), everything else static or micro.

### 2.5 Owner brief alignment (the brief wins)
The owner's brief ("Create a modern, premium saree e-commerce website called Renish Collections…") is the **pinned design authority**. Where this plan and the brief disagree, the brief wins; where the brief is silent, this plan's recommendations apply. Where the brief conflicts with what already exists in code, the conflict is resolved below and the decision is listed in §12.1.

**Brief → current state → plan section**

| Brief requirement | Current state (verified) | Resolution / plan section |
|---|---|---|
| RC logo/monogram as primary identity, "RENISH COLLECTIONS" | **Done this session** (§0.4) | Keep; §3.8 for remaining brand work |
| Palette: deep maroon/burgundy, cream, white, gold accents | Tokens exist (ivory/cream/maroon/gold) | Keep; add `white` surface usage for cards/product frames; gold as accent lines (§3.1) |
| Clean whitespace, generous spacing, "do not overcrowd" | Mostly fine; home has dead zones and 3 identical grids | §3.4 rhythm, §5.2 section list trimmed |
| **Saree categories** — brief listed 9; **owner's final list is 8**: Banarasi Tissue, Silk, Kora, Soft Silk, Katan Silk, Warm Silk, Dupion Silk, Viscose Silk | Implemented: taxonomy created, only Banarasi Tissue published (has photos) | §2.6 |
| Category URLs `/sarees/banarasi`, `/sarees/soft-silk`, … | Routing already supports `/{parent}/{child}` via `app/(storefront)/[categorySlug]/[slug]/page.tsx` (subcategory resolved before product) | **No route change needed** — set subcategory slugs exactly to `banarasi, tissue, silk, kora, soft-silk, katan-silk, warm-silk, dupion-silk, viscose-silk`; add 301s from old slugs (`silk-sarees` → `silk`, etc.) |
| Category card: image, name, short description, **product count**, "View Collection"/"Explore" button, link | Circle tile with name only (category-grid.tsx) | §5.2.2 rewritten to brief spec |
| Category grid: **3/row desktop, 2/row tablet, 2/row or horizontal scroll on mobile** | 6-col circle grid | §5.2.2 |
| Header: RC logo + name · Home · Sarees · **Collections** · New Arrivals · Offers · About Us · Contact · Search · Wishlist · Cart · Account | Logo done; nav = Home + DB categories + 5 static (4 dead); no Collections | §5.1.2 rewritten: all brief items kept, Sarees has the 9-category dropdown, Collections dropdown (occasion/curated), all links must resolve (§4.1) |
| Mobile header: hamburger · logo · search · cart | Hamburger · text logo · account · cart + full search row | §5.1.3 matches brief exactly |
| Hero: "Elegance Woven for Every Occasion" / "Discover timeless sarees crafted in exquisite fabrics." / **Shop Sarees** + **Explore Collections**, high-quality saree image | Banner title + single "Shop Now"; fallback copy differs | §5.2.1 uses the brief copy as the default/fallback hero |
| Category page: breadcrumb Home › Sarees › {Category}; H1; description; product grid | No visible breadcrumb; H1 + description exist | §5.3 |
| Product card: image, name, **fabric**, price, discount price, **rating**, wishlist, **Add to Cart**, **Quick View** | Image, category, name, price/MRP, wishlist, hover-only ghost ATC | §5.4 rewritten: all brief elements, ATC **visible** (not hover-ghost), Quick View on all devices |
| Filters: Saree Type, Price Range, Color, Fabric, **Occasion, Pattern, Border Type**, Availability, **Discount**; desktop sidebar + mobile drawer | Shop only: Category, Price, Color, Fabric, In stock; categories: none | §5.3 facet list = brief list; schema adds `pattern`, `borderType`, `occasion[]` (§12.2) |
| Sorting: Newest, Price ↑, Price ↓, Popular, Best Selling | Exactly these 5 exist (sort-select.tsx) | Keep; optional "Biggest discount" only on /offers |
| Product data: name, slug, category, categorySlug, fabric, price, salePrice, images, colors[], occasion[], pattern, stock, rating, reviews, featured, newArrival | Prisma `Product`: `originalPrice`(=price/MRP) + `sellingPrice`(=salePrice), fabric, single `color`, stock, isFeatured, isNewArrival; **no** colors[], occasion[], pattern; rating/reviews computed from Review | §12.2: add `colors String[]` (keep `color` as primary or migrate), `occasion String[]`, `pattern`, `borderType`; expose `ratingAverage/ratingCount` (denormalised on review approval) |
| Category data: id, name, slug, image, description — **not hardcoded in components** | Already DB-driven (Category model with image/description) + admin CRUD | Satisfied; seed the 9 categories with the brief's descriptions (§2.6) |
| Pages: /, /sarees, /sarees/[category], /product/[slug], /cart, /wishlist, /about, /contact | /, /sarees, /sarees/[sub], /cart exist; product at `/sarees/{product-slug}`; wishlist only under /account; about/contact missing | Build /wishlist (§6.8), /about (§6.5), /contact (§6.6), /collections (§6.9); product URL: **keep `/sarees/{slug}`** (decision D10) |
| CartDrawer | None (Buy Now/ATC go nowhere visible) | §5.7.1 cart drawer on add-to-cart |
| SEO per category: title "{Category} \| Renish Collections", description template, H1, OG | Title currently `${name} — Shop Online` fallback | §4.9 uses the brief templates |
| "Smooth hover effects, subtle animations, rounded or softly framed cards, gold accent lines, elegant typography, premium buttons, mobile-first" | Scale-on-hover, `rounded-sm` everywhere, no gold lines | §3.4 radius updated to soft frames; §3.6 motion allows smooth card hover (lift + image cross-fade) |
| **JavaScript, NOT TypeScript**; `data/categories.js`, `data/products.js` | Codebase is **TypeScript** with Prisma DB + admin already built | **Decision D11 — recommended: keep TypeScript and the DB.** The brief's goal ("so a backend and admin panel can be connected later") is already met more fully; converting to JS static data would delete the admin, cart persistence and type safety. The brief's data shapes are honoured as the **public DTO** returned by `services/*` (see §2.6) |
| Admin: add/edit/delete categories, upload images, products, prices, stock, multi-image, New Arrival, Featured, discounts, colors, fabric types | All exist except structured colors/fabric-type management and discount management UX | §9.5, §9.6 (fabric/colour managed lists), §9.11 |

### 2.6 Saree taxonomy — **owner's final list (8 categories, decided 2026-09-27)**
Parent: **Sarees** (`/sarees`). Children, in this display order. Implemented by `npm run db:setup-categories` (prisma/setup-categories.ts); a category is **published only once it has real photos** (owner decision), otherwise it exists hidden and is published from Admin → Categories.

| # | Name | Slug | Description (default, owner-editable) | Status |
|---|---|---|---|---|
| 1 | Banarasi Tissue Sarees | `banarasi-tissue` | Lightweight tissue sarees with rich Banarasi woven motifs and a festive shimmer. | **Live** — 7 owner photos |
| 2 | Silk Sarees | `silk` (renamed from `silk-sarees`, keeps its product) | Classic silk sarees for timeless occasions. | Hidden, awaiting photos |
| 3 | Kora Sarees | `kora` | Elegant and lightweight sarees with a graceful finish. | Hidden, awaiting photos |
| 4 | Soft Silk Sarees | `soft-silk` | Soft, comfortable and elegant silk sarees. | Hidden, awaiting photos |
| 5 | Katan Silk Sarees | `katan-silk` | Premium silk with a rich traditional texture. | Hidden, awaiting photos |
| 6 | Warm Silk Sarees | `warm-silk` | Beautiful silk sarees with a luxurious finish. | Hidden, awaiting photos |
| 7 | Dupion Silk Sarees | `dupion-silk` | Elegant textured silk for sophisticated occasions. | Hidden, awaiting photos |
| 8 | Viscose Silk Sarees | `viscose-silk` | Beautiful silk-look sarees with a smooth finish. | Hidden, awaiting photos |

- **Not in the final list (hidden, never deleted):** standalone *Banarasi Sarees* and *Tissue Sarees* (replaced by Banarasi Tissue), *Cotton Sarees* (dropped — D12 resolved), and the seeded *Designer, Wedding, Printed, Party Wear, Traditional*. Wedding/Party become **Occasion** values (Wedding, Festival, Party, Reception, Office, Casual); Designer/Traditional/Printed become **Pattern** values (Traditional, Contemporary, Printed, Woven, Embroidered, Zari Butta).
- Grid behaviour with 8 categories: desktop 3-per-row (3 + 3 + 2 — the last row's two cards stay card-width, left-aligned; do not stretch them), tablet/mobile 2-per-row (4 even rows). While only one category is live, the home section renders a single feature card (implemented).
- **Collections** (header item): curated, not structural — e.g., {{Bridal Edit, Festive Edit, Office Elegance, Under ₹5,000, Gifting}}. `Collection` model (D13), routes `/collections`, `/collections/[slug]`.
- **Reserved slugs** (§4.1) must include `collections`, `product`, `wishlist`.
- **Public DTO** mirrors the brief's product shape: `{ id, name, slug, category, categorySlug, fabric, price /*MRP*/, salePrice /*selling*/, images, colors, occasion, pattern, borderType, stock, rating, reviews, featured, newArrival }`; categories use `CategoryCardData` from `getSubcategoryCards()` (implemented). Components never read Prisma models directly.

---

## 3. Design system (build this first — every page spec references it)

All tokens live in `app/globals.css` (`:root` + `@theme inline`). Tailwind v4 reads them; do not hard-code hex in components.

### 3.1 Colour tokens — keep, add, and restrict
| Token | Hex | Status | Allowed use |
|---|---|---|---|
| `ivory` | #faf6f0 | keep | Page ground |
| `cream` | #f4ede2 | keep | Secondary panels, footer, skeleton base |
| `white` | #ffffff | keep (as token `--color-surface`) | Inputs, cards on ivory, admin tables |
| `charcoal` | #241f1c | keep | Primary text (15.15:1 on ivory) |
| `ink-600` | #5a534d | keep | Secondary text (7.02:1 ivory, 6.50 cream) |
| **`ink-500`** | **#6b635c** | **add** | Muted/meta text, captions, helper text (5.47 ivory, 5.07 cream) — replaces `ink-400` for all text |
| `ink-400` | #8a8179 | restrict | **Decorative icons and disabled states only.** Placeholders use `ink-500` (placeholders may never carry required information — labels always visible). 3.55 ivory / 3.82 white fails AA for text |
| `border` | #e7ddd0 | keep | Dividers, card outlines (decorative; 1.34:1 is fine for non-interactive) |
| **`border-strong`** | **#9a8e80** | **add** | Interactive control boundaries on **white** surfaces: inputs, selects, checkboxes, qty steppers (3.20:1 on white). On the ivory ground it is only 2.98:1 → controls must sit on a white fill (inputs are `bg-surface`) or use **`border-stronger` #8a7e71** (3.68:1 ivory, 3.41:1 cream, 3.96:1 white) where the edge meets ivory or cream |
| `maroon-50/100` | #fbecee/#f3d3d8 | keep | Selected-chip fill, error-tint backgrounds |
| `maroon-400` | #a13b48 | keep (restricted) | Hover tint on dark surfaces and illustration only; not for text on light (verify before any text use) |
| `maroon-600` | #7a1f2b | keep | Primary actions, links, active state (9.48:1 on ivory) |
| `maroon-700` | #601722 | keep | Hover/pressed, logo on light |
| `maroon-900` | #3d0e15 | keep | Announcement bar, admin login ground, OG/icon ground |
| `gold-300` | #e7d3a3 | keep | Text on maroon-900 (11.20:1), hairlines on dark |
| `gold-400` | #cfa969 | restrict | Hairlines/rules/ornament on light, stars fill |
| `gold-500` | #b8894a | restrict | Filled gold button with **charcoal** text (5.21:1) only; never text on light (2.90:1); never white text on it (3.13:1) |
| `gold-600` | #96702f | restrict | Large text ≥18.66px bold / 24px only (4.19:1) |
| **`gold-700`** | **#7d5c22** | **add** | Gold-hued small text (5.69:1 ivory): "Low stock", accents |
| `success` | #2f6b3f | keep | Text 5.92 on ivory; white on it 6.37 |
| `error` | #b3261e | keep | Text 6.07 on ivory; white on it 6.54 |
| **`warning`** | **#8a5a00** | add | Pending/processing status text (5.51 ivory, 5.10 cream) |
| **`info`** | **#1f4e79** | add | Shipped/in-transit status text (8.05 ivory, 7.45 cream) |

Also theme browser surfaces (craft floor): `::selection { background: var(--color-maroon-100); color: var(--color-charcoal) }`; `caret-color: var(--color-maroon-600)`; `accent-color: var(--color-maroon-600)` on checkbox/radio; link `text-underline-offset: 0.2em`; thin scrollbars `scrollbar-color: var(--color-gold-400) transparent` on horizontal carousels; `font-variant-numeric: tabular-nums` on prices in tables, cart and admin.

**Acceptance:** `grep -rn "text-ink-400" components app` returns only placeholder/icon usages; no `text-white`/`bg-white` literals outside tokens; axe `color-contrast` = 0 violations on /, /shop, /[cat], PDP, /cart, /login.

### 3.2 Measured contrast (for evaluator verification)
ink-400/ivory 3.55 · ink-400/cream 3.29 · ink-400/white 3.82 · ink-600/ivory 7.02 · ink-500/ivory 5.47 · ink-500/cream 5.07 · maroon-600/ivory 9.48 · charcoal/gold-500 5.21 · white/gold-500 3.13 · gold-500/ivory 2.90 · gold-600/ivory 4.19 · gold-700/ivory 5.69 · gold-300/maroon-900 11.20 · border/white 1.34 · border-strong/white 3.20 · white/success 6.37 · white/error 6.54 · shop price placeholders #8f8b86/ivory 3.14.

### 3.3 Typography
Current: Playfair Display (500–700) for h1–h3 + Inter body. Detector: Inter = 85–93% of rendered text ("overused font"); Playfair at 600 reads as generic "luxury template"; the logo's lettering is a **classical Roman capital serif with wide tracking**, which Playfair's high-contrast Didone does not echo.

**Decision D1 (owner) — recommended:**
- **Display:** *Cormorant Garamond* (500, 600; italic 500 for rare emphasis) — echoes the logo's Roman caps; **only at ≥24px** (thin hairlines break below). Uppercase wide-tracked usage (`tracking-[0.18em]`) for small navigation labels mirrors "COLLECTIONS".
- **UI/body:** *Figtree* (400/500/600) — warmer, humanist, excellent at 14–16px, distinct from Inter. **Verify the ₹ (U+20B9) glyph**; if missing, add a `unicode-range: U+20B9` `@font-face` fallback to Noto Sans so prices never render in a fallback metric.
- Alternative if the owner prefers continuity: keep Playfair for display but at **500**, sizes per the scale below, and swap only Inter → Figtree.
- Load via `next/font/google` with `display: "swap"`, `subsets: ["latin", "latin-ext"]`, explicit weights only.
- Future i18n: reserve `--font-deva` / `--font-tamil` (Noto Serif Devanagari / Noto Sans Tamil) for Hindi/Tamil product names.

**Type scale (mobile → desktop)** — define as tokens `--text-*` with paired line-heights:
| Token | Size | LH | Use |
|---|---|---|---|
| `display-xl` | 40 → 64px | 1.04 | Home hero headline (Cormorant 500, tracking -0.01em) |
| `display-l` | 32 → 44px | 1.08 | Page H1 on Persuade pages |
| `display-m` | 26 → 32px | 1.15 | Section H2 |
| `title-l` | 24 → 28px | 1.2 | PDP product name, category card names on desktop (Cormorant 600). Below 24px use Figtree 600 (`title`) — Cormorant is never set under 24px |
| `title` | 18px | 1.35 | Sub-section H3 (Figtree 600) |
| `body-l` | 16 → 17px | 1.6 | Descriptions, policy text |
| `body` | 15 → 16px | 1.55 | Default UI text (**inputs always 16px on mobile** — iOS zoom) |
| `small` | 13 → 14px | 1.45 | Meta, captions, helper |
| `micro` | 12px | 1.35 | Tags, legal — **floor**; nothing interactive below 12px (bottom nav currently 10px). Only numeric count badges may use 11px |
| `label-caps` | 12 → 13px, `tracking-[0.14em]`, uppercase, Figtree 600 | 1.2 | Nav labels, button text on primary CTAs only |

Rules: implement sizes as Tailwind v4 `--text-*` theme tokens (`text-display-xl`, `text-body`, `text-small`, `text-micro`, `text-label-caps`) and use those classes — arbitrary `text-[Npx]` only where no token fits; body measure 60–72ch; Cormorant has a smaller x-height — use `adjustFontFallback` and size display text ~8–10% larger than the Playfair equivalents; headings `text-wrap: balance`; paragraphs `text-wrap: pretty`; more space above a heading than below (e.g., `mt-16 mb-6` for H2); prices Figtree 600 tabular.

### 3.4 Space, layout, radius, elevation
- **Spacing scale:** 4/8/12/16/24/32/48/64/96px. Section rhythm: mobile 48px, desktop 80–96px between Persuade bands; Operate pages 24–32px.
- **Container:** `max-w-7xl` (1280) storefront, `max-w-[1440px]` for full-bleed editorial bands; gutter 16px mobile / 24px tablet / 32px desktop.
- **Grid:** 4-col mobile / 8-col tablet / 12-col desktop; product grids 2 / 3 / 4 columns with `gap-x-4 gap-y-10` (mobile `gap-x-3 gap-y-8`).
- **Radius (brief: "rounded or softly framed product cards"):** `--radius-card: 6px` (`rounded-card`) for product/category cards, images, drawers' inner panels, dropdown panels; `--radius-control: 4px` for buttons, inputs, selects, chips; `9999px` only for icon buttons, count badges and swatches. **Remove the pill search input** (search-bar.tsx:30 `rounded-full`). Soft frame = 1px `border` that becomes `gold-400` on hover/focus — this is the brief's "gold accent lines" at card level.
- **Elevation:** define `--shadow-1: 0 1px 2px rgba(36,31,28,.06)` (card hover), `--shadow-2: 0 8px 24px -8px rgba(36,31,28,.18)` (dropdowns, sticky bars, popovers), `--shadow-3: 0 24px 48px -12px rgba(36,31,28,.28)` (drawers/dialogs) as Tailwind theme tokens `shadow-1/2/3`. No zero-offset glows.
- **Z-index scale:** header 40, bottom nav 40, sticky buy bar 45, overlay/drawer 50, toast 60.

### 3.5 Component library (create in `components/ui/`, then migrate)
Each needs: default, hover, focus-visible (2px maroon-600 outline, 2px offset — keep globals.css:72-75), active, disabled, loading, error; keyboard + screen-reader behaviour stated.

| Component | Spec highlights | Replaces |
|---|---|---|
| `Button` (extend) | Sizes sm 36 / md 44 / lg 52px height (`h-13` is valid in Tailwind v4's dynamic spacing scale = 3.25rem; verified 52px in the empty-cart render) — sm 36 is below the 44px touch target, so use sm only on desktop-only toolbars; `loading` prop → 16px spinner + `aria-busy`, keeps width, opacity ≥0.85 (not 0.5); variants primary/secondary/gold/ghost/danger/link | button.tsx |
| `Field` (Label + Input + Hint + Error) | `id` wiring, `aria-invalid`, `aria-describedby` → hint+error ids, error icon + text (not colour alone), `border-strong`, 16px text mobile, optional prefix slot (`+91`, `₹`), password reveal slot (44×44 button, `aria-pressed`) | input.tsx Input/Label/FieldError |
| `Select`, `Textarea`, `Checkbox`, `Radio`, `Switch` | Same states; checkbox 20px with 44px label hit area; `accent-color` | ad-hoc selects/checkboxes in 15 files |
| `ChipGroup` (radio/checkbox semantics) | Variant/filter chips: 44px min height, selected = maroon-600 border + maroon-50 fill + check icon; unavailable = strike-through + `aria-disabled` + "Sold out" tooltip | variant-selector.tsx:58-68 |
| `Price` | Selling (Figtree 600), MRP struck `ink-500`, "–{n}%" in `success`, "+ GST" suffix / "Price excludes GST" micro line (D3, §4.6); sizes sm/md/lg; tabular | 6 ad-hoc price renders |
| `Rating` | Stars (gold-400 fill = 2.05:1 on ivory, so the numeric text is **mandatory**) + "4.6" + "(128)"; `aria-label="Rated 4.6 out of 5 from 128 reviews"` | review-list.tsx, reviews-section.tsx |
| `Badge` → `Tag` + `StatusChip` | Tag: product merchandising (New, Bestseller, –20%) — max **one** tag on imagery; StatusChip: order/payment/product status with icon + colour + text (§3.7) | badge.tsx |
| `Sheet` / `Drawer` / `Dialog` | Portal to `document.body`; `role="dialog" aria-modal aria-labelledby`; focus trap; Esc; scroll lock (`overflow:hidden` on html, preserve scroll position); return focus to trigger; close on route change; side prop left/right/bottom; `h-dvh`; reduced-motion aware | mobile-menu.tsx, mobile-filter-drawer.tsx, window.confirm |
| `ConfirmDialog` | Title names object ("Delete 'Maroon Kanjivaram'?"), consequence line, destructive button labelled with verb ("Delete product"), cancel focused by default | window.confirm + unconfirmed deletes |
| `Toast` | Bottom-center mobile (above bottom nav/sticky bar), top-right desktop; `role="status"` (`alert` for errors); 4s auto-dismiss, pause on hover/focus; optional action ("Undo", "View cart") | none (silent actions today) |
| `Skeleton` | cream → ivory shimmer 1.2s, reduced-motion = static; shapes for card, PDP, table row | none |
| `EmptyState` | Illustration-free: 40px outline icon (gold-700), title, one line, one primary action | 12 ad-hoc empty `<p>` |
| `Breadcrumb` | `nav aria-label="Breadcrumb"` + `ol`, current `aria-current="page"`, truncates middle on mobile | JSON-LD only today |
| `QtyStepper` | 44×44 buttons, `role="group" aria-label="Quantity"`, value announced, disabled at bounds with reason ("Only 2 left") | cart-line-item.tsx:58-77 (32px) |
| `Tabs`, `Accordion` | Accordion uses `details/summary` with visible chevron rotating, 56px rows | product-faq.tsx (marker removed, no affordance) |
| `DataTable` (admin) | Sticky header, sortable columns (`aria-sort`), row selection checkbox, bulk bar, density toggle, empty/loading/error rows, pagination with page size | 4 ad-hoc admin tables |
| `ProductCard` | See §5.4 | product-card.tsx |

### 3.6 Motion
- Durations: micro 120ms, UI 200ms, drawers 280ms; easing `cubic-bezier(0.22,1,0.36,1)` (exponential out). Only transform/opacity/clip-path.
- **Brief: "smooth hover effects, subtle animations".** Budget per page: **one authored moment** (Home = hero settle + headline clip-path reveal; PDP = gallery cross-fade/zoom; Category page = none) **plus** a shared, quiet interaction layer: card hover lift + image cross-fade + gold frame (200–300ms), dropdown/drawer transitions, button press states. **Not allowed:** scroll-triggered entrance on every section, hero autoplay, marquee/rotating banners on desktop (announcement bar is static on desktop, one message cross-fading on mobile only).
- Product/category image hover: replace `scale-105` zoom (detector flag) with **second-image cross-fade** (primary → image[1], 300ms) + 2px card lift, on hover-capable pointers only (`@media (hover:hover)`); no scale anywhere.
- `prefers-reduced-motion: reduce` → keep state changes (colour/opacity), drop movement; no carousel autoplay.

### 3.7 Status language (customer + admin)
| Enum | Customer label | Admin label | Chip colour |
|---|---|---|---|
| PENDING | Order placed | Pending | warning |
| CONFIRMED | Confirmed | Confirmed | info |
| PROCESSING | Being prepared | Processing | info |
| PACKED | Packed | Packed | info |
| SHIPPED | Shipped | Shipped | info |
| OUT_FOR_DELIVERY | Out for delivery | Out for delivery | info |
| DELIVERED | Delivered | Delivered | success |
| CANCELLED | Cancelled | Cancelled | error |
| RETURNED | Returned | Returned | neutral |
| REFUNDED | Refunded | Refunded | neutral |
Put this map in `lib/order-status.ts`; never render raw enums (account orders/page.tsx:39, admin dashboard page.tsx:94, admin orders select).

### 3.8 Brand application (remaining after §0.4)
- **Announcement bar** (§5.1) on `maroon-900` with the gold thread rule motif; no logo repeat.
- **Hairline motif (gold accent lines — brief):** reuse the logo's flanking hairlines as ornament **without text**: a centered `1px gold-400` rule of 48px + 6px gold diamond + 48px rule, used as a divider *between* sections or under the footer logo (max 2 per page). Never place text between the rules and never directly above a heading (that would be an eyebrow — banned). Card-level gold lines = the hover frame in §3.4.
- `SiteSettings.logoUrl` / `faviconUrl` exist in schema with no UI: either expose in admin Settings (upload → used by `<Logo>` with fallback to static assets) or remove the fields. Recommend: keep static assets as source of truth (quality-controlled alpha), hide the fields.
- Delete Next starter files in `public/` (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) — unused.
- Email templates (reset password, order emails) must use the stacked logo on maroon header + branded button (currently raw HTML with raw URL, auth.actions.ts:93).
- Loading splash: none — rely on skeletons; don't add a logo spinner.

### 3.9 Imagery art direction (owner/photographer brief — the biggest single lever)
- **Product (per saree, minimum 5 shots):** 1) full drape on model, natural light, pleats visible to the fall, 3:4; 2) pallu spread flat or over shoulder; 3) border + zari macro (colour-true, daylight 5500K, grey card); 4) body texture macro; 5) blouse piece laid flat; optional 15–30s video (drape movement). Plain warm-ivory or temple-stone background; no heavy filters (colour accuracy is a purchase criterion and a top return reason).
- **Category tiles:** 1200×1600 (3:4), single saree, same background family across categories.
- **Hero:** desktop 2400×1200 (2:1) + mobile 1080×1440 (3:4) with focal point kept in the central 60% (Banner has `mobileImageUrl` already — schema field unused, §9.12).
- **Admin guidance inline** in uploaders (§9.6): recommended sizes, "first image = shown in listings", alt-text prompt.
- Until real photography exists: the seed's placeholder images must not ship; hide image-dependent sections when images are missing rather than show stock.

---

## 4. Cross-cutting fixes (apply once, benefit every page)

### 4.1 [P0] Route map — every link must resolve
Build these routes (specs in §6) **or** remove the link until built. Never ship a link to a 404.

| Route | Linked from | Build as |
|---|---|---|
| `/search?q=` | search-bar.tsx:16, mobile-bottom-nav.tsx:12, JSON-LD layout.tsx:54 | Listing page (reuse shop listing) with query header + zero-results state (§6.1). Interim one-line fix: point SearchBar to `/shop?q=` (already supported, shop/page.tsx:41) **and** replace the bottom-nav Search item (mobile-bottom-nav.tsx:12) per §5.1.3 |
| `/new-arrivals` | constants.ts:13, footer.tsx:45, home page.tsx:40 | Collection page filtered `isNewArrival` (or `publishedAt` last 30 days), sorted newest (§6.2) |
| `/best-sellers` | constants.ts:14, footer.tsx:46, home page.tsx:48 | Collection page filtered `isBestSeller`, sort best_selling (§6.2) |
| `/offers` | constants.ts:15, footer.tsx:47 | Collection page: products where `originalPrice > sellingPrice`, sort by discount desc; plus active coupons strip (§6.3) |
| `/about` | constants.ts:16, footer.tsx:54 | Read/Persuade page (§6.5) |
| `/contact` | constants.ts:17, footer.tsx:55 | Contact page with WhatsApp/phone/email/address/hours + form (§6.6) |
| `/checkout` | cart/page.tsx:83 | Checkout flow — **a separate project** (payments, guest orders, schema changes §12.2); UI spec in §5.8. Interim: CTA "Order on WhatsApp" → `https://wa.me/{number}?text=` with a template `Hi Renish Collections, I'd like to order:\n{n}× {name} ({variant}) — ₹{price}\n…\nTotal: ₹{total}` truncated to 1,800 chars ("…and {k} more items"); if no WhatsApp number is set → "Call to order {phone}"; if neither → disabled button "Online checkout opens soon" with a one-line explanation. Never link to a 404 |
| `/policies/shipping`, `/policies/returns`, `/policies/privacy`, `/policies/terms`, `/policies/cancellation` | new footer links | Read pages from one MDX/DB template (§6.4) |
| `/sarees` (index) | header "View all sarees", hero "Shop Sarees" | Already exists as the parent category page; upgrade per §6.10 |
| `/collections`, `/collections/[slug]` | header Collections, hero "Explore Collections" | §6.9 |
| `/faq`, `/saree-care` | footer Help | §6.11 (or omit the links until written) |
| `/track-order` | new footer/help link | Order number + phone/email lookup → order detail (§6.7) — after checkout exists |
| `/account/orders/[orderNumber]` | orders list | Order detail (§8.5) |

**Implementation note:** `app/(storefront)/[categorySlug]/page.tsx` is a catch-all first segment and `[categorySlug]/[slug]` resolves **both** subcategory listings and PDPs (subcategory first — `resolveSubcategory`, [slug]/page.tsx:17-21). Static folders win over the dynamic segment (verified in the Next 16 routing docs). Therefore: (1) **reserve slugs** in the category slug validator — `shop, search, cart, checkout, account, wishlist, login, signup, forgot-password, reset-password, new-arrivals, best-sellers, offers, about, contact, policies, collections, product, track-order, faq, saree-care, admin, api`; (2) validate **product slugs against child-category slugs** of the same parent (and vice versa) — a product named "silk" would otherwise be shadowed by `/sarees/silk`.

**Interim link hiding (Phase 0), exact list:** header static items for pages not yet built (from `STATIC_NAV_LINKS`, constants.ts:12-18), footer Shop/Company items (footer.tsx:46-47, 55-56), home "View all" links (page.tsx:40, 48 — point both to `/shop?sort=` equivalents: New Arrivals → `/shop?sort=newest`, Best Sellers → `/shop?sort=best_selling` until the collection pages exist), bottom-nav Search. Implement with a single `NAV_ROUTES_ENABLED` map in lib/constants.ts so links reappear when pages ship.

**Acceptance:** a crawler script (Playwright, all `a[href^="/"]` on /, /shop, a category, a PDP, /cart, footer) reports 0 non-200 internal links.

### 4.2 [P0] Overlay containing-block bug (mobile menu, and any future overlay in the header)
- **Cause (verified in code + screenshot `mobile-menu-open.png`):** `header.tsx:22` has `backdrop-blur` → `backdrop-filter` makes `<header>` the containing block for `position:fixed` descendants; `MobileMenu`'s `fixed inset-0` overlay (mobile-menu.tsx:23) is rendered inside the header, so it is clipped to header height and the links paint transparently over the hero.
- **Fix:** render all overlays through the `Sheet` primitive (§3.5) that portals to `document.body`. Keep the header blur (or move it to a `::before` pseudo layer) — the portal alone resolves it.
- Also: drawer opens on the **left** (trigger is top-left; today it slides from the right because the scrim precedes the nav, mobile-menu.tsx:24-30).
- **Acceptance:** at 390×844 the open drawer covers `100dvh`, background does not scroll, Esc closes, focus starts on the first link and returns to the trigger; axe reports no `aria-dialog-name` violations.

### 4.3 [P1] Mobile chrome budget
Today: sticky header 116px (64 + search row 52) + bottom nav 64px = **180px (21%) of an 844px screen permanently**.
- Mobile header: single 56px row — menu · logo (centered, `h-9`) · search icon · cart (with count). Search opens a full-screen search overlay (§5.1.5).
- Bottom nav (§5.1.3): 56px + `env(safe-area-inset-bottom)`; hide on scroll-down, show on scroll-up (threshold 8px, `transform` only); **hidden on PDP (replaced by sticky buy bar), cart, checkout, auth pages**.
- Add `pb-[calc(56px+env(safe-area-inset-bottom))] sm:pb-0` to `<main>` in storefront layout (layout.tsx:9) and remove footer's `pb-20` hack (footer.tsx:19).
- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` via Next `viewport` export in app/layout.tsx.
- **Acceptance:** at 390×844 fixed chrome ≤ 112px while scrolling up, ≤ 56px while scrolling down; no content hidden behind the bottom nav at page end.

### 4.4 [P1] Loading, error, not-found boundaries (none exist)
| File | Content |
|---|---|
| `app/not-found.tsx` (root) + `app/(storefront)/not-found.tsx` | Branded 404 inside the storefront chrome: H1 "We couldn't find that page" (display-l), line "The link may be old, or the saree may have sold out.", search field (autofocus off), 4 category tiles, "Go to home" + "Chat on WhatsApp". Status 404 preserved. For missing PDP slugs: "This saree is no longer available" + 4 related products from same category (needs category from slug redirect table if possible) |
| `app/(storefront)/error.tsx` (client) | "Something went wrong on our side." + "Try again" (call the **`retry()`** prop — Next 16 prefers it over `reset()`, node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md) + "Go to home"; log digest; never show stack |
| `app/global-error.tsx` | Minimal branded fallback with logo, own `<html><body>`, `retry()` button |
| `app/admin/not-found.tsx` | Admin-styled 404 ("This admin page doesn't exist" + back to dashboard) so `/admin/*` 404s don't get the storefront page |
| Root `app/not-found.tsx` note | URLs with 3+ segments (e.g. `/sarees/silk/x`) are not matched by the storefront group and render the **root** not-found inside the root layout **without** the store header/footer — the root page must render its own minimal header (logo + search + home link) |
| **No group-level `loading.tsx`.** Add `loading.tsx` only for `/shop`, `/sarees` listing segments **after** their existence checks, `/cart`, `/account/*` | **Caution (Next 16 streaming):** once a response starts streaming, the status is 200 — `notFound()` becomes a soft 404 and `redirect()` can't send a 3xx (loading.md:101-120). For `[categorySlug]` and PDPs, resolve existence, canonical redirects and slug redirects **in the page before any Suspense boundary**, and stream only below-the-fold sections via `<Suspense>` inside the page (reviews, related, recently viewed). Skeletons match the final layout (card grid; PDP gallery+buy box; cart lines) — no spinners |
| `app/admin/(dashboard)/loading.tsx`, `error.tsx` | Table-row skeletons; error with retry |
- Wrap slow, independent home sections in `<Suspense>` (reviews, instagram, product rails) so the hero streams first (page.tsx:18-28 currently awaits 8 queries before any byte).
- Header: stream cart count/account state in a small `<Suspense>` so `auth()` + `getCartItemCount()` don't block the whole shell (header.tsx:11-12; mobile-bottom-nav.tsx:7-8 repeats both calls — dedupe with React `cache()` in the service layer).
- **Acceptance:** throttled "Slow 4G" in DevTools shows header + hero within 1.5s and skeletons for the rest; forcing a thrown error in a server component renders error.tsx with working retry.

### 4.5 [P1] Forms contract (auth, account, address, review, newsletter, admin)
1. Server actions return `{ ok: boolean; formError?: string; fieldErrors?: Partial<Record<Field,string>>; values?: Record<string,string> }` (never echo passwords). Build from `z.flattenError(err).fieldErrors` (zod v4). Today: single `issues[0]` string (auth.actions.ts:47,84,112; similar in account/address/admin actions).
2. Inputs re-populate from `values` (`defaultValue`) — React 19 form actions reset uncontrolled inputs; today signup wipes name/email/phone on any error (**P0 for signup abandonment**).
3. `noValidate` on forms; validate on blur, re-validate on change after first error, validate all on submit; focus first invalid field; error summary `role="alert"` at top only when ≥2 errors.
4. Every input: `autoComplete`, `inputMode`, `enterKeyHint`, correct `type`. India specifics: mobile `type=tel inputMode=numeric autoComplete=tel-national maxLength=10` with fixed `+91` prefix; strip spaces/leading 0/+91 before validating; PIN `inputMode=numeric maxLength=6 autoComplete=postal-code`; email `autoCapitalize=none spellCheck=false`.
5. Pending: button spinner + `aria-busy`, inputs `readOnly` during submit (not disabled — keeps values announced).
6. Success: toast + redirect or inline success panel; never render success text in error colour (signup "Account created — please log in" is shown in error style, auth.actions.ts:72).
7. Rate-limit states: "Too many attempts. Try again in 5 minutes." with countdown (login, forgot, OTP, newsletter). (Backend limiter required — see §12 dependency.)
- **Acceptance:** submitting an empty signup shows all 3 required-field errors at once with `aria-invalid="true"` and `aria-describedby`; fixing one keeps the other values; screen reader announces the error summary.

### 4.6 [P1] Pricing truth and display
- **Tax — owner decision D3 (2026-09-27): listed prices do NOT include GST; GST is added at cart/checkout** (current cart.service.ts:216-219 behaviour stays). UI requirements so the total is never a surprise: every product price shows a small "+ GST" suffix on cards and "Price excludes GST · GST added at checkout" under the PDP price; the cart summary keeps a **"GST ({rate}%)"** line (rename from "Tax") between Shipping and Total; the cart drawer shows "Subtotal (excl. GST)". GST rate comes from `SiteSettings.taxPercentage` (currently defaults to 0 — admin must set the CA-confirmed rate). **Compliance flag for the owner (not a UI blocker):** Legal Metrology rules require an MRP to be shown inclusive of all taxes; if the struck-through `originalPrice` is presented as "MRP", label it "Original price" instead, and confirm the display approach with your CA.
- Every price display uses `<Price>` (§3.5): selling price, struck original price, % off, and the "+ GST" / "Price excludes GST" note (D3).
- **Shipping:** hard-coded ₹99 (cart.service.ts:214) while `ShippingZone` (pincode prefixes, flat rate, free min order, ETA days) is unused. UI needs: free-shipping progress in cart ("Add ₹640 more for free shipping" with a 4px gold-400 progress bar), PDP PIN checker using zones (§5.6 (item 5)). Threshold from `SiteSettings.freeShippingThreshold`.
- `formatPrice` (lib/utils.ts:10-17) drops paise (`maximumFractionDigits:0`) — fine for display, but ensure totals that include GST back-out don't show a ₹1 mismatch between lines and total (round only at display, sum Decimals).

### 4.7 [P1] Trust content system (one source, many placements)
Add fields to `SiteSettings` (admin-editable, §9.13): `returnWindowDays`, `codAvailable`, `codFee`, `dispatchDaysMin/Max`, `deliveryDaysMin/Max`, `supportHours`, `gstin`, `legalName`, `whatsappNumber` (exists), `contactPhone` (exists), `address` (exists), `announcementMessages[]`.
Render via one `TrustPoints` component in: announcement bar, PDP buy box (3 compact lines under CTA), cart summary, checkout, footer trust band, product FAQ answers. Remove hard-coded copies (product-detail.tsx:156-165, product-faq.tsx:1-18, why-shop-with-us.tsx:3-8).
Default WhatsApp placeholder `https://wa.me/910000000000` (constants.ts:30) must never render — hide the WhatsApp entry points when no number is set.

### 4.8 [P1] Accessibility baseline (site-wide)
- Skip link "Skip to content" as first focusable element → `<main id="main">`.
- Landmarks: one `<main>`, `<nav aria-label="Primary">`, `<nav aria-label="Footer">`, `<nav aria-label="Account">`, `<nav aria-label="Admin">`.
- Active states: `aria-current="page"` on header nav, bottom nav, account nav, admin sidebar (only admin has visual active today, and no aria).
- Live regions: a single `aria-live="polite"` announcer in root layout used by Toast and cart count updates ("Added Maroon Kanjivaram to cart. Cart has 3 items.").
- Icon-only buttons get `aria-label` **and** a visible tooltip on hover/focus (admin row actions, cart remove).
- Touch targets ≥ 44×44 (WCAG 2.5.8 min 24, platform 44): cart remove (16px icon, no padding — cart-line-item.tsx:52), qty (32px), wishlist heart (36px — product-card), footer social (36px), admin row icons (16px), filter checkboxes (16px, label is the target — ensure label row ≥ 44px).
- Headings: exactly one H1 per page; home H1 currently = banner title (fine) but fallback hero H1 must remain; account/admin sections use H2.
- `lang="en-IN"` on `<html>` (layout.tsx:60 `en`).

### 4.9 [P2] SEO/meta hygiene surfaced by the UI audit
- JSON-LD SearchAction target must resolve (§4.1). Breadcrumb JSON-LD for subcategories uses the parent **slug** as the name (`[categorySlug]/[slug]/page.tsx:61` `subcategory.parent!.slug`) → use `parent.name`.
- Add visible breadcrumbs mirroring JSON-LD (§3.5) on category, subcategory, PDP.
- **Category metadata (brief):** title `"{Category name} | Renish Collections"` (root template already appends the site name — set `title: category.name`), description `category.seoDescription ||` "Explore elegant {Category name} at Renish Collections. Discover beautiful designs for weddings, festivals and special occasions.", H1 = category name, canonical `/sarees/{slug}`, Open Graph title/description/image (category image, 1200×630 crop) — replaces the current `${name} — Shop Online` fallback ([categorySlug]/page.tsx:14).
- Per-product Open Graph image (primary image) so WhatsApp shares show the saree, not the site logo.
- Product JSON-LD: add `aggregateRating` + `review` when ≥1 approved review; `brand`; `offers.priceValidUntil`; `itemCondition`.
- `sitemap.ts`, `robots.ts`, `manifest.ts` (README lists as missing) — manifest should use the new icons and `theme_color: #3d0e15`, `background_color: #faf6f0`.

### 4.10 [P2] Global edge states (apply everywhere they occur)
- **Session expired during a server action** (account/admin): action returns `UNAUTHENTICATED` → toast "Your session expired — sign in again" + redirect to login with `callbackUrl`, preserving unsaved form input in sessionStorage.
- **Guest → login cart merge:** after merge, toast "We added 2 items from your earlier visit to your cart."
- **Offline / slow network on actions:** pending state after 300ms; after 10s show "Still working…"; on network failure keep the user's input and offer "Try again".
- **Product with no images:** card and PDP show the cream RC-mark placeholder (never text "No image" — product-card.tsx:38); admin completeness meter flags it; unpublished from home rails automatically.
- **Product in an unpublished category / archived product in cart or wishlist:** line shows "No longer available" with Remove; PDP returns the branded 404 with related products.
- **Data errors:** MRP < selling price or price 0 → hide the discount and log; admin form blocks saving such values.
- **Admin with 0 categories adding a product:** inline prompt "Create a category first" with a link, instead of an empty select.
- **Newsletter form** (newsletter-form.tsx): field-level invalid email, already-subscribed message, success replaces the form, input keeps its value on error, placeholder `ink-500`.
- **Notifications:** transactional email (and WhatsApp, if opted in) templates for order placed, shipped (carrier + tracking), delivered (review prompt), cancelled, password reset — logo header + one primary button; `NotificationEvent` enum already exists.

---

## 5. Storefront — page-by-page specifications

Format per surface: **Intent/mode · Current (file:line) · Problems · Spec · States · Acceptance.**

### 5.1 Global shell

#### 5.1.1 Announcement bar (new)
- **Intent:** the #1 trust lever for this audience, visible before anything else. Mode: Persuade (micro).
- **Spec:** `h-9 bg-maroon-900 text-gold-300 text-[12px] font-semibold uppercase tracking-[0.14em]`, centered; messages from `SiteSettings.announcementMessages` (e.g., `{{Free shipping above ₹1,999}}` · `{{Cash on Delivery available}}` · `{{7-day easy returns}}`). Desktop: show up to 3 separated by a 4px gold-400 diamond. Mobile: one message, cross-fade every 5s, pause on focus/hover, reduced-motion → static first message, `aria-live="off"` (rotating content must not spam SR). Each message may link to its policy. Not sticky. Hidden on admin and checkout.
- **Acceptance:** contrast 11.20:1; no layout shift when rotating (fixed height); hidden when no messages set.

#### 5.1.2 Header (desktop ≥1024) — brief-pinned items
- **Brief:** RC logo + RENISH COLLECTIONS · Home · Sarees · Collections · New Arrivals · Offers · About Us · Contact · Search icon · Wishlist icon · Cart icon · Account icon.
- **Current:** header.tsx:22 — single 64px row: logo (done) · 448px search field · flat nav (Home + every DB category + 5 static links, 4 dead) · account/wishlist/cart icons; no active state, no dropdowns; wishlist hidden <640; cart badge 16px/10px.
- **Problems:** [P0] dead links; [P1] no "Collections", no category dropdown for the 8 saree types; [P2] 7 nav items + search field + 4 icons in one 64px row crowds at 1024–1280; [P3] no `aria-current`.
- **Spec — two tiers (keeps every brief item without crowding):**
  - **Tier 1** (`h-16`, `bg-ivory/95` + blur — overlays must portal, §4.2; `border-b border-border`): left = search **icon** button (44×44, opens the search overlay §5.1.5 — the brief specifies an icon, not a field); center = `<Logo className="h-11" eager />`; right = Account · Wishlist (count badge) · Cart (count badge) — icon buttons 44×44 with `aria-label` ("Account", "Wishlist, 2 items", "Cart, 3 items"); count badges `min-w-[18px] h-[18px]` 11px Figtree 600 `ring-2 ring-ivory` (count badges are exempt from the 12px floor at 11px, never smaller).
  - **Tier 2** (`h-11`, centered, `text-label-caps`, gap 32px): **Home · Sarees ▾ · Collections ▾ · New Arrivals · Offers · About Us · Contact**. Active item: 1px `gold-400` underline 6px offset + `aria-current="page"`.
  - **Sarees ▾ dropdown** (simple panel, not a full mega-menu — P2 to extend later when departments arrive): 4×2 grid of the published saree categories (§2.6; up to 8), each = 56×72 thumbnail (category image, 3:4, `rounded-card`) + name + "{n} sarees" (ink-500) + footer link "View all sarees →" (`/sarees`). Opens on click/Enter/ArrowDown and on hover with 150ms intent delay; Esc closes and returns focus; `aria-expanded`/`aria-controls`; panel `bg-surface shadow-2 rounded-card` 720px wide.
  - **Collections ▾ dropdown:** list of active Collections (§2.6/§6.9) with 1-line descriptions + "All collections →". Hidden item when zero collections exist (then the nav shows 6 items).
  - **Offers** is hidden automatically when no discounted products and no public coupons exist (§6.3); **New Arrivals** hidden when the collection is empty. Never link to empty/404 pages.
  - Condense on scroll >120px: Tier 2 slides up (transform only), Tier 1 stays `h-16`→`h-14`, logo `h-11`→`h-9` (200ms).
- **States:** 0 categories → Sarees item links to `/sarees` without dropdown; long names wrap to 2 lines only inside dropdowns; guest vs logged-in (Account icon → `/login?callbackUrl=` vs `/account`).
- **Acceptance:** at 1024/1280/1440 Tier 2 fits on one line with all 7 items; every item reachable by keyboard; all links 200; dropdown thumbnails load lazily (only on open).

#### 5.1.3 Mobile/tablet header + bottom nav — one breakpoint table
- **Brief (mobile):** Hamburger · Logo · Search · Cart.
- **Breakpoints (single source of truth; today they disagree: search row `md:hidden` 768, menu `lg:hidden` 1024, bottom nav `sm:hidden` 640):**

| Width | Header | Bottom nav | Account & Wishlist access |
|---|---|---|---|
| < 640 | 56px: ☰ · logo `h-9` (center) · search icon · cart | **Yes** (Home · Sarees · Wishlist · Cart · Account) | bottom nav |
| 640–1023 | 64px: ☰ · logo `h-10` · search icon · wishlist · account · cart | No | header icons |
| ≥ 1024 | Two-tier desktop header (§5.1.2) | No | header icons |

- Remove the always-visible mobile search row (header.tsx:73).
- **Bottom nav** (mobile-bottom-nav.tsx): items **Home · Sarees (opens the menu sheet at the Sarees section) · Wishlist · Cart · Account** — replaces the dead "Search" item (mobile-bottom-nav.tsx:12, search lives in the header per the brief). Labels 12px Figtree 500; icons 22px; active = maroon-700 icon+label + 2×24px maroon top indicator + `aria-current`; count badges 11px min; `pb-[env(safe-area-inset-bottom)]`; hide-on-scroll-down/show-on-scroll-up (transform); hidden on PDP (sticky buy bar instead), cart, checkout, auth. Wishlist → guest-capable `/wishlist` (§6.8).
- **Acceptance:** at 390, 768 and 1024 widths account + wishlist + cart are reachable in ≤ 1 tap; no text < 12px except count badges (11px); safe-area verified in iPhone 15 emulation.

#### 5.1.4 Mobile menu sheet (mobile-menu.tsx)
- **Spec:** `Sheet side="left"` `w-[86vw] max-w-[360px] h-dvh`. Top: logo + close (44×44). Guest: two buttons `h-11` "Sign in" / "Create account"; logged-in: "Hi, {name}" + Orders/Wishlist links. Then the **brief nav in order** as rows `h-14 text-[16px]`: Home · **Sarees ▸** (accordion listing the 9 categories with 40px thumbnails + "View all sarees") · **Collections ▸** (active collections) · New Arrivals · Offers (only when live; optional `{{upto 30% off}}` tag only if true) · About Us · Contact. Secondary list (`h-12 text-[15px] ink-600`): Track order (only once §6.7 ships), Shipping & returns (`/policies/returns`), FAQ (only once §6.11 ships). Footer card `bg-cream p-4`: WhatsApp button `h-12 w-full` "Chat with us · {{hours}}" (hidden when no number) + 3 trust points. Every row must resolve (§4.1).
- Motion: translateX(-100%→0) 280ms, scrim fade 200ms; reduced-motion → instant.
- **Acceptance:** see §4.2.

#### 5.1.5 Search (search-bar.tsx + new search sheet)
- **Current:** submits to `/search` (404); 14px input (iOS zoom); no suggestions/clear; empty submit silently ignored.
- **Spec:** desktop inline field + dropdown; mobile full-screen sheet with autofocus.
  - Typeahead after 2 chars, 150ms debounce, `role="combobox" aria-expanded aria-controls aria-activedescendant`, ↑/↓/Enter/Esc. Sections: *Categories* (name + count), *Products* (40px thumb, name, `<Price size="sm">`, max 5), *Colours* (swatch chips). "See all results for '{q}'" row.
  - Empty focus state: "Popular searches" chips from the brief categories and occasions (Banarasi, Soft silk, Tissue, Kora, Katan silk, Wedding), recent searches (localStorage, max 5, "Clear").
  - Synonyms (server-side search — needs a search backend upgrade, §12.3): pattu→silk, benarasi/banaras/varanasi→Banarasi, tissu/tissue silk→Tissue, kota/kora cotton→Kora, katan/kataan→Katan silk, dupioni/dupion→Dupion silk, art silk→Viscose silk, saree/sari. API contract: `GET /api/search/suggest?q=` route handler, min 2 chars, returns `{categories:[{name,slug,count}] (≤4), products:[{name,slug,href,image,price,salePrice}] (≤5), colours:[{name,hex}] (≤6)}`, `Cache-Control: s-maxage=60`.
  - Clear (×) 44×44 when non-empty; input 16px; `enterKeyHint="search"`.
- **Acceptance:** "benarasi" returns Banarasi results; keyboard-only selection works; no 404.

#### 5.1.6 Footer (footer.tsx)
- **Current:** logo (done) + blurb + 4 social circles 36px; Shop/Company/Help columns (5 of 8 links 404); newsletter; copyright in ink-400 (3.29:1 on cream).
- **Spec (top → bottom):**
  1. Trust band `grid grid-cols-2 md:grid-cols-4 gap-6 py-10 border-b`: outline icon 28px gold-700 stroke 1.25 + title (Figtree 600 15px) + one line (ink-600 14px), from `TrustPoints` (§4.7). No circles, no card boxes.
  2. Columns (only routes that exist — §4.1): **Shop** (Sarees, Collections, New Arrivals, Offers) · **Help** (Track order — after §6.7, Shipping `/policies/shipping`, Returns & exchange `/policies/returns`, FAQ `/faq` — after §6.11, Saree care `/saree-care` — after §6.11) · **Company** (About Us, Contact, {{Visit our store}} → `/contact#visit` only if a store exists) · **Reach us** (WhatsApp number as text + link, phone, email, hours, address, **Grievance Officer** name + email — Consumer Protection (E-Commerce) Rules 2020 — all from SiteSettings). "Gift a saree" only after gifting (§6.12) exists.
  3. Newsletter row: heading (Cormorant 24px) "New weaves, first." + line "Early access to new arrivals{{ and ₹500 off your first order}}." + email field (16px) + "Subscribe"; secondary "Get updates on WhatsApp" link. Success replaces form: "You're in. Watch your inbox." Already subscribed → "You're already on the list."
  4. Bottom bar: payment marks row (UPI, RuPay, Visa, Mastercard, {{COD}}) as monochrome SVGs `h-6`; legal links Privacy · Terms · Refunds · Shipping; "© 2026 {{Legal Name}} · GSTIN {{…}}" in ink-500.
  5. Social icons 44×44, hidden individually when URL empty (no placeholders).
- **Acceptance:** 0 dead links; contrast ≥4.5 for all footer text; mobile: columns become accordions (Help/Company) to cut length, Reach us always open.

### 5.2 Home (`app/(storefront)/page.tsx`)
- **Intent:** in 5 seconds: "premium sarees, authentic, current edit — here's where to start." Mode: Persuade.
- **Current order:** Hero → Category grid → New Arrivals (8) → Best Sellers (8) → Featured (8) → Why shop with us → Reviews → Instagram (text only) → SEO paragraph. Product rails and reviews return `null` when empty → today's home is hero + one airplane circle + trust row + empty Instagram band + paragraph (screenshot home-desktop.png).
- **Problems:** P0 placeholder imagery; P0 dead "View all" (2 of 3); P1 three identical 8-card grids (up to 24 cards, ~4 phone screens of the same pattern) and possible duplicates across rails; P1 trust shown 5th; P1 empty Instagram band; P2 SEO block is a centered 14px dead zone with `py-16` + footer `mt-16` = ~128px gap.
- **New section order:**
  1. **Announcement bar** (§5.1.1)
  2. **Hero** (§5.2.1)
  3. **Saree Categories** — the brief's 9-category grid (§5.2.2)
  4. **New In rail** — horizontal carousel (§5.2.3)
  5. **Promise strip** — compact 3 trust points inline (one row, icons 20px, `ink-600`), not a section
  6. **Shop by occasion** — tiles from occasion Collections (§6.9; image = collection image; values from the `occasion[]` column: Wedding, Festival, Party, Reception, Office); hide a tile until it has ≥4 products and an image
  7. **Best Sellers** — 2×2 mobile / 4-up desktop, capped at 4 + "View all best sellers" button
  8. **Editorial story** — split band (§5.2.4)
  9. **Reviews** with aggregate (§5.2.5)
  10. **#DrapedInRenish UGC** (§5.2.6) — only if curated images exist
  11. **About Renish** SEO block (§5.2.7)
- De-duplicate product IDs across rails server-side (New In excludes nothing; Best Sellers excludes New In IDs; Featured becomes the editorial band's 4 products).

#### 5.2.1 Hero (hero-banner.tsx) — brief copy is the default
- **Brief:** large premium saree fashion banner · headline **"Elegance Woven for Every Occasion"** · subheading **"Discover timeless sarees crafted in exquisite fabrics."** · buttons **Shop Sarees** (→ `/sarees`) and **Explore Collections** (→ `/collections`) · high-quality Indian saree image.
- **Current:** `h-[60vh] min-h-[420px] sm:h-[70vh]`, image `opacity-90` over maroon-900 (muddies colour), left gradient, H1 = banner title, single "Shop Now" only if linkUrl; fallback maroon gradient with eyebrow "New Season Edit" (hero-banner.tsx:26 — remove, eyebrow ban) and different copy; only `banners[0]` used; no mobile image; `priority` (deprecated in Next 16); `alt=banner.title`.
- **Spec:**
  - Content model (Banner, §9.12/§12.2): `title`, `subtitle`, `ctaLabel`, `linkUrl`, `secondaryLabel`, `secondaryUrl`, `imageUrl` (desktop 2:1), `mobileImageUrl` (3:4), `imageAlt`, `textTone`. **Defaults = the brief copy and buttons** when fields are empty; the fallback hero (no banner) also uses the brief copy.
  - **Art direction with one image element:** use `getImageProps()` to build a `<picture>` with a `(max-width: 767px)` source → mobile 3:4 image and default → desktop 2:1 image; put `fetchPriority="high"` on the single `<img>` (Next 16: `priority` is deprecated; do **not** combine `preload` with `fetchPriority`, and don't use `preload` when the LCP image differs by viewport — node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md:285-293).
  - Desktop: `h-[min(78vh,760px)]`; text block left `max-w-[520px]`; headline `text-display-xl` Cormorant 500 (white or charcoal by `textTone`); subtitle `text-body-l` white/85; buttons: primary **Shop Sarees** (gold, charcoal text, `h-12 px-8 text-label-caps`) + secondary **Explore Collections** (outline: 1px white/70 border, white text; on light tone: maroon outline).
  - Mobile: `aspect-[3/4] max-h-[80svh]`; text anchored bottom over `bg-gradient-to-t from-charcoal/70 via-charcoal/25 to-transparent` on the bottom 45% only; headline 36–40px; buttons stacked full-width `h-12`.
  - Remove `opacity-90`; gradient only where text sits.
  - **Single hero by default** (no autoplay carousel — keeps the page to one authored motion moment). If the owner wants multiple banners (D14), use manual slides only (arrows + dots + swipe, no autoplay).
  - Motion (the page's one authored moment): image settles 1.04→1 over 1.2s + headline `clip-path` reveal 600ms; reduced-motion → none.
- **Acceptance:** LCP element = hero image, LCP < 2.5s on a throttled mid-range mobile profile (after real photography); headline contrast ≥ 4.5:1 measured against the **lightest** image region under the text; no CLS; both brief buttons present and resolving.

#### 5.2.2 Saree Categories section (category-grid.tsx) — brief-pinned
- **Brief:** dedicated "Saree Categories" section; each card: **large saree image, category name, short description, product count, "Explore"/"View Collection" button**, linking to `/sarees/{slug}`; **3 per row desktop, 2 per row tablet, 2 per row or horizontal scroll on mobile**; data-driven (never hardcoded in the component).
- **Current:** 96–112px circles in a 2/3/4/6-col grid, name only (category-grid.tsx:10-28); 1 category renders a lone circle; no description/count/button; no image → initial letter.
- **Spec:**
  - Data: `getSareeCategories()` service returns `{ id, name, slug, image, description, productCount }` for published children of `sarees` ordered by `displayOrder` (the brief's category DTO + count). Count = published, non-deleted products.
  - Section heading H2 "Saree Categories" (`text-display-m`), optional one-line intro below (ink-600) — no eyebrow.
  - Grid: `grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8`; with the 8 final categories: 3 + 3 + 2 on desktop, 4 × 2 rows on tablet/mobile. Mobile alternative (D15): horizontal scroll-snap row, card width 72vw, 16px peek. Default: 2-col grid (all 9 visible without hidden overflow).
  - **Card** (`<article>`, whole card is one link): image `aspect-[4/5] rounded-card overflow-hidden` (object-cover); below: name `font-display` 24px (desktop) / 20px (mobile — use Figtree 600 18px on mobile if Cormorant is chosen, since Cormorant is only used ≥ 24px); description `text-small ink-600 line-clamp-2`; meta row: "{n} sarees" (ink-500) + **"Explore"** text button with arrow (`text-label-caps text-maroon-600`, 44px hit area). Soft frame: 1px `border` on the image that turns `gold-400` on hover/focus; hover (hover-capable only): card lifts `-translate-y-0.5` + `shadow-1→shadow-2`, image cross-fades to the category's second image if present (else no image motion). 200ms ease-out.
  - Missing image → neutral cream tile with the RC mark (gold, 30% opacity) and the name — never an unrelated stock photo; admin warned (§9.5).
  - "View all sarees" secondary button under the grid → `/sarees`.
- **States:** skeleton (9 cards); 0 categories → section hidden; counts of 0 show "Coming soon" instead of "0 sarees" and the card stays visible (brief wants all 9 present).
- **Acceptance:** 9 cards render 3/2/2 per row at 1440/768/390; each links to `/sarees/{slug}` with 200; no hardcoded category data in components (grep).

#### 5.2.3 Product rails (product-section.tsx)
- **Spec:** section header = H2 (display-m) left + "View all" link right (`label-caps` underline-offset-4, 44px hit area). No subtitle eyebrows; a one-line subtitle under the H2 is allowed (ink-600 15px) if it adds information (e.g., "Woven this month").
  - New In: horizontal carousel, mobile 2.2 cards visible (`w-[44vw]`), desktop 4 visible + arrows; scroll-snap; `aria-roledescription="carousel"`, arrows `aria-controls`.
  - Best Sellers: static grid capped at 4.
  - Under each rail on mobile: full-width secondary button "View all {title}".
- **States:** loading skeleton cards (4); <4 products → hide rail (avoid half-empty), never show a rail linking to a 404.

#### 5.2.4 Editorial story band (new; replaces "Featured Collection")
- Split: left 5/12 lifestyle image `aspect-[4/5]`; right 7/12 heading (display-m) e.g. `{{"The Banarasi, woven in Varanasi"}}` (origin/GI claims only when owner-verified) + 2–3 sentences of **owner-supplied** craft copy + 2×2 featured products (`isFeatured`) + "Explore {category}". Mobile: image full-width then copy then 2×2.
- Only renders when `isFeatured` products ≥4 and an editorial banner (placement `HOME_PROMO`) exists — this finally uses the unused placement.

#### 5.2.5 Reviews (reviews-section.tsx)
- **Current:** 3-col cards, bright success-green "VERIFIED" badge, unclamped bodies, byline ink-400 (fails), product not linked, no aggregate.
- **Spec:** header row: aggregate "4.8" (Cormorant 48px) + stars + "from {n} reviews" (store-wide, approved reviews — say "verified" only when counting `isVerifiedPurchase` reviews). Cards (no box border; separated by whitespace and a top 1px `border`): optional review photo `aspect-[4/5]` (Review.images exists, unused), stars 14px, body 15px `line-clamp-4` + "Read more" (expands inline), byline 13px ink-600 "{First name} {Initial}. · {City if collected}" — when the name is missing show "A customer", **never "Verified Customer"** for unverified reviewers (current fallback at review-list.tsx:65 and reviews-section.tsx:39 is a misleading claim — [P1]), product link row: 40px thumb + name. Verified = small check icon + "Verified buyer" in success 12px (no filled badge). Mobile: scroll-snap carousel 85vw cards.
- Render only when ≥3 approved featured reviews.

#### 5.2.6 UGC / Instagram (instagram-section.tsx)
- **Current:** icon + heading + text link; no images → 250px hole.
- **Spec:** 6 curated images (admin: new banner placement `HOME_UGC` or reuse `HOME_PROMO` list) in 6×1 desktop / 3×2 mobile squares, each optionally linked to a product ("Shop this look" on hover/focus); heading "#DrapedInRenish"; outline button "Follow @{{handle}}". **Hide the section entirely** when no images curated or no Instagram URL set. Customer photos require recorded permission (store consent + credit handle per image).

#### 5.2.7 About Renish (SEO block, page.tsx:66-73)
- Left-aligned, `max-w-[68ch]`, body-l; first 3 lines visible, "Read more" `details` expands 300–500 words with H3s linking to categories (owner-written). Section `py-12`, and footer `mt-0` on home to remove the double gap.

### 5.3 Listing pages — `/shop`, `/[categorySlug]`, `/[categorySlug]/[subSlug]`, `/search`, collections
Shared component: `ProductListing` (merge `shop/page.tsx` and `components/shop/category-listing.tsx`, which today diverge — **category pages have no filters at all**, only sort).

- **Intent:** narrow 200 sarees to the 10 worth opening. Mode: Operate.
- **Current:** H1 + "{n} products" + native select sort; shop has a 240px left filter form (Category checkboxes incl. parent "Sarees" beside its own subcategories, Price min/max number inputs with 3.14:1 placeholders, Color/Fabric only when data exists, In stock, "Apply Filters" submit, "Clear all filters" 12px ink-400); mobile filters in a drawer with the Apply button at the bottom of scrolling content; pagination Prev / "Page x of y" / Next; empty = one centered sentence.
- **Problems:** P1 category pages lack filters; P1 submit-to-apply (no instant feedback, no applied-filter chips, no counts); P1 filter drawer lacks dialog semantics and sticky apply; P2 parent+child duplication in category facet; P2 no occasion/price-band facets; P2 pagination gives no sense of range; P2 empty state has no recovery path.
- **Spec:**
  - **Header:** breadcrumb; H1 (display-l) = category name / "Search results for '{q}'" / collection name; optional category description (max 2 lines + "More") and a `CATEGORY_TOP` banner slot (uses the unused placement) at most 240px tall desktop.
  - **Subcategory chips** row under H1 on parent categories (horizontal scroll, chips 40px): "All · Banarasi Tissue · Silk · Kora · Soft Silk · Katan Silk · …" (the 8 final categories, published ones only) — replaces the circle CategoryGrid inside listings (category-listing.tsx:40).
  - **Toolbar** (sticky under header on scroll, `h-14 bg-ivory/95 border-b`): left "Filters" button (mobile) with active count badge; applied filter chips (each with × and "Clear all"); right: result count "{n} sarees" + Sort (custom listbox styled like Select; options: Newest, Price low→high, Price high→low, Best selling, Most popular, Biggest discount).
  - **Facets — brief list, in this order** (desktop left rail 264px sticky; mobile filter drawer = bottom sheet 90dvh with sticky footer "Show {n} sarees" + "Clear all"): **Saree Type** (the 8 final categories, published only; on a category page shows siblings as links, not checkboxes), **Price Range** (bands: Under ₹2,999 · ₹3,000–₹4,999 · ₹5,000–₹9,999 · ₹10,000–₹24,999 · ₹25,000 & above — `minPrice`/`maxPrice` params; plus custom min/max with ₹ prefix, 16px text), **Color** (swatch + name + count; `colors[]`), **Fabric** (checkbox + count), **Occasion** (Wedding, Festival, Party, Reception, Office, Casual — `occasion[]` column; single source, not tags), **Pattern** (Traditional, Contemporary, Woven/Zari Butta, Printed, Embroidered…), **Border Type** (Zari border, Temple border, Contrast border, Plain/No border, Embroidered border…), **Availability** (In stock), **Discount** (10%+ · 20%+ · 30%+ — needs stored `discountPercent`, §12.2). Values for Pattern/Border/Occasion come from admin-managed lists (§9.6). Each facet collapsible, first 6 values + "Show {n} more"; counts for the current query; zero-count values disabled not hidden. **Sort (brief):** Newest · Price: Low to High · Price: High to Low · Popular · Best Selling — keep the **native `<select>`** on touch devices (better mobile UX) and switch `router.push` → `router.replace` so sort changes don't pile up history entries (sort-select.tsx:22).
  - **Apply behaviour:** desktop applies instantly (URL updates via `router.replace` with `scroll:false`, `useTransition` → grid dims to 60% + top progress bar while pending); mobile applies on "Show {n} results". URL is the state (shareable).
  - **Grid:** 2 / 3 / 4 cols, card §5.4; optional density toggle on mobile (1-col large / 2-col).
  - **Pagination:** "Showing 1–24 of 156" + "Load more" button (keeps URL `?page=`) with numbered pagination fallback for SEO (`<link rel="next/prev">` not required; plain links fine). Preserve **all** filter params (shop does; category-listing only preserves sort).
  - **Empty/zero results:** EmptyState: title "No sarees match these filters", body lists the active filters, actions "Remove last filter" / "Clear all", then "You might like" 4 best sellers; for search add "Ask us on WhatsApp — we'll find it for you."
- **States:** skeleton grid on navigation; error → inline retry; 1 result → no pagination; very long category names wrap in H1 (`text-balance`).
- **Acceptance:** filters available on every category page; applying a filter on desktop updates results < 600ms perceived (pending UI immediately); Back button restores previous filter state; facet counts correct against DB for 3 sample queries.

### 5.4 Product card (product-card.tsx) — used on every listing (brief-pinned)
- **Brief:** product image, product name, **fabric**, price, discount price if applicable, **rating**, wishlist button, **Add to Cart** button, **Quick View** button; rounded or softly framed; smooth hover.
- **Current:** 3:4 image with hover `scale-105`; up to 3 stacked badges top-left; wishlist 36px; OOS overlay; **Add to Cart overlay `opacity-0 group-hover:opacity-100` — invisible on touch/keyboard but still clickable** (product-card.tsx:56-58), and it passes no `variantId` (a variant product gets a variant-less cart line — the server accepts it); category label (ink-400), name `line-clamp-1`, price + MRP. No fabric, rating or quick view.
- **Problems:** [P1] ghost ATC → accidental adds; [P1] variant-less adds; [P1] missing brief elements (fabric, rating, Quick View); [P2] badge stack covers the saree; [P2] 1-line name hides key words; [P2] muted text fails contrast.
- **Spec:**
  - Frame: `rounded-card` (6px) image container with 1px `border` → `gold-400` on hover/focus-within; card background transparent on ivory (image carries the frame).
  - Image `aspect-[3/4]`; hover-capable only: image cross-fade to images[1] (300ms) + card lift (`-translate-y-0.5`, `shadow-1`); no zoom.
  - **One** tag max top-left (priority: Sold out > –{n}% (≥10%) > New > Bestseller): `bg-surface/95 text-charcoal text-micro uppercase tracking-[0.12em] px-2 h-6 rounded-sm`; discount tag text `success`.
  - Wishlist: top-right 44×44 hit (36 visual), `aria-pressed`, toast "Saved to wishlist · View".
  - **Quick View:** icon+label button ("Quick view", eye icon) revealed top-right below the heart on hover **and focus-within** on desktop; **always visible as a small icon button on touch** (bottom-right of image, 40×40 visual/44 hit). Opens a `Sheet` (mobile bottom sheet 90dvh / desktop right panel 480px): mini gallery (swipe), name, fabric, rating, `<Price>`, variant chips, qty, Add to cart, "View full details →".
  - Text block (below image, 12px gap): **Fabric** line `text-micro uppercase tracking-[0.12em] ink-500` (from `fabric`; falls back to category name); **Name** 15px Figtree 500 `line-clamp-2` (reserve 2 lines); **Rating** `★ 4.8 (24)` 13px (hidden when 0 reviews); **Price** `<Price size="sm">` — sale price in charcoal 600 + struck MRP ink-500 + "–10%" success.
  - **Add to Cart button — visible, not hover-only:** full-width `h-10` secondary (maroon outline) button at the bottom of the card on all devices. Behaviour: no variants → adds directly (pending spinner in button; success → cart drawer opens §5.7.1); has variants → label "Choose options" and opens Quick View; sold out → disabled "Sold out". Density option (D16): on mobile 2-col grids the button may collapse to an icon-only cart button (44px) beside the price to save height — default is the full-width button per the brief.
  - OOS: image `opacity-80`, tag "Sold out", wishlist still active.
  - Semantics: `<article>`; image + name share one link (image link `tabIndex={-1}` + `aria-hidden` to avoid duplicate stops); tab order: product link → wishlist → quick view → add to cart.
- **Acceptance:** on touch, tapping the image navigates and never adds; variant products never add without a variant; all brief elements present; contrast passes; grid rows align with mixed name lengths.

### 5.5 PDP — gallery (image-gallery.tsx)
- **Current:** main 3:4 image (`priority` on every re-render), thumbnails 64px (row on mobile, right column on desktop via `flex-row-reverse` — unconventional), no zoom, no swipe, no video (ProductVideo exists; admin collects `videoUrl`), no image counter, alt falls back to product name for every image.
- **Spec:**
  - Desktop (≥1024): **vertical thumbnail rail on the left** (72×96 thumbs, active = 1px maroon-600 outline + 2px offset) + main image; hover-capable → inner zoom lens (2× on hover, follows cursor) ; click → full-screen lightbox (pinch/scroll zoom up to 3×, arrows, Esc, counter "3 / 7"). Alternative for ≥1280: 2-column image stack scroll (Taneira-style) — pick one (**D5**), default = thumbs + main.
  - Mobile: full-bleed swipeable carousel (scroll-snap, `touch-action: pan-y pinch-zoom`), dot indicator + "1 / 7" chip bottom-right, tap → lightbox with pinch-zoom; double-tap zoom.
  - Video: appears as the last thumbnail with a play glyph (lucide `Play`), plays inline muted with controls, poster = `thumbnailUrl`.
  - Variant images: when a colour variant is selected and has `ProductImage.variantId` images, filter/jump the gallery to them (schema supports; UI doesn't).
  - First image `fetchPriority="high"` (Next 16: `priority` is deprecated — image-gallery.tsx:28 currently sets it on every switch); others lazy; `sizes="(min-width:1024px) 50vw, 100vw"`. Note the current thumbnails switch layout at `sm:` (640px), not desktop.
  - Colour-accuracy note under gallery (13px ink-500): "Colours may vary slightly due to lighting and screen settings." (standard, reduces returns).
- **Acceptance:** swipe works under synthesized touch in Playwright; lightbox traps focus and closes on Esc; video never autoplays with sound.

### 5.6 PDP — buy box and details (product-detail.tsx, variant-selector.tsx, add-to-cart-button.tsx, buy-now-button.tsx, share-button.tsx, product-faq.tsx, review-*.tsx, recently-viewed.tsx)
- **Intent:** answer "is this the one, is it genuine, will it reach me in time, can I return it" and act. Mode: Persuade → Operate.
- **Current (in order):** category (12px ink-400) · H1 (24–30px Playfair 600) · "SKU: …" (prominent, meaningless to buyers) · badges incl. "In Stock" green pill · price (only when no variants) · short description · variants/ATC/Buy Now · wishlist + share row · spec `dl` (Fabric, Color, Saree Length, Blouse Included ✓/✗) · Description · Care · hard-coded Shipping/Returns box · then Reviews → generic FAQ → "You May Also Like" → Recently Viewed. No breadcrumbs UI, no rating near title, no delivery estimate, no sticky mobile CTA.
- **Problems:** P1 "Out of Stock" label when a variant is merely unselected (add-to-cart-button.tsx:44 renders "Out of Stock" whenever `disabled`); P1 action results ignored → failures look like success; P1 no delivery/PIN/COD info at decision point; P1 no sticky CTA on mobile (CTA scrolls away; bottom nav still visible); P2 variant chips lack `aria-pressed`, unavailable states, per-variant MRP (`ProductVariant.originalPrice` exists, unused); P2 SKU above the fold; P2 generic FAQ duplicates spec rows; P2 reviews summary shows "0.0 out of 5 (0 reviews)"; P2 rating stars `aria-hidden` missing; P2 review form rating buttons have no pressed state.
- **Spec — buy box (right column desktop `sticky top-[calc(header+24px)]`, max-w 480px):**
  1. Breadcrumb (Home › Sarees › Banarasi Sarees) — brief format.
  2. Name: `title-l`→28px Cormorant 600, `text-balance`.
  3. Rating summary link "★ 4.7 · 32 reviews" → scrolls to reviews (hidden when 0; show "Be the first to review" link in the reviews section instead).
  4. `<Price size="lg">` (updates on variant selection, incl. variant MRP) + "Price excludes GST · GST added at checkout" (D3, §4.6).
  5. One-line value props composed **only from structured, admin-confirmed fields** (fabric, borderType, sareeLength, blouseIncluded, silkMark) — never from free-text tags (they could produce false "Pure silk" claims): e.g. "Banarasi silk · Zari border · 6.3 m with blouse piece".
  6. Variant `ChipGroup` per axis: label "Colour: Maroon" (selected value appended); colour chips show swatch; unavailable combos disabled with strike + "Sold out"; auto-select when only one value; per-variant stock message.
  7. Stock line: "In stock — ships in {{1–2}} days" (success) / "Only 2 left" (gold-700) / "Sold out" (error) — replaces the "In Stock" pill badge.
  8. Quantity stepper (default 1, max = stock, hidden if stock = 1).
  9. CTAs: primary "Add to cart" (`h-13` full width) + secondary "Buy now". Labels by state: not all variants chosen → "Select {axis}" (enabled; clicking scrolls/focuses the first missing chip group and shows inline "Please select a colour" — never "Out of Stock"); pending → spinner "Adding…"; success → toast "Added to cart" with actions "View cart"/"Checkout" + header/bottom badge update + `aria-live`; failure → inline error under CTA ("Couldn't add — only 1 left in stock" / server message) and button returns to idle. `BuyNowButton` must await the result and only navigate on success. **Prerequisite (server, [P1]):** `addToCartAction` (actions/cart.actions.ts:21-33) always returns `{success:true}` or throws, and `addItemForUser`/`addItemForGuest` perform no stock, published-status, variant-required or quantity-cap check (quantity can grow past the zod max via repeated adds). Add server validation returning `{ ok:false, code:'OUT_OF_STOCK'|'VARIANT_REQUIRED'|'UNAVAILABLE'|'MAX_QTY', message }` before building this UI.
  10. Wishlist (outline button with heart, 44px) + Share (Web Share API; fallback copy with toast "Link copied"). **Fix existing bug:** cancelling the native share sheet throws `AbortError` and currently falls through to clipboard copy + "Link copied" (share-button.tsx:10-19) — only fall back when `navigator.share` is unavailable or throws a non-Abort error.
  11. **Delivery checker:** PIN field (6-digit, `inputMode=numeric`, remembered in localStorage) + "Check" → "Delivery by {Thu, 3 Oct} · {{COD available}}" from ShippingZone. **Formula:** match zone by the longest matching `pincodePrefixes` entry, else by state, else "We don't deliver to this PIN yet"; ETA = order date (+1 day if after the dispatch cut-off `{{2 PM IST}}`) + `dispatchDaysMax` (SiteSettings) + zone `estimatedDaysMax`, skipping Sundays and an admin-managed holiday list; show a range when min≠max ("Delivery by Thu 3 – Sat 5 Oct").
  12. Trust points (3 compact lines with 18px icons from TrustPoints): returns window, COD, authenticity (only if true).
  13. WhatsApp help line: "Questions about this saree? Chat with us" (prefilled message with product name + URL) — the category's signature trust device (video-call viewing optional).
- **Mobile:** gallery → buy box → details; **sticky bottom buy bar** (`h-16 + safe-area`, shadow-2) appears once the main CTA scrolls out of view: price + "Add to cart" (+ variant state label); bottom nav hidden on PDP.
- **Details (below the fold, full width, two columns desktop):**
  - Accordion sections (first open): **Product details** (spec table: Fabric, Weave/Work, Zari, Colour, Saree length, Blouse piece + length, Occasion, Care, SKU — SKU moves here), **Description** (body-l, 68ch), **Care** (from careInstructions; default guidance for silk), **Shipping & returns** (from TrustPoints/SiteSettings, link to policies).
  - Schema gaps to add for the details table (§9.6): `weave`, `work` (e.g., zari, embroidery, print), `zariType` (real/tested/none), `occasion[]`, `blouseLength`, `origin` (e.g., Kanchipuram), `silkMark` (boolean). Render rows only when present.
  - FAQ: make it product-aware (answers pull real values: "Yes — this saree includes an unstitched blouse piece of 0.8 m") or remove it; never "Check the detail above".
- **Reviews (review-list.tsx, review-form.tsx):** summary card: average (Cormorant 40px) + stars + count + 5-row distribution bars (click filters); list sorted "Most recent"/"Most helpful"/"With photos"; each review: stars, title, body, photos (Review.images) as 64px thumbs → lightbox, "Verified buyer" check, name + date (en-IN). Form in a Sheet/Dialog triggered by "Write a review": star rating as radio group (`role="radiogroup"`, arrow keys, labels "1 star — Poor" … "5 stars — Excellent"), title, body with counter, optional photo upload (≤3), submit → "Thanks! Your review will appear after a quick check." Guests: "Sign in to review" (preserve return URL). 0 reviews: "No reviews yet — bought this saree? Share how it draped." 
- **You may also like / Recently viewed:** carousel rails (same as §5.2.3); recently viewed shows wishlist state and excludes current; hide when <2 items.
- **Acceptance:** with an unselected variant the primary button never reads "Out of Stock"; simulated server failure shows inline error and no "Added"; mobile sticky bar appears/disappears correctly and never overlaps content; PIN checker returns an ETA for a configured zone; SKU not above the fold.

### 5.7 Cart (cart/page.tsx, cart-line-item.tsx)
- **Intent:** confirm choices, see the real total, proceed with confidence. Mode: Operate.
- **Current:** H1 "Your Cart"; lines: 80×96 image, name link, "Currently unavailable" in red, remove × (16px icon, no hit area), qty stepper 32px, line total; summary card (Subtotal, Discount, Shipping "Free"/₹99, **Tax added**, Total), "Proceed to Checkout" → **404**, "Continue Shopping" 12px. No variant attributes, no unit price, no coupon field (Cart.coupon exists; discountTotal computed), no free-shipping progress, no undo, no move-to-wishlist, errors from actions ignored. Empty state: heading + line + "Continue Shopping".
- **Spec:**
  - Title "Your cart ({n})" — the brief names the icon and page "Cart" (D4 resolved: **"Cart"** everywhere, URL `/cart`).
  - Line item: image 96×128; name (2 lines) + **variant line** ("Colour: Maroon") + unit price (`<Price size="sm">` with MRP) ; stepper 44px with "Only 2 left" note at max; actions row: "Move to wishlist" · "Remove" (text buttons 44px). Remove → line collapses with toast "Removed Maroon Kanjivaram · Undo" (8s). Unavailable/OOS line: greyed, message "Sold out — remove to continue" and checkout disabled until resolved (or auto-excluded with notice). Quantity reduced by stock → notice "We updated the quantity to 1 — only 1 left."
  - Summary (sticky on desktop): Subtotal · Discount (coupon code shown, "Remove") · Shipping ("Free" / ₹ / "Calculated at checkout" before PIN known) · **GST ({rate}%)** · **Total** · free-shipping progress bar + message · coupon field (collapsed "Have a coupon?" → field + Apply; errors inline: "This code expired on 30 Sep" / "Add ₹500 more to use this code") · available coupons list (active, public) · primary CTA "Checkout" (h-13) · trust points (secure payment, COD, returns) · payment marks.
  - Mobile: summary collapses into a sticky bottom bar "Total ₹12,499 · Checkout" with an expandable breakdown; bottom nav hidden.
  - Empty: EmptyState "Your cart is empty" + "Continue shopping" + rails: "Your wishlist" (if any) and "Best sellers".
  - Guest: subtle banner "Sign in to sync your cart across devices" (cart merges on login already).
- **Acceptance:** remove + undo restores line and totals; every mutation shows pending on that line only; totals never mismatch sum of lines; CTA never 404s.

#### 5.7.1 Cart drawer (brief: `CartDrawer`) — new
- **Intent:** confirm an add without leaving the browsing context. Mode: Operate.
- **Spec:** `Sheet side="right"` 420px desktop / bottom sheet 85dvh mobile, opened on successful add-to-cart (card, quick view, PDP) and from the header cart icon on desktop (the mobile cart icon still navigates to `/cart`). Content: header "Added to your cart" (after add) or "Your cart ({n})"; the just-added line highlighted (image 64×85, name, variant, qty, price); other lines compact (max 4 + "and {k} more"); free-shipping progress bar + message; subtotal; buttons **"View cart"** (secondary) + **"Checkout"** (primary; interim WhatsApp order per §4.1); "Continue shopping" text button closes. Esc/scrim/close restore focus to the trigger; `aria-live` announces "Added {name} to cart".
- **States:** pending line shimmer; error (server refused) → drawer does not open, inline error at the trigger; empty (opened from icon) → EmptyState + "Explore sarees".
- **Acceptance:** add from card on desktop opens the drawer within 300ms of the server response with correct totals; keyboard focus lands on the drawer heading; closing returns focus to the add button.

### 5.8 Checkout (future route — UI spec only; payment integration out of scope)
Single page, 3 collapsible steps with progress indicator: **1 Contact** (mobile first with OTP option, email optional for guests) → **2 Address** (saved address cards for logged-in; India address form §8.6 with PIN → city/state autofill) → **3 Payment** (UPI, cards, netbanking, COD with fee disclosure). Right column order summary (collapsed on mobile, "Show order summary ₹12,499"). Guest checkout allowed. Success page: order number, ETA, WhatsApp updates opt-in, "Track order", continue shopping. Errors: payment failure keeps cart and shows retry + alternate method. Hide header nav (logo + "Secure checkout" lock + help WhatsApp only). **Acceptance:** completes keyboard-only; no step loses entered data on back/refresh.

---

## 6. New storefront pages (fill the dead links)

### 6.1 `/search`
Reuse `ProductListing` (§5.3) with H1 "Results for '{q}'" + count; search field pre-filled at top on mobile; synonyms applied; zero results → suggestions ("Did you mean Banarasi?"), popular searches chips, best sellers, WhatsApp help. `robots: noindex` for search result pages. Empty `q` → redirect to `/shop`.

### 6.2 `/new-arrivals`, `/best-sellers` (collection pages)
`ProductListing` with fixed base filter; H1 + one-line description ("Woven and added in the last 30 days" / "The sarees our customers choose most"); full facets; indexable with canonical; if collection empty → EmptyState with link to /shop (never an empty grid).

### 6.3 `/offers`
Header band: active public coupons as ticket rows (code in mono is acceptable here — it is data): "FESTIVE10 — 10% off above ₹4,999 · ends 31 Oct" + "Copy code" (toast "Code copied"); then `ProductListing` of discounted products sorted by discount desc with a "Discount" facet (10%+, 20%+, 30%+). If no offers: "No offers running right now" + newsletter/WhatsApp opt-in + best sellers. Remove the "Offers" nav item automatically when no discounted products and no active public coupons exist.

### 6.4 Policies — `/policies/{shipping,returns,privacy,terms,cancellation}`
- **Mode:** Read. One template: breadcrumb, H1, "Last updated {date}", left sticky table of contents (desktop) / top "On this page" accordion (mobile), body `max-w-[68ch] body-l`, H2/H3 anchors with hover link icons, summary box at top with the 3–4 facts customers want (e.g., Returns: "{{7}} days from delivery · unused with tags · free pickup in {{serviceable PINs}} · refund in {{5–7}} days to original payment; COD refunds via UPI/bank"). Contact block at bottom.
- Content is **owner-supplied** (legal); store as MDX in `content/policies/*.mdx` or a `Page` DB model editable in admin (**D6**).
- Linked from footer, PDP trust points, cart, checkout, FAQ.
- **Acceptance:** all 5 pages exist before any payment gateway review; each has a unique title/description.

### 6.5 `/about` — "Our story"
Persuade/Read hybrid: full-bleed image (owner/store/weaver — real, not stock), H1 (display-l), 3 short editorial sections (who we are, how we choose sarees, the craft/regions we work with) alternating image/text (image 4:5), a proof row (years in business, customers, cities served — only real numbers), "Visit us" block (address, map link, hours) if a store exists, CTA to shop. No team-card grids.

### 6.6 `/contact`
Top: 3 direct channels as large tappable rows (not cards): WhatsApp (primary, prefilled "Hi Renish Collections, I have a question about…"), Call (`tel:`), Email (`mailto:`), each with hours. Then a short form (Name, Mobile, Email optional, Order number optional, Message; `aria-live` success "Thanks — we'll reply within {{1 business day}}"). Then address + embedded map link (no heavy iframe on mobile — static map image or link), FAQ shortcuts (Track order, Returns, Shipping). **Backend:** form → email via existing mailer + store `ContactMessage` (new model) for admin inbox (optional).

### 6.7 `/track-order` (after checkout exists)
Order number + mobile/email → shows the order detail timeline (§8.5) without login; rate-limited; generic error "We couldn't find an order with those details."

### 6.8 `/wishlist` (guest-capable)
Same UI as `/account/wishlist` (§8.4) backed by the guest cookie; banner "Sign in to keep your wishlist on all devices" → login with return URL; merges on login (service exists).

### 6.9 `/collections` and `/collections/[slug]` (brief: Collections nav item + "Explore Collections" hero button)
- **Index:** H1 "Collections" + one line; editorial grid of collection cards (image 4:5 `rounded-card`, name in Cormorant 28px, 1-line description, "Explore" link, product count) — 2-up desktop large cards for the first two, then 3-up; mobile single column. Collections are curated: e.g. {{Bridal Edit, Festive Edit, Office Elegance, Under ₹5,000, Gifting}} (owner-defined).
- **Detail:** `ProductListing` (§5.3) with the collection rule applied as a locked base filter (shown as a non-removable chip), collection hero (image + description, max 320px tall), full facets.
- **Data (D13):** `Collection { id, name, slug, description, imageUrl, rule Json? /* {occasion:[..], maxPrice, patterns:[..]} */, productIds String[], isPublished, displayOrder, startsAt?, endsAt? }` — the date window also powers **festival edits** (Diwali, Durga Puja, Onam, Pongal/Sankranti, wedding season) that appear and expire automatically.
- **Acceptance:** hero "Explore Collections" resolves; unpublished/expired collections 404 via `notFound()` resolved before streaming (§4.4).

### 6.10 `/sarees` (all sarees — already exists as the parent category page)
- Upgrade the parent page: breadcrumb Home › Sarees; H1 "Sarees"; category description; **Saree Categories grid** (§5.2.2, compact variant: image 4:5 + name + count, 3/2/2) as the first band; then the full `ProductListing` of all saree products with the brief facets. The subcategory circle grid currently embedded in listings (category-listing.tsx:40) is replaced by this grid on `/sarees` and by sibling chips on subcategory pages.

### 6.11 `/faq` and `/saree-care` (Read)
- `/faq`: grouped accordions (Orders & delivery, Payments & COD, Returns & exchanges, Products & fabrics), search-within-page field, answers pulled from SiteSettings trust fields where factual (return window, dispatch days) so they never drift; "Still need help? WhatsApp us".
- `/saree-care`: fabric-by-fabric care (one section per final category: Banarasi Tissue, Silk, Kora, Soft Silk, Katan Silk, Warm Silk, Dupion Silk, Viscose Silk) — storage, dry-clean vs hand-wash, zari care, ironing temperature; owner/expert-reviewed copy only. PDP "Care" accordion links to the matching anchor.
- Ship these before linking them from the footer/menu (§4.1).

### 6.12 Saree extras & gifting
- ~~Fall & pico~~ and ~~blouse stitching~~ — **not offered** (owner decision D17/D18, 2026-09-27). Do not build service add-ons, measurement flows or size charts. PDP/FAQ copy should state plainly: "Blouse piece is unstitched" (when included) and "Fall & pico not included" to prevent queries and returns.
- **Need-by date:** optional date on PDP/cart ("Need it by?") compared with the PIN-based ETA → "Arrives before {date}" (success) or "May arrive after {date} — chat with us" (warning). High value for wedding buyers.
- **Gifting:** gift wrap (+₹{{fee}}), gift message (max 200 chars), "hide prices on the invoice" — at cart/checkout; gift-ready tag on eligible products.
- **Video viewing:** "See this saree on video call" → WhatsApp prefilled request with product link and preferred time (no booking system needed initially).
- **Legal/content per PDP (Consumer Protection (E-Commerce) Rules 2020 + Legal Metrology):** country of origin, seller name/address (link), price basis stated clearly ("excludes GST", D3 — confirm MRP labelling with the CA); handloom note "Minor irregularities are the hallmark of handloom, not defects" on handloom products (reduces disputes).

---

## 7. Auth — `/login`, `/signup`, `/forgot-password`, `/reset-password`
(Source: auth review + lead verification. Files: `app/(storefront)/{login,signup,forgot-password,reset-password}/page.tsx`, `components/auth/*`, `actions/auth.actions.ts`, `schemas/auth.schema.ts`.)

### 7.0 Shared auth layout (auth-card.tsx)
- **Current:** `min-h-[70vh]` centered white card on ivory, heading + subtitle above; full storefront chrome around it.
- **Spec:** desktop split layout: left 5/12 brand panel on `maroon-900` with gold stacked logo, one real lifestyle image (4:5, bottom) and 3 benefits ("Track orders", "Save your wishlist", "Faster checkout"); right 7/12 form column `max-w-[400px]`. Mobile: form first, brand panel omitted (logo already in header). Hide bottom nav on auth pages. Card border removed (form sits on ivory; fields carry `border-strong`).
- All forms adopt §4.5. Inputs 16px on mobile, `border-strong` (current `border` = 1.34:1 fails 1.4.11), helper text `ink-500` (current ink-400 3.82:1 fails).
- Rate limiting on login/forgot/signup (backend) + UI states (§4.5 (item 7)). **Security P1**.
- Respect a same-origin `callbackUrl` (login currently always redirects to `/account`, auth.actions.ts:27) — PDP "Sign in to review", wishlist, checkout all need return-to.

### 7.1 Login
- **Current:** "Welcome Back" / "Log in to your Renish Collections account"; Email, Password; "Log In"; 12px footer links "Forgot password?" "Create an account" (~16px tap height); generic "Invalid email or password".
- **Problems:** [P2 + owner decision D7] email+password only — Indian shoppers commonly expect mobile OTP / Google (login itself works, so not P0); P1 no return-to; P1 no show-password; P1 tiny secondary links; P2 cannot log in with phone though stored.
- **Note:** `proxy.ts` already appends `?callbackUrl=` when bouncing from /account and /admin (proxy.ts:27,37); only the auth actions ignore it (auth.actions.ts:27, :150) — read the existing param, validate same-origin path, redirect there.
- **Spec (order):** H1 "Sign in" + subtitle "Track orders, save favourites, check out faster." → **[Continue with mobile number]** (OTP; primary; `+91` prefix field → 6-digit `autoComplete="one-time-code"` single input, "Resend in 0:30", "Change number", WebOTP on Android) → **[Continue with Google]** (secondary, bordered white) → divider "or use email" → Email (`autoComplete=username`), Password (reveal toggle, `current-password`) → "Sign in" → "Forgot password?" (14px, 44px hit) → "New here? Create an account" as full-width secondary button. OTP/Google depend on backend providers (**D7**); ship the email path improvements regardless.
- Error copy: "That email and password don't match. Try again or reset your password." (inline reset link). Inactive account: same generic copy + "Need help? WhatsApp us".
- Already signed in → redirect to `/account` (or callbackUrl).
- **Acceptance:** return-to works from wishlist/PDP; show-password toggles `type` and announces state; links ≥44px tall.

### 7.2 Signup
- **Current:** Full Name, Email, "Phone (optional)" (no prefix/inputMode/maxLength), Password (8+, upper, lower, digit; hint omits "lowercase"), "Create Account"; errors one at a time; values wiped on error; duplicate email is a dead end; no terms/consent.
- **Spec:** fields: Full name (`autoComplete=name`, single field), Mobile number (label "Mobile number", helper "For delivery updates", `+91` prefix, normalise input; make **required** if OTP login is adopted, else optional but visually equal), Email, Password (reveal + live checklist `aria-live="polite"`: "8+ characters", "A number", "An uppercase letter", "A lowercase letter" — or relax policy to length ≥8 + not common (**D8**)); consent line "By creating an account you agree to our Terms and Privacy Policy." (links); optional unchecked checkbox "Send me order updates and new arrivals on WhatsApp" (DPDP Act 2023 consent). Duplicate email/phone → "You already have an account with this email. Sign in or reset your password." Success → toast "Welcome, {firstName}!" + redirect to callbackUrl/account; if auto-sign-in fails → `/login?created=1` with a green notice (not error styling).
- **Acceptance:** all errors shown at once; values persist; hint copy matches schema.

### 7.3 Forgot password
- **Spec:** "Back to sign in" link above form; H1 "Reset your password"; email field; "Send reset link". Success panel replaces form: mail icon (gold-700), "Check your email", "If an account exists for **{email}**, we've sent a link. It expires in 1 hour.", tips ("Check Spam or Promotions"), "Resend link" disabled 60s with countdown, "Back to sign in" secondary. Offer "Reset with an OTP on your mobile instead" when OTP exists. Email template branded (§3.8). Mail failures → inline "We couldn't send the email right now. Try again in a minute." (currently thrown to error boundary).

### 7.4 Reset password
- **Current:** missing token → red text "This reset link is missing a token…" with no link (jargon, dead end); token validity only checked on submit after typing two passwords; no rules hint; manual login afterwards.
- **Spec:** validate token server-side on page load; invalid/expired/used → state card "This link has expired" + "Reset links work once, for 1 hour." + primary "Send a new link" (→ /forgot-password). Valid → subtitle "Choose a new password for {masked email}", new password with reveal + checklist, confirm with live "Passwords match ✓" once lengths equal; success → auto sign-in + toast "Password updated — you're signed in", invalidate other sessions, send "password changed" email.

---

## 8. Customer account — `/account/*`
Files: `app/(storefront)/account/**`, `components/account/*`, `lib/constants.ts` (ACCOUNT_NAV_LINKS).

### 8.1 Account shell (account/layout.tsx)
- **Current:** 220px left nav of 5 plain links + red "Log Out", no active state, no greeting; on mobile the full link list stacks **above** every page's content.
- **Spec:** desktop: left rail 240px: greeting block "Hi, {firstName}" + member since (ink-500), nav items with 20px icons (Overview, Orders, Wishlist, Addresses, Profile & security), active = maroon-50 fill + maroon-700 text + `aria-current`; "Sign out" separated at bottom, ink-600 (not red — it isn't destructive). Mobile: `/account` is the hub (list of nav rows 56px with chevrons + summary counts); sub-pages show a back link "‹ Account" and the page H1 — no stacked nav above content.
- **Acceptance:** active state visible + announced; mobile sub-pages start with content within the first 120px.

### 8.2 Overview `/account` (currently "My Profile", read-only duplicate of settings)
- **Spec:** replace with a dashboard: latest order card (status chip + timeline mini + "Track"/"View"), quick tiles (Orders {n}, Wishlist {n}, Addresses {n}), "Complete your profile" nudge if phone missing, recently viewed rail. Empty (new user, no orders): EmptyState "No orders yet" + "Start shopping" + best sellers rail.

### 8.3 Orders `/account/orders`
- **Current:** rows with "#RC…", date · items, total, raw enum badge; not clickable; empty = one sentence.
- **Spec:** order cards: order number + date (en-IN "12 Sep 2026"), 1–3 item thumbnails (+n), total `<Price>`, `StatusChip` with customer labels (§3.7), primary action by status ("Track", "Write a review" when delivered, "Return/exchange" within window, "Buy again"). Whole card links to detail. Filters: All / In progress / Delivered / Cancelled & returns. Pagination (20/page). Empty: EmptyState + CTA.

### 8.4 Wishlist `/account/wishlist` (and guest `/wishlist`)
- **Current:** grid of cards with × remove (32px) and "Move to Cart" (secondary) / "Out of Stock"; no variant handling (moving a variant product to cart without a variant).
- **Spec:** reuse ProductCard (§5.4) with actions: "Move to cart" (opens variant chooser sheet when variants exist), remove (44px, toast with Undo), price-drop tag "Price dropped ₹500" when current < price at save time (needs `WishlistItem.priceAtAdd`), back-in-stock "Notify me" for OOS (future). Share wishlist link (optional). Empty: "Save sarees you love" + "Explore new arrivals".

### 8.5 Order detail `/account/orders/[orderNumber]` (new)
Header: "Order #RC2609251234" + placed date + StatusChip; **timeline** (vertical on mobile, horizontal stepper desktop): Placed → Confirmed → Packed → Shipped (carrier + tracking link from `carrierName/trackingNumber`) → Out for delivery → Delivered, with timestamps; cancelled/returned branches. Items list with variant, qty, price, per-item "Write a review" after delivery. Delivery address, payment method + status, price breakdown (matches cart format incl. GST line), invoice download (GST invoice, future), actions: "Cancel order" (only before SHIPPED; ConfirmDialog with reason select), "Request return" (within window), "Need help?" WhatsApp prefilled with order number.

### 8.6 Addresses `/account/addresses`
- **Current:** list cards (name, one-line address, phone ink-400, gold "Default" tag), pencil/trash icons 16px (trash deletes immediately — no confirm), "Add New Address" toggles an inline form; form fields: Full Name, Phone, Line 1, Line 2, City, State (**free text**), Pincode; single form-level error.
- **Spec — India address form (shared with checkout):** Full name · Mobile (`+91`, 10 digits) · **PIN code first** (6 digits → autofill City + State via a PIN lookup table/API; user can override) · Flat/House no., Building (line1) · Area, Street, Village (line2) · Landmark (optional; add `landmark` column) · City · State (**select** of 28 states + 8 UTs) · Address label chips Home / Work / Other (**new** `label` enum column — the existing `AddressType` enum is SHIPPING/BILLING and must stay for order semantics) · "Make this my default" switch. Field-level errors, `autoComplete` tokens (`shipping postal-code`, `address-line1`, etc.). Present as a Sheet on mobile/desktop (not inline expansion that shifts the list).
- List: cards with type tag, default tag, full address multi-line, phone ink-600; actions as text buttons "Edit" / "Remove" / "Set as default" (44px); Remove → ConfirmDialog "Remove this address?"; default address cannot be removed without choosing another (or auto-promote next).
- Empty: EmptyState "No saved addresses" + "Add address".
- **Acceptance:** entering 600001 fills Chennai / Tamil Nadu; delete requires confirmation; errors per field.

### 8.7 Profile & security `/account/settings`
- **Current:** Profile form (Full Name, Phone placeholder "10-digit mobile number") + Change Password (3 fields) — only if passwordHash; success/error text under each.
- **Spec:** sections as separate cards with their own save: **Profile** (name, mobile with `+91` and "Verify" via OTP when available, email read-only with "Change" flow requiring password/OTP), **Password** (current + new with checklist + reveal; toast on success; sign out other devices checkbox), **Communication preferences** (WhatsApp order updates, email newsletter, SMS — toggles; ties to DPDP consent), **Delete account** (danger zone at the bottom: explanation, ConfirmDialog requiring typing "DELETE", soft-delete via `deletedAt`). Show "Signed in with Google" state when no password.

---

## 9. Admin — `/admin/*`
Mode: **Operate (dense)**. Brand lives in details (logo, maroon active states, gold hairlines) — not in ornament. Target: Alex can add a saree with 5 photos in **< 90 seconds** and process 20 orders without touching the mouse more than necessary.
Files: `app/admin/**`, `components/admin/*`, `actions/admin/*`, `services/admin/*`, `lib/authorization.ts` (roles: SUPER_ADMIN, ADMIN, PRODUCT_MANAGER, ORDER_MANAGER, CONTENT_MANAGER).

### 9.1 Admin login (done in §0.4 visually)
Remaining: show-password toggle; `callbackUrl` return to the admin page that bounced; rate limit + lockout message; "Forgot password?" for staff (reuse flow); error copy "Email or password is incorrect." Field borders `border-strong`.

### 9.2 Admin shell (admin (dashboard)/layout.tsx, admin-sidebar.tsx, admin-topbar.tsx)
- **Current:** fixed `w-56` charcoal sidebar (always visible — on a 390px phone it eats 224px), 8 flat items with maroon active fill (no `aria-current`), topbar with logo+ADMIN (done), "{name} · ROLE" and "Log Out" text; no "View store", no search, no role-based item hiding (every staff role sees every item; server actions enforce, UI doesn't).
- **Spec:**
  - Sidebar 240px desktop, collapsible to 64px icon rail (state in localStorage; tooltips on icons when collapsed); **<1024: off-canvas Sheet** from the left via a menu button in the topbar.
  - Groups with `label-caps` headers: **Overview** (Dashboard) · **Catalogue** (Products, Categories, Reviews [new], Inventory [future]) · **Sales** (Orders, Customers, Coupons) · **Storefront** (Banners, Pages/Policies [new], Navigation [future]) · **Settings** (Store settings, Staff & roles [future], Audit log [new]).
  - Items filtered by role — **mirror the permissions enforced in `lib/authorization.ts` and each action's `requireRole`; do not invent new rules in the UI.** Proposed matrix to confirm against the code (D20): Dashboard = all staff · Products/Categories/Reviews = PRODUCT_MANAGER + ADMIN/SUPER_ADMIN · Orders/Customers = ORDER_MANAGER + ADMIN/SUPER_ADMIN · Coupons = ADMIN/SUPER_ADMIN (+ORDER_MANAGER if owner agrees) · Banners/Pages = CONTENT_MANAGER + ADMIN/SUPER_ADMIN · Settings/Audit = ADMIN/SUPER_ADMIN. Hidden items must also be blocked server-side (page `requireRole` or proxy) for direct URL access. Count badges: Orders "pending to ship", Reviews "awaiting approval".
  - Active: `bg-white/10` + 2px gold-400 left inset indicator (1–2px is allowed; not a thick colored border) + white text + `aria-current`.
  - Topbar (56px, white): menu (mobile) · logo+ADMIN · global search (⌘K) · "View store ↗" (new tab) · user menu (name, role label humanised "Product manager", Sign out).
  - [P3 — defer until catalogue/order volume justifies it] **Command palette (⌘K / Ctrl+K):** jump to pages, search products by name/SKU, orders by number, customers by email/phone; actions "New product", "New coupon".
- **Acceptance:** at 390px content uses full width; role CONTENT_MANAGER does not see Products/Orders items; ⌘K opens palette and Esc closes it.

### 9.3 Dashboard (dashboard/page.tsx, stat-card.tsx)
- **Current:** 11 equal-weight stat cards (Total/Today/Monthly sales, Total/Pending/Delivered/Cancelled orders, Customers, Products, Low stock, OOS) — the hero-metric template; Top selling list; Low stock list (names not linked); Recent orders table (raw enum badge, rows not linked). No date range, no trend, no first-run guidance.
- **Spec:**
  - **First-run checklist** (shown until complete, dismissible): Add store contact & WhatsApp · Upload hero banner (with mobile image) · Add category images · Add first 5 products · Set shipping & returns policy · Configure payments. Each item links to the exact screen; progress "3 of 6".
  - **Needs attention** row (actionable, not vanity): "Orders to confirm: 4" · "Ready to ship: 7" · "Low stock: 12" · "Reviews awaiting approval: 5" — each a link to a pre-filtered list. Numbers large (Figtree 600 28px tabular), label 13px ink-600; zero state reads "All caught up" in success.
  - **Sales** panel: date range selector (Today · 7 days · 30 days · Custom, en-IN), revenue + orders + AOV with delta vs previous period (↑/↓ with text, not colour alone), one line chart (revenue by day) — follow the dataviz rules (single series, direct labels, no gridline clutter).
  - Lists: Recent orders (StatusChip, customer, total, relative time, row → order detail), Top products (thumb, units, revenue, link), Low stock (thumb, stock with gold-700/error text, inline "+ Restock" quick edit).
- **States:** empty store → checklist + "Sales will appear after your first order."; loading skeletons; error panel with retry per widget.

### 9.4 Products list (products/page.tsx, product-list.tsx)
- **Current:** search by name/SKU (form submit), table: thumb+name+SKU, category, price, stock (colour only: error/gold-600/charcoal), **status select that commits on change with no feedback**, row actions icon-only 16px (edit link, duplicate, delete with `window.confirm`), empty "No products found."; pagination; no filters, sort, bulk, counts, or published/draft tabs.
- **Spec (DataTable §3.5):**
  - Tabs with counts: All · Published · Draft · Archived · Out of stock · Low stock.
  - Filters: Category (tree select), Fabric, Price range, Has images (missing-images audit), Flags (New/Best seller/Featured). Search debounced 250ms, matches name/SKU/tags. URL state.
  - Columns: select · image 40×53 · Name (+ SKU below, ink-500) · Category · Price (selling + MRP struck, tabular) · Stock (number + text label "Low"/"Out" + inline editable on click, Enter saves, Esc cancels) · Status (StatusChip; change via row menu with toast "Published · Undo") · Updated (relative) · actions menu (⋯ 44px): Edit, Duplicate, View on store ↗, Archive, Delete.
  - Sort by name/price/stock/updated (`aria-sort`).
  - **Bulk actions** bar (appears when ≥1 selected, sticky bottom): Publish · Move to draft · Archive · Set flags · Change category · Adjust price by % · Delete (ConfirmDialog with count "Delete 12 products? This can't be undone.").
  - Delete is **already** a soft delete (services/admin/product.service.ts:284 sets `deletedAt` + ARCHIVED) — the bug is the confirm copy "This cannot be undone" (product-list.tsx:30). Replace `window.confirm` with ConfirmDialog "Move '{name}' to trash?" + Undo toast; add a Trash tab with Restore; permanent purge only for SUPER_ADMIN.
  - Row click → edit; keyboard: ↑/↓ move row focus, Enter open, X select, `/` focus search, N new product.
  - Empty store: EmptyState "Add your first saree" + "Import from CSV" (future) + "Add product".
- **Acceptance:** status change shows pending + toast + undo; delete requires confirm; table usable at 1024 without horizontal scroll (hide Updated/Category <1280 into the name cell).

### 9.5 Categories (categories/page.tsx, category-list.tsx, category-form.tsx)
- **Current:** cards list with "Parent / Name", slug · counts, Published/Draft badge, Publish toggle text, edit (inline form expansion), **delete with no confirmation**; add form toggles inline at top; image uploader 128px; parent select limited to top-level.
- **Spec:** tree table ([P3] drag-to-reorder later; start with ▲/▼ move buttons that write `displayOrder`; indent children; expand/collapse), columns: image thumb (3:4, red "Missing image" tag if none — storefront hides imageless tiles), name, products count (link to filtered products), visibility switch (toast), actions. Edit/create in a right Sheet (not inline): Name → slug auto (editable, live URL preview `renishcollections.com/{slug}`, reserved-slug validation §4.1), Parent, Description (with char count, used on category page), Image (3:4 guidance "1200×1600, one saree, plain background"), Banner (CATEGORY_TOP) link, SEO (title ≤60 / description ≤160 with counters + Google preview). Delete: ConfirmDialog; blocked with explanation when products/children exist ("Move 14 products first" + link) — the action already returns an error; surface it next to the row, not at the top of the page.

### 9.6 Product editor (products/new, products/[id], product-form.tsx, image-uploader.tsx, variant-editor.tsx) — the daily-entry workflow
- **Current:** one long `max-w-4xl` page of 7 white sections (Basic, Pricing & Inventory, Saree Attributes, Media, Variants, Status & Visibility, SEO); error text only at the bottom; Save/Cancel only at the bottom; fabric/colour free text (breaks facets: "Silk" vs "silk" vs "Pure Silk"); no occasion/weave/zari; images: add (multi), "Make Primary", remove — no drag reorder, no alt text, **one failed upload discards the whole batch** (`Promise.all`, image-uploader.tsx:121), no per-file progress, no size/type validation or guidance; video = URL text field; variants = free Color/Size/SKU/Price/Stock rows (Size is irrelevant for sarees; no variant MRP though schema has `originalPrice`); after save → always back to list (no "save & add another"); Cancel discards without warning; no unsaved-changes guard; no preview.
- **Spec — layout:** two columns ≥1280: main (8/12) + side (4/12 sticky). **Sticky action bar** (top, under topbar): breadcrumb "Products / New saree", status chip, "Preview ↗", "Save draft", primary "Publish"/"Update" with split-menu ("Save & add another", "Save & duplicate"); ⌘S saves; unsaved-changes dot + `beforeunload` + in-app navigation guard ("Discard changes?").
- **Main column order (optimised for saree entry):**
  1. **Media** first (photos drive everything): drag-and-drop zone + click, multi-file with per-file progress bars and per-file failure ("IMG_2231.jpg failed — Retry"); client-side validation (jpg/png/webp, ≤10MB, warn if < 1200px on the short side or not ~3:4); thumbnails in a sortable grid (drag to reorder, keyboard reorder with Alt+←/→), first = "Listing image" label; per-image alt text field (prefilled "{name} — {colour} saree, {view}") and optional variant assignment (colour); video upload or URL with thumbnail. Guidance line: "Best: 5+ photos · full drape · pallu · border close-up · blouse piece · daylight".
  2. **Basics:** Name (live slug preview + "Edit"), Category (searchable tree select), Short description (≤160 with counter — used on cards/meta), Description (textarea with basic formatting: paragraphs, bullet list).
  3. **Saree details** (structured, powers filters and PDP spec table). **Managed vocabularies (brief: "manage product colors, manage fabric types")**: a new admin screen **Catalogue → Attributes** with editable lists for Fabric, Colour (name + hex swatch), Occasion, Pattern, Border type, Blouse type — used as the options below and as filter values; renaming a value updates products. Fields: Fabric (combobox from existing values + "Add new", normalised casing), Weave/Work (multi-select: Zari, Kanjivaram weave, Banarasi, Embroidery, Print, Handloom…), Zari type (Real / Tested / None), Colour (combobox + swatch picker; also secondary colour), Occasion (multi: Wedding, Festive, Party, Office, Casual, Gifting), Saree length (number + "m", default 6.3), Blouse piece (Yes/No + length, stitched?), Origin/region, Silk Mark certified (checkbox — only claim if true), Care (select presets: Dry clean only / Hand wash / Machine wash gentle + custom), **Weight** (grams — key for silk buyers), **Blouse type** (running / contrast / attached; stitched / unstitched), **Pattern**, **Border type**, **Colours** (multi, from the managed list; first = primary), **Country of origin** (default India).
  4. **Pricing:** Selling price (₹ prefix, "excl. GST" note — D3), MRP/compare-at (validation: MRP ≥ selling; shows "–20% · ₹2,000 off" live), Cost (admin only; shows margin % live), GST rate — **owner/CA-configured per HSN, not hard-coded slabs** (the GST slab structure was rationalised in Sept 2025; many textiles are 5%, some stitched apparel above a price threshold 18% — confirm with the CA) — hidden unless per-product rates are needed.
  5. **Inventory:** SKU (auto-suggest from category+colour+sequence, e.g., `KAN-MAR-0042`, editable), Stock, Low-stock threshold.
  6. **Variants** (optional): axis builder (choose axes: Colour, … — no stitched-blouse sizes, D18; enter values as chips) → generates the combination table (SKU auto, price inherits with override, MRP, stock, available switch, image link) with bulk-edit row ("Apply price to all"). Remove the hard-coded Size axis for sarees.
  7. **SEO** (collapsed by default, "Auto-filled from name/description" note): title/description with counters and a Google snippet preview; canonical/OG overrides under "Advanced".
- **Side column:** Status (Draft/Published/Archived + publish date), Visibility flags (New arrival, Best seller, Featured) as switches with helper text explaining where each appears on the storefront, Completeness meter ("Add 2 more photos", "Add fabric" — gentle, not blocking), Last saved / Created by (from AuditLog).
- **Errors:** field-level (§4.5) + top summary with jump links; server error toast; never lose uploaded images on a failed save.
- **Acceptance:** required fields ≤ 8 (name, category, 1 image, selling price, MRP, stock, fabric, colour); images upload in parallel; tab order follows the visual order; a product can be created with keyboard only; a failed upload of 1 of 5 files keeps the other 4; navigating away with changes prompts; ⌘S saves.

### 9.7 Orders list (orders/page.tsx, order-status-select.tsx)
- **Current:** table: order #, customer, items count, total, payment status raw, tracking, **status select that commits instantly for any transition** (e.g., DELIVERED → PENDING, or REFUNDED with no confirmation or notes); no date column (!), no filters/search, rows not linked, no detail page.
- **Spec:** status tabs with counts, mapped to enums: All · **To confirm** = PENDING · **To pack** = CONFIRMED + PROCESSING · **To ship** = PACKED · **Shipped** = SHIPPED + OUT_FOR_DELIVERY · **Delivered** = DELIVERED · **Cancelled & returns** = CANCELLED + RETURNED + REFUNDED. Allowed transitions also include PENDING/CONFIRMED/PROCESSING/PACKED → CANCELLED and CANCELLED → REFUNDED (prepaid cancellations); search (order #, customer name/phone/email); filters: date range, payment method/status, COD; columns: select · Order # (link) · Date/time (en-IN, relative on hover) · Customer (name + phone) · Items (thumbs stack) · Total · Payment (chip: Paid/COD/Failed/Refunded) · Status (StatusChip) · Ship-by (SLA badge "Due today" gold-700 / "Overdue" error). Row action menu: "Mark as packed", "Add tracking…", "Print invoice / packing slip", "Cancel…". **Status changes follow an allowed-transition map** (PENDING→CONFIRMED→PROCESSING→PACKED→SHIPPED→OUT_FOR_DELIVERY→DELIVERED; CANCELLED only before SHIPPED; RETURNED/REFUNDED only after DELIVERED) and destructive ones (Cancel, Refund) require ConfirmDialog + reason; SHIPPED requires carrier + tracking in a small dialog (fills `carrierName/trackingNumber`, triggers customer notification). Bulk: "Mark packed", "Print slips", "Export CSV".
- **Acceptance:** cannot move DELIVERED → PENDING; marking shipped without tracking is blocked with an inline message; every change toasts with undo where reversible and is written to the audit log (exists).

### 9.8 Order detail `/admin/orders/[id]` (new)
Header: order #, date, StatusChip, payment chip, primary next-step button (e.g., "Mark as packed"). Timeline (status history + audit entries + notifications sent). Items (image, name, variant, SKU, qty, price, stock remaining). Customer card (name, phone with WhatsApp link, email, order count, lifetime value, link to customer). Shipping & billing address (copy button), delivery zone/ETA. Payment (method, gateway ref, status, refund action). Totals (same breakdown as customer). Internal notes (staff-only comments, new `OrderNote` model). Actions: print invoice/packing slip, resend confirmation, cancel/refund with reason.

### 9.9 Customers (customers/page.tsx)
- **Current:** loads **all** customers with **all orders** in one query (unbounded; will degrade), sums money with `Number()` floats (violates the project's Decimal rule — use Prisma `_sum`/Decimal), no search/filter/pagination/sort, rows not linked, status colour-only text.
- **Spec:** paginated DataTable (server aggregation: order count, total spent via `groupBy`/`_sum`), search (name/email/phone), filters (Has orders, Joined date, Active/Inactive), sort by spent/orders/joined; columns: name + email, phone, orders, total spent (tabular ₹), last order date, joined, status chip. Row → customer detail (profile, addresses, orders, wishlist count, notes, deactivate with confirm). Export CSV (ADMIN+ only; PII caution note).

### 9.10 Reviews moderation `/admin/reviews` (new — **P1, feature is currently broken end-to-end**)
Reviews are created with `isApproved: false` (review.service.ts:65) and only approved reviews render (review.service.ts:5,22,72), but **no admin UI exists to approve them** → no review will ever appear. Build: queue tabs (Pending · Approved · Hidden) with counts and sidebar badge; each row: stars, title, body, photos (thumbs → lightbox), product (thumb+link), customer, verified-purchase chip, date; actions Approve (A), Hide (H), Feature on home (F) — keyboard-first moderation with next-item auto-focus; bulk approve; optional reply-as-store (future). Approving updates product rating aggregates.

### 9.11 Coupons (coupons/page.tsx, coupon-list.tsx, coupon-form.tsx)
- **Current:** card list (code mono, Active badge, "10% off · Min order ₹X · Valid dd/mm/yyyy – dd/mm/yyyy"), Activate toggle, edit inline, **delete without confirmation**; form: code, description, type, value, min order, max discount, start/end `type=date` using `toISOString().slice(0,10)` (**UTC → IST off-by-one risk** for dates set near midnight — use en-IN local date handling and store start-of-day/end-of-day IST), usage limits, active; `applicableCategoryIds/ProductIds` exist in schema with **no UI**.
- **Spec:** table with columns Code · Offer summary · Status (Scheduled/Active/Expired/Disabled — derived, colour+text) · Usage "34 / 100" with bar · Valid window · actions. Form in a Sheet: code (auto-uppercase, "Generate" button, uniqueness check), discount type segmented control, value with ₹/% adornment, min order, max discount (only for %), **applies to** (All / Categories / Products pickers), dates with time (IST, defaults start now → end +7 days 23:59), limits, "Show on Offers page" toggle (public vs private code), live preview line ("10% off on orders above ₹4,999, up to ₹1,000 · 1 use per customer · ends 31 Oct, 11:59 PM"). Delete → ConfirmDialog; prefer "Disable" for used coupons.

### 9.12 Banners (banners/page.tsx, banner-list.tsx, banner-form.tsx)
- **Current:** list with 112×64 thumb, title, Active badge, "PLACEMENT · link", toggle/edit/**delete without confirm**; form: single image, title, link, placement (4 options — **only HOME_HERO is rendered anywhere**), order, dates, active. `mobileImageUrl` exists in schema but no field. No preview.
- **Spec:** group by placement with a description of where each appears and its required sizes (Home hero: 2400×1200 + mobile 1080×1440; Home promo/editorial: 1600×2000; Category top: 2400×600 + mobile 1080×720; Mobile strip → repurpose as Announcement messages or remove). Form: desktop image + **mobile image** (required for hero), alt text, title, subtitle, CTA label, link (with internal route picker + 404 check), text tone (light/dark), focal point picker (click on image), schedule with time (IST), active. [P3] Live preview at desktop and mobile widths using the real hero component (start with a static thumbnail of both crops). Drag reorder within placement. Delete → ConfirmDialog. Warn when a placement has no active banner ("Home hero is using the fallback"). Storefront must render HOME_PROMO (§5.2.4) and CATEGORY_TOP (§5.3) — or remove those options.

### 9.13 Store settings (settings/page.tsx, settings-form.tsx)
- **Current:** one ungrouped form: store name, contact email/phone, WhatsApp number **and** WhatsApp link (duplicate concepts), address (single line), 4 social URLs, tax %, free shipping threshold, default SEO; success text only.
- **Spec:** left sub-nav sections, each saving independently with toast: **Store profile** (name, legal name, GSTIN, address multi-line, support hours), **Contact & social** (phone, WhatsApp number only — derive `wa.me` link; email; Instagram/Facebook/YouTube with URL validation and "Test link"), **Checkout & shipping** (free-shipping threshold, COD available + fee, shipping zones manager — table over `ShippingZone`: name, PIN prefixes/states, flat rate, free above, ETA days; this powers the PDP PIN checker and cart shipping), **Taxes** (prices include GST toggle, default rate), **Policies & trust** (return window days, dispatch/delivery days, announcement messages list with reorder, links to edit policy pages), **SEO defaults** (title/description with counters + preview), **Brand** (read-only logo preview; see §3.8).
- **Acceptance:** changing return window updates PDP trust points, FAQ answer and announcement after revalidation.

### 9.14 Audit log `/admin/audit` (new; data already recorded by lib/audit.ts)
Filterable timeline table: when (en-IN), who (staff + role), action (humanised "Changed status of #RC… from Packed to Shipped"), entity link, diff viewer (before/after JSON rendered as field list). Filters: staff, entity type, date range. SUPER_ADMIN/ADMIN only.

### 9.15 Admin-wide
- Toasts for every mutation; optimistic UI with rollback on error.
- ConfirmDialog for every delete/cancel/refund (today only product delete confirms, via `window.confirm`).
- Tables: `tabular-nums`, right-aligned money, en-IN dates, sticky headers, 44px row actions with tooltips.
- Permission-denied state (role lacks access): "You don't have access to Orders. Ask an admin." instead of a thrown error.
- Mobile admin: lists become cards; editor single column with sticky bottom save bar; order detail usable one-handed (status actions at bottom).

---

## 10. Technical findings register (audit detail)

| # | Sev | Category | Location | Finding | Fix | WCAG/Std |
|---|---|---|---|---|---|---|
| T1 | P0 | Integrity | constants.ts:12-18 etc. | 7 internal routes 404 | §4.1 | — |
| T2 | P0 | Responsive/A11y | header.tsx:22, mobile-menu.tsx:23 | Fixed overlay clipped by `backdrop-filter` containing block | Portal Sheet §4.2 | 2.1.1, 2.4.3 |
| T3 | P1 | A11y | mobile-menu.tsx, mobile-filter-drawer.tsx | No `role=dialog`, `aria-modal`, focus trap, Esc, scroll lock, focus return | Sheet primitive | 2.1.2, 2.4.3, 4.1.2 |
| T4 | P1 | A11y | input.tsx:9; filter-panel.tsx:57,65; review-form.tsx:70 | Control borders `#e7ddd0` 1.34:1 | `border-strong` 3.20:1 | 1.4.11 |
| T5 | P1 | A11y | ~40 uses of `text-ink-400` for text | 3.29–3.82:1 | `ink-500` | 1.4.3 |
| T6 | P1 | A11y | mobile-bottom-nav.tsx:23,25; badge.tsx:23; header badge | 9–11px functional text (detector: undersized-ui-text ×5/page) | 12px floor | 1.4.4 (practical) |
| T7 | P1 | A11y | all forms | No `aria-invalid`/`aria-describedby`; errors not live; browser bubbles | §4.5 | 3.3.1, 3.3.3, 4.1.3 |
| T8 | P1 | A11y | product-card.tsx:56 | Invisible focusable/clickable ATC | §5.4 | 2.4.7, 2.5.x |
| T9 | P1 | A11y | variant-selector.tsx:58; review-form.tsx:52 | Toggle chips/star buttons lack `aria-pressed`/radio semantics | ChipGroup/radiogroup | 4.1.2 |
| T10 | P1 | A11y | header/bottom nav/account nav | No `aria-current`; no skip link | §4.8 | 2.4.1, 2.4.8 |
| T11 | P1 | Responsive | search-bar.tsx:30, input.tsx:9 | 14px inputs → iOS focus zoom | 16px on mobile | — |
| T12 | P1 | Responsive | admin layout.tsx:15 | Fixed 224px sidebar at all widths | Off-canvas <1024 | 1.4.10 |
| T13 | P1 | Touch | cart-line-item.tsx:52,59-76; wishlist 36px; footer social 36px; admin icons 16px | Targets < 44px (some < 24px) | §4.8 | 2.5.8 |
| T14 | P1 | Performance | app/ | No loading/error boundaries; home awaits 8 queries | §4.4 | Core Web Vitals |
| T15 | P1 | Performance | header.tsx:11-12 + mobile-bottom-nav.tsx:7-8 | `auth()` + cart count executed twice per request | React `cache()` in services; Suspense | — |
| T16 | P1 | Performance/Integrity | admin customers/page.tsx:11-23,44 | Unbounded users+orders query; float money sum | Paginate + `_sum` Decimal | project rule |
| T17 | P1 | Integrity | review.service.ts:65 | No moderation UI → reviews never visible | §9.10 | — |
| T18 | P1 | Integrity | cart.service.ts:214-219 | Tax added on top; fixed ₹99 shipping; zones unused | §4.6 | Legal Metrology (MRP incl. taxes) — confirm |
| T19 | P1 | Integrity | add-to-cart-button.tsx:36-40; buy-now-button.tsx:28-31; cart-line-item.tsx:27-35; wishlist actions | Server action results ignored | Handle `{ok,error}` + toast | 3.3.1 |
| T20 | P2 | Performance | image-gallery.tsx:28 | `priority` on the active image on every switch | `fetchPriority="high"` on index 0 only | LCP |
| T21 | P2 | Performance | hero-banner.tsx:9 | No `sizes`, no mobile source; `opacity-90` | §5.2.1 | LCP |
| T22 | P2 | Integrity | [categorySlug]/[slug]/page.tsx:61 | Breadcrumb JSON-LD uses parent slug as name | `parent.name` | schema.org |
| T23 | P2 | Integrity | banner placements | HOME_PROMO/CATEGORY_TOP/MOBILE_STRIP never rendered | §5.2.4, §5.3, §9.12 | — |
| T24 | P1 | Integrity | coupon-form.tsx:20; banner-form.tsx:14 | `toISOString().slice(0,10)` date handling (UTC vs IST) — a coupon can expire/start a day off on sale day | Local-date (IST) util; store start/end of day in IST | — |
| T25 | P2 | Theming | badge.tsx, wishlist-button.tsx:33, image-uploader.tsx:150, stat tones | `text-white`/`bg-white`/`bg-black/50` literals, `text-[10px]/[11px]` arbitrary values | Tokens + type scale | — |
| T26 | P2 | Theming | stat-card.tsx:12; product-list.tsx:64 | `text-gold-600` for small text (4.19:1) | `gold-700`/`warning` | 1.4.3 |
| T27 | P2 | Integrity | public/*.svg | Next starter assets shipped | Delete | — |
| T28 | P2 | A11y | layout.tsx:60 | `lang="en"` | `en-IN` | 3.1.1 |
| T29 | P2 | Motion | product-card.tsx:35, category-grid.tsx:20 | Hover `scale` on images (detector image-hover-transform ×6) | Cross-fade, hover-capable only | — |
| T30 | P1 | Integrity/Trust | constants.ts:28-33 | Placeholder WhatsApp number **and guessed Instagram/Facebook/YouTube handles** render when settings are empty (may be someone else's accounts) | Hide each link when unset | — |
| T32 | P1 | Integrity | actions/cart.actions.ts:21-33; services/cart.service.ts | No server-side stock/published/variant-required/qty-cap validation on add; always `{success:true}` | Typed result codes (§5.6) | — |
| T33 | P1 | Trust | review-list.tsx:65; reviews-section.tsx:39 | "Verified Customer" shown for reviewers with no name, regardless of `isVerifiedPurchase` | "A customer" | — |
| T34 | P2 | Integrity | share-button.tsx:10-19 | Cancelling native share falls through to clipboard + "Link copied" | Ignore AbortError | — |
| T35 | P2 | Performance | components/layout/logo.tsx, hero-banner.tsx:9, image-gallery.tsx:28 | `priority` deprecated in Next 16 (logo already migrated to `loading="eager"` this session) | `fetchPriority`/`getImageProps` | Next 16 docs |
| T36 | P2 | Integrity | recently-viewed.tsx:28-37 | Reads via a server action on every PDP mount; pops in after hydration (CLS) and ignores wishlist state | Reserve height/skeleton; pass wishlist ids | CLS |
| T37 | P2 | UX | sort-select.tsx:22 | `router.push` adds a history entry per sort change | `router.replace` | — |
| T38 | P2 | Integrity | product-list.tsx:30 | Confirm copy says "cannot be undone" but delete is soft (product.service.ts:284) | ConfirmDialog + Undo + Trash | — |
| T31 | P3 | A11y | product-faq.tsx:27 | `list-none marker:content-none` removes disclosure affordance without replacement | Chevron | 1.3.1 |

Detector false positives / context: `cream-palette` (ivory ground is the brand's deliberate choice, not an AI default — keep); `overused-font` (valid — addressed by D1); `line-length` on home SEO paragraph (~105ch — valid, §5.2.7).

---

## 11. Execution roadmap

Each phase ends with: typecheck + lint + the phase's acceptance tests + one batched Playwright screenshot round (desktop 1440 + mobile 390) + impeccable detector on changed files. Re-score §1.2.

| Phase | Scope | Items | Depends on |
|---|---|---|---|
| **0 — Stop the bleeding (1–2 days)** | No dead ends, nothing broken, nothing fabricated | §4.1 interim (search → /shop?q=, exact link-hiding list, bottom-nav fix, WhatsApp/phone order CTA), §4.2 drawer portal, T32 server add-to-cart validation + T19 result handling + "Select {axis}" label, §5.4 remove ghost ATC, T30/T33 fabricated trust signals, hide placeholder-image sections, §9.15 confirm dialogs, §9.10 **reviews moderation** (small, unblocks all review UI) | — |
| **0.5 — Taxonomy (0.5–1 day + owner sign-off)** | Brief categories | §2.6: ✅ 8 final categories created (only Banarasi Tissue live); remaining: reassign products, 301s from old slugs, reserved-slug + product/category slug-collision validation, Occasion/Pattern/Border vocabularies | D12, D13 |
| **1 — Foundations (3–4 days)** | Design system | §3.1 tokens (+contrast), §3.3 fonts (after D1), §3.5 primitives: Button(loading), Field family, ChipGroup, Price, Rating, Tag/StatusChip, Sheet/Dialog/ConfirmDialog, Toast+announcer, Skeleton, EmptyState, Breadcrumb, QtyStepper; §4.4 boundaries; §4.8 a11y baseline; §3.7 status map | D1 |
| **2 — Trust & content (2–3 days + owner content)** | Legitimacy | §4.7 SiteSettings trust fields + TrustPoints; §6.4 policies; §6.5 about; §6.6 contact; §5.1.6 footer; §5.1.1 announcement bar; §9.13 settings sections | Owner facts (D2), policy text |
| **3 — Browse & buy (5–7 days)** | Conversion core | §5.1.2–5.1.5 header/mega-menu/mobile/search; §6.1–6.3 collections/search/offers; §5.3 listing + facets; §5.4 card + quick view; §5.5 gallery; §5.6 buy box + sticky bar + PIN checker; §5.7 cart; §4.6 pricing (after D3); §4.3 chrome budget | Phase 1; ShippingZone data |
| **4 — Home & editorial (2–3 days + photography)** | Persuade | §5.2 all; §9.12 banner model (subtitle, CTA, mobile image, focal point) + preview | Real photography (§3.9) |
| **5 — Accounts (3–4 days)** | Retention | §7 auth (email path first; OTP/Google after D7 + TRAI DLT); §8 account shell, overview, wishlist (+guest `/wishlist`), addresses (PIN autofill), settings. **Order list/detail/track pages ship with checkout** | Checkout project |
| **6 — Admin (4–5 days)** | Operator speed | §9.2 responsive shell + role filtering; §9.6 product editor (media first, managed attribute lists); §9.4 product table + bulk status; §9.3 dashboard (needs-attention + checklist); §9.7–9.9 orders (transition map)/customers (pagination, Decimal sums); §9.5, §9.11 (IST dates), §9.13 settings sections. **Deferred to P3:** ⌘K palette, drag-reorder, live banner preview, bulk price %, audit diff viewer, customer detail, CSV export | Schema additions (§12.2) |
| **Separate project — Checkout & orders** | Revenue | §5.8 checkout (UPI-first, COD rules, guest), order status history, `/account/orders/*`, `/track-order`, admin order detail §9.8, notifications (email/WhatsApp), returns flow | Payment gateway, schema (§12.2), legal policies live |
| **7 — Polish** | Craft | Motion moments (§3.6), browser surfaces, email templates, empty-state copy pass, `/impeccable polish` | All |

---

## 12. Dependencies, owner decisions, schema changes

### 12.1 Owner decisions (block specific items)
| ID | Decision | Recommendation | Blocks |
|---|---|---|---|
| D1 | Typeface pairing | Cormorant Garamond (display ≥24px) + Figtree (UI) — verify ₹ glyph | Phase 1 |
| D2 | Trust facts | **Supplied 2026-09-27 and applied** (`npm run db:store-settings`, prisma/store-settings.ts): no returns/exchanges · **no COD** (prepaid only) · no free shipping · delivery 3–5 days · **no GST for now** (tax 0%) · Renish Collections, Chennai, Tamil Nadu · +91 99404 10494 (phone + WhatsApp) · amalarajini.f@gmail.com · 24/7 · Grievance Officer Amala Rajini F · no quality marks · no social accounts yet. **Still missing: normal shipping fee** (code still charges the hard-coded ₹99, cart.service.ts) | Phase 2 |
| D3 | GST | **Decided: prices exclude GST; currently no GST charged (0%)** — the cart hides the GST line while it is 0; when a rate is set, show "+ GST" labels per §4.6 | §4.6, cart |
| D4 | ~~"Bag" vs "Cart"~~ | **Resolved by the brief: "Cart"** | — |
| D5 | PDP gallery pattern | Thumbs + main (default) vs stacked scroll ≥1280 | §5.5 |
| D6 | Policy/About content storage | MDX in repo (simple) vs admin-editable Page model | §6.4, §9 |
| D7 | Login methods | Add mobile OTP (SMS/WhatsApp provider) + Google | §7 |
| D8 | Password policy | ≥8 chars + common-password check (drop composition rules) | §7.2 |
| D9 | Photography | Commission per §3.9 before Phase 4 | Home, category tiles |
| D10 | Product URL: brief suggests `/product/[slug]`; current is `/sarees/{slug}` with slug-redirects | **Keep `/sarees/{slug}`** (breadcrumb-shaped, SEO history, redirects exist); optionally add `/product/[slug]` → 301 to canonical | routing |
| D11 | JavaScript (brief) vs existing TypeScript | **Keep TypeScript + Prisma**; honour the brief's data shapes as service DTOs (§2.6) | all |
| D12 | Category list | **Decided: final 8** — Banarasi Tissue, Silk, Kora, Soft Silk, Katan Silk, Warm Silk, Dupion Silk, Viscose Silk; Cotton dropped (2026-09-27) | §2.6 |
| D13 | Collections model: `Collection` table vs saved filter URLs | `Collection` table (also powers festival edits) | §6.9 |
| D14 | Single hero vs manual multi-slide | Single hero | §5.2.1 |
| D15 | Mobile category grid: 2-col grid vs horizontal scroll | 2-col grid (all 9 visible) | §5.2.2 |
| D16 | Card ATC on mobile: full-width button vs icon | Full-width (brief) | §5.4 |
| D17 | Fall & pico service | **Decided: not offered** (2026-09-27) | §6.12 |
| D18 | Blouse stitching service | **Decided: not offered** (2026-09-27) | §6.12 |
| D19 | Gift wrap / message / price-hidden invoice | Offer (strong gifting category) | §6.12 |
| D20 | Admin role × section matrix | Confirm against `lib/authorization.ts` | §9.2 |
| D21 | Ship internationally (NRI buyers)? | Owner call; plan assumes India-only | §2.1 |
| D22 | COD rules: order-value cap, confirmation step (WhatsApp/OTP), prepaid incentive | Owner call | §5.8 |

### 12.2 Schema additions implied by this plan
- `Product`: `colors String[]` (brief; keep `color` as primary or migrate), `occasion String[]`, `pattern String?`, `borderType String?`, `weave String?`, `work String[]`, `zariType enum?`, `blouseType String?`, `blouseLength String?`, `weightGrams Int?`, `origin String? @default("India")`, `silkMark Boolean @default(false)`, **`discountPercent Int`** (stored; Prisma can't orderBy a computed difference — powers Discount facet and /offers sort), **`ratingAvg Decimal?` + `ratingCount Int`** (denormalised on review approval — avoids N+1 on cards); managed vocabularies (Fabric/Colour/Occasion/Pattern/BorderType tables or enums) for clean facets.
- `Banner`: `subtitle`, `ctaLabel`, `secondaryLabel`, `secondaryUrl`, `imageAlt`, `textTone`, `focalX`, `focalY`; placement `HOME_UGC` (or drop MOBILE_STRIP).
- `Address`: `landmark String?`, `label enum(HOME,WORK,OTHER)`.
- `SiteSettings`: trust fields (§4.7), `pricesIncludeTax Boolean`, `codAvailable`, `codFee`.
- `WishlistItem`: `priceAtAdd Decimal?` (price-drop tag).
- `Order`: **`userId String?`** + guest contact fields (email, phone) + address snapshot (for guest checkout and `/track-order` — `Order.userId` is currently required); **`OrderStatusEvent { orderId, status, at, byUserId?, note }`** (timelines need timestamps — AuditLog is admin-only).
- `Coupon`: `isPublic Boolean @default(false)` (Offers page / cart "available coupons").
- `Review`: `status enum(PENDING, APPROVED, HIDDEN)` replacing/augmenting `isApproved`, `helpfulCount Int`, optional `storeReply`.
- `User`: consent fields (`whatsappOptIn`, `emailMarketingOptIn`, timestamps), `tokenVersion Int` (NextAuth uses JWT sessions — auth.ts:10 — so "sign out other devices"/invalidate-on-reset needs a version check in the jwt callback).
- `Collection` (§6.9).
- New: `OrderNote`, `ContactMessage`, (optional) `Page` for policies.
- Category slug reserved-word validation (no schema change).

### 12.3 Non-UI dependencies surfaced
Rate limiting (auth, OTP, newsletter, contact, track-order) with a **shared store** (e.g. Redis/Upstash or Postgres) — in-memory limits don't work on serverless; OTP provider + **TRAI DLT** sender-ID/template registration for SMS OTP; PIN → city/state dataset; payment gateway (UPI intent, cards, netbanking, COD; EMI for high-value silk); email templates; revalidation tags so SiteSettings changes propagate; search backend upgrade (synonyms/typeahead need more than `contains`); **data-retention rules** before "Delete account" (GST invoices must be retained); legal review of policy text, DPDP consent wording and the Grievance Officer details.

### 12.4 Owner values (D2) — supplied 2026-09-27; the table below remains the field map
All values except the shipping fee are now in the database and editable in Admin → Settings (new fields: legal name, support hours, delivery time, one-line return policy, COD switch, Grievance Officer name/email). Where each is used:

| Field | Example format | Used in |
|---|---|---|
| Return window | `7` days, conditions (unused, tags intact, unboxing video?) | PDP, cart, FAQ, returns policy |
| Exchange vs refund | "Exchange or refund" / "Exchange only" | returns policy, order detail |
| COD available? + fee + max order value | Yes, ₹{{fee}}, up to ₹{{limit}} | PDP, checkout, announcement |
| Free-shipping threshold / flat shipping fee | ₹{{1,999}} / ₹{{99}} | cart progress bar, announcement |
| Dispatch time / delivery time | {{1–2}} days / {{3–7}} days | PDP ETA, FAQ |
| GST rate(s) (from CA) + GSTIN | {{5}}% · 33XXXXX | cart GST line, footer, invoices |
| Legal business name + registered address | — | footer, policies, invoices |
| Phone, WhatsApp number, email, support hours | +91 … · Mon–Sat 10am–8pm | header/footer/contact, WhatsApp links |
| Grievance Officer name + email | — | footer, contact, policies (E-Commerce Rules 2020) |
| Authenticity marks you are licensed to claim | Silk Mark / Handloom Mark / none | PDP trust points (only if true) |
| Instagram / Facebook / YouTube URLs | real handles | footer (hidden if blank) |

---

## 13. Appendix — evidence

### 13.1 Route status (localhost:3001, 2026-09-25)
200: `/`, `/shop`, `/sarees`, `/cart`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/admin/login` · 307 (auth redirect): `/account`, `/admin/dashboard` · **404:** `/new-arrivals`, `/best-sellers`, `/offers`, `/about`, `/contact`, `/search`, `/checkout`.

### 13.2 Browser detector (impeccable detect.js injected) — per page counts
`/` 12 · `/shop` 12 · `/sarees` 16 · `/cart` 10 · `/login` 10. Rules: low-contrast (search placeholder 3.8:1 on white; newsletter placeholder 3.8:1; ink-400 on cream 3.3:1; shop price placeholders 3.1:1), undersized-ui-text (bottom nav labels 10px ×5), overused-font (Inter 85–93%), cream-palette (intentional — ignore), image-hover-transform (card/category `scale`), line-length (home SEO paragraph ~105ch). CLI detector over source: 0 findings.

### 13.3 Screenshots captured (scratchpad, not committed)
home/shop/category/cart/login/signup/forgot/reset/notfound/admin-login × desktop+mobile; mobile-menu-open (shows T2); mobile-filter-open; login/signup empty submit; home keyboard focus; logo placements (header desktop/mobile, footer, admin login).

### 13.4 Not verified (evaluator: please verify after `npm run db:seed`)
Populated product grids, PDP with variants/reviews, cart with lines, logged-in account pages, all admin pages post-login, real iOS Safari (zoom, safe-area), screen-reader pass (VoiceOver/NVDA), Lighthouse/CWV numbers.

---

## 14. Self-critique log (adversarial review of the draft, and what changed)

An independent reviewer agent checked 45 claims against the code, all 28 app routes and 62 components, the Next 16 docs in `node_modules/next/dist/docs`, internal consistency, specificity and Indian saree-commerce domain fit. The lead re-verified the high-impact items (add-to-cart server behaviour, `priority` deprecation, `retry()`, streaming soft-404, soft delete, `callbackUrl`) before applying them. Resolution of each finding:

| # | Finding | Verdict | Resolution |
|---|---|---|---|
| 1 | 45 fact checks; a few line numbers off by one (header :22, hero eyebrow :26, search-bar :30, footer :19) | Mostly confirmed | Line refs corrected |
| 2 | `addToCartAction` always returns success; no server stock/variant/published/qty checks — UI error states impossible without it | **Confirmed** by lead | New P1 T32 + §5.6 prerequisite + Phase 0 |
| 3 | Next 16: `error.tsx` uses `retry()` | **Confirmed** (error.md) | §4.4 updated |
| 4 | Next 16: `priority` deprecated; don't mix `preload` with `fetchPriority`; art-directed hero should use `getImageProps` + `<picture>` | **Confirmed** (image.md:285-293) | §5.2.1, §5.5 rewritten; **`<Logo>` migrated to `loading="eager"` in code this session**; T35 |
| 5 | Planned `loading.tsx` would turn `notFound()` into soft-404 and break slug `redirect()`; 3+-segment and `/admin` 404s render the root page without store chrome | **Confirmed** (loading.md:101-120) | §4.4: no group-level loading, resolve before streaming, admin not-found, root page gets minimal header |
| 6 | Reserved slugs incomplete; product/subcategory slug collision under `[categorySlug]/[slug]` | Confirmed | §4.1 full list + collision validation |
| 7 | Schema gaps: guest orders (`Order.userId` required), status history, coupon public flag, review status/helpful, rating aggregates, consent, stored discount % | Confirmed | §12.2 expanded |
| 8 | Plan introduced new dead links (FAQ, care guide, gift, visit store, refunds, help); bottom-nav /search still 404 after Phase 0 | Confirmed | §4.1 route map + exact interim list; §5.1.3/§5.1.4/§5.1.6 only link existing routes; §6.11/§6.12 added |
| 9 | Contradictions: Cormorant ≥24px vs 22px specs; 12px floor vs 10–11px badges; eyebrow ban vs labelled hairline; undefined `shadow-lvl2`; chip sizes; motion budget; "bag" with D4 open; 640–1023px loses account/wishlist | Confirmed | Type table fixed; 11px count-badge exemption; hairline motif is text-free; `shadow-1/2/3` tokens; motion budget rewritten; **"Cart" per brief**; one breakpoint table (§5.1.3) |
| 10 | Fabrication risks: "Verified Customer" fallback, guessed social handles, "verified reviews" count, value props from free-text tags, hard-coded returns/dispatch copy treated as truth | Confirmed | T30→P1, T33 new; §2.1 treats template copy as `{{…}}`; §5.6 value props from structured fields only; §5.2.5 wording |
| 11 | Domain gaps: fall & pico, blouse stitching + size guide (**later declined by owner, D17/D18**), need-by date, COD rules, UPI intent/EMI, gifting, festival edits, weight/blouse-type fields, handloom disclaimer, Grievance Officer, country of origin, TRAI DLT | Accepted | §6.12, §6.9 festival edits, §9.6 fields, footer Grievance Officer, §12.1 D17–D22, §12.3 |
| 12 | "5%/12% GST" slab select looks outdated after the Sept-2025 rationalisation | Accepted with caution (lead did not independently verify the current slab list) | GST made CA-configured, not hard-coded |
| 13 | Severity: OTP/Google P0 → P2; mega-menu P1 → simplify; placeholder social/WhatsApp, coupon UTC date, server cart validation → P1 | Accepted | Re-ranked; mega-menu replaced by a simple Sarees dropdown |
| 14 | Admin over-reach (⌘K, drag trees, focal picker, live preview, bulk price, audit diff); roadmap lacked a checkout phase; JWT sessions need token version | Accepted | Deferred to P3; "Checkout & orders" separate project; `User.tokenVersion` |
| 15 | Product delete is already soft; proxy already sets `callbackUrl`; `border-strong` on ivory is 2.98:1; `h-13` is valid in Tailwind v4 | **Confirmed** by lead | §9.4, §7.1, §3.1 (`border-stronger` 3.68:1), §3.5 corrected |

**Owner brief integration (second input, applied after the critique):** 9-category taxonomy with brief slugs/descriptions (§2.6); header items incl. Collections (§5.1.2); mobile header (§5.1.3); hero copy + two buttons (§5.2.1); category cards 3/2/2 with description, count and Explore (§5.2.2); product card with fabric, rating, visible Add to Cart and Quick View (§5.4); brief filter list incl. Occasion/Pattern/Border/Discount (§5.3); cart drawer (§5.7.1); Collections (§6.9); category SEO templates (§4.9); rounded/soft frames and smooth hover (§3.4, §3.6); JavaScript-vs-TypeScript conflict surfaced as D11 (keep TypeScript).

**Known limits of this plan (evaluator: verify):** logged-in account and all admin screens were reviewed from source only; populated grids/PDP were reviewed from code because the local DB has 0 products; no real-device iOS or screen-reader pass; performance targets are goals, not measured baselines.
