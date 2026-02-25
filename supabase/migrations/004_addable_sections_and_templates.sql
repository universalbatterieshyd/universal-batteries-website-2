-- Allow multiple instances of same section type + config for templates
-- Run after 003_homepage_sections.sql

-- Drop UNIQUE on section_key (allows multiple features_grid, image_text, etc.)
ALTER TABLE homepage_sections DROP CONSTRAINT IF EXISTS homepage_sections_section_key_key;

-- Ensure config column exists (already in 003)
ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS config JSONB;
