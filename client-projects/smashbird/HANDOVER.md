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

**Photography.** Four professional product photographs were shared in conversation
but could not be retrieved (image host blocked by network policy) and are **not** in
the repository. The site currently uses the earlier lower-resolution photographs
(1000px wide — below what a full-bleed hero needs on a high-density display).
Supply the originals as files.

---

## 3. MENU — content required

Real product names and the eleven category names are in place. Not supplied, so
**not shown**: prices, descriptions, allergens, product photography, per-item
availability, per-item order URLs.

Products render as name-only tiles until filled in. Each supports:
`name, description, price, image, allergens, vegan, vegetarian, glutenFree,
available, orderUrl`.

⚠ **Category assignment needs a check.** Products were grouped by best inference
from their names (e.g. *The Melter* → Burgers, *Disco Fries* → Loaded). Confirm the
real grouping — especially *Birdhouse Tendies & Fries*, which may belong under
Meal Deals rather than Birds.

Also required: how allergen information is provided to customers
(`allergenNote`). No claim is currently made.

Gluten-free is stated only as **"options available"** — never as a blanket claim
across the menu.

---

## 4. SAUCES — content required

Three Birdhouse sauces are named: **Buckie BBQ**, **Bum Burner**, **Burnt**.

Not supplied and therefore not shown: bottle imagery/logos, flavour descriptions,
heat levels, allergens, recommended pairings, bottle availability, purchase links.
Descriptions and heat levels have **not** been invented.

Also required: the Birdhouse social link (`birdhouseSocial`).

---

## 5. LOCATIONS — content required

**Cross Street** — address confirmed and published:
`3 Cross Street Lower, Galway, H91 T995`

**Liosbán** — only the area is published: `Liosbán Industrial Estate, Galway`.
An eircode of `H91 D8VP` was previously supplied but the unit and street are
unconfirmed, so the full address stays unpublished.

Required for **both**: Google Maps URL, opening hours, phone, dine-in status,
collection status, delivery status, location-specific ordering URL, real
exterior/interior photograph.

**Dominick Street** closed 31 December 2025. It does not appear anywhere in the
site, and a repository-wide search confirms zero occurrences. Keep it that way.

---

## 6. ORDERING — blocking for the primary CTA

`ORDER NOW` opens a location chooser (Cross Street / Liosbán) as specified. **No
ordering URLs were supplied**, so no generic link is used — a single shared link
would send customers to the wrong branch.

Required: one URL per location (`locations[].orderUrl`), and confirmation of which
platform each branch uses (`ordering.platforms` — Flipdish and/or Deliveroo).

Until then the chooser routes to that location's details rather than off-site.

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

## 8. FORMS — needs a backend

The contact and catering forms validate in the browser and are fully labelled and
keyboard-accessible, but **submit nowhere**. This is a static site on Netlify with
no build step.

Two options:
1. **Netlify Forms** — add `data-netlify="true"` and a hidden `form-name` field to
   each `<form>`. No environment variables needed.
2. **External endpoint** — set `catering.formEndpoint` / `contact.formEndpoint`.

Until one is connected the submit handler shows an inline message and does not
pretend the message was sent.

The catering form collects: name, email, phone, event type, event date, location,
estimated guests, message, consent checkbox.

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
| Flipdish and/or Deliveroo | Order CTA | URLs required |
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
