-- Logo variants for contrast: light bg = black text, dark bg = white text
-- Horizontal for navbar/footer, vertical for narrow spaces (admin sidebar)
INSERT INTO site_settings (key, value) VALUES
  ('logo_light_horizontal', ''),
  ('logo_light_vertical', ''),
  ('logo_dark_horizontal', ''),
  ('logo_dark_vertical', '')
ON CONFLICT (key) DO NOTHING;
