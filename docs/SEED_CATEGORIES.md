# Seeding Product Categories

To add all categories and subcategories with full SEO/AEO content directly to the database:

## Option 1: Supabase SQL Editor

1. Open your Supabase project → **SQL Editor**
2. Create a new query
3. Copy the contents of `supabase/migrations/015_seed_product_categories.sql`
4. Paste and click **Run**

## Option 2: Supabase CLI

```bash
supabase db push
```

## What gets seeded

- **4 top-level categories:** Automotive Batteries, Power Backup Systems, Solar Energy Solutions, Support & Services
- **10 subcategories** with full content:
  - Automotive: Two‑wheeler, Car & SUV, Truck/Tractor/Genset
  - Power Backup: Home Inverters, Commercial Inverters, Line‑interactive UPS, Online UPS & Racks
  - Solar: Home Rooftop, Business & Institutional, Off‑grid & Hybrid

Each category/subcategory includes:
- `hero_headline`, `hero_tagline`, `hero_image_url`
- `overview` (main content)
- `faq_items` (JSONB)
- `cta_headline`, `cta_subtext`
- `meta_title`, `meta_description` (top-level only)

## Image paths

The migration uses paths like `/images/hero-automotive-batteries.jpg`. Add these images to your `public/images/` folder or update the URLs in Admin after seeding.

## Idempotent

Safe to run multiple times. Existing categories (matched by slug) are updated, not duplicated.
