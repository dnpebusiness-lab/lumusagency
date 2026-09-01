# Smashbird — Developer Handover & Outstanding Items

## 0. WHAT CHANGED IN THE ART-DIRECTION PASS

`index.html` was rebuilt rather than patched. The reason, from the audit:

- **Two complete design systems were layered on top of each other.** A v1
  editorial system (full-bleed slabs, list rows, split panes) had been
  superseded by a v2 card system, but none of v1 was deleted — roughly 190
  lines of CSS were unreachable and 67 class names were defined and never used.
  The distinctive half had been replaced by the generic half.
- **`--muted` was used 19 times and never defined.** The entire secondary-text
  tier rendered at primary weight, which flattened the hierarchy everywhere.
- **Five components — menu, sauce, location, order and review cards — were the
  same recipe**: `#0b0b0d`, a 1px white border, ~24px padding, dropped into an
  `auto-fit minmax(N,1fr)` grid where only N varied, and N was arbitrary. Every
  page below the hero was the same grid of grey boxes. That is the template tell.
- **Live bugs:** the v1 `footer` rule still applied to the v2 markup; the dark
  input theme was applied to the cream contact panel; the focus ring had been
  downgraded from yellow (12:1) to pink (3.3:1); `sendForm` was called from a
  scope it was not declared in and would have thrown the moment Netlify Forms
  was switched on; and `placements.vegan` was rendering into the *Loaded* strip.
- **The hero had five attention devices** competing in two viewports — a static
  headline, a rotating panel cycling four *different* brand lines, an award
  grid, a marquee, then four full-height strips.

What replaced it: one token system (colour, type scale, 8px spacing, motion),
four breakpoints instead of nine, one reveal system instead of two, one
`prefers-reduced-motion` block instead of four, and a different composition per
content type instead of five card grids. Colour values now come from the deck —
the previous build used `#FF1493`, which is the CSS keyword `deeppink`, not
Smash Pink `#FB2095`.

The **menu is a Wrap Paper panel set as an editorial price list**, because deck
slide 08 names black-on-paper 17.28:1 as "preferred for menus and long
information". That one move both follows the brand doc and removes the grey-card
problem. **Sauces are ranked by heat**, and the heat number is the only place
Hot Sauce yellow appears at size — which is exactly the 7% the deck reserves it for.

`content.js` was **not** rebuilt. It is the verified data layer and it survived
intact; only the photography block and the logo paths changed.

---

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

## 2. BRAND ASSETS — resolved

**Logo — supplied and in use.** The three official lockups were taken from the
Brand Identity & Art Direction deck (2026) and exported unmodified into `img/`.
The earlier hand-drawn SVG approximation has been **deleted**.

| Lockup | File | Used for | Deck minimum |
|---|---|---|---|
| Horizontal | `img/logo-horizontal.png` | Site header | 160px — held even at 375px |
| Stacked | `img/logo-stacked.png` | Footer, OG image | 96px — used at 168px |
| Avatar | `img/logo-avatar.png` | Favicon, touch icon | 40px |

Slide 06 rules are enforced in the CSS: the mark is never stretched, cropped,
recoloured, rotated, outlined, shadowed **or glowed**. The site's neon
treatment is applied to type only and never touches the logo — this is
verified in the QA pass.

**The bird.** `img/bird.png` is one silhouette lifted from the deck's
illustration sheet, isolated by connected-component so no neighbouring bird
bleeds into the crop. It is painted through CSS `mask-image`, so it is always
exactly one brand colour and the source file itself is never recoloured. Per
slide 11 it appears **twice on the whole site** — once cropped off the hero's
right edge, once in the footer. Never scattered, never small.

**Fonts — self-hosted.** Nimbus Sans Narrow Bold / Nimbus Sans are licensed and
were not supplied. No unlicensed font file has been downloaded. Barlow
Condensed and Barlow (open licence) stand in as deliberate metric-adjacent
substitutes and are served **from this domain**, not from Google — a request to
`fonts.gstatic.com` sends the visitor's IP to a third party, which is a live
GDPR question for an Irish business and one the cookie policy would then have
to answer. Latin subset, five weights, 109KB total, in `fonts/`.

Swapping in the licensed Nimbus files later is two lines: replace the
`@font-face` sources and the `--font-d` / `--font-b` stacks.

**Photography — how to add it.** Two routes, same naming convention. Which one
is live is set by `photos.source` in `content.js`.

**Route A — files in the site (`source: 'local'`, current setting).**
Drop photos into `img/` named after the product, then deploy the folder.
Nothing else. See `img/README.txt`.

| Product | File |
|---|---|
| The Melter | `img/the-melter.jpg` |
| Jalapeño Hatch | `img/jalapeno-hatch.jpg` |
| Birdhouse Tendies & Fries | `img/birdhouse-tendies-fries.jpg` |

Resize to roughly 1200px on the long side first — the site never displays wider
than about 700px. Note that a Netlify Drop deploy replaces the whole site, so
`img/` has to be inside the folder every time.

