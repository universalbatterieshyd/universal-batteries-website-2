-- Seed product categories and subcategories with full SEO/AEO content
-- Run in Supabase SQL Editor or: supabase db push
-- Safe to run multiple times: updates existing by slug

-- Ensure meta columns exist (for SEO)
ALTER TABLE product_category ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE product_category ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- 1. Top-level categories (with full content)
INSERT INTO product_category (name, slug, description, "order", icon, hero_headline, hero_tagline, hero_image_url, overview, faq_items, cta_headline, cta_subtext, meta_title, meta_description) VALUES
(
  'Automotive Batteries',
  'automotive-batteries',
  'Batteries and support for vehicles, gensets, and industrial applications.',
  0,
  'Car',
  'Automotive Batteries',
  'Find the right battery for your bike, car, SUV, truck, tractor or genset in minutes.',
  '/images/hero-automotive-batteries.jpg',
  'Automotive batteries are the starting point of every reliable vehicle, from two-wheelers and cars to trucks, tractors and generator sets. This category covers replacement batteries for popular Indian and international vehicle brands, plus heavy‑duty applications like fleets, construction equipment and standby generators. We help you choose the right capacity, technology and warranty so you get easy starts, longer life and fewer roadside surprises.
Use our compatibility finder to match the exact battery to your vehicle make, model and fuel type, or talk to our team for expert guidance on upgrades, maintenance and bulk or institutional requirements.',
  '[{"question":"How do I know which battery fits my vehicle?","answer":"The safest way is to match your vehicle''s make, model, variant and fuel type with the recommended battery specification or use our online battery finder, which is based on manufacturer application charts and fitment guidelines."},{"question":"How long does a car or bike battery usually last?","answer":"Most automotive batteries last around 3–5 years depending on driving pattern, climate and maintenance; frequent short trips, extreme heat and rarely driving the vehicle can shorten battery life."},{"question":"Can I upgrade to a higher capacity battery for better performance?","answer":"In many cases you can move slightly higher in capacity, but the battery must match OEM size, terminal layout and electrical requirements; using an incorrect size or type can affect cranking performance and alternator life."},{"question":"What are the signs that my battery is failing?","answer":"Slow cranking, dimming headlights at idle, dashboard warning lights, needing frequent jump‑starts, or visible swelling and corrosion around terminals usually indicate it''s time to replace the battery."},{"question":"Do I need a different battery for diesel vehicles or stop‑start systems?","answer":"Diesel engines and vehicles with start‑stop or heavy electrical loads often need higher CCA or advanced technologies like EFB or AGM rather than standard flooded SLI batteries, so always check the specification before buying."},{"question":"Do you supply batteries for fleets, tractors and gensets?","answer":"Yes, we stock heavy‑duty and deep‑cycle batteries suitable for trucks, tractors, material‑handling equipment and generator sets, and we offer scheduled replacements and bulk pricing for institutional users."}]'::jsonb,
  'Not sure which battery you need?',
  'Use our battery finder or share your RC details and we''ll recommend the exact compatible options for your vehicle.',
  'Automotive Batteries | Car, Bike, Truck & Genset Battery Replacement',
  'Find the right battery for your car, bike, SUV, truck, tractor or genset. Use our battery finder tool or talk to an expert for quick, reliable battery replacement.'
),
(
  'Power Backup Systems',
  'power-backup-systems',
  'Complete inverter and UPS solutions with batteries and accessories.',
  1,
  'Zap',
  'Inverters & UPS Power Backup',
  'Reliable backup solutions for homes, shops, offices and critical equipment.',
  '/images/hero-power-backup.jpg',
  'This category brings together inverter‑based backup systems and UPS systems for everything from small homes and shops to offices, datacentres and medical facilities. We help you size the system based on your appliances, backup hours, power quality needs and future expansion plans. From basic inverter‑plus‑battery trolleys to high‑capacity online UPS racks with isolation transformers, you get complete solutions including batteries, structures, cabling and installation.
Use our guided backup sizer to estimate the inverter or UPS capacity and battery bank you need, then refine it with our team for a site‑ready proposal.',
  '[{"question":"How do I calculate what size inverter or UPS I need?","answer":"Add up the wattage of the appliances you want to run during outages, factor in starting surges, then divide by power factor to estimate VA; we recommend a safety margin rather than sizing at the absolute minimum."},{"question":"What is the difference between an inverter and a UPS?","answer":"A home inverter provides backup with a slight switchover delay and longer runtime, while an online UPS offers near‑zero transfer time and tighter voltage regulation for sensitive IT and medical equipment."},{"question":"How long will my backup last?","answer":"Backup time depends on battery Ah, number of batteries, system voltage and your actual load; for example, a tubular 150–220 Ah inverter battery can provide several hours at partial load but much less at full load."},{"question":"Should I choose tubular or flat‑plate inverter batteries?","answer":"Flat‑plate batteries suit short, frequent cuts, while tubular batteries handle deeper discharges and longer outages better, usually with longer life."},{"question":"When do I need an online UPS instead of an inverter?","answer":"For IT servers, desktops, CNC machines, lab and medical equipment, an online UPS is preferred because it isolates equipment from voltage fluctuations and ensures continuous, clean power."}]'::jsonb,
  'Not sure what backup you need?',
  'Answer a few questions about your appliances and backup hours and get a personalised inverter or UPS recommendation.',
  'Inverters & UPS Power Backup | Home, Office & Industrial Solutions',
  'Compare home inverters, commercial inverters, line‑interactive UPS and online UPS systems. Get help sizing your backup and choosing the right batteries.'
),
(
  'Solar Energy Solutions',
  'solar-energy-solutions',
  'All solar systems, hybrid integrations, and related services.',
  2,
  'Sun',
  'Solar Energy Solutions',
  'On‑grid, off‑grid and hybrid solar systems designed for Indian homes and businesses.',
  '/images/hero-solar-energy.jpg',
  'This category includes complete rooftop solar systems, from grid‑tied plants for bill reduction to off‑grid and hybrid systems with battery backup. We help you choose the right configuration based on roof area, electricity consumption, grid reliability and budget. Our solutions cover design, supply, installation, net‑metering coordination and long‑term maintenance so you get predictable savings and cleaner energy.',
  '[{"question":"What is the difference between on‑grid and off‑grid solar?","answer":"On‑grid systems connect to the utility grid with net metering and usually don''t use batteries, while off‑grid systems run independently with batteries to store energy for night and outages."},{"question":"Which type of solar system is best for me?","answer":"If you have reliable grid power and want to cut your bill, on‑grid is usually best; if power is unreliable or unavailable, off‑grid or hybrid with batteries is more suitable."},{"question":"Are government subsidies available on rooftop solar?","answer":"In India, central and state subsidies are typically available only for eligible on‑grid rooftop systems within specified capacity limits; off‑grid/battery‑only systems generally don''t get subsidy."},{"question":"What size solar plant do I need?","answer":"Rooftop systems are usually sized based on your average monthly consumption, available shadow‑free roof area and budget; a site assessment refines this into a final kW recommendation."}]'::jsonb,
  'Estimate your solar savings',
  'Enter your monthly electricity bill and roof details to see recommended solar system sizes and savings.',
  'Solar Energy Solutions | On‑grid, Off‑grid & Hybrid Rooftop Solar',
  'Explore rooftop solar for homes and businesses. Understand on‑grid vs off‑grid solar, hybrid systems with batteries, subsidies and payback.'
),
(
  'Support & Services',
  'support-services',
  'Ongoing service, warranty, and advisory across all categories.',
  3,
  'Shield',
  'Service, Warranty & Energy Consultation',
  'End‑to‑end support for batteries, backup systems and solar plants.',
  '/images/hero-support-services.jpg',
  'Beyond products, we offer end‑to‑end services to keep your power systems running reliably. This includes warranty claim handling, on‑site diagnostics and repairs, preventive maintenance contracts, performance audits and system upgrades. Whether it''s a two‑wheeler battery, an inverter trolley, a 40 kVA UPS or a rooftop solar plant, you get one team that understands the full lifecycle and stands behind every installation.',
  '[{"question":"How do warranty claims work for batteries and inverters?","answer":"Warranty terms vary by brand and type; we help test the product, document faults as per manufacturer policy and process claims or pro‑rata replacements where applicable."},{"question":"Do you offer AMC for UPS and solar systems?","answer":"Yes, we provide annual maintenance contracts that include scheduled visits, cleaning, performance checks, battery health checks and priority support."},{"question":"Can you help me decide whether to upgrade or repair?","answer":"After a site inspection and load assessment, we compare the cost and reliability of repair versus replacement or upgrade and recommend what makes the most long‑term sense."}]'::jsonb,
  'Need help with an existing system?',
  'Raise a service request or book a site visit so we can diagnose issues and recommend the right fix or upgrade.',
  'Battery, UPS & Solar Service | Warranty, AMC & Energy Consultation',
  'End‑to‑end support for automotive batteries, inverters, UPS and solar plants. Warranty claims, AMCs, diagnostics, performance audits and upgrade recommendations.'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  "order" = EXCLUDED."order",
  icon = EXCLUDED.icon,
  hero_headline = EXCLUDED.hero_headline,
  hero_tagline = EXCLUDED.hero_tagline,
  hero_image_url = EXCLUDED.hero_image_url,
  overview = EXCLUDED.overview,
  faq_items = EXCLUDED.faq_items,
  cta_headline = EXCLUDED.cta_headline,
  cta_subtext = EXCLUDED.cta_subtext,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  updated_at = NOW();

-- 2. Automotive Batteries subcategories
INSERT INTO product_category (name, slug, description, parent_id, "order", hero_headline, hero_tagline, hero_image_url, overview, faq_items, cta_headline, cta_subtext)
SELECT 'Two‑wheeler Batteries', 'two-wheeler-batteries', 'Quick‑start, long‑life batteries for bikes and scooters.', id, 0,
  'Two‑wheeler Batteries', 'Quick‑start, long‑life batteries for bikes and scooters.', '/images/hero-two-wheeler-batteries.jpg',
  'This section covers maintenance‑free and conventional batteries for motorcycles and scooters. We focus on reliable cold starts, vibration resistance and warranties that make sense for daily city riders and delivery fleets. Use the finder to match your bike by brand and model, or ask us about long‑life and premium options for heavy usage.',
  '[{"question":"How often should I replace my bike battery?","answer":"Most two‑wheeler batteries last 3–4 years, but heavy city usage, infrequent rides or poor charging can reduce that, so test the battery if you notice weak starts or dim lights."},{"question":"Is a maintenance‑free battery better for scooters and bikes?","answer":"Modern sealed maintenance‑free batteries are convenient and reduce the risk of acid spills, making them ideal for most scooters and commuter motorcycles."},{"question":"Can I use any 12 V battery that fits physically?","answer":"No, voltage, capacity, terminal layout and mounting orientation must match your vehicle''s specification to avoid performance and safety issues."}]'::jsonb,
  'Get the right bike battery in one go', 'Search by brand and model or send us your bike details on WhatsApp for an instant recommendation.'
FROM product_category WHERE slug = 'automotive-batteries' LIMIT 1
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", hero_headline = EXCLUDED.hero_headline, hero_tagline = EXCLUDED.hero_tagline, hero_image_url = EXCLUDED.hero_image_url, overview = EXCLUDED.overview, faq_items = EXCLUDED.faq_items, cta_headline = EXCLUDED.cta_headline, cta_subtext = EXCLUDED.cta_subtext, updated_at = NOW();

INSERT INTO product_category (name, slug, description, parent_id, "order", hero_headline, hero_tagline, hero_image_url, overview, faq_items, cta_headline, cta_subtext)
SELECT 'Car & SUV Batteries', 'four-wheeler-batteries', 'Exact‑fit batteries for hatchbacks, sedans and SUVs.', id, 1,
  'Car & SUV Batteries', 'Exact‑fit batteries for hatchbacks, sedans and SUVs.', '/images/hero-four-wheeler-batteries.jpg',
  'Find replacement batteries for popular hatchbacks, sedans, SUVs and MUVs with correct size, terminal orientation and cranking power. Whether you drive mostly in the city or take long highway trips, we help you pick between standard, low‑maintenance and premium batteries designed for your usage and climate. Our team can also advise on options for vehicles with start‑stop systems, high‑end audio or aftermarket accessories.',
  '[{"question":"How do I choose between standard, low‑maintenance and premium batteries?","answer":"Standard lead‑acid batteries work for most cars, while enhanced flooded (EFB) or AGM batteries are better for start‑stop systems or vehicles with heavier electrical demands."},{"question":"Will a bigger battery damage my car?","answer":"Oversized batteries may physically not fit or may not be supported by the alternator; staying within manufacturer‑approved sizes and specs is safest."},{"question":"Do extreme temperatures affect car battery life?","answer":"Both high heat and very low temperatures can shorten battery life by stressing the internal chemistry and demanding higher cranking power."}]'::jsonb,
  'Check if your car battery is due', 'Share your car make, model and battery age to know if it''s time to replace or just recharge.'
FROM product_category WHERE slug = 'automotive-batteries' LIMIT 1
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", hero_headline = EXCLUDED.hero_headline, hero_tagline = EXCLUDED.hero_tagline, hero_image_url = EXCLUDED.hero_image_url, overview = EXCLUDED.overview, faq_items = EXCLUDED.faq_items, cta_headline = EXCLUDED.cta_headline, cta_subtext = EXCLUDED.cta_subtext, updated_at = NOW();

INSERT INTO product_category (name, slug, description, parent_id, "order", hero_headline, hero_tagline, hero_image_url, overview, faq_items, cta_headline, cta_subtext)
SELECT 'Truck, Tractor & Genset Batteries', 'heavy-duty-batteries', 'Rugged batteries for commercial and standby power.', id, 2,
  'Truck, Tractor & Genset Batteries', 'Rugged batteries for commercial and standby power.', '/images/hero-heavy-duty-batteries.jpg',
  'This subcategory focuses on batteries for trucks, tractors, earth‑moving equipment and generator sets. These applications need high cranking power and strong deep‑cycle performance for repeated starts and long standby periods. We offer heavy‑duty batteries from leading brands with specifications tailored for commercial vehicles, agricultural machinery and diesel gensets.',
  '[{"question":"What is the difference between a car battery and a heavy‑duty or deep‑cycle battery?","answer":"Standard SLI batteries are optimised for short high‑current bursts, whereas heavy‑duty or deep‑cycle batteries are built for repeated deep discharges and longer reserve capacity."},{"question":"How often should I test genset batteries?","answer":"For standby generators, testing every 3–6 months helps avoid failure during outages and ensures the charger is working properly."}]'::jsonb,
  'Power your fleet and generators reliably', 'Talk to us for fleet, industrial and genset battery planning and replacement schedules.'
FROM product_category WHERE slug = 'automotive-batteries' LIMIT 1
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", hero_headline = EXCLUDED.hero_headline, hero_tagline = EXCLUDED.hero_tagline, hero_image_url = EXCLUDED.hero_image_url, overview = EXCLUDED.overview, faq_items = EXCLUDED.faq_items, cta_headline = EXCLUDED.cta_headline, cta_subtext = EXCLUDED.cta_subtext, updated_at = NOW();

-- 3. Power Backup Systems subcategories
INSERT INTO product_category (name, slug, description, parent_id, "order", hero_headline, hero_tagline, hero_image_url, overview, faq_items, cta_headline, cta_subtext)
SELECT 'Home Inverters & Batteries', 'home-inverters-batteries', 'Quiet, long‑lasting backup for lights, fans, Wi‑Fi and essentials.', id, 0,
  'Home Inverters & Batteries', 'Quiet, long‑lasting backup for lights, fans, Wi‑Fi and essentials.', '/images/hero-home-inverters.jpg',
  'Home inverters with compatible batteries keep your lights, fans, Wi‑Fi and basic appliances running when the power goes out. This subcategory covers inverter units, tubular and flat‑plate batteries, and trolleys designed for Indian homes with frequent or long power cuts. We help you choose capacity based on your typical loads and backup hours so you don''t overpay or end up with too little runtime.',
  '[{"question":"How do I choose the right inverter battery Ah for my home?","answer":"List the appliances you want to run, calculate total watts, multiply by backup hours, and divide by system voltage and efficiency to get the required Ah; our calculator does this automatically."},{"question":"What type of inverter battery is best for long power cuts?","answer":"Tubular inverter batteries are generally recommended for long and frequent outages because they support deeper discharge cycles and last longer."},{"question":"How often should I top up distilled water in inverter batteries?","answer":"For non‑sealed batteries, checking water levels every 2–3 months is common, but the exact frequency depends on usage and charger settings."}]'::jsonb,
  'Design your home backup in 2 minutes', 'Use our home inverter sizing tool to get recommended inverter and battery combinations for your exact needs.'
FROM product_category WHERE slug = 'power-backup-systems' LIMIT 1
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", hero_headline = EXCLUDED.hero_headline, hero_tagline = EXCLUDED.hero_tagline, hero_image_url = EXCLUDED.hero_image_url, overview = EXCLUDED.overview, faq_items = EXCLUDED.faq_items, cta_headline = EXCLUDED.cta_headline, cta_subtext = EXCLUDED.cta_subtext, updated_at = NOW();

INSERT INTO product_category (name, slug, description, parent_id, "order", hero_headline, hero_tagline, hero_image_url, overview, faq_items, cta_headline, cta_subtext)
SELECT 'Commercial Inverters & Batteries', 'commercial-inverters-batteries', 'Backup solutions for shops, clinics and small offices.', id, 1,
  'Commercial Inverters & Batteries', 'Backup solutions for shops, clinics and small offices.', '/images/hero-commercial-inverters.jpg',
  'Shops, clinics, coaching centres and small offices need consistent backup for lights, computers, point‑of‑sale systems and refrigeration. This subcategory offers higher‑capacity inverters and matching battery banks, with options tailored for long opening hours and sensitive loads. We design systems that balance upfront cost, running cost and expansion needs as your business grows.',
  '[{"question":"Can I run air‑conditioners and fridges on an inverter?","answer":"It''s possible with correctly sized inverters and batteries, but starting current and long runtimes make it more expensive; we''ll help you decide what should be backed up and what can be excluded."},{"question":"Is it better to use multiple small inverters or one large system?","answer":"Multiple smaller systems can provide redundancy, while a single large system is usually more efficient; the right choice depends on layout and criticality of loads."}]'::jsonb,
  'Keep your business running through outages', 'Share your load details and operating hours for a tailored commercial backup plan.'
FROM product_category WHERE slug = 'power-backup-systems' LIMIT 1
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", hero_headline = EXCLUDED.hero_headline, hero_tagline = EXCLUDED.hero_tagline, hero_image_url = EXCLUDED.hero_image_url, overview = EXCLUDED.overview, faq_items = EXCLUDED.faq_items, cta_headline = EXCLUDED.cta_headline, cta_subtext = EXCLUDED.cta_subtext, updated_at = NOW();

INSERT INTO product_category (name, slug, description, parent_id, "order", hero_headline, hero_tagline, hero_image_url, overview, faq_items, cta_headline, cta_subtext)
SELECT 'Line‑interactive UPS', 'line-interactive-ups', 'Cost‑effective backup for PCs, POS and network gear.', id, 2,
  'Line‑interactive UPS', 'Cost‑effective backup for PCs, POS and network gear.', '/images/hero-line-interactive-ups.jpg',
  'Line‑interactive UPS systems provide short‑duration, clean backup for desktops, POS terminals, routers and small servers. They offer voltage regulation and faster switchover than basic inverters at a lower cost than online UPS. Ideal for retail counters, small offices and SOHO setups where brief outages and voltage fluctuations are common.',
  '[{"question":"How long will a small UPS keep my PC or router running?","answer":"Typical line‑interactive UPS units provide 10–30 minutes of backup at rated load, enough to save work or ride through short cuts."},{"question":"Can I connect a laser printer to a small UPS?","answer":"High inrush current from laser printers can overload many small UPS units; they''re usually not recommended on standard outlets."}]'::jsonb,
  'Protect your PCs and POS systems', 'Choose from compact UPS units sized for your computer, router and billing setups.'
FROM product_category WHERE slug = 'power-backup-systems' LIMIT 1
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", hero_headline = EXCLUDED.hero_headline, hero_tagline = EXCLUDED.hero_tagline, hero_image_url = EXCLUDED.hero_image_url, overview = EXCLUDED.overview, faq_items = EXCLUDED.faq_items, cta_headline = EXCLUDED.cta_headline, cta_subtext = EXCLUDED.cta_subtext, updated_at = NOW();

INSERT INTO product_category (name, slug, description, parent_id, "order", hero_headline, hero_tagline, hero_image_url, overview, faq_items, cta_headline, cta_subtext)
SELECT 'Online UPS & Power Racks', 'online-ups', 'Zero‑downtime power for IT, labs and critical equipment.', id, 3,
  'Online UPS & Power Racks', 'Zero‑downtime power for IT, labs and critical equipment.', '/images/hero-online-ups.jpg',
  'Online double‑conversion UPS systems with battery racks and isolation transformers are built for mission‑critical applications like datacentres, labs, hospitals and industrial automation. They deliver continuous, regulated power with no switching delay, protecting sensitive equipment from sags, surges, harmonics and outages. We design complete solutions with metal racks, cabling, battery banks and optional isolation transformers tailored to your load profile.',
  '[{"question":"Why is online UPS preferred for servers and medical equipment?","answer":"Online UPS isolates the load from power disturbances and switches to battery with zero transfer time, reducing the risk of reboots, data loss or equipment damage."},{"question":"How much backup should I plan for critical loads?","answer":"Many IT and medical installations size for 5–30 minutes on UPS and rely on generators for longer outages, while some sites use larger banks for 1+ hour."},{"question":"Do I need an isolation transformer?","answer":"For sensitive biomedical and certain industrial loads, isolation transformers help reduce electrical noise and provide galvanic isolation; many online UPS models integrate them or support external units."}]'::jsonb,
  'Design a zero‑downtime power solution', 'Share your IT or equipment details for a custom online UPS and rack configuration.'
FROM product_category WHERE slug = 'power-backup-systems' LIMIT 1
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", hero_headline = EXCLUDED.hero_headline, hero_tagline = EXCLUDED.hero_tagline, hero_image_url = EXCLUDED.hero_image_url, overview = EXCLUDED.overview, faq_items = EXCLUDED.faq_items, cta_headline = EXCLUDED.cta_headline, cta_subtext = EXCLUDED.cta_subtext, updated_at = NOW();

-- 4. Solar Energy Solutions subcategories (new structure)
INSERT INTO product_category (name, slug, description, parent_id, "order", hero_headline, hero_tagline, hero_image_url, overview, faq_items, cta_headline, cta_subtext)
SELECT 'Home Rooftop Solar', 'home-rooftop-solar', 'Cut your electricity bills with grid‑tied solar for your home.', id, 0,
  'Home Rooftop Solar', 'Cut your electricity bills with grid‑tied solar for your home.', '/images/hero-home-solar.jpg',
  'Home rooftop on‑grid systems convert your roof into a mini power plant that offsets your daytime electricity consumption. Excess power is exported to the grid via a bi‑directional net meter and adjusted in your bill. We design systems that match your roof, aesthetics and budget while complying with DISCOM and MNRE guidelines so you can claim applicable subsidies and net‑metering benefits.',
  '[{"question":"Will my home still get power at night with on‑grid solar?","answer":"On‑grid systems don''t store energy in batteries, so at night you draw power from the grid; your savings come from daytime generation offsetting your bill."},{"question":"Can I run my home during a power cut with on‑grid solar?","answer":"Standard on‑grid systems shut down during grid outages for safety; for backup during cuts you need hybrid/on‑grid with battery or a separate backup system."}]'::jsonb,
  'See how much your roof can save', 'Use our home solar calculator to estimate kW size, monthly savings and payback period.'
FROM product_category WHERE slug = 'solar-energy-solutions' LIMIT 1
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", hero_headline = EXCLUDED.hero_headline, hero_tagline = EXCLUDED.hero_tagline, hero_image_url = EXCLUDED.hero_image_url, overview = EXCLUDED.overview, faq_items = EXCLUDED.faq_items, cta_headline = EXCLUDED.cta_headline, cta_subtext = EXCLUDED.cta_subtext, updated_at = NOW();

INSERT INTO product_category (name, slug, description, parent_id, "order", hero_headline, hero_tagline, hero_image_url, overview, faq_items, cta_headline, cta_subtext)
SELECT 'Solar for Businesses & Institutions', 'business-institutional-solar', 'Lower operating costs with commercial rooftop solar.', id, 1,
  'Solar for Businesses & Institutions', 'Lower operating costs with commercial rooftop solar.', '/images/hero-business-solar.jpg',
  'Shops, offices, factories, schools and hospitals can significantly cut electricity bills by installing on‑grid rooftop solar on unused roof space. Commercial systems are typically sized to match daytime loads and leverage net‑metering and open access policies where available. We design, install and maintain plants with proper safety, earthing and monitoring so you get predictable energy output and bank‑friendly documentation.',
  '[{"question":"What is a good size of solar plant for my business?","answer":"It depends on your contract demand, rooftop area and load pattern; a load and roof survey helps us propose kW sizes that maximise self‑consumption and ROI."},{"question":"How long does a commercial solar plant last?","answer":"Quality panels typically have 25‑year performance warranties, while inverters may need replacement after 10–15 years depending on usage and environment."}]'::jsonb,
  'Turn your roof into a cost saver', 'Share your electricity bill and roof photos for a quick feasibility and savings estimate.'
FROM product_category WHERE slug = 'solar-energy-solutions' LIMIT 1
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", hero_headline = EXCLUDED.hero_headline, hero_tagline = EXCLUDED.hero_tagline, hero_image_url = EXCLUDED.hero_image_url, overview = EXCLUDED.overview, faq_items = EXCLUDED.faq_items, cta_headline = EXCLUDED.cta_headline, cta_subtext = EXCLUDED.cta_subtext, updated_at = NOW();

INSERT INTO product_category (name, slug, description, parent_id, "order", hero_headline, hero_tagline, hero_image_url, overview, faq_items, cta_headline, cta_subtext)
SELECT 'Off‑grid & Hybrid Solar', 'offgrid-hybrid-solar', 'Solar with battery backup for remote and unreliable grids.', id, 2,
  'Off‑grid & Hybrid Solar', 'Solar with battery backup for remote and unreliable grids.', '/images/hero-offgrid-solar.jpg',
  'Off‑grid and hybrid solar systems combine panels, charge controllers or hybrid inverters and battery banks to provide power where the grid is unreliable or unavailable. Off‑grid systems run standalone, while hybrid systems work with the grid and can supply backup during outages. These solutions suit farmhouses, remote sites, telecom towers, critical loads and homes with frequent, long power cuts.',
  '[{"question":"When should I choose off‑grid over on‑grid?","answer":"Off‑grid is ideal when grid access is unavailable or extremely unreliable and energy independence is the priority; on‑grid is better where grid power is available and you mainly want bill savings."},{"question":"Do off‑grid systems get subsidy?","answer":"In India, current central rooftop subsidies focus on grid‑connected systems; off‑grid or behind‑the‑meter plants generally are not eligible."}]'::jsonb,
  'Keep your power on, even off‑grid', 'Tell us about your location and outage pattern to size an off‑grid or hybrid solar system.'
FROM product_category WHERE slug = 'solar-energy-solutions' LIMIT 1
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", hero_headline = EXCLUDED.hero_headline, hero_tagline = EXCLUDED.hero_tagline, hero_image_url = EXCLUDED.hero_image_url, overview = EXCLUDED.overview, faq_items = EXCLUDED.faq_items, cta_headline = EXCLUDED.cta_headline, cta_subtext = EXCLUDED.cta_subtext, updated_at = NOW();
