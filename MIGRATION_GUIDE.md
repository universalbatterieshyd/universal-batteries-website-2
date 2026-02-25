# Migration Guide: Bringing the UI to Full Functionality

This document describes how to bring **Universal Batteries Website_2** to the same functionality as **Universal Batteries Website** (current app) **without altering the UI**. All backend logic, middleware, auth, API routes, and Supabase integration from the current app are wired into this codebase.

---

## Table of Contents

1. [Overview & Strategy](#1-overview--strategy)
2. [Current App Functionality Inventory](#2-current-app-functionality-inventory)
3. [Website_2 App Inventory](#3-website_2-app-inventory)
4. [Migration Approach](#4-migration-approach)
5. [Detailed Step-by-Step Migration](#5-detailed-step-by-step-migration)
6. [Middleware & Auth Wiring](#6-middleware--auth-wiring)
7. [API & Data Layer Integration](#7-api--data-layer-integration)
8. [Admin Panel Integration](#8-admin-panel-integration)
9. [Environment & Deployment](#9-environment--deployment)
10. [Design Guidelines: Avoid the “Shop” Look](#10-design-guidelines-avoid-the-shop-look)
11. [Verification Checklist](#11-verification-checklist)

---

## 1. Overview & Strategy

**Goal:** Use Website_2 as the visual/UI base. Add all functionality from the current app (Supabase, admin panel, forms, dynamic data) so that Website_2’s UI remains unchanged while gaining full backend capability.

**Recommended Approach:** Migrate Website_2 into a **Next.js** app so that:

- Website_2 components become the public-facing frontend (unchanged visually)
- API routes and Supabase stay server-side (as in the current app)
- Admin panel and auth work via Next.js middleware and server components
- Single codebase, single deploy

**Alternative:** Keep Website_2 as a Vite SPA and connect it to a separate backend (Next.js API or Supabase client). Section [4.2](#42-alternative-keep-website_2-as-vite-spa--backend-api) covers this.

---

## 2. Current App Functionality Inventory

### 2.1 Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS 4 |
| Database | Supabase |
| Auth | Supabase Auth (email/password) |
| Session | `@supabase/ssr` (cookie-based) |

### 2.2 API Routes

| Route | Methods | Auth Required | Purpose |
|-------|---------|---------------|---------|
| `/api/contact` | POST | No | Contact form → `contact_submission` |
| `/api/enterprise` | POST | No | Enterprise form → `enterprise_lead` |
| `/api/branches` | GET, POST | GET: No, POST: Yes | List/create branches |
| `/api/branches/[id]` | GET, PATCH, DELETE | GET: No, PATCH/DELETE: Yes | Branch CRUD |
| `/api/categories` | GET, POST | GET: No, POST: Yes | Product categories |
| `/api/products` | GET, POST | GET: No, POST: Yes | Products (optional `?category=slug`) |
| `/api/products/[id]` | PATCH, DELETE | Yes | Update/delete product |
| `/api/settings` | GET, PUT | GET: No, PUT: Yes | Site settings |
| `/api/testimonials` | GET, POST | GET: No, POST: Yes | Testimonials CRUD |
| `/api/testimonials/[id]` | PATCH, DELETE | Yes | Update/delete testimonial |
| `/api/inquiries` | GET | Yes | Contact + enterprise inquiries |
| `/api/inquiries/contact/[id]` | PATCH | Yes | Mark contact as contacted, notes |
| `/api/inquiries/enterprise/[id]` | PATCH | Yes | Mark enterprise lead as contacted, notes |

### 2.3 Middleware & Session Logic

**File:** `proxy.ts` (root) – session refresh and route protection.  

**Important:** Next.js expects `middleware.ts` with a default export. The current app uses `proxy.ts` with a named export. This must be wired as the Next.js middleware.

**File:** `lib/supabase/update-session.ts`

- Validates JWT and refreshes session
- Protects `/admin/*` (except `/admin/login`)
- Redirects unauthenticated users to `/admin/login`
- Redirects authenticated users away from `/admin/login` to `/admin`
- **Matcher:** Skips `_next/static`, `_next/image`, favicon, images (svg, png, jpg, jpeg, gif, webp)

**Correct wiring:** Rename/refactor so the logic runs from `middleware.ts` (see Section 6).

### 2.4 Auth Flow

1. **Login:** `/admin/login` uses Supabase `signInWithPassword` (client)
2. **Session:** Server validates JWT via `updateSession` (middleware)
3. **Server checks:** `lib/auth.ts` → `getSupabaseSession()` for layout and API routes
4. **Sign out:** Client `supabase.auth.signOut()` + redirect to `/admin/login`
5. **Supabase clients:**
   - `lib/supabase/client` – browser (anon key)
   - `lib/supabase/server` – server with cookies
   - `lib/supabase.ts` – service role for API and server logic

### 2.5 Supabase Schema (Tables)

| Table | Purpose |
|-------|---------|
| `branch` | Branch locations (name, address, phone, hours, maps_url, is_main, order) |
| `product_category` | Categories (name, slug, description, order) |
| `product` | Products (title, slug, description, category_id, specs, brands, image_url, is_active, order) |
| `testimonial` | Testimonials (quote, role, area, customer_name, rating, is_approved, image_url, order) |
| `banner` | Reserved for future use |
| `contact_submission` | Contact form (name, phone, email, query_type, message, contacted, notes) |
| `enterprise_lead` | Enterprise form (company_name, contact_person, email, phone, quantity, timeline, comments, contacted, notes) |
| `site_settings` | Key-value (phone, whatsapp, email, gst, hours, site_url) |

**RLS:** Disable automatic RLS if using service role for server-side operations. Configure via Supabase Dashboard.

### 2.6 Admin Panel Routes

| Route | Feature |
|-------|---------|
| `/admin` | Dashboard (branch, testimonial, product, contact, enterprise counts) |
| `/admin/login` | Supabase Auth login |
| `/admin/branches` | Branches CRUD |
| `/admin/testimonials` | Testimonials CRUD, approve/hide |
| `/admin/products` | Categories + products CRUD |
| `/admin/inquiries` | Contact + enterprise inquiries, mark contacted, CSV export |
| `/admin/settings` | Phone, WhatsApp, email, GST, hours |

### 2.7 Site Settings Provider

- **File:** `components/providers/SiteSettingsProvider.tsx`
- Root layout fetches `getSiteSettings()` (from `lib/site-settings.ts`) and passes to `SiteSettingsProvider`
- Components use `useSiteSettings()` for phone, whatsapp, email, hours, site_url, gst

### 2.8 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://YOUR-PROJECT-REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR-ANON-KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR-SERVICE-ROLE-KEY"

# Contact
CONTACT_EMAIL="YOUR-EMAIL@example.com"
NEXT_PUBLIC_BUSINESS_PHONE="+91-XXXXXXXXXX"
NEXT_PUBLIC_WHATSAPP_NUMBER="91XXXXXXXXXX"

# Site
NEXT_PUBLIC_SITE_URL="https://universalbatteries.co.in"
```

### 2.9 Special Files

- `lib/db-utils.ts` – `toCamelCase`, `toCamelCaseArray`, `toSnakeCase` for API
- `scripts/seed.ts` – Admin user, site settings, categories, sample branch, testimonials
- `app/sitemap.ts` – Static sitemap
- `app/robots.ts` – Robots.txt

---

## 3. Website_2 App Inventory

### 3.1 Tech Stack

| Component | Technology |
|-----------|------------|
| Build | Vite 5 |
| Framework | React 18 |
| Routing | react-router-dom v6 |
| UI | shadcn/ui (Radix), Tailwind CSS 3 |
| State | TanStack React Query (installed, not used) |
| Animations | framer-motion |

### 3.2 Structure

```
src/
├── App.tsx
├── main.tsx
├── index.css          # Design tokens, .glass-card, .gradient-hero
├── pages/
│   ├── Index.tsx      # Home: Navbar, Hero, ProductCategories, WhyChooseUs, Testimonials, ContactCTA, Footer
│   └── NotFound.tsx
├── components/
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── ProductCategories.tsx
│   ├── WhyChooseUs.tsx
│   ├── Testimonials.tsx
│   ├── ContactCTA.tsx
│   ├── Footer.tsx
│   └── ui/            # shadcn components
└── assets/
    └── hero-batteries.jpg
```

### 3.3 Current Content (All Static)

- **Navbar:** Hash links (#home, #products, #services, #about, #contact), “Dealer Login”
- **Hero:** hero-batteries.jpg, trust badges (25+ Years, Pan-Hyderabad, etc.)
- **ProductCategories:** 6 static categories
- **Testimonials:** 3 hardcoded
- **ContactCTA:** Static address, phone, email, hours
- **Design tokens:** HSL variables, `.glass-card`, `.gradient-hero` in `index.css`

### 3.4 What Website_2 Lacks

- No API calls
- No Supabase
- No admin panel
- No dynamic branches, testimonials, settings
- No contact/enterprise form submission
- Single-page layout with hash navigation

---

## 4. Migration Approach

### 4.1 Recommended: Migrate Website_2 into Next.js

1. Create a new Next.js app (or clone the current app)
2. Copy Website_2’s `src/` into the Next.js project
3. Replace the public-facing pages with Website_2 components (no UI changes)
4. Copy all API routes, `lib/`, Supabase setup, admin pages from the current app
5. Wire middleware for session/auth
6. Replace `react-router` usage with Next.js routing where needed (e.g. Link, navigation)
7. Swap hardcoded data for server data or client fetching from API

Result: One Next.js app with Website_2 UI and full backend functionality.

### 4.2 Alternative: Keep Website_2 as Vite SPA + Backend API

1. Deploy the current app’s API (e.g. Next.js on Vercel)
2. Add Supabase client and API client to Website_2
3. Website_2 fetches branches, testimonials, settings from API or Supabase
4. Admin panel: deploy current Next.js app at `/admin` or as a separate subdomain
5. No server-side middleware in Website_2; admin auth is client-side or via API tokens

Result: Two deployables (API + Website_2 SPA) or one API with admin plus one SPA.

---

## 5. Detailed Step-by-Step Migration

This section assumes the **recommended approach** (Website_2 migrated into Next.js).

### Phase 1: Project Setup

1. **Create Next.js app** (if starting fresh):
   ```bash
   npx create-next-app@latest universal-batteries --typescript --tailwind --app --no-src-dir
   ```

2. **Copy from Website_2:**
   - `src/components/` → `components/` (Navbar, Hero, ProductCategories, WhyChooseUs, Testimonials, ContactCTA, Footer)
   - `src/components/ui/` → `components/ui/` (all shadcn components)
   - `src/assets/` → `public/` or `app/` assets
   - `src/index.css` → merge design tokens and utilities into `app/globals.css` (or keep as separate CSS)

3. **Copy from current app (Website):**
   - `app/api/` – all API route directories and `route.ts` files
   - `lib/` – supabase, auth, site-settings, db-utils
   - `supabase/schema.sql`
   - `scripts/seed.ts`
   - Admin components and pages: `app/admin/`, `components/admin/`
   - `components/providers/SiteSettingsProvider.tsx`
   - `proxy.ts`, `lib/supabase/update-session.ts`

### Phase 2: Adapt Website_2 Components (Without Changing UI)

**Rule:** Only change routing, data source, and form submission behavior. Do not change layout, styles, or content structure.

| Website_2 Component | Changes Required |
|-------------------|------------------|
| `Navbar` | Replace hash links with Next.js `Link` to `/`, `/products`, `/services`, `/about`, `/contact`. “Dealer Login” → `Link` to `/admin` or `/admin/login`. |
| `Hero` | Replace static phone/WhatsApp with `useSiteSettings()`. Keep hero image, badges, copy as-is. |
| `ProductCategories` | Fetch categories from API or server; map to same card layout. Use heading “What We Offer” or “Power Solutions”, not “Products” or “Shop”. Cards link to info/contact, not “Buy”. Preserve design. |
| `WhyChooseUs` | No data change; keep static content. |
| `Testimonials` | Fetch from `/api/testimonials` or server; map to same card layout. Preserve design. |
| `ContactCTA` | Use `useSiteSettings()` for phone, email, address, hours. Add contact form that POSTs to `/api/contact`. |
| `Footer` | Use `useSiteSettings()` for contact info. Links from hash → proper routes. |

### Phase 3: Routing Structure

**Next.js pages (public):**

| Path | Website_2 Source | Data |
|------|----------------|------|
| `/` | Index (Hero, ProductCategories, WhyChooseUs, Testimonials, ContactCTA) | Branches, testimonials, settings from server/API |
| `/about` | New or minimal page | Static or settings |
| `/contact` | Contact page (form + ContactCTA-style content) | Settings |
| `/enterprise` | Enterprise form page | Settings |
| `/branches` | Branches list | Branch data |
| `/testimonials` | Testimonials page | Testimonial data |
| `/products` | Products listing | Categories/products |
| `/products/[slug]` | Product detail | Single product |

**Admin (unchanged from current app):**

- `/admin`, `/admin/login`, `/admin/branches`, `/admin/testimonials`, `/admin/products`, `/admin/inquiries`, `/admin/settings`

### Phase 4: Layout Integration

**Root layout** (`app/layout.tsx`):

- Fetch `getSiteSettings()` (server)
- Wrap children in `SiteSettingsProvider` with `initialSettings`
- Use Website_2’s `Navbar` and `Footer` instead of current Header/Footer
- Add WhatsApp floating button if desired
- Add `LocalBusinessSchema` for SEO

**Admin layout** (`app/admin/layout.tsx`):

- Keep current structure (session check, AdminSidebar, children)

---

## 6. Middleware & Auth Wiring

### 6.1 Wire Next.js Middleware

The current app has `proxy.ts` exporting `proxy`, but Next.js expects `middleware.ts` with a default export.

**Create `middleware.ts` at project root:**

```typescript
// middleware.ts
import { updateSession } from '@/lib/supabase/update-session'

export async function middleware(request: import('next/server').NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

Or, if you prefer a default export:

```typescript
import { updateSession } from '@/lib/supabase/update-session'
import type { NextRequest } from 'next/server'

export default async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 6.2 `update-session.ts` Behavior

- Creates Supabase server client with cookie handlers
- Runs `supabase.auth.getClaims()` for JWT validation
- If path starts with `/admin` and is not `/admin/login` and no user → redirect to `/admin/login`
- If path is `/admin/login` and user exists → redirect to `/admin`
- Otherwise returns `NextResponse.next({ request })`

### 6.3 Supabase Client Setup

**Files to copy:**

- `lib/supabase/client.ts` – browser client with anon key
- `lib/supabase/server.ts` – server client with cookies
- `lib/supabase.ts` – service role client for API
- `lib/supabase/update-session.ts` – used by middleware

---

## 7. API & Data Layer Integration

### 7.1 API Routes

Copy the entire `app/api/` directory from the current app. Ensure:

- `lib/supabase.ts` is used for all Supabase operations in API routes
- `getSupabaseSession()` from `lib/auth.ts` is used for protected routes
- Request/response shapes stay the same so Website_2’s fetch calls work

### 7.2 Data Flow for Website_2 Components

| Component | Data Source | Integration |
|-----------|-------------|-------------|
| Navbar | Site settings | `SiteSettingsProvider` (phone, WhatsApp in header) |
| Hero | Site settings | `useSiteSettings()` for CTAs |
| ProductCategories | `/api/categories` or server | Fetch in page, pass as props |
| Testimonials | `/api/testimonials` (is_approved) | Fetch in page, pass as props |
| ContactCTA | Site settings, `/api/contact` | `useSiteSettings()` + form POST |
| Footer | Site settings | `useSiteSettings()` |
| Branches page | `/api/branches` | Fetch in page or component |

### 7.3 Contact & Enterprise Forms

- **Contact:** POST to `/api/contact` with `{ name, phone, email?, queryType?, message }`
- **Enterprise:** POST to `/api/enterprise` with `{ companyName, contactPerson, email, phone, requiredQuantity, timeline, comments? }`
- Both APIs use `supabase.from('contact_submission')` and `supabase.from('enterprise_lead')` with service role

---

## 8. Admin Panel Integration

### 8.1 Copy Admin Structure

From the current app, copy:

- `app/admin/` (all pages and layout)
- `components/admin/` (AdminSidebar, managers, etc.)
- Admin-specific UI components

### 8.2 Auth Flow

1. User visits `/admin` or any `/admin/*` except `/admin/login`
2. Middleware checks session; if none, redirect to `/admin/login`
3. User signs in on `/admin/login` via Supabase `signInWithPassword`
4. Middleware sees session and allows access; from `/admin/login` redirects to `/admin`
5. Layout and API routes use `getSupabaseSession()` for server-side checks

### 8.3 Admin Seed

Run `npm run db:seed` (or `npx tsx scripts/seed.ts`) to create:

- Admin user (email/password in Supabase Auth)
- Default site settings
- Product categories
- Sample branch and testimonials

---

## 9. Environment & Deployment

### 9.1 Environment Variables

Use the same variables as in Section 2.8. Create `.env.local` with:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CONTACT_EMAIL`
- `NEXT_PUBLIC_BUSINESS_PHONE`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_SITE_URL`

### 9.2 Dependencies to Add

From current app:

- `@supabase/ssr`
- `@supabase/supabase-js`
- `dotenv` (for seed script)

From Website_2 (if not already present):

- shadcn/Radix UI components as used
- `framer-motion`
- `@tanstack/react-query` (optional, for client data fetching)

### 9.3 Build & Deploy

- Build: `npm run build`
- Seed (once): `npx tsx scripts/seed.ts`
- Deploy to Vercel/Netlify/other; ensure middleware runs on all non-static paths

---

## 10. Design Guidelines: Avoid the "Shop" Look

The site should read as a **trusted B2B/service partner and solutions provider**, not a retail shop or e-commerce store. During migration and future updates, follow these guidelines so the experience stays professional and consultative.

### 10.1 Positioning & Tone

| Avoid (Shop/Retail) | Prefer (Service/Partner) |
|---------------------|---------------------------|
| “Shop our batteries” | “Power solutions we offer” |
| “Browse products” | “Explore solutions” or “What we offer” |
| “Add to cart” | “Get a quote” or “Contact us” |
| “Buy now” | “Request consultation” or “Talk to an expert” |
| “Checkout” | Not applicable |
| Promotional banners (“50% off”, “Flash sale”) | Trust signals (“25+ years”, “Authorized dealer”, “Same-day service”) |

**Tone:** Expert, reliable, consultative. Lead with experience, trust, and service—not product catalog and prices.

### 10.2 Call-to-Action (CTA) Language

| Use | Avoid |
|-----|-------|
| Get a Quote | Buy Now |
| Request a Callback | Add to Cart |
| Speak to an Expert | Shop Now |
| WhatsApp Us | Order Online |
| Visit Our Branch | Checkout |
| Emergency Support | Sale |

### 10.3 Navigation & Section Labels

| Avoid | Prefer |
|-------|--------|
| Shop / Products | Solutions / What We Offer |
| Catalog | Power Solutions |
| Cart / Checkout | Remove entirely |
| Deals / Offers | Trust / Why Choose Us |

Keep primary nav focused on: Home, Solutions, Services, About, Branches, Contact. Avoid a prominent “Shop” or “Products” tab that suggests browsing to buy.

### 10.4 Content Hierarchy

1. **Lead with trust and expertise** – Hero: “Powering Homes, Businesses & Industries”, trust badges, legacy (“Since 1971”).
2. **Solutions, not a catalog** – Product categories presented as “What We Offer” or “Power Solutions” (Automotive, UPS, Solar, etc.), not as a product grid with prices.
3. **Service and support** – Emphasize expert guidance, installation, emergency support, same-day service.
4. **Social proof** – Testimonials, authorized brands, locations.
5. **Low emphasis on transactional product detail** – No product cards with “Add to cart” or prominent pricing; use “Learn more” or “Get a quote” instead.

### 10.5 Page-Level Guidelines

- **Product Categories:** Present as solution cards (“Automotive Batteries”, “UPS & Inverter”) linking to info/contact, not product listings. No prices or “Buy” buttons.
- **Product Detail (if used):** Describe the solution, specs, brands; CTA should be “Get a quote” or “Contact for pricing”, never “Add to cart”.
- **Homepage:** Trust badges, hero with CTA to contact, Why Choose Us, Testimonials, Branches preview. Avoid product grids with prices.
- **Branches:** Emphasize “Visit us” and “Get expert help locally”, not “Pick up order”.

### 10.6 Visual & UI Patterns to Avoid

- Shopping cart icon in main nav
- “Checkout” or multi-step “Place order” flows
- Promo banners (“Sale”, “Limited time offer”, countdown timers)
- Product cards with price + “Add to cart”
- Checkout-style forms (payment, shipping address)

### 10.7 Visual & UI Patterns to Use

- Phone / WhatsApp as primary CTAs
- “Get a Quote” and “Contact us” buttons
- Trust badges (years in business, pan-city delivery, authorized dealer)
- Expert/support messaging (“Emergency support”, “Same-day service”)
- Branch locations and “Visit us” links

### 10.8 Naming in Components and Routes

When mapping Website_2 components:

- **ProductCategories** → Use label “What We Offer” or “Power Solutions”, not “Products” or “Shop”
- **`/products`** route → Consider `/solutions` or keep `/products` but style content as solution pages, not a catalog
- **ContactCTA** → Keep as “Get in touch” / “Request a call”, not “Place order”

---

## 11. Verification Checklist

### Middleware & Auth

- [ ] `middleware.ts` exists and exports the session/update logic
- [ ] Unauthenticated access to `/admin` redirects to `/admin/login`
- [ ] Authenticated access to `/admin/login` redirects to `/admin`
- [ ] API routes requiring auth return 401 when no session

### Data & API

- [ ] Site settings load in `SiteSettingsProvider`
- [ ] Branches display on branches page
- [ ] Testimonials display (only approved)
- [ ] Product categories and products display
- [ ] Contact form POSTs to `/api/contact` and saves to Supabase
- [ ] Enterprise form POSTs to `/api/enterprise` and saves to Supabase

### Admin Panel

- [ ] Login works with Supabase Auth
- [ ] Dashboard shows counts
- [ ] Branches CRUD works
- [ ] Testimonials CRUD and approval work
- [ ] Products and categories CRUD work
- [ ] Inquiries view, mark contacted, CSV export work
- [ ] Settings update persists

### UI Preservation

- [ ] Navbar, Hero, ProductCategories, WhyChooseUs, Testimonials, ContactCTA, Footer look identical
- [ ] Site follows [Section 10](#10-design-guidelines-avoid-the-shop-look): no shop-style CTAs, product grids with prices, or cart/checkout flows
- [ ] Design tokens (`.glass-card`, `.gradient-hero`, colors) preserved
- [ ] Hero image and trust badges unchanged
- [ ] Animations and interactions preserved

---

## Appendix A: File Mapping

| Current App (Source) | Target (After Migration) |
|----------------------|---------------------------|
| `proxy.ts` | Logic moved to `middleware.ts` |
| `lib/supabase/*` | `lib/supabase/*` |
| `lib/auth.ts` | `lib/auth.ts` |
| `lib/site-settings.ts` | `lib/site-settings.ts` |
| `lib/db-utils.ts` | `lib/db-utils.ts` |
| `app/api/*` | `app/api/*` |
| `app/admin/*` | `app/admin/*` |
| `components/admin/*` | `components/admin/*` |
| `components/providers/*` | `components/providers/*` |
| Website_2 `src/components/*` | `components/*` (public UI) |
| Website_2 `src/index.css` | Merged into `app/globals.css` |
| Website_2 `src/assets/*` | `public/*` |

---

## Appendix B: Design Tokens (Preserve)

From Website_2 `src/index.css`, keep these in `globals.css`:

```css
:root {
  --primary: 357 82% 49%;
  --primary-foreground: 0 0% 100%;
  --secondary: 208 100% 28%;
  --secondary-foreground: 0 0% 100%;
  --gradient-hero: linear-gradient(135deg, hsl(208 100% 28%) 0%, hsl(357 82% 49%) 100%);
  --gradient-subtle: linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(0 0% 98%) 100%);
  --glass-bg: hsl(0 0% 100% / 0.7);
  --glass-border: hsl(0 0% 100% / 0.2);
  --shadow-glass: 0 8px 32px 0 hsl(0 0% 0% / 0.1);
}

.glass-card { ... }
.gradient-hero { ... }
.gradient-subtle { ... }
```

---

*Document version: 1.1 — Last updated: February 2025*
