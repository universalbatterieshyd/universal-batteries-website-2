-- Card image for product category (homepage section)
-- Distinct from hero_image_url (category page banner)
-- Recommended: 640×400px landscape, web-optimized JPG/WebP (~100-150KB)
-- Prevents pixelation on retina while keeping file size small

ALTER TABLE product_category ADD COLUMN IF NOT EXISTS card_image_url TEXT;

COMMENT ON COLUMN product_category.card_image_url IS 'Homepage section card image. 640×400px recommended. Leave empty for icon-only card.';
