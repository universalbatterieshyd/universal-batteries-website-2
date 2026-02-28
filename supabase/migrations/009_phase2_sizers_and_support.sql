-- Phase 2: Sizers & Support
-- Vehicle compatibility, battery groups, appliances, support tickets
-- Additive – no changes to existing tables

-- Battery groups: logical equivalence groups for vehicle matching
CREATE TABLE IF NOT EXISTS battery_group (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  capacity_ah INT,
  voltage INT DEFAULT 12,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle compatibility: brand, model, fuel_type → battery_group
CREATE TABLE IF NOT EXISTS vehicle_compatibility (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  fuel_type TEXT,
  vehicle_segment TEXT,
  capacity_ah INT,
  voltage INT DEFAULT 12,
  battery_group_id TEXT REFERENCES battery_group(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_compatibility_brand ON vehicle_compatibility(brand);
CREATE INDEX IF NOT EXISTS idx_vehicle_compatibility_model ON vehicle_compatibility(brand, model);
CREATE INDEX IF NOT EXISTS idx_vehicle_compatibility_battery_group ON vehicle_compatibility(battery_group_id);

-- Product ↔ battery group (many-to-many)
CREATE TABLE IF NOT EXISTS product_battery_group (
  product_id TEXT NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  battery_group_id TEXT NOT NULL REFERENCES battery_group(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, battery_group_id)
);

CREATE INDEX IF NOT EXISTS idx_product_battery_group_product ON product_battery_group(product_id);
CREATE INDEX IF NOT EXISTS idx_product_battery_group_group ON product_battery_group(battery_group_id);

-- Appliances for power backup load calculator (admin-configurable)
CREATE TABLE IF NOT EXISTS appliance (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  watts INT NOT NULL,
  emoji TEXT DEFAULT '📦',
  show_in_visual BOOLEAN DEFAULT TRUE,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Power backup config (formula constants, inverter VA mapping)
CREATE TABLE IF NOT EXISTS power_backup_config (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default power backup constants
INSERT INTO power_backup_config (key, value) VALUES
  ('formula', '{"voltage": 12, "maxCapacityAh": 200, "depthOfDischarge": 0.8, "efficiency": 0.8, "deRatingOffline": 0.36, "deRatingOnline": 0.42, "powerFactor": 0.8}'::jsonb),
  ('inverter_offline', '[{"vaMin": 600, "vaMax": 1800, "batteries": 1, "voltage": 12}, {"vaMin": 2000, "vaMax": 5000, "batteries": 2, "voltage": 24}]'::jsonb),
  ('inverter_online', '[{"vaMin": 1000, "vaMax": 2500, "batteries": 2, "voltage": 24}, {"vaMin": 3000, "vaMax": 5000, "batteries": 4, "voltage": 48}]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Default appliances
INSERT INTO appliance (key, name, watts, emoji, show_in_visual, "order") VALUES
  ('led-light', 'LED Light', 20, '💡', true, 1),
  ('fan', 'Ceiling Fan', 75, '🌀', true, 2),
  ('tv', 'TV', 100, '📺', true, 3),
  ('laptop', 'Laptop', 65, '💻', true, 4),
  ('router', 'WiFi Router', 15, '📡', true, 5),
  ('fridge', 'Refrigerator', 150, '🧊', true, 6),
  ('ac', 'AC (1 Ton)', 1200, '❄️', true, 7),
  ('washing-machine', 'Washing Machine', 500, '🧺', true, 8),
  ('water-pump', 'Water Pump', 750, '💧', true, 9),
  ('microwave', 'Microwave', 1000, '📦', true, 10)
ON CONFLICT (key) DO NOTHING;

-- Support tickets
CREATE TABLE IF NOT EXISTS support_ticket (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  category TEXT NOT NULL,
  urgency TEXT DEFAULT 'normal',
  message TEXT,
  photos TEXT[],
  preferred_slot TEXT,
  status TEXT DEFAULT 'open',
  assigned_to TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_ticket_status ON support_ticket(status);
CREATE INDEX IF NOT EXISTS idx_support_ticket_created ON support_ticket(created_at DESC);

-- Extend leads to support support_ticket type
-- (leads.type already accepts any string; support_ticket is separate for richer workflow)
