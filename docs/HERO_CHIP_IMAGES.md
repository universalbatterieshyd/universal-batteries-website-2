# Hero Category Chip Images

The hero section displays up to four category chips. Each chip can have an optional background image for an Amazon-style visual.

## Image Guidelines

- **Recommended size:** 400×400px (square)
- **Format:** JPG or PNG
- **Content:** Product/category imagery (e.g. inverter, battery, solar panel)
- **Contrast:** Use images that work with a dark gradient overlay and white text

## Admin Setup

1. Go to **Admin → Homepage**
2. Scroll to **Hero category chips**
3. For each chip, optionally upload or paste an image URL
4. Leave empty for the default solid red gradient

## Migration

Run `supabase/migrations/013_hero_cta_chips.sql` to add the `cta_chips` column to `hero_content`.
