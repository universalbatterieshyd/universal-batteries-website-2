# SEO, AEO & Google Listing Improvements

Actions to improve search visibility, AI Overview (AEO), and Google Business Profile presence.

---

## 1. On-Page SEO

### Meta tags (implement in `app/layout.tsx` and per-page)
- **Title:** 50–60 chars, include primary keyword + location  
  - e.g. `Universal Batteries | Automotive, Inverter, UPS Hyderabad | Since 1992`
- **Description:** 150–160 chars, compelling, with CTA  
  - e.g. `Genuine batteries & power solutions in Hyderabad. Automotive, inverter, UPS, solar. 30+ years, same-day delivery. Call or visit.`
- **Keywords:** Primary + long-tail (batteries Hyderabad, inverter battery Secunderabad, car battery replacement Hyderabad)
- **Canonical URL:** Prevent duplicate content
- **Open Graph / Twitter:** For social sharing

### Structured data (JSON-LD)
- **LocalBusiness** – name, address, phone, hours, geo
- **Product** – for product pages
- **FAQPage** – for FAQ sections
- **BreadcrumbList** – for category/product pages

### Technical
- **Sitemap:** `/sitemap.xml` – all pages, categories, solutions
- **Robots.txt:** Allow crawlers, reference sitemap
- **Core Web Vitals:** Optimize images (WebP), lazy load, minimize CLS
- **Mobile-first:** Responsive, touch-friendly

---

## 2. Content SEO

- **Unique H1 per page** – one main heading
- **H2/H3 hierarchy** – clear structure for crawlers
- **Internal linking** – link categories ↔ solutions ↔ resources
- **Long-form content** – 800+ words on key pages (About, category pages)
- **Location keywords** – Hyderabad, Secunderabad, Telangana
- **Schema for FAQs** – helps FAQ rich results

---

## 3. AEO (AI Overview / Search Generative Experience)

- **Clear, factual content** – AI prefers well-structured, authoritative text
- **Entity clarity** – consistent business name, address, contact
- **Structured data** – LocalBusiness, Organization
- **FAQ schema** – increases chance of AI citing your content
- **Authoritative tone** – expertise, experience, specifics (e.g. “30+ years”, “since 1992”)

---

## 4. Google Business Profile (Google Listing)

### Profile completeness
- Business name, category, address, phone, website
- Hours, attributes (e.g. “Same-day delivery”, “Wheelchair accessible”)
- Services list – Automotive batteries, Inverter, UPS, Solar, etc.
- Products – add key products with images
- Description – 750 chars, keywords, USPs

### Media
- **Photos** – storefront, products, team, installations (weekly)
- **Logo & cover** – high-res, consistent branding

### Engagement
- **Posts** – offers, updates, events (weekly)
- **Q&A** – answer customer questions
- **Reviews** – ask happy customers, respond to all

### Local SEO
- **NAP consistency** – same name, address, phone everywhere
- **Local citations** – JustDial, Sulekha, IndiaMART, etc.
- **Google Maps** – correct pin, service area

---

## 5. Quick Wins to Implement

| Action | Impact |
|--------|--------|
| Add JSON-LD LocalBusiness | Rich results, knowledge panel |
| Add FAQ schema to category FAQs | FAQ snippets |
| Generate sitemap.xml | Better indexing |
| Per-page meta (title, description) | Better CTR in SERPs |
| Optimize images (alt, WebP, sizes) | Core Web Vitals |
| Add `hreflang` if multi-language | International SEO |

---

## 6. Recommended Implementation Order

1. **Phase 1:** Meta tags, sitemap, robots.txt, LocalBusiness JSON-LD
2. **Phase 2:** Per-page meta, FAQ schema, image optimization
3. **Phase 3:** Content expansion, internal linking, blog/resources
4. **Ongoing:** Google Business Profile updates, reviews, posts
