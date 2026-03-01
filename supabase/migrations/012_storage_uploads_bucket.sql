-- Storage bucket for admin uploads (logos, favicon, banners)
-- Run in Supabase SQL Editor. If this fails, create manually: Dashboard → Storage → New bucket
-- Name: uploads, Public: Yes, File size limit: 5MB

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']::text[]
)
ON CONFLICT (id) DO NOTHING;
