-- Rapid Quote Engine — core schema
-- Separate from website CMS. Shop staff never need CMS access.

-- Branches (quote letterheads)
CREATE TABLE IF NOT EXISTS quote_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  address_line TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO quote_branches (code, name, address_line, phone)
VALUES
  (
    'MG',
    'MG Road',
    '2-4-78, M.G. Road, Secunderabad - 500 003',
    '9391026003'
  ),
  (
    'KK',
    'Karkhana',
    'Karkhana, Secunderabad — update address in Quotes Admin',
    NULL
  )
ON CONFLICT (code) DO NOTHING;

-- Quote app profiles (presence = quote access; can_access_cms false for shop floor)
CREATE TABLE IF NOT EXISTS quote_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('quote_admin', 'salesperson', 'shop_boy')),
  display_name TEXT,
  branch_id UUID REFERENCES quote_branches(id) ON DELETE SET NULL,
  can_access_cms BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_profiles_role ON quote_profiles(role);
CREATE INDEX IF NOT EXISTS idx_quote_profiles_branch ON quote_profiles(branch_id);

-- Category tree (drag-and-drop hierarchy; GST on node)
CREATE TABLE IF NOT EXISTS quote_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES quote_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  gst_percent NUMERIC(5,2) NOT NULL DEFAULT 18.00,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (slug)
);

CREATE INDEX IF NOT EXISTS idx_quote_categories_parent ON quote_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_quote_categories_sort ON quote_categories(parent_id, sort_order);

-- Shop boy (and optional) category ACL
CREATE TABLE IF NOT EXISTS quote_profile_categories (
  user_id UUID NOT NULL REFERENCES quote_profiles(user_id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES quote_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, category_id)
);

-- Products (canonical; DP inclusive GST)
CREATE TABLE IF NOT EXISTS quote_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT,
  brand TEXT,
  series TEXT,
  model_code TEXT,
  full_name TEXT NOT NULL,
  capacity_value NUMERIC(12,3),
  capacity_unit TEXT CHECK (capacity_unit IS NULL OR capacity_unit IN ('Ah', 'VA')),
  dp_incl_gst NUMERIC(12,2) NOT NULL,
  warranty_text TEXT,
  warranty_months INT,
  category_id UUID REFERENCES quote_categories(id) ON DELETE SET NULL,
  price_list_date DATE,
  source_sheet TEXT,
  ref_universal NUMERIC(12,2),
  ref_reseller NUMERIC(12,2),
  ref_customer NUMERIC(12,2),
  ref_mrp NUMERIC(12,2),
  search_text TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_products_category ON quote_products(category_id);
CREATE INDEX IF NOT EXISTS idx_quote_products_brand ON quote_products(brand);
CREATE INDEX IF NOT EXISTS idx_quote_products_model ON quote_products(model_code);
CREATE INDEX IF NOT EXISTS idx_quote_products_search ON quote_products USING gin (
  to_tsvector('english', coalesce(search_text, ''))
);

-- Buyback Ah slabs (from Weight Comparison)
CREATE TABLE IF NOT EXISTS quote_buyback_slabs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  min_ah NUMERIC(10,2) NOT NULL,
  max_ah NUMERIC(10,2) NOT NULL,
  buyback_amount NUMERIC(12,2) NOT NULL,
  weight_note TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (min_ah <= max_ah)
);

-- Global / default pricing settings
CREATE TABLE IF NOT EXISTS quote_pricing_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  floor_markup_percent NUMERIC(8,4) NOT NULL DEFAULT 11.0000,
  target_mode TEXT NOT NULL DEFAULT 'percent_of_floor' CHECK (target_mode IN ('percent_of_floor', 'fixed_amount')),
  target_percent NUMERIC(8,4) NOT NULL DEFAULT 3.0000,
  target_fixed_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  rounding_mode TEXT NOT NULL DEFAULT 'ceil_100' CHECK (
    rounding_mode IN ('none', 'nearest_10', 'nearest_100', 'ceil_10', 'ceil_100')
  ),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO quote_pricing_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Customers
