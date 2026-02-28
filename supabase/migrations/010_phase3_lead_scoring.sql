-- Phase 3: Lead scoring
-- Additive – no changes to existing logic

-- Lead score: 0-100, computed on submit. High priority = datacentre + >20 kVA, etc.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score INT DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC);
