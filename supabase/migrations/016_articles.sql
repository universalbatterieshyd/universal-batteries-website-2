-- Articles for FAQ "Read more" links and standalone content
-- Content is markdown; images use URLs (upload via Admin)

CREATE TABLE IF NOT EXISTS article (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL DEFAULT '',
  featured_image_url TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_article_slug ON article(slug);
CREATE INDEX IF NOT EXISTS idx_article_published ON article(is_published) WHERE is_published = true;

COMMENT ON TABLE article IS 'Articles linkable from category FAQs. Content is markdown. Use ![alt](url) for images.';
