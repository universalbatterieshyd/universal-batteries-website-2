-- Homepage sections - drag-and-drop configurable layout (WordPress-style)
CREATE TABLE IF NOT EXISTS homepage_sections (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  section_key TEXT UNIQUE NOT NULL,
  "order" INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  config JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default sections in display order (only seed when table is empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM homepage_sections LIMIT 1) THEN
    INSERT INTO homepage_sections (section_key, "order", is_visible) VALUES
      ('hero', 0, true),
      ('product_categories', 1, true),
      ('why_choose_us', 2, true),
      ('testimonials', 3, true),
      ('contact_cta', 4, true);
  END IF;
END $$;
