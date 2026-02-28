-- Add about_us to homepage sections if not present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM homepage_sections WHERE section_key = 'about_us') THEN
    INSERT INTO homepage_sections (section_key, "order", is_visible) VALUES ('about_us', 3, true);
    UPDATE homepage_sections SET "order" = 4 WHERE section_key = 'testimonials';
    UPDATE homepage_sections SET "order" = 5 WHERE section_key = 'contact_cta';
  END IF;
END $$;