CREATE TABLE IF NOT EXISTS quote_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mobile TEXT,
  customer_type TEXT,
  floor_markup_percent NUMERIC(8,4),
  target_mode TEXT CHECK (target_mode IS NULL OR target_mode IN ('percent_of_floor', 'fixed_amount')),
  target_percent NUMERIC(8,4),
  target_fixed_amount NUMERIC(12,2),
  rounding_mode TEXT CHECK (
    rounding_mode IS NULL OR rounding_mode IN ('none', 'nearest_10', 'nearest_100', 'ceil_10', 'ceil_100')
  ),
  default_branch_id UUID REFERENCES quote_branches(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_customers_mobile ON quote_customers(mobile);
CREATE INDEX IF NOT EXISTS idx_quote_customers_name ON quote_customers(name);

-- Quote number sequences per branch per FY
CREATE TABLE IF NOT EXISTS quote_sequences (
  branch_id UUID NOT NULL REFERENCES quote_branches(id) ON DELETE CASCADE,
  fy_label TEXT NOT NULL,
  last_seq INT NOT NULL DEFAULT 0,
  PRIMARY KEY (branch_id, fy_label)
);

-- Quotations
CREATE TABLE IF NOT EXISTS quote_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number TEXT NOT NULL UNIQUE,
  branch_id UUID NOT NULL REFERENCES quote_branches(id),
  author_id UUID NOT NULL REFERENCES quote_profiles(user_id),
  customer_id UUID REFERENCES quote_customers(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_mobile TEXT,
  source TEXT DEFAULT 'walk_in',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'cancelled')),
  subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
  total NUMERIC(14,2) NOT NULL DEFAULT 0,
  cost_total NUMERIC(14,2),
  margin_total NUMERIC(14,2),
  notes TEXT,
  issued_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_quotes_branch ON quote_quotes(branch_id);
CREATE INDEX IF NOT EXISTS idx_quote_quotes_author ON quote_quotes(author_id);
CREATE INDEX IF NOT EXISTS idx_quote_quotes_created ON quote_quotes(created_at DESC);

CREATE TABLE IF NOT EXISTS quote_quote_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quote_quotes(id) ON DELETE CASCADE,
  line_type TEXT NOT NULL DEFAULT 'product' CHECK (line_type IN ('product', 'buyback', 'service')),
  product_id UUID REFERENCES quote_products(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  warranty_months INT,
  volts NUMERIC(8,2),
  capacity_value NUMERIC(12,3),
  capacity_unit TEXT,
  qty NUMERIC(12,3) NOT NULL DEFAULT 1,
  unit_rate NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  dp_at_quote NUMERIC(12,2),
  floor_rate NUMERIC(12,2),
  target_rate NUMERIC(12,2),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_quote_lines_quote ON quote_quote_lines(quote_id);

-- updated_at helper (creates triggers only if missing — no DROP)
CREATE OR REPLACE FUNCTION quote_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'quote_branches',
    'quote_profiles',
    'quote_categories',
    'quote_products',
    'quote_buyback_slabs',
    'quote_pricing_settings',
    'quote_customers',
    'quote_quotes'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE tgname = format('trg_%s_updated', t)
        AND tgrelid = t::regclass
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER trg_%s_updated BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION quote_set_updated_at();',
        t, t
      );
    END IF;
  END LOOP;
END $$;

-- RLS
ALTER TABLE quote_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_profile_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_buyback_slabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_pricing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_quote_lines ENABLE ROW LEVEL SECURITY;

-- Helpers
CREATE OR REPLACE FUNCTION quote_is_quote_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM quote_profiles p
    WHERE p.user_id = auth.uid() AND p.is_active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION quote_is_quote_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM quote_profiles p
    WHERE p.user_id = auth.uid() AND p.is_active = true AND p.role = 'quote_admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION quote_can_access_cms()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT p.can_access_cms FROM quote_profiles p WHERE p.user_id = auth.uid() AND p.is_active = true),
    true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;
-- Note: users with NO quote_profiles row → COALESCE(..., true) so existing CMS admins keep access.

-- Policies: quote users can read shared masters; admins write
CREATE POLICY quote_branches_select ON quote_branches FOR SELECT TO authenticated
  USING (quote_is_quote_user());
CREATE POLICY quote_branches_admin ON quote_branches FOR ALL TO authenticated
  USING (quote_is_quote_admin()) WITH CHECK (quote_is_quote_admin());

