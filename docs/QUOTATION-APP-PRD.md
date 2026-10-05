# Rapid Quote Engine — Product Requirements Document (MVP)

**Company:** Universal Motorcycle and Hardware Stores / Universal Batteries  
**Branches:** MG Road (Secunderabad), Karkhana  
**Status:** Spec locked from samples + founder decisions (Sep 2026)  
**Samples:** `Samples/Universal_Price List.xlsx`, `Samples/26-27_065 Qt. Sitaram Spinners Private Limited.pdf`

---

## 1. Vision

Mobile-first internal quotation app so shop staff can produce an accurate, professional PDF quote in **under 30 seconds**, without seeing cost (DP), while Admin retains full margin visibility and control.

---

## 2. Roles (RBAC)

| Role | Create quotes | Categories | See DP / true margin | Delete quotes | Manage prices, rules, users, imports |
|------|---------------|------------|----------------------|---------------|--------------------------------------|
| **Admin** (Founder/Director) | All | All | Yes | Yes | Yes |
| **Salesperson** | All categories | All | No — Target + Floor only | No | No |
| **Shop boy** | Restricted | Assigned only (e.g. Automotive, 2-wheeler) | No — Target + Floor only | No | No |

---

## 3. Pricing model (source of truth = DP)

### 3.1 Principles
- **DP is GST-inclusive** for almost all products (default GST **18%** CGST+SGST / IGST).
- GST % is assigned at **subcategory** level (overrideable; default 18%).
- Quote rates/amounts shown to customers are **inclusive of GST**.
- Staff **never** see DP. They only see:
  - **Floor** = no-regret / customer negotiation floor  
  - **Target** = good-margin asking price (slightly above Floor)

### 3.2 Computation (runtime — not Excel columns)

```
Floor  = apply(DP, floor_markup) then apply_rounding(floor_rule)
Target = apply(Floor, target_markup) then apply_rounding(target_rule)
         OR apply(DP, target_markup) — prefer Target derived from Floor + target rule
```

**Defaults (Admin-editable globally and per customer / per quote):**
| Setting | Default | Editable as |
|---------|---------|-------------|
| Floor markup on DP | **+11%** (`DP × 1.11`) — matches Pricing Criteria “Customer” | % of DP |
| Target markup | **+3% above Floor** (`Floor × 1.03`) | **% of Floor** *or* **fixed ₹ amount** |
| Rounding | Configurable (e.g. round **up to next ₹100** for consumers; none / nearest ₹10 for resellers) | Rule presets per customer type / customer / quote |

**Situation override:** On any quote, user (or Admin) can change markup % / fixed add-on / rounding for that quote without editing the product master.

**Excel Reseller / Customer / Universal columns:** imported as optional reference only. Day-to-day quoting **always recomputes from DP + rules**.

### 3.3 Customer-specific rules
- Customer types: End consumer, Institution, Reseller, Electrician, etc.
- Per customer (e.g. Jain Electronics): preset floor % on DP, target rule, rounding.
- Selecting customer on quote auto-applies their rules; can still nudge Target↔Floor on the line.

### 3.4 Admin margin
- Per line and per quote: `Amount − DP×qty − |buyback|` (and GST breakdown if needed for reports).
- Aggregates by branch, salesperson, date range.

---

## 4. Buyback

**Source sheet:** `Weight Comparison` in the dealer workbook.

| Fields | Meaning |
|--------|---------|
| Min / Max Ah | Capacity range of old battery |
| Buyback Price (Rs) | Fixed credit (negative), e.g. −900 for 35–42 Ah |
| Weight range | Informational / future; **quote uses Ah slab ₹**, not ₹/kg |

**On quote:** Toggle buyback → enter Ah (or inherit from sold SKU) → lookup slab → negative line item (PDF style: `(₹-1,400)`).

---

## 5. Excel import strategy (multi-sheet workaround)

### 5.1 Do not require a single flat CSV
Accept the existing workbook. Use **sheet adapters** that map each product sheet into a **canonical product** row.

### 5.2 Sheets to import (source of truth)

| Sheet | Action |
|-------|--------|
| **Pricing Criteria** | Brand + Product Family → default Universal/Reseller/Customer *policy* (seed default markups; Admin can override in app) |
| **Amaron, Exide Vehicular, Luminous, Microtek, Amaron Quanta, Microtek Batteries, Exide_SMF_Industrial, Exide_Home, BPE, Hitachi, Amptek, Solar Structure** | Product catalog (when rows exist) |
| **Weight Comparison** | Buyback slabs |
| **Dealer Schemes** | Optional “special price” overrides (Phase 1.5) |

