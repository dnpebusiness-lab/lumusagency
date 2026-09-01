# Smashbird — Developer Handover & Outstanding Items

Everything below is **required before the site can go live**. All content lives in
`content.js`. Set the value, flip the matching `confirmed` flag to `true`, and the
element appears. Nothing on the public site is invented — unconfirmed facts are hidden
rather than guessed.

---

## 1. LEGAL — blocking

The currently published privacy policy contains **blank fields** for registration
number and registered address. That incomplete text has deliberately **not** been
carried over.

| Item | `content.js` key | Status |
|---|---|---|
| Legal company name | `legal.companyName` | Required |
| Company registration number | `legal.registrationNumber` | Required |
| Registered business address | `legal.registeredAddress` | Required |
| Privacy contact email | `legal.privacyEmail` | Required |
| Privacy Policy URL | `legal.privacyPolicyUrl` | Required |
| Cookie Policy URL | `legal.cookiePolicyUrl` | Required |
| Terms & Conditions URL | `legal.termsUrl` | Required |
| Allergen information URL | `legal.allergenInfoUrl` | Required |

**Cookies and consent**
- The cookie policy must list the cookies actually set — not a generic template.
- No analytics or advertising script may load before consent. The site currently
  loads **no** tracking of any kind, so it is compliant as it stands. Adding
  analytics later requires a consent gate first.

---

## 2. BRAND ASSETS — blocking

**Logo.** The official artwork was not supplied. The mark in `index.html` is a
**hand-drawn SVG approximation** created before this brief. It must be replaced with
the supplied files. Do not redraw it again.

- Stacked → `brand.logo.stacked`
- Horizontal → `brand.logo.horizontal`
- Avatar → `brand.logo.avatar`

**Fonts.** Nimbus Sans Narrow Bold (display) and Nimbus Sans Regular/Bold (body) are
licensed and are **not** in the repository. No unlicensed font file has been
downloaded. The stack currently falls back to metrically similar grotesques.
Supply the licensed web-font files, or confirm a licensed web-font service.

**Photography — how to add it.** Photos resolve from Cloudinary **by naming
convention**, so adding one is an upload, not a code change.

| Product | Upload as |
|---|---|
| The Melter | `smashbird/the-melter` |
| Jalapeño Hatch | `smashbird/jalapeno-hatch` |
| Birdhouse Tendies & Fries | `smashbird/birdhouse-tendies-fries` |
| Drty Secret VG | `smashbird/drty-secret-vg` |

Rule: lower-case, accents stripped, `&` dropped, spaces to dashes.

Upload any format at the largest size available. Cloudinary crops to 4:3, finds
the subject itself (`g_auto`), converts to WebP/AVIF per browser and serves 400w
or 700w by device. Nothing enters the repository, and replacing a photo later
means re-uploading over the same public ID — no redeploy.

Then set `photos.enabled = true` in `content.js`. One switch for all of them.

A product with no photo yet shows no photo — the image is dropped on error, never
a broken icon, so photos can arrive a few at a time.

An optional hero photo goes in `photos.hero.id`.

**Video — same convention.** Upload to `smashbird/video/` and set
`video.hero.id` plus `video.enabled = true`. Cloudinary renders the poster frame
from the clip itself, so one upload covers both.

Non-negotiable behaviour, built in rather than left to configuration:
- always muted, looped and `playsinline` — autoplay with sound is never used
- `preload="none"`; the poster carries the panel and the clip fades in only once
  it can actually play, so the hero never sits empty on a slow connection
- `prefers-reduced-motion` or Save-Data / 2G gets the poster and no video at all

Keep clips **4–8 seconds and silent by design** — it is wallpaper, not a film.
A hero video replaces the cycling brand lines; leave `video.hero.id` null to keep
them.

Note on cost: Cloudinary bills video transformations far more heavily than
images. One hero loop is fine on the free tier; a video per menu card is not, and
would be the wrong call anyway — twelve loops competing on one screen is noise,
and it is a lot of mobile data for someone deciding what to eat.

⚠ Still worth saying: a food menu without product images converts worse. This
makes adding them cheap — the remaining work is a photographer.

