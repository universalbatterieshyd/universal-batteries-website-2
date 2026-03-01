-- Hero CTA chips with optional background images
-- Each chip: label, href, icon, image_url (optional)
-- Recommended image size: 400×400px (square) for best display

ALTER TABLE hero_content ADD COLUMN IF NOT EXISTS cta_chips JSONB DEFAULT NULL;

-- Default chips when column is empty (app fallback handles this; DB default for new rows)
COMMENT ON COLUMN hero_content.cta_chips IS 'Array of {label, href, icon, image_url?}. Icons: Home, Building2, Battery, Package. Image size: 400×400px recommended.';