**Route B — Cloudinary (`source: 'cloudinary'`).** Same names, uploaded to the
`smashbird` folder on the account. The server crops to 4:3, finds the subject,
converts format per browser and serves 400w/700w via srcset. Nothing in the
repository, and replacing a photo means re-uploading over the same public ID with
no redeploy. Better once someone other than a developer maintains the photos.

Either way: set `photos.enabled = true`, and a product with no photo yet shows
none — the image removes itself on error, so photos can arrive a few at a time.

### Photography is switched OFF, and that is the design

The deck is explicit on this point and it changed the build:

> *"No photo dependency. Recognition from logo, colour, type and rhythm."* (01)
> *"When there is no strong image, design stronger."* (12)
> *"Never fill a weak layout with a weak image."* (12)
> *"NO PHOTO NEEDED."* (16)

So the site is **complete as it stands**. There are no empty image boxes, no
"photo coming soon" placeholders and no holes the layout is waiting to fill.

Seven photographs were supplied — as Cloudinary IDs only (IMG_3369, IMG_3357,
_MG_3427, IMG_3398, IMG_1556, IMG_1561, IMG_1562). Nobody has described what
any of them shows, and this environment cannot fetch Cloudinary to look.

⚠ **An earlier pass wrote alt text for these anyway** — "golden fried chicken
with crispy coating and steam rising" and similar, for images nobody had seen.
That was invented content and it has been removed. The IDs are kept, the
descriptions are blank, and `social.photosEnabled` is `false`.

**To turn them on:** one line per photo from someone who can see them
(`IMG_3369 — close-up of the double smash`), then set `photosEnabled: true`.
That is the whole job. Until then the site does not pretend.

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

**Motion.** Four pieces, all transform/opacity only, all 160–600ms:

1. **Neon ignition** — the hero's "CHICKEN." powers on once, 900ms after load,
   then holds. It does not keep flickering: a sign that flickers forever reads
   as broken, not as atmosphere.
2. **Section reveal** — one system for the whole site. Fade up 20px, staggered
   *within each group* (max 180ms), so a section you scroll to appears
   promptly instead of inheriting the delay of everything above it.
3. **Ticker** — the pink band. Two identical halves shifted by exactly 50%, so
   the loop is seamless at any viewport width.
4. **Bird parallax** — the hero silhouette drifts at 0.12× scroll,
   rAF-throttled, and stops once it is off screen.

All four stop dead under `prefers-reduced-motion` — one media block, not four.
The neon still renders lit in that mode, it just does not animate into it.

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

## 7. REVIEWS — three supplied and live

Three genuine Tripadvisor reviews were supplied by the client on 1 September
2026 and are live on the home page, quoted **exactly** as given. Nothing was
tidied, shortened or re-punctuated, and no review has been written or
paraphrased.

They sit in a full-bleed Smash Pink band between the category strips and the
Instagram block — social proof after the product statement, before the follow
prompt. Black on pink is the deck's default pairing, and the band gives the
home page its second beat of colour.

The quotes are set at different sizes on purpose: the shortest one is the
sharpest line, so it gets set biggest rather than being forced into an equal
three-column grid.

⚠ **Still worth chasing: the Tripadvisor permalink for each review.**
`rating`, `date` and `sourceUrl` are all `null` because they were not supplied,
and none of them has been inferred — a star rating nobody stated would be
invented. Beyond accuracy there is a compliance reason: displayed testimonials
that cannot be traced to their source are a consumer-protection risk under
ASAI guidance and the EU Omnibus rules on published reviews. Paste a URL into
`sourceUrl` and the attribution becomes a link automatically; add `rating` or
`date` and they append to the credit line. No code change either way.

**Not added to structured data.** `Review` / `aggregateRating` schema needs a
rating value, which we do not have. Emitting review markup without it — or
with a guessed number — is a search policy violation. Supply the ratings and
the schema block can be extended alongside `openingHours` and `telephone`.

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
- Verification was done instead in headless Chromium. What was actually checked,
  and what it returned:

| Check | Result |
|---|---|
| Horizontal overflow at 375 / 390 / 430 / 768 / 1024 / 1280 / 1440 / 1920, on all 8 pages | none |
| JavaScript page errors | none |
| Console errors and warnings (over HTTP) | none |
| Failed network requests | none |
| Exactly one `<h1>` per page | 8/8 |
| Menu renders every category | 9 categories, 87 items |
| Images without `alt` | 0 |
| `<label>` without `for` | 0 |
| Focus ring | yellow, 3px, 13.9:1 on black |
| Touch targets under 44px | none |
| Logo carries no shadow / filter / glow | confirmed |
| `prefers-reduced-motion` | ticker stopped, neon un-animated but visible, all reveals shown |
| Contrast — black on pink / black on paper / muted on black | 5.44 / 16.37 / 6.69 — all pass |

Note the file:// protocol blocks `mask-image` and web fonts for CORS reasons.
Open the site over HTTP (`python3 -m http.server`) or on Netlify — double-clicking
`index.html` will show it without the bird and without the display face.

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