**Motion.** Three pieces, all transform/opacity only:
1. Hero panel — the approved brand lines cycle every 3.6s on a 3D flip.
2. Category words (SMASHED / FRIED / LOADED / VEGAN JUNK) — extruded type that
   tilts with scroll position.
3. Menu and sauce cards — staggered fade-up, replayed when the category changes.

All three stop under `prefers-reduced-motion`; the cycling panel also pauses when
the tab is hidden. 61fps on mobile in a headless container.

---

## 3. MENU — supplied and live

Verified against the official Smashbird Flipdish site on 31 August 2026 and now
live in `content.js`. Cross Street and Liosbán show the same menu and prices, so
one list serves both — stated on the menu page.

Categories are exactly what the official site shows: Burgers, Birds, Vegan Junk,
Dawgs, Sides, Drips, Drinks, Sauce Bottles, Kids Menu. There is deliberately **no
"Meal Deals" and no "Loaded"** category. No Deliveroo prices were imported.

"From €X" prices are kept as "From". Allergens are shown per item exactly as
published — nothing added, nothing inferred. Gluten-free is never claimed on an
item; the proof strip says only that options are available.

Still required: product photography, per-item availability, and confirmation of
how allergen information is given in store (`allergenNote`).

---

## 4. SAUCES — supplied and live

Seven Birdhouse retail bottles with prices, sizes, descriptions, allergen advice
and links to birdhouse.ie. Two have no heat rating shown because the source
contradicts itself (see Content Issues).

The Sauce Bottles category on the menu lists only the six bottles the Smashbird
menu actually sells. **Bum Burner and Burnt Butter Buffalo are not listed as
available in store** even though Birdhouse.ie sells them online.

Birdhouse descriptions are marketing copy, not legal ingredient lists — the site
says so under the sauce grid.

Wholesale tubs (1L/5L/10L) exist but prices are unpublished, so nothing about
wholesale appears on the site.

Still required: bottle imagery, the Birdhouse social link.

---

## 5. LOCATIONS — addresses and ordering confirmed

| | Cross Street | Liosbán |
|---|---|---|
| Address | 3 Cross Street Lower, Galway, H91 T995 | Unit 8, Liosban Industrial Estate, 1 Kilkerrian Park, Tuam Rd, Galway, H91 D8VP |
| Collection | ✅ live | ✅ live |

Both order links point at the official Flipdish collection URLs, one per branch.

Still required: Google Maps URLs, **regular weekly opening hours** (a live
open/closed status is not weekly hours and was not used), phone numbers, dine-in
and delivery status, real photographs.

**Dominick Street** closed 31 December 2025. Zero occurrences in the repository.
Birdhouse.ie still shows that old address — it must never be copied across.

---

## 6. ORDERING — live

`ORDER NOW` opens a per-branch chooser and each button goes to that branch's own
Flipdish collection URL. No shared link is used.

Deliveroo is not wired up: the award is displayed, but no Deliveroo ordering URL
was supplied and no Deliveroo prices were imported.

---

## 7. REVIEWS — content required

The reviews section renders **only** when genuine reviews are supplied. The array is
currently empty, so the section does not appear at all. No review has been written
or paraphrased.

Each entry requires: exact review text, customer name, platform, rating, date,
source URL.

Instagram is linked directly (`https://www.instagram.com/smashbird_galway/`). No
fake feed is embedded. Supplying real images to `social.grid` turns on a curated
grid beside the link.

---

## 8. FORMS — ready, one switch away

Both forms are wired for **Netlify Forms** and send in the background, so people
stay on the site instead of landing on Netlify's own thank-you page. They are
inert until the switch is flipped.

**To make enquiries arrive at a Smashbird inbox:**

1. Netlify → the project → **Forms** → enable form detection.
2. Redeploy (detection reads the deployed HTML, so it needs one deploy to see
   the two forms).
3. Forms → `catering` and `contact` → **Form notifications** → Add notification →
   **Email notification** → enter the Smashbird address.
4. In `content.js` set `forms.netlify.enabled = true`.

The destination address lives in the Netlify dashboard, **not in the repository**
— it never appears in the page source, so spam crawlers cannot scrape it. Change
it later without touching code.

Free tier covers 100 submissions a month. Both forms carry a honeypot field
(`bot-field`) against bots.

**Until step 4:** each form validates, then says plainly that it is not live yet
and points to Instagram. It never shows a fake "sent" confirmation.

