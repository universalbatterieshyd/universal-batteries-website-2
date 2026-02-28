# Universal Batteries – Growth Engine & Sizers Roadmap

Additive build plan. No changes to existing screens. Maintain current visual scheme.

---

## Phase 1: Foundation & Lead Capture (3–4 weeks) ✅

- [x] **Solution landing pages**
  - [x] `/solutions/home-backup` – inverter + battery for homes
  - [x] `/solutions/office-ups` – UPS + AMC for offices, clinics, datacentres
  - [x] `/solutions/factory-power` – industrial/institutional
  - [x] `/solutions/home-solar` – off-grid solar for homes
  - [x] `/solutions/business-solar` – on-grid solar for businesses

- [x] **Hero CTAs** – Update to 3 segment CTAs:
  - [x] "Need home backup or solar?" → guided flow
  - [x] "Running an office, clinic or datacentre?" → UPS/solar/AMC flow
  - [x] "Looking for a battery replacement?" → quick-buy / call-back

- [x] **Lead forms**
  - [x] Battery finder (simple dropdown) – submits to leads table
  - [x] UPS proposal form
  - [x] Solar enquiry form

- [x] **Leads backend**
  - [x] `leads` table (phone, area, type, source, payload JSON)
  - [x] Admin view to list, filter, assign leads

- [x] **Resource pages** – 2–3 educational guides
  - [x] "Homeowner's guide to backup and solar in Hyderabad"
  - [x] "How to choose the right UPS for your office"
  - [x] "Solar basics: Off-grid vs on-grid"

- [x] **Nav structure** – Add "Solutions" and "Resources" (keep existing "Products")

---

## Phase 2: Sizers & Support (4–6 weeks)

### Reusable wizard engine
- [ ] **Generic wizard component** – config-driven steps, progress bar, validation
- [ ] **Shared:** step navigation, lead capture, product recommendation display

### Automotive battery sizer
- [ ] **Vehicle compatibility data model**
  - [ ] `vehicle_compatibility` table (brand, model, fuel_type, segment, capacity_ah)
  - [ ] `battery_group` table (logical equivalence groups)
  - [ ] `product_battery_group` (many-to-many) – new battery = assign to group, no tag copying
- [ ] **Battery finder wizard**
  - [ ] Brand → Model → Variant (fuel type) – progressive disclosure
  - [ ] Vehicle type auto-detect or manual
  - [ ] Match scoring (exact, partial, capacity-appropriate)
  - [ ] Product cards with match badges, warranty, exchange price
  - [ ] No-results: "Show similar" + Contact/WhatsApp
- [ ] **Admin UI** – manage vehicle list, battery groups, product assignments
- [ ] **Data migration** – Excel/CSV import for vehicle database

### Power backup sizer
- [ ] **Load calculator**
  - [ ] By appliances (visual cards + list) – admin-configurable appliance list
  - [ ] Direct load (watts)
- [ ] **Battery/inverter logic**
  - [ ] Formula: Ah = (Load × Backup Hrs) / (Voltage × DoD × Efficiency × De-rating)
  - [ ] Inverter config: VA → battery count, voltage (offline vs online)
  - [ ] UPS type: Offline (1–2 hr) vs Online (5 min–1.5 hr)
  - [ ] Biomedical load → isolation transformer note
- [ ] **Installation** – trolley (offline) vs metal rack (online)
- [ ] **Output** – inverter + battery + accessories recommendations
- [ ] **"Talk to expert"** CTA with pre-filled lead data

### Solar sizer
- [ ] **Off-grid** – reuse power backup wizard + "Add solar charging?" step
- [ ] **On-grid** – separate flow
  - [ ] Inputs: roof type, area, city, monthly bill
  - [ ] Output: kW range, savings estimate
  - [ ] CTA: "Book site survey"

### Support & service
- [ ] **Support ticket form** – category, urgency, photos, preferred slot
- [ ] **Ticket admin** – assign, update status, resolve
- [ ] **Solar calculator (basic)** – bill + roof area → kW, savings

### Account signup (optional in Phase 2)
- [ ] Phone + OTP for future portal

---

## Phase 3: Customer Portal & Automation (6–8 weeks)

- [ ] **Customer portal (MVP)** – login via phone OTP
- [ ] **Project tracker** – stages: Survey → Design → Approvals → Installation → Testing
- [ ] **Asset & warranty view** – batteries, inverters, UPS, solar with expiry dates
- [ ] **Service history** – past tickets and status
- [ ] **Automated reminders** – warranty expiry, AMC due, battery life (WhatsApp/email)
- [ ] **Lead scoring** – e.g. datacentre + >20 kVA = high priority
- [ ] **Admin improvements** – lead assignment, status, notes, filters

---

## Phase 4: Intelligence & Integrations (ongoing)

- [ ] **UPS proposal logic** – load/org type → rough kVA estimate on form
- [ ] **Solar calculator v2** – city, roof type, orientation → better kW/savings
- [ ] **Monitoring APIs** – inverter/solar monitoring → generation stats in portal
- [ ] **WhatsApp automation** – templates for reminders, follow-ups
- [ ] **Email automation** – same for email channel
- [ ] **Dealer/wholesale flow** – separate forms and views for B2B (if needed)

---

## Phase 5: Mobile Apps (future)

- [ ] **Enterprise app** – UPS proposals, project tracking, AMC, tickets
- [ ] **Dealers app** – wholesale catalogue, orders, pricing
- [ ] **Customers app** – battery finder, warranty view, tickets, reminders
- [ ] **Shared APIs** – reuse backend from Phases 1–3

---

## Sizer Implementation Notes

- **Reusability:** One wizard engine, many sizer configs
- **Off-grid solar** reuses power backup logic + solar step
- **Automotive:** Use `vehicle_compatibility` + `battery_group` instead of tag-based matching
- **Reference:** `docs/ZIPOWATT_SIZER_IMPLEMENTATION_NOTES.md` for Zipowatt implementation details

---

## Dependencies

- Phase 2 requires Phase 1 (leads backend)
- Phase 3 requires Phase 2 (tickets, signup)
- Phase 4 can run in parallel with Phase 3
- Phase 5 requires Phases 1–3 (APIs and data model)
