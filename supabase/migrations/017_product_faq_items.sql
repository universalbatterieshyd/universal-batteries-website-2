-- Product-level FAQs stored as JSONB on product
-- Safe to run multiple times (IF NOT EXISTS)

ALTER TABLE product
  ADD COLUMN IF NOT EXISTS faq_items JSONB DEFAULT '[]';

