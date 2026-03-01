# Image Upload Setup

Admin can upload logos, favicon, and hero banner images directly instead of pasting URLs.

## Prerequisites

1. **Supabase Storage bucket** – Create an `uploads` bucket:
   - Go to **Supabase Dashboard → Storage → New bucket**
   - Name: `uploads`
   - Public: **Yes** (so images are viewable on the site)
   - File size limit: 5MB (optional)
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml` (optional)

2. **Or run the migration** – `supabase/migrations/012_storage_uploads_bucket.sql` (if your Supabase project supports it)

## Usage

- **Admin → Settings**: Each logo and favicon field has an **Upload** button. Click to select a file, or paste a URL.
- **Admin → Homepage**: Hero background image has an **Upload** button.

Uploaded images are stored in Supabase Storage and the public URL is saved automatically.
