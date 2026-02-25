# Admin CMS Implementation Plan

## Architecture: Vercel + GitHub + Supabase

- **Frontend**: Next.js (migrated from Vite) - public pages + admin
- **API**: Next.js API Routes (server-side)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email/password)
- **Deploy**: Vercel (single deploy)
- **Source**: GitHub

## Existing Supabase Schema (from Universal Batteries Website)

| Table | Purpose |
|-------|---------|
| `branch` | name, address, phone, email, hours, manager, maps_url, is_main, order |
| `product_category` | name, slug, description, order |
| `product` | title, slug, description, category_id, specs, brands, image_url, is_active, order |
| `testimonial` | quote, role, area, customer_name, rating, is_approved, image_url, order |
| `banner` | headline, subheadline, cta_text, cta_link, image_url, is_active, order |
| `contact_submission` | name, phone, email, query_type, message, contacted, notes |
| `enterprise_lead` | company_name, contact_person, email, phone, required_quantity, timeline, comments, contacted, notes |
| `site_settings` | key-value (phone, whatsapp, email, gst, hours, site_url) |

## Additive Schema Extensions (New Tables)

### Phase 1 – Core CMS (This Implementation)
- **`hero_content`** – Homepage hero banners (headline, subheadline, cta text, image, order, active)
- **`site_settings`** – Extend keys: hero_tagline, emergency_phone, social_links (JSON), logo_url, favicon_url

### Phase 2 – Dealer & Services
- **`dealer_registration`** – dealer_name, city, monthly_volume, brands, gst_number, contact details, status (pending/approved/rejected), notes
- **`service`** – title, description, image_url, coverage_area, cta_link, order, is_active

### Phase 3 – Advanced (Future)
- **`admin_role`** – role-based access (super_admin, content_manager, branch_manager, marketing)
- **`activity_log`** – user_id, action, entity, entity_id, changes, created_at
- **`media`** – Central image library
- **`promotion_banner`** – Seasonal banners with start/end date
- **`seo_meta`** – Per-page meta title, description, og_image

## Implementation Phases

### Phase 1 – Migration & Core Admin (Current Scope)
1. Migrate project from Vite to Next.js
2. Copy lib/, API routes, admin from parent project
3. Preserve Website_2 UI components (Hero, ProductCategories, etc.)
4. Add hero_content management
5. Extend site_settings for homepage/contact
6. Wire frontend to fetch from API/Supabase

### Phase 2 – Dealer & Services
7. Dealer registration form + admin approval
8. Services manager
9. Extend branches (whatsapp, images)

### Phase 3 – Full Blueprint
10. Role-based access
11. Activity logging
12. Media manager
13. Banner/promotion manager
14. SEO settings
15. Analytics integration
16. Notifications (email/WhatsApp alerts)

## Admin Routes (Phase 1) ✅ Implemented

| Route | Feature | Status |
|-------|---------|--------|
| `/admin` | Dashboard | Done |
| `/admin/login` | Auth | Done |
| `/admin/homepage` | Hero content editor | Done |
| `/admin/branches` | Branches CRUD | Done |
| `/admin/testimonials` | Testimonials CRUD | Done |
| `/admin/products` | Categories + Products | Done |
| `/admin/inquiries` | Contact + Enterprise leads | Done |
| `/admin/settings` | Site settings | Done |

## Design Principles

1. **Additive** – Reuse existing tables, extend with new columns/tables as needed
2. **Non-breaking** – Same Supabase project; no schema changes to existing tables unless additive
3. **Modular** – Admin sections as independent modules
4. **Mobile-accessible** – Responsive admin UI
5. **Sidebar navigation** – Clean, not overwhelming
