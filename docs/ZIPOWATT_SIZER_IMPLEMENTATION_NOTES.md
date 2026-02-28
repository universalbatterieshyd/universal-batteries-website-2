# Zipowatt Sizer Implementation Notes

Notes from the Zipowatt (Shopify) project for porting to Universal Batteries (Next.js + Supabase). Focus on UX, data structures, and improvements for the custom stack.

---

## 1. Automotive Battery Finder

### Data Sources
- **Shopify:** `shop.metafields.vehicle.database` (JSON or file reference)
- **Format 1 (JSON):** Nested structure: `brands[]` → `models[]` → `variants[]`, `specifications{}`
- **Format 2 (CSV):** Flat table with columns:
  - `Vehicle Make`, `Vehicle Segment`, `Brand + Model`, `Battery Capacity (AH)`, `Fuel Types`, `Notes`
- **CSV parsing:** Inline in Liquid/JS – supports quoted fields, comma-separated model lists

### User Flow (UX)
1. **Brand** (required) → populates Model dropdown
2. **Model** (required) → populates Variant (fuel type) if multiple
3. **Variant** (optional) → Petrol/Diesel/Electric – only shown when model has multiple fuel types
4. **Vehicle Type** (optional) → Auto-detect from segment, or manual: Car, 2-Wheeler, Truck, Tractor

### Progressive Disclosure
- Model dropdown **disabled** until Brand selected
- Variant dropdown **hidden** until Model has multiple fuel types
- Results **clear** when any selection changes

### Product Matching (Tag-Based)
- Products fetched from `/collections/automotive-batteries/products.json`
- **Scoring algorithm** (points):
  - Exact brand: 50 | Partial brand: 25
  - Exact model: 40 | Partial model: 20
  - Vehicle segment: 30
  - Fuel type: 15
  - Capacity match: 20
  - Brand+model combined: 10
  - Exact tag combo: 25
  - Penalty: irrelevant tags (laptop, phone, etc.): -20

### Match Quality Labels
- **Perfect Match** (80+)
- **Excellent Match** (60–79)
- **Good Match** (40–59)
- **Partial Match** (20–39)
- **Basic Match** (1–19)

### Product Card UX
- **Exchange variant:** Prefer variant with "exchange", "after exchange", "trade in" in title/options
- **Fallback:** Lowest-price variant
- **Display:** Image, warranty badge, match indicator, capacity, voltage, price (exchange), "View Details", "Add to Cart"

### No-Results UX
- "No Exact Match Found" message
- **Show Similar Options** button (broader search)
- **Contact Support** button (WhatsApp with pre-filled message)

### Data Maintenance Pain Points (from your brief)
- Manual updates to vehicle list for new models
- New battery models need all vehicle tags copied from equivalent battery
- **Improvement for Next.js:** Use `vehicle_compatibility` table with `(brand, model, fuel_type) → battery_group_id`. Products belong to groups. Add new battery = assign to group. No tag copying.

### Excel Template Structure (for data entry)
| Vehicle Make | Vehicle Segment | Brand + Model | Battery Capacity (AH) | Fuel Types | Notes |
|--------------|-----------------|---------------|----------------------|------------|-------|
| AUDI | CARS | AUDI A3 (Petrol & Diesel), ... | 100 | Petrol & Diesel | ... |

- **Vehicle Segment** maps to: cars, suv, bikes, trucks, mpv
- **Brand + Model** is comma-separated; fuel types in parentheses

### Gensets, Trucks, Tractors
- Same automotive batteries, larger capacities (100Ah–200Ah)
- Include in vehicle database with appropriate segment

---

## 2. Power Backup Wizard

### Steps (5 total)
1. **Load Calculator** – appliances or direct watts
2. **Battery & Inverter Requirements** – backup hours, UPS type, biomedical load
3. **Installation Type** – trolley vs electrical services
4. **Contact Info** – name, email, phone, message
5. **Summary & Quote** – system summary, browse products, generate quote

### Load Calculator UX
- **Two input methods:** "Calculate by appliances" (default) | "Enter total load directly"
- **Visual appliance cards:** Tap to add; grid of cards with emoji, name, wattage
- **Appliance list:** Add/remove rows, quantity, custom wattage
- **Admin-configurable:** Appliances from section blocks (Liquid) – key, name, watts, emoji, show_in_visual

### Appliance Data Structure
```json
{
  "key": "led-light",
  "name": "LED Light",
  "watts": 20,
  "emoji": "💡",
  "show_in_visual": true
}
```

### Battery/Inverter Logic
- **Formula:** `Required Ah = (Load × Backup Hrs) / (Voltage × DoD × Efficiency × De-rating)`
- **Config:** voltage=12, maxCapacity=200, depthOfDischarge=0.8, efficiency=0.8, deRating=0.85
- **Indian derating:** offline 0.36, online 0.42
- **Power factor:** 0.8

### Inverter Config (VA → batteries, voltage)
**Offline:** 600–1800 VA → 1 battery (12V); 2000–5000 VA → 2–4 batteries (24–48V)
**Online:** 1000–2500 VA → 2 batteries (24V); 3000–5000 VA → 4 batteries (48V)

### UPS Type
- **Offline (Inverter):** 1–2 hr backup typical
- **Online:** 5 min–1.5 hr backup; IT/servers/machinery/biomedical
- **Biomedical:** Needs isolation transformer (inline or built-in)

