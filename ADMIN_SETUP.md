# Admin CMS Setup Guide

## Architecture: Vercel + GitHub + Supabase

- **Frontend & Admin**: Next.js
- **API**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email/password)
- **Deploy**: Vercel

---

## 1. Supabase Setup

### Create a Supabase project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Note your **Project URL** and **API keys** (Settings → API)

### Run the schema
1. In Supabase Dashboard → **SQL Editor** → New query
2. Run `supabase/schema.sql` (main tables)
3. Run `supabase/migrations/002_hero_content_and_extensions.sql` (hero_content + extended settings)

### Create admin user
In Supabase Dashboard → **Authentication** → **Users** → Add user:
- Email: your admin email
- Password: (set a secure password)

Or run the seed script (see below).

---

## 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
CONTACT_EMAIL="your@email.com"
NEXT_PUBLIC_BUSINESS_PHONE="+91 9391026003"
NEXT_PUBLIC_WHATSAPP_NUMBER="919391026003"
NEXT_PUBLIC_SITE_URL="https://universalbatteries.co.in"
```

---

## 3. Seed Database (Optional)

```bash
npm run db:seed
```

This creates a default admin user and site settings.

---

## 4. Run Locally

```bash
npm install
npm run dev
```

- **Public site**: http://localhost:3000
- **Admin**: http://localhost:3000/admin (login required)

---

## 5. Deploy to Vercel

1. Push to GitHub
2. Connect repo at [vercel.com](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy

---

## Admin Features (Phase 1)

| Section | Purpose |
|---------|---------|
| **Dashboard** | Counts for branches, testimonials, products, inquiries |
| **Homepage** | Edit hero headline, subheadline, tagline, CTAs, background image |
| **Branches** | Add/edit branch locations |
| **Testimonials** | Add/edit/approve testimonials |
| **Products** | Manage categories and products |
| **Inquiries** | View contact & enterprise leads, mark contacted, export |
| **Settings** | Phone, WhatsApp, email, hours |

---

## Troubleshooting

- **"Table does not exist"**: Run the migrations in Supabase SQL Editor
- **Login fails**: Ensure admin user exists in Supabase Auth
- **Build fails**: Check env vars are set for production (Vercel)