### 5.3 Sheets to **skip** (helpers / non-master)

| Sheet | Reason |
|-------|--------|
| **2 wheeler prices** | Staff helper only; derived from Amaron + Exide. **Do not import** as master. 2W SKUs come from brand sheets. |
| Rack Sizer | Tooling |
| Vehicle Compatibility | Finder data (optional later) |
| Exide-Amaron Equivalents | Cross-sell helper (optional later) |
| Vendor Tracker, Sheet14 | Empty / internal |

### 5.4 Category column on upload + separate hierarchy

**Upload:** Each product row in the price list will include a **Category** column (name or code matching a leaf node in the quote category tree). On import, the product is linked to that category. Unmatched category strings are flagged for Admin to map or create.

**Hierarchy (separate from Excel structure):** Admin maintains the full product tree in-app with **drag-and-drop** reorder/nest (parent → child → leaf). Hierarchy is **not** inferred from sheet names.

Example tree (illustrative):
- Automotive → Four-wheeler → Exide / Amaron leaves  
- Automotive → Two-wheeler  
- Power Backup → Inverters / UPS / Tubular batteries  
- Solar → …

**Per category / subcategory (Admin):**
- GST % (default 18%)
- Shop-boy ACL (which roles/users can quote that branch of the tree)
- Optional default markup/rounding overrides

**Note:** Quote categories are a **quote-app taxonomy** (can mirror website categories later, but are not the same CMS table by default).

### 5.5 Canonical product fields
- `sku` / model code, `brand`, `series`, `full_name`
- `capacity_value`, `capacity_unit` (`Ah` | `VA`)
- `dp_incl_gst` (always store inclusive; convert if sheet is excl.)
- `warranty_text`, `warranty_months_total`
- `category_id` (leaf from Category column / Admin assignment; GST from that node or nearest parent)
- `price_list_date`, `source_sheet`
- Optional reference: Universal / Reseller / Customer from Excel

### 5.6 Column map highlights
- **Category** (new on upload) → resolve to `category_id`
- Most sheets: `DP` → `dp_incl_gst`
- **Exide_Home:** `Recommended Resale Price` → `dp_incl_gst`
- **BPE / Hitachi:** `DP (Excl. GST)` → `dp_incl_gst = DP_excl × (1 + gst%)`
- Clean bad cells on import (e.g. date in Ah Range on Weight Comparison)

### 5.7 After import
Admin **spreadsheet-like bulk edit** for DP, category, warranty; drag-and-drop tree editor for hierarchy; re-upload workbook for periodic dealer revisions.

---

## 6. Quote numbering & branches

| Branch | Code (suggested) | Letterhead address |
|--------|------------------|--------------------|
| MG Road | `MG` | 2-4-78, M.G. Road, Secunderabad - 500 003 |
| Karkhana | `KK` | *(Admin-configurable address)* |

**Number format (MVP):** `{BRANCH}-{SEQ}/{FY}`  
Example: `MG-065/26-27` (extends current `065 / 26-27`).

- Sequence per branch per FY (or global — confirm at build; default **per branch**).
- **Source** field on quote (Walk-in, Phone, WhatsApp, Website later) — store now; optional embed in number in Phase 2.
- **Duplicate quote** → new number, copy lines/customer/markups.
- **Delete** → Admin only (soft-delete preferred).

---

## 7. 30-second quote flow (mobile)

1. Select **branch** (or locked by user profile).  
2. Find/create **customer** (name + mobile; Google-style autocomplete).  
3. Search **product** (type `BTX` → BTX5R, BTX7R…); show **Target** and **Floor** only.  
4. Set qty; optional **buyback**; optional service line.  
5. Adjust line price between Floor–Target (or Admin override).  
6. One tap → **PDF** (branch letterhead) + save to ledger.

**OTP / website self-service:** Phase 2 (OTP would break 30s goal).

---

## 8. PDF (modernize sample, keep all info)

Mirror current content, improve aesthetics:

- Header: brand, distributor line, **branch address**, phone  
- Meta: To, Quote No, Date  
- Table: S.No, Description, Warranty (months), Volts, AH/VA, Qty, Rate, Amount  
- Buyback as negative line  
- Total  
- T&Cs (Taxes inclusive GST @ rate, Delivery, Payment, Warranty, Transport, Validity, Installation)  
- Bank / OD account block  
- “Computer generated” + sign-off  

Visual: clean typography, Universal red/blue accents, clear hierarchy — not a clone of the old dense layout.

---

## 9. Monitoring (Admin)

