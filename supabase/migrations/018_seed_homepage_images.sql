-- Seed homepage hero, CTA chips, and category card images (WebP under /public/images)
-- Safe to re-run: only fills empty URLs, or updates known local paths

-- Hero background
UPDATE hero_content
SET background_image_url = '/images/hero-homepage.webp',
    updated_at = NOW()
WHERE is_active = true
  AND (background_image_url IS NULL OR background_image_url = '' OR background_image_url LIKE '/images/hero-homepage.%');

-- Hero CTA chips with images (preserves labels/hrefs/icons when chips already exist)
UPDATE hero_content
SET cta_chips = '[
  {"label":"Need home backup or solar?","href":"/solutions/home-backup","icon":"Home","image_url":"/images/chip-home-backup-solar.webp"},
  {"label":"Running an office, clinic or datacentre?","href":"/solutions/office-ups","icon":"Building2","image_url":"/images/chip-office-ups.webp"},
  {"label":"Looking for a battery replacement?","href":"/solutions/home-backup#battery-finder","icon":"Battery","image_url":"/images/chip-battery-replacement.webp"},
  {"label":"View Products","href":"/#products","icon":"Package","image_url":"/images/chip-view-products.webp"}
]'::jsonb,
    updated_at = NOW()
WHERE is_active = true
  AND (
    cta_chips IS NULL
    OR cta_chips = '[]'::jsonb
    OR NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(cta_chips) AS chip
      WHERE COALESCE(chip->>'image_url', '') <> ''
    )
  );

-- Category card images (top-level only)
UPDATE product_category SET card_image_url = '/images/card-automotive-batteries.webp', updated_at = NOW()
WHERE slug = 'automotive-batteries' AND parent_id IS NULL
  AND (card_image_url IS NULL OR card_image_url = '' OR card_image_url LIKE '/images/card-automotive-batteries.%');

UPDATE product_category SET card_image_url = '/images/card-power-backup.webp', updated_at = NOW()
WHERE slug = 'power-backup-systems' AND parent_id IS NULL
  AND (card_image_url IS NULL OR card_image_url = '' OR card_image_url LIKE '/images/card-power-backup.%');

UPDATE product_category SET card_image_url = '/images/card-solar-energy.webp', updated_at = NOW()
WHERE slug = 'solar-energy-solutions' AND parent_id IS NULL
  AND (card_image_url IS NULL OR card_image_url = '' OR card_image_url LIKE '/images/card-solar-energy.%');

UPDATE product_category SET card_image_url = '/images/card-support-services.webp', updated_at = NOW()
WHERE slug = 'support-services' AND parent_id IS NULL
  AND (card_image_url IS NULL OR card_image_url = '' OR card_image_url LIKE '/images/card-support-services.%');
