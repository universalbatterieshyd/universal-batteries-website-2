-- Unified leads table for all lead types (battery finder, UPS proposal, solar, etc.)
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  phone TEXT NOT NULL,
  area TEXT,
  type TEXT NOT NULL,           -- battery_finder, ups_proposal, solar_enquiry, contact, enterprise
  source TEXT NOT NULL,          -- form source for attribution
  payload JSONB DEFAULT '{}',   -- flexible data (vehicle, load, roof, etc.)
  assigned_to TEXT,             -- admin user id for assignment
  status TEXT DEFAULT 'new',    -- new, contacted, qualified, closed
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_type ON leads(type);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
