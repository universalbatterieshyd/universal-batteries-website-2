-- Category pages & subcategories
-- Extend product_category for editable category pages; add parent_id for subcategories

-- Add parent_id for subcategories (NULL = top-level category)
ALTER TABLE product_category ADD COLUMN IF NOT EXISTS parent_id TEXT REFERENCES product_category(id) ON DELETE SET NULL;

-- Category page content
ALTER TABLE product_category ADD COLUMN IF NOT EXISTS hero_headline TEXT;
ALTER TABLE product_category ADD COLUMN IF NOT EXISTS hero_tagline TEXT;
ALTER TABLE product_category ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE product_category ADD COLUMN IF NOT EXISTS overview TEXT;
ALTER TABLE product_category ADD COLUMN IF NOT EXISTS cta_headline TEXT;
ALTER TABLE product_category ADD COLUMN IF NOT EXISTS cta_subtext TEXT;
ALTER TABLE product_category ADD COLUMN IF NOT EXISTS faq_items JSONB DEFAULT '[]';
ALTER TABLE product_category ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE product_category ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Index for listing top-level categories and subcategories
CREATE INDEX IF NOT EXISTS idx_product_category_parent ON product_category(parent_id);