The catering form collects: name, email, phone, event type, event date, location,
estimated guests, message, consent checkbox.

Alternative: set `catering.formEndpoint` for a third-party endpoint instead.

---

## 9. STRUCTURED DATA

`Restaurant` schema is emitted using **confirmed facts only** — name, Cross Street
address, Galway locality, Instagram as `sameAs`, and the Deliveroo award.

Deliberately omitted until confirmed: `openingHours`, `telephone`, `priceRange`,
`servesCuisine`, `aggregateRating`, `geo`. Adding unverified values here is a search
policy violation, not just an inaccuracy. Fill `content.js` and extend the schema
block in `index.html` together.

---

## 10. ENVIRONMENT / EXTERNAL SERVICES

| Service | Needed for | Status |
|---|---|---|
| Flipdish | Order CTA | ✅ live, one URL per branch |
| Deliveroo | Optional second channel | No URL supplied |
| Netlify Forms *or* form endpoint | Contact + catering | Not connected |
| Licensed Nimbus Sans web fonts | Typography | Not supplied |
| Analytics (optional) | — | Not installed. Requires consent gate first |

No API keys or environment variables are required by the current build.

---

## 11. BUILD & TOOLING — note

This project is a **single static HTML file** with no `package.json`, bundler,
TypeScript, linter or test suite. The brief's final checks assumed a framework
project, so:

- Formatter / linter / type-check / test suite / production build: **do not exist**
  and were not run — there is nothing to run them against.
- Verification was done instead by rendering the page in headless Chromium at
  375px, 390px, 768px, 1024px and 1440px, checking for horizontal overflow,
  JavaScript errors, heading order and focus behaviour.

If a build pipeline is wanted later, migrating to Astro (the agency default) would
suit this site — but that is a rebuild decision, not a fix, and was out of scope
here.

---

## 12. CONTENT ISSUES — unresolved, nothing guessed

Machine-readable copies live in `content.js` under `contentIssues`.

| # | Where | Problem | What the site does |
|---|---|---|---|
| 1 | Birdhouse — Burnt Butter Buffalo | Heat given as 5/10, 6/10 and 2/3 in three places | No rating shown |
| 2 | Birdhouse — Jerk BBQ | Heat given as 4/10, 2/10 and .5/3 | No rating shown |
| 3 | Birdhouse — Mango Mazzaleen | No allergen advice on the product page | Nothing shown; dip allergens **not** carried across — different product |
| 4 | Birdhouse — Teeling Whiskey | Page says 250ml, extra info mentions 105ml and 250ml | Only 250ml shown |
| 5 | Birdhouse — all bottles | No complete ingredient labels published | Descriptions labelled as marketing copy, not ingredients |
| 6 | Sauce bottles in store | Bum Burner and Burnt Butter Buffalo sell online but are not on the Smashbird menu | Not listed as available in store |
| 7 | Drips — Burnt Butter Buffalo | Source shows `(V0)` | Not reproduced; no dietary label shown |
| 8 | Dawgs — The Stray | Described as vegan merguez, but allergens list Eggs and Milk | Allergens shown as published; **no vegan claim made** |
| 9 | Sides — Jalapeño Jam Fries V | Description reads "Saberno fior de latter, jalapeño jam" | Description withheld; cheese/brand not guessed |
| 10 | Birds — Tendies, Wings ×2, Chick N Pop | Allergens vary by flavour, not published per item | No allergens shown |
| 11 | Burgers — Rasta Burger | Crustaceans and Fish via Caribbean Jerk; Birdhouse jerk data inconsistent | Shown as published, flagged |
| 12 | Vegan Junk — Cabbage Fritter | No allergens there; the Sides copy lists Cereals and Sulphites | Sides entry shows them, Vegan Junk entry does not |
| 13 | **Photography** | Supplied hero images are named `ChatGPT_Image…`, i.e. AI-generated food photography, which the brand brief rules out | In use pending a decision |
| 14 | Opening hours | Only a live open/closed status available | No hours published |
| 15 | Alcohol | Wine and beer on the menu | Listed; no delivery or age-verification claims made |

Presentation fixes applied: `Allergan` → `Allergen`. No ingredient or allergen
meaning was altered anywhere.