- Quotes by user, branch, date range  
- Quote count + value; Admin-only margin  
- Filter by source, customer type  

---

## 10. App placement & auth (locked)

**Inside this project** (Universal Batteries Website_2), not a separate repo.

| Surface | Path (suggested) | Users |
|---------|------------------|--------|
| Public website | `/`, `/categories`, … | Customers |
| Website CMS | `/admin`, `/admin/login` | Content admins **only** |
| **Rapid Quote Engine** | `/quotes`, `/quotes/login` | Shop / sales / founder (quote roles) |

### Separate login — hard rule
- Quote app has its **own login** at `/quotes/login`. It is **not** `/admin/login` and does **not** reuse the CMS login UI or session gate.
- **Shop staff never access Admin.** No links to `/admin` from the quote app. Middleware **blocks** quote-only users (`salesperson`, `shop_boy`) from every `/admin/**` route even if they somehow hit the URL.
- CMS admins who also need quotes get an explicit **quote role grant**; they still use `/quotes/login` (or a dual-capable account that is checked per-route). Preferred: **separate quote accounts** for floor staff so CMS credentials are never shared with the shop.
- After `/quotes/login` success → always land on `/quotes` (never `/admin`).
- Quote Admin (import, hierarchy, users, margins) lives under **`/quotes/admin`**, which is part of the quote product — **not** the website CMS. Only `quote_admin` role can open it. Shop boys and salespeople cannot.

### Auth implementation sketch
- Supabase Auth users tagged with `app_access`: `website_cms` | `quotes` | both (rare).
- Quote profile: `quote_role` = `quote_admin` | `salesperson` | `shop_boy`, plus `branch_id`, `allowed_category_ids`.
- Middleware:
  - `/admin/**` → requires CMS access; reject quote-only users with redirect to `/quotes` or 403.
  - `/quotes/**` → requires quote access; reject CMS-only users with redirect to `/admin` or 403.
- RLS: quote tables readable/writable only by quote roles; website CMS tables unchanged and invisible to shop staff.

---

## 11. Tech direction (MVP)

- **Next.js 14** App Router + TypeScript + Tailwind (this monorepo)  
- **Supabase** Auth + Postgres (separate quote RBAC + RLS)  
- Fast search: Postgres `pg_trgm` / full-text, or client Fuse if catalog is modest  
- PDF: client-side (`@react-pdf/renderer` or similar)  
- Import: server parse of `.xlsx` with per-sheet adapters  
- Hierarchy UI: `@dnd-kit` (already in this project) for drag-and-drop category tree  

---

## 12. MVP vs later

### MVP
- Separate `/quotes` auth + roles + category ACL  
- Category tree Admin (drag-and-drop) + Category column on import  
- Workbook import (adapters) + Weight Comparison  
- Products, customers, markup/rounding settings  
- Quote builder + duplicate + Admin delete  
- PDF by branch letterhead  
- Admin margin + basic monitoring  

### Phase 2
- OTP / lead CRM  
- Website self-service quotes  
- Dealer Schemes specials UI  
- Vehicle compatibility / equivalents in search  
- Offline drafts  
- Optional sync/link between quote categories and website CMS categories  

---

## 13. Locked decisions log

| Topic | Decision |
|-------|----------|
| DP tax | Inclusive GST; default 18% by subcategory |
| Floor | Markup on DP (default +11%); Staff “no regret” |
| Target | Default **+3% on Floor**; editable as **% or fixed ₹** |
| Rounding | Configurable rules (not hard-coded) |
| Excel list columns | Reference only; compute from DP |
| 2 wheeler sheet | Helper only — **do not import** |
| Buyback | Ah slabs from Weight Comparison |
| Branches | MG Road + Karkhana; PDF address by branch |
| Quote delete | Admin only |
| Staff prices | Target + Floor only |
| Category on upload | **Category column** on price list maps product → leaf category |
| Hierarchy | Maintained **separately** by Admin with **drag-and-drop** |
| App placement | **Inside this project** at `/quotes` |
| Auth | **Separate** `/quotes/login` — **not** CMS `/admin/login` |
| Shop staff | **Never** access website `/admin` (middleware + no UI links); quote settings only via `/quotes/admin` for `quote_admin` |

---

## 14. Open items (small — resolve at build start)

1. Exact **Karkhana** address + phone for letterhead.  
2. FY sequence: reset on Indian FY (1 Apr)?  
3. Volts on PDF: default **12** for batteries; blank/N/A for UPS lines?  
4. Exact header name for Category column on upload (e.g. `Category` vs `Quote Category`).
