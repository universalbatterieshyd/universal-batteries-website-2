# Product Category Card Images

The homepage "Complete Power Solutions" section displays product category cards. Each card can have an optional image for a richer visual.

## Image Guidelines

- **Recommended size:** 640×400px (landscape 16:10)
- **Format:** JPG or WebP, compressed (~100–150KB)
- **Why 640px:** Sharp on retina (2×) for ~320px-wide cards; avoids pixelation without large file size
- **Content:** Product/category imagery (batteries, inverters, etc.)

## Admin Setup

1. Go to **Admin → Categories**
2. Edit a category
3. Under "Category page content", find **Homepage card image**
4. Upload or paste an image URL
5. Leave empty for the icon-only gradient card

## Migration

Run `supabase/migrations/014_product_category_card_image.sql` to add the `card_image_url` column.
