# Skill: Local SEO

## What This Skill Does
Loads a complete local SEO implementation guide for small businesses. Covers Google Business Profile, local citations, on-page local signals, and schema markup. Ensures the website ranks for location-based searches.

## When to Use
Activate for all local businesses — restaurants, B&Bs, service businesses, shops, cafés, and any business where location matters to the customer. This is almost every client.

## Agent That Uses It
SEO Agent (Phase 8)

---

## SKILL INSTRUCTIONS

### LOCAL SEO FUNDAMENTALS

#### The Local SEO Triangle

Local ranking depends on three factors (Google's own framework):
1. **Relevance** — Does the business match what the searcher wants?
2. **Distance** — How close is the business to the searcher?
3. **Prominence** — How well-known and trusted is the business online?

Your job is to optimise for relevance and prominence. Distance is fixed.

---

#### 1. GOOGLE BUSINESS PROFILE (HIGHEST PRIORITY)

GBP is the single most impactful local SEO asset for most small businesses.

**Claim and verify:** If not claimed, claim it first.

**Profile completion checklist:**
- [ ] Business name (exact match to website + all directories)
- [ ] Category set correctly (primary + up to 9 secondary categories)
- [ ] Business description written (750 chars, keyword-rich, specific, not generic)
- [ ] Address confirmed and matching everywhere
- [ ] Phone number confirmed (local number preferred over 0800/national)
- [ ] Website URL confirmed
- [ ] Opening hours set correctly (including seasonal hours if applicable)
- [ ] Special hours set (bank holidays, Christmas closures)
- [ ] Attributes set (Outdoor seating, Wheelchair accessible, Free WiFi, etc.)
- [ ] Photos uploaded: exterior, interior, product/food/rooms, team (minimum 10 photos)
- [ ] Cover photo: premium quality, 1024x768px minimum
- [ ] Logo uploaded
- [ ] Services or menu items listed
- [ ] Q&A section reviewed and answered
- [ ] First post published (welcome post with CTA)

**Ongoing GBP actions (for Maintenance Agent):**
- Post weekly or bi-weekly
- Respond to every review (positive and negative) within 48 hours
- Update photos monthly
- Add special offers or events as posts

---

#### 2. NAP CONSISTENCY

NAP = Name, Address, Phone Number.

This must be IDENTICAL across:
- Website (every page that shows it)
- Google Business Profile
- Bing Places
- Apple Maps
- Facebook Business page
- Any industry directories (TripAdvisor, Yelp, etc.)

**Common NAP mistakes:**
- "St" vs "Street" vs "St."
- "Co. Kerry" vs "County Kerry"
- Different phone number formats: +353 66 123 4567 vs 066 123 4567
- Business name with and without "Ltd" or "& Co"

**Choose an exact format and use it everywhere. Document it in the SEO brief.**

```
Exact NAP format for [Client Name]:
Name: [Exact business name as it appears on GBP]
Address: [Line 1], [Line 2], [Town], [County/Region], [Postcode]
Phone: [Exact format: e.g., 087 123 4567 or +353 87 123 4567]
```

---

#### 3. ON-PAGE LOCAL SIGNALS

**Location keywords in content:**
- Include town/city name in H1 or H2 on the homepage (naturally, not forced)
- Include location in meta title tag on homepage and contact page
- Include location in meta description
- Mention neighbourhood/area where relevant

**Contact page requirements:**
- Full address written out in text (not just a map)
- Phone number as clickable link: `<a href="tel:+35312345678">`
- Email as clickable link: `<a href="mailto:info@business.com">`
- Google Map embedded
- Opening hours
- Directions (driving, public transport if applicable)

**Footer requirements:**
- NAP in footer on every page
- Consistent with GBP format

---

#### 4. LOCAL SCHEMA MARKUP

Use the most specific schema type available:

| Business Type | Schema Type |
|---|---|
| Restaurant | `Restaurant` |
| Café | `CafeOrCoffeeShop` |
| B&B | `BedAndBreakfast` |
| Hotel | `Hotel` |
| Hair salon | `HairSalon` |
| Plumber | `Plumber` |
| Electrician | `Electrician` |
| Generic service | `LocalBusiness` |

Required fields:
- `name` (exact NAP match)
- `address` (PostalAddress with all subfields)
- `telephone` (exact NAP match)
- `url`
- `openingHoursSpecification`
- `geo` (GeoCoordinates — get from Google Maps)
- `image` (main business photo URL)
- `sameAs` (array of all directory/social profile URLs)

Optional but valuable:
- `priceRange` (e.g., "€€" or "££")
- `servesCuisine` (for restaurants)
- `menu` (URL to menu page)
- `hasMap` (Google Maps URL)
- `aggregateRating` (if using real review data)

---

#### 5. LOCAL KEYWORD STRATEGY

Keyword formula for local businesses:
`[Service] + [Location]`

Examples:
- "coffee shop Cork city centre"
- "B&B Dingle Peninsula"
- "garden maintenance Dublin"
- "Thai restaurant Galway"

**Where to include them:**
- Homepage title tag: `[Business Name] | [Service] in [Location]`
- Homepage H1 or H2
- Homepage meta description
- Contact page title: `Contact [Business Name] | [Location]`
- Services/menu/rooms pages: `[Service] | [Business Name], [Location]`

**Long-tail local keywords to target:**
- "[service] near [landmark]" (e.g., "restaurant near Galway Cathedral")
- "[service] [neighbourhood]" (e.g., "coffee shop Westport town centre")
- "[service] [occasion]" (e.g., "Sunday brunch Kerry", "dog-friendly restaurant Cork")

---

#### 6. LOCAL CITATION BUILDING

Top directories for Irish/UK businesses:

| Directory | Priority | URL |
|-----------|----------|-----|
| Google Business Profile | Critical | business.google.com |
| Bing Places | High | bingplaces.com |
| Apple Maps | High | mapsconnect.apple.com |
| Facebook Business | High | facebook.com |
| TripAdvisor | High (hospitality) | tripadvisor.com |
| Yelp | Medium | yelp.ie / yelp.co.uk |
| Yell | Medium (UK) | yell.com |
| Golden Pages | Medium (IE) | goldenpages.ie |
| Eatery (restaurants) | Medium | eatery.ie |

**NAP must be identical on every directory.**
