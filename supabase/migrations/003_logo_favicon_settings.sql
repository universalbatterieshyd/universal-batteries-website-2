-- Ensure logo_url and favicon_url exist; set default favicon if empty
INSERT INTO site_settings (key, value) VALUES
  ('logo_url', ''),
  ('favicon_url', '/favicon.svg')
ON CONFLICT (key) DO NOTHING;

-- Update favicon to default for existing rows that have empty favicon
UPDATE site_settings SET value = '/favicon.svg', updated_at = NOW()
WHERE key = 'favicon_url' AND (value IS NULL OR value = '');
