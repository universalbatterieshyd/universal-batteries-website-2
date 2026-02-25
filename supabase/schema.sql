-- Universal Batteries - Full Database Schema
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Then run 002_hero_content_and_extensions.sql for admin CMS extensions

-- Branches
CREATE TABLE IF NOT EXISTS branch (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  hours TEXT,
  manager TEXT,
  maps_url TEXT,
  is_main BOOLEAN DEFAULT FALSE,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product categories
CREATE TABLE IF NOT EXISTS product_category (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  "order" INT DEFAULT 0
);

-- Products
CREATE TABLE IF NOT EXISTS product (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category_id TEXT NOT NULL REFERENCES product_category(id) ON DELETE CASCADE,
  specifications TEXT,
  brands TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonial (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  quote TEXT NOT NULL,
  role TEXT NOT NULL,
  area TEXT,
  customer_name TEXT,
  rating INT DEFAULT 5,
  is_approved BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Banners (for future use)
CREATE TABLE IF NOT EXISTS banner (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  headline TEXT NOT NULL,
  subheadline TEXT,
  cta_text TEXT,
  cta_link TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submission (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  query_type TEXT DEFAULT 'general',
  message TEXT NOT NULL,
  contacted BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enterprise lead submissions
CREATE TABLE IF NOT EXISTS enterprise_lead (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  required_quantity TEXT NOT NULL,
  timeline TEXT NOT NULL,
  comments TEXT,
  contacted BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site settings (key-value)
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default site settings
INSERT INTO site_settings (key, value) VALUES
  ('phone', '+91 9391026003'),
  ('whatsapp', '919391026003'),
  ('email', 'universalbatterieshyd@gmail.com'),
  ('address', '2-4-78, M.G. Road, Secunderabad - 500003'),
  ('gst', ''),
  ('hours', 'Mon-Sat: 9 AM - 7 PM, Sun: 10 AM - 4 PM'),
  ('site_url', 'https://universalbatteries.co.in')
ON CONFLICT (key) DO NOTHING;