### Installation
- **Trolley** (ABS, wheels) – for offline inverter
- **Metal rack** (iron, no wheels) – for online UPS
- Custom trolley if >2 batteries

### Product Metafields (Shopify)
- `custom.capacity_in_va` – inverter/UPS
- `custom.capacity_in_ah` – battery
- `custom.volts` – battery voltage
- `custom.product_type` – Inverter, Online UPS, SMF Battery, Tall Tubular, etc.

### UX Enhancements (from Zipowatt)
- Progress bar with step count
- **Browse all products** – skip wizard
- **Browse recommended** – filtered by results
- OTP verification (optional, can be disabled)
- Inline FAQ accordions
- Button pointer glow, card pop animations
- Skeleton loading states
- Glassmorphism styling

---

## 3. Solar (Not in Zipowatt – from your brief)

### Off-Grid
- Power backup + solar charging
- Solar inverter has built-in charge controller
- For remote areas, power issues
- **Reuse:** Power backup wizard + "Add solar?" step

### On-Grid
- kW rating, net meter, no batteries
- For energy saving
- Inputs: roof type, area, city, monthly bill
- Output: kW range, savings estimate, "Book site survey"

---

## 4. UX Patterns to Preserve

### Form Behaviour
- Progressive disclosure (show fields when relevant)
- Auto-detect where possible (vehicle type from segment)
- Clear/reset on parent change
- Loading state during fetch
- No-results with fallback actions

### Visual Feedback
- Match quality badges
- Warranty badges on products
- Capacity/specs on cards
- Price with compare-at and discount

### Mobile
- Touch-friendly cards
- 2-up appliance grid on mobile
- Responsive product grid
- Sticky elements where useful

### Accessibility
- Focus states
- ARIA labels
- Reduced motion support (Zipowatt has this)

---

## 5. Data Model for Next.js + Supabase

### Vehicle Compatibility (replaces tag-based matching)
```sql
-- vehicle_make, model, fuel_type → battery_group
CREATE TABLE vehicle_compatibility (
  id UUID PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  fuel_type TEXT,  -- petrol, diesel, electric, etc.
  vehicle_segment TEXT,  -- car, bike, truck, tractor
  capacity_ah INT,
  voltage INT DEFAULT 12,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- battery_group: logical group of equivalent batteries
CREATE TABLE battery_group (
  id UUID PRIMARY KEY,
  name TEXT,
  capacity_ah INT,
  voltage INT
);

-- product_battery_group: many-to-many
CREATE TABLE product_battery_group (
  product_id UUID REFERENCES product(id),
  battery_group_id UUID REFERENCES battery_group(id),
  PRIMARY KEY (product_id, battery_group_id)
);
```
**Benefit:** New battery = add to `product_battery_group`. No tag copying.

### Power Backup Config (server-side or DB)
- Inverter VA → battery count, voltage
- Appliance list (admin-editable)
- Formula constants

---

## 6. Improvements for Next.js

| Zipowatt (Shopify) | Universal Batteries (Next.js) |
|--------------------|------------------------------|
| Tag-based matching | DB lookup: vehicle → battery_group → products |
| Metafield JSON/CSV | Supabase tables, admin UI for vehicles |
| Products from collection API | Products from Supabase `product` table |
| Liquid + inline JS | React components, API routes |
| Add to cart (Shopify) | Lead capture + "Inquire" / WhatsApp |
| No lead storage | `leads` table with source, type, data |
| OTP (disabled) | Phone + OTP via Supabase Auth (optional) |

---

## 7. Files to Reference

| File | Purpose |
|------|---------|
| `sections/automobile-battery-finder.liquid` | Full finder logic, CSV parse, scoring, product cards |
| `sections/power-backup-wizard.liquid` | Wizard structure, appliance blocks, steps |
| `assets/power-backup-wizard.js` | Load calc, battery/inverter formulas, inverter config |
| `AUTOMOBILE_BATTERY_SETUP_GUIDE.md` | Vehicle DB structure, tagging strategy |
| `VEHICLE_DATABASE_EXCEL_TEMPLATE.md` | Excel format for data entry |
| `METAFIELD_SETUP_GUIDE.md` | Product metafields (capacity_va, capacity_ah, etc.) |

---

## 8. Unique Notes You May Have Missed

1. **CSV fallback:** If metafield is file GID or empty, fetches CSV from file URL and parses client-side.
2. **Exchange variant logic:** Prefers variant with "exchange"/"trade in" in title; fallback to lowest price.
3. **Capacity from chart:** `isCapacityAppropriateForVehicle` uses `Battery Capacity (AH)` from vehicle row, not just vehicle-type ranges.
4. **Variant = fuel type:** In Zipowatt, "variant" is Petrol/Diesel, not trim (LXI, VXI).
5. **Segment mapping:** CARS→car, SUV→suv, BIKES→bike, TRUCKS/MPV→truck.
6. **Product limit:** Returns top 6 matches.
7. **Price filter:** Products without valid price are excluded.
8. **Power backup:** Appliances can be admin-defined via Liquid blocks; fallback to hardcoded list.
9. **Biomedical warning:** Checkbox shows warning about isolation transformer when checked.
10. **Installation checkboxes:** Multiple select (trolley, electrical services) with `data-installation` attribute.
