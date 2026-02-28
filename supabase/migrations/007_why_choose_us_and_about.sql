-- Why Choose Us (editable USPs)
CREATE TABLE IF NOT EXISTS why_choose_us (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Shield',
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- About Us (editable story)
CREATE TABLE IF NOT EXISTS about_us (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  headline TEXT NOT NULL,
  subheadline TEXT,
  story TEXT,
  image_url TEXT,
  image_caption TEXT,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default Why Choose Us (only when empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM why_choose_us LIMIT 1) THEN
    INSERT INTO why_choose_us (title, description, icon, "order") VALUES
      ('Genuine Products', '100% authentic batteries from authorized brands', 'Shield', 0),
      ('Same Day Delivery', 'Fast delivery across Hyderabad & surrounding areas', 'Truck', 1),
      ('30+ Years Experience', 'Trusted by thousands since 1992', 'Award', 2),
      ('Expert Guidance', 'Professional consultation for the right solution', 'Headphones', 3),
      ('Free Installation', 'Complimentary setup with every purchase*', 'ThumbsUp', 4),
      ('Quick Service', 'Efficient testing, charging & repair services', 'Clock', 5);
  END IF;
END $$;

-- Seed default About Us (only when empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM about_us LIMIT 1) THEN
    INSERT INTO about_us (headline, subheadline, story, "order") VALUES
      ('Our Story', 'A legacy of trust in power solutions since 1992', 'Universal Batteries began in 1992 with a simple mission: to provide genuine batteries and reliable power solutions to homes and businesses across Hyderabad. Over three decades, we have grown from a small shop to a trusted name, serving thousands of customers with automotive, inverter, UPS, and solar solutions.', 0);
  END IF;
END $$;