CREATE POLICY quote_profiles_select_self ON quote_profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR quote_is_quote_admin());
CREATE POLICY quote_profiles_admin ON quote_profiles FOR ALL TO authenticated
  USING (quote_is_quote_admin()) WITH CHECK (quote_is_quote_admin());

CREATE POLICY quote_categories_select ON quote_categories FOR SELECT TO authenticated
  USING (quote_is_quote_user());
CREATE POLICY quote_categories_admin ON quote_categories FOR ALL TO authenticated
  USING (quote_is_quote_admin()) WITH CHECK (quote_is_quote_admin());

CREATE POLICY quote_profile_categories_select ON quote_profile_categories FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR quote_is_quote_admin());
CREATE POLICY quote_profile_categories_admin ON quote_profile_categories FOR ALL TO authenticated
  USING (quote_is_quote_admin()) WITH CHECK (quote_is_quote_admin());

CREATE POLICY quote_products_select ON quote_products FOR SELECT TO authenticated
  USING (quote_is_quote_user());
CREATE POLICY quote_products_admin ON quote_products FOR ALL TO authenticated
  USING (quote_is_quote_admin()) WITH CHECK (quote_is_quote_admin());

CREATE POLICY quote_buyback_select ON quote_buyback_slabs FOR SELECT TO authenticated
  USING (quote_is_quote_user());
CREATE POLICY quote_buyback_admin ON quote_buyback_slabs FOR ALL TO authenticated
  USING (quote_is_quote_admin()) WITH CHECK (quote_is_quote_admin());

CREATE POLICY quote_pricing_select ON quote_pricing_settings FOR SELECT TO authenticated
  USING (quote_is_quote_user());
CREATE POLICY quote_pricing_admin ON quote_pricing_settings FOR ALL TO authenticated
  USING (quote_is_quote_admin()) WITH CHECK (quote_is_quote_admin());

CREATE POLICY quote_customers_select ON quote_customers FOR SELECT TO authenticated
  USING (quote_is_quote_user());
CREATE POLICY quote_customers_write ON quote_customers FOR INSERT TO authenticated
  WITH CHECK (quote_is_quote_user());
CREATE POLICY quote_customers_update ON quote_customers FOR UPDATE TO authenticated
  USING (quote_is_quote_user()) WITH CHECK (quote_is_quote_user());
CREATE POLICY quote_customers_admin_delete ON quote_customers FOR DELETE TO authenticated
  USING (quote_is_quote_admin());

CREATE POLICY quote_sequences_admin ON quote_sequences FOR ALL TO authenticated
  USING (quote_is_quote_user()) WITH CHECK (quote_is_quote_user());

CREATE POLICY quote_quotes_select ON quote_quotes FOR SELECT TO authenticated
  USING (
    quote_is_quote_admin()
    OR (author_id = auth.uid() AND deleted_at IS NULL)
  );
CREATE POLICY quote_quotes_insert ON quote_quotes FOR INSERT TO authenticated
  WITH CHECK (quote_is_quote_user() AND author_id = auth.uid());
CREATE POLICY quote_quotes_update ON quote_quotes FOR UPDATE TO authenticated
  USING (
    quote_is_quote_admin()
    OR (author_id = auth.uid() AND deleted_at IS NULL)
  )
  WITH CHECK (
    quote_is_quote_admin()
    OR (author_id = auth.uid())
  );

CREATE POLICY quote_lines_select ON quote_quote_lines FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quote_quotes q
      WHERE q.id = quote_id
        AND (quote_is_quote_admin() OR (q.author_id = auth.uid() AND q.deleted_at IS NULL))
    )
  );
CREATE POLICY quote_lines_write ON quote_quote_lines FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quote_quotes q
      WHERE q.id = quote_id
        AND (quote_is_quote_admin() OR q.author_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quote_quotes q
      WHERE q.id = quote_id
        AND (quote_is_quote_admin() OR q.author_id = auth.uid())
    )
  );

COMMENT ON TABLE quote_profiles IS 'Quote app access. Shop staff: can_access_cms=false. Separate from website CMS.';
COMMENT ON TABLE quote_categories IS 'Drag-and-drop hierarchy; products link via Category column on import.';
