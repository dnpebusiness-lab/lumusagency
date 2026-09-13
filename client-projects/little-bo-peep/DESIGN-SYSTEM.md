# Little Bo Peep — Design System

Source of truth for tokens and components: **`preview/lbp-system.css`**.
This document covers the decisions behind them and the rules that keep the
build coherent. Read it before touching a page.

> Supersedes the earlier coral / sage / Georgia direction, which is retired.
> Do not reintroduce those tokens.

---

## 1. The idea

Little Bo Peep is a real shop in Spiddal, twelve miles west of Galway city, on
the coast road. It sells Andalusian and traditional childrenswear — clothes
made for christenings, communions and family occasions — to Irish families.

That tension is the brand, and no competitor has it: **Spanish formality,
Connemara address.** The design expresses it as a printed lookbook rather than
a web template — wide margins, hairline rules, an editorial serif, and
photography given room to carry the page.

What this is not: pastel, cartoonish, or "children's website". The clothes are
formal and expensive (median €65, up to €490). The site is styled for the
parent buying them, not the child wearing them.

---

## 2. Colour

Ivory ground, charcoal ink, and accents used sparingly because the photography
supplies the colour. Full values in `lbp-system.css` §1.

| Role | Token | Value |
|---|---|---|
| Page ground | `--ivory` | `#F8F5EF` |
| Alternate section | `--sand` | `#EFE8DE` |
| Ink | `--charcoal` | `#242220` |
| Secondary ink | `--warm-grey` | `#77716A` |
| Hairline | `--rule` | `#DED8CF` |
| Accent | `--rose` | `#B98882` |
| Accent | `--sage` | `#A8B19D` |
| Emphasis | `--terracotta` | `#B7735F` |

Rules:
- Terracotta is the **only** colour that carries emphasis: the hero italic,
  primary button hover, sale price, sale flag, active states. Nothing else.
- Never place a saturated colour next to product photography.
- No gradients except the single scrim on the full-bleed campaign band, where
  it exists to make white type legible over a photograph.
- Pure white is used for flags and drawer surfaces only, never as page ground.

---

## 3. Type

Two families, no more.

- **Cormorant Garamond** — display. Headings, product names, the wordmark,
  designer index. Set at 400/500 weight; it is high-contrast and goes fragile
  if pushed lighter or tracked loose.
- **Inter** — everything operational. Navigation, prices, buttons, filters,
  forms, body copy.

Rules:
- Prices, size counts and any aligned figures take `.lbp-num`
  (`font-variant-numeric: tabular-nums`). Ragged digits read as amateur.
- Eyebrows are 11px Inter, uppercase, `0.18em` tracking, warm grey. They label
  a section; they never carry meaning on their own.
- Running copy stays inside `--measure` (62ch).
- Headings get `text-wrap: balance`.
- In the Shopify theme, both faces come from `font_picker` settings so Shopify
  self-hosts them. Do not hard-link a font CDN.

---

## 4. Layout

- Container `1400px`, gutter `clamp(20px, 4vw, 64px)`.
- Section rhythm `--section-y: clamp(56px, 8.5vw, 160px)` — roughly 160px
  desktop, 100px tablet, 56–80px mobile, as briefed.
- Product grid: 4 up desktop, 3 at ≤1100px, 2 at ≤760px. Never 5 — the cards
  stop being premium.
- Imagery is square-cornered. Only controls get a radius, and only 2px.
- Image ratios are limited to **4:5** (product), **3:4** (category tile),
  **5:6** (editorial figure), **4:3** (mega-menu feature). Do not add more.

### The hairline system
Sections are separated by rules, not boxes or shadows. `.lbp-sectionhead` puts
the eyebrow and title on the left of a rule and the "view all" link on the
right. Every image well carries a 1px inset hairline so composition still reads
while photography loads.

### Asymmetry
`.lbp-tiles--lead` gives the first tile more width but the **same height** as
its siblings. Varying width is art direction; varying baseline is a bug.

---

## 5. Components

Flat BEM, one class per component root. **Element selectors never set spacing.**
This is what stops the cascade fighting itself over section rhythm — the trap
the previous system fell into.

Product card (`.lbp-card`) specifics:
- No border, no shadow, no card box. Photography dominates.
- Hover: image scales to 1.035, quick-add and wishlist fade in.
- **Second-image crossfade is progressive enhancement only.** 58% of the
  catalogue has exactly one photograph, so the layout never assumes a second.
- `@media (hover: none)` pins quick-add and wishlist visible and disables the
  crossfade — hover affordances are unreachable on touch.
- Product name is clamped to two lines with the second line reserved, so every
  price in a row sits on one baseline.

---

## 6. Motion

One system, applied consistently. Timings in `lbp-system.css` §1.

| Use | Duration |
|---|---|
| Micro-interaction | 200ms |
| Menu | 300ms |
| Drawer | 380ms |
| Section reveal | 620ms |
| Editorial image reveal | 880ms |
| Hero | 1500ms |

Easing is `cubic-bezier(0.22, 1, 0.36, 1)` for entrances, `0.65, 0, 0.35, 1`
for drawers. Never linear.

Rules:
- Scroll reveal is **one** treatment everywhere: opacity 0→1, translateY 18→0,
  via a single IntersectionObserver. Do not invent per-section animations.
- Stagger is 90ms, capped at four steps (`data-delay="1..3"`).
- Animate `transform` and `opacity` only.
- `prefers-reduced-motion` resets everything to a visible resting state.

---

## 7. Non-negotiables

1. **Nothing on the page is invented.** No fabricated reviews, ratings,
   awards, statistics, press quotes, or photo captions. If the data does not
   exist, the element is omitted. See `CATALOGUE-AUDIT.md`.
2. **Do not assert what a photograph shows.** Alt text and captions are derived
   from the product record, never asserted from looking at the image.
3. **Navigation follows the data.** Designers / Smocks / Christening / Shop by
   Age exist because that data exists. Girls / Boys / Baby does not ship until
   the products are tagged — 61% of the catalogue has no gender signal today.
4. **No horizontal scroll at any width**, 320px to 1920px. Enforced by
   `overflow-x: clip` on html and body, which contains the off-canvas drawers
   without breaking the sticky header.
5. **44px minimum tap targets.** Verified, not assumed.
6. Closed drawers carry `visibility: hidden` so they stay out of the tab order.

---

## 8. Preview build

`preview/index.html` is **generated** — do not hand-edit it.

```bash
cd preview && python3 build.py
```

It reads the real catalogue export and emits the homepage, so every product,
price, brand, image and age-band count on the page is live store data.

Product photography is referenced from the Shopify CDN. The images will not
load inside a restricted network sandbox; they load normally in a browser.
