-- Appliance icons for backup calculator + conservative default wattages
-- Run in Supabase SQL editor if not applied via migration pipeline

ALTER TABLE appliance
  ADD COLUMN IF NOT EXISTS icon_url TEXT;

-- Upsert catalog with conservative (worst-case) running watts for Indian homes.
-- Surge is handled in the sizing engine, not shown on each appliance card.
INSERT INTO appliance (key, name, watts, emoji, show_in_visual, "order") VALUES
  ('led-light', 'LED Light', 20, '💡', true, 1),
  ('tube-light', 'Tube Light', 40, '💡', true, 2),
  ('fan', 'Ceiling Fan', 80, '🌀', true, 3),
  ('bldc-fan', 'BLDC Fan', 40, '🌀', true, 4),
  ('tv', 'LED TV', 120, '📺', true, 5),
  ('router', 'WiFi Router', 20, '📡', true, 6),
  ('laptop', 'Laptop', 90, '💻', true, 7),
  ('macbook', 'MacBook', 100, '💻', true, 8),
  ('fridge', 'Refrigerator', 200, '🧊', true, 9),
  ('washing-machine', 'Washing Machine', 800, '🧺', true, 10),
  ('water-pump', 'Water Pump', 750, '💧', true, 11),
  ('microwave', 'Microwave', 1200, '🍲', true, 12),
  ('ac', 'AC (1 Ton)', 1500, '❄️', true, 13)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  watts = EXCLUDED.watts,
  emoji = COALESCE(NULLIF(appliance.emoji, ''), EXCLUDED.emoji),
  show_in_visual = EXCLUDED.show_in_visual,
  "order" = EXCLUDED."order";
