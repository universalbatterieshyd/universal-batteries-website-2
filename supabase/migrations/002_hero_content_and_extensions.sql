-- Additive migration: Hero content & extensions for Admin CMS
-- Run in Supabase SQL Editor after main schema

-- Hero banners (homepage content manager)
CREATE TABLE IF NOT EXISTS hero_content (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  headline TEXT NOT NULL,
  subheadline TEXT,
  cta_primary_text TEXT,
  cta_primary_link TEXT,
  cta_secondary_text TEXT,
  cta_secondary_link TEXT,
  background_image_url TEXT,
  tagline TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default hero if empty
INSERT INTO hero_content (headline, subheadline, cta_primary_text, cta_secondary_text, tagline, "order")
SELECT 'Powering Homes, Businesses & Industries', 'Your trusted partner for genuine batteries, expert service, and reliable power solutions across Hyderabad for over 30 years.', 'WhatsApp Us', 'Call: +91 9391026003', 'Since 1992 • Trusted Power Solutions', 0
WHERE NOT EXISTS (SELECT 1 FROM hero_content LIMIT 1);

-- Extend site_settings with new keys (upsert on first admin use)
INSERT INTO site_settings (key, value) VALUES
  ('address', '2-4-78, M.G. Road, Secunderabad - 500003'),
  ('hero_tagline', 'Since 1992 • Trusted Power Solutions'),
  ('emergency_phone', ''),
  ('logo_url', ''),
  ('favicon_url', ''),
  ('facebook_url', ''),
  ('instagram_url', ''),
  ('linkedin_url', '')
ON CONFLICT (key) DO NOTHING;
