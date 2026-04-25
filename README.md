# Lumus Agency

> *We light the way.*

Official website of **Lumus Agency** — a creative studio in Galway, Ireland.
The name comes from the Latin *lumus* — *light*.

Services: **Branding · Web Design · Social Media · Motion Graphics**

---

## Brand

| Token | Value | Use |
| --- | --- | --- |
| `--black` | `#0A0A0A` | Page background |
| `--dark` | `#111111` | Alternating section background |
| `--gold` | `#D4A017` | Accents, eyebrows, active state |
| `--gold-bright` | `#E8B420` | Hover / sweep |
| `--gold-pale` | `#f0c84a` | Subtle gold tints |
| `--white` | `#FFFFFF` | Body copy |
| `--text-muted` | `rgba(255,255,255,0.55)` | Secondary copy |
| `--border-gold` | `rgba(212,160,23,0.25)` | Hairline dividers, borders |

**Fonts** — Cormorant Garamond (display) and DM Sans (body / UI), loaded via
`next/font/google` and exposed as `--font-display` and `--font-sans`.

**Type rules**
- Headlines: Cormorant, `letter-spacing: -0.02em`, line-height `0.95–1.05`
- Eyebrow: DM Sans 500, `10px`, `letter-spacing: 0.5em`, uppercase, gold,
  preceded by a 32px gold rule
- Body: DM Sans 300, `line-height: 1.8`
- CTA / labels: DM Sans 500, `letter-spacing: 0.25em` / `0.3em`

**Design principles**
1. **Darkness as Canvas** — black is the page
2. **Gold as Signal** — gold only for meaning (CTA, highlights, active)
3. **Generous Space** — wide padding, room to breathe
4. **Serif for Soul** — Cormorant in every headline
5. **Motion with Purpose** — `power3.out` / `power4.inOut`, never linear
6. **Precision in Detail** — 1px hairlines, gold dividers at 25% opacity

---

## Stack

- **Next.js 14** (App Router) · **TypeScript**
- **Tailwind CSS** with brand-token theme
- **GSAP** + **ScrollTrigger** for editorial motion
- **lucide-react** + custom inline SVGs (brand glyphs)
- `next/og` for icon, apple-icon and OpenGraph image generation
- Deploy target: **Vercel**

---

## Project structure

```
src/
├─ app/
│  ├─ layout.tsx              Root layout: fonts, metadata, header, footer, cursor
│  ├─ page.tsx                Home — Hero / Services / About / Work / Final CTA
│  ├─ globals.css             :root tokens, base reset, utility classes
│  ├─ icon.tsx                Branded 32×32 favicon (next/og)
│  ├─ apple-icon.tsx          180×180 Apple touch icon
│  ├─ opengraph-image.tsx     1200×630 OG image
│  ├─ twitter-image.tsx       Re-exports OG image
│  ├─ sitemap.ts              Static sitemap
│  ├─ robots.ts               robots.txt + sitemap reference
│  ├─ agency/page.tsx         /agency — Hero · Story · Principles · Vision/Mission
│  ├─ services/page.tsx       /services — Hero · 4 alternating service blocks
│  ├─ work/page.tsx           /work — Hero · filterable grid of 3 case studies
│  ├─ contact/page.tsx        /contact — Hero · form · info · WhatsApp widget
│  └─ api/contact/route.ts    POST /api/contact validation + log
├─ components/
│  ├─ Button.tsx              Filled / outline / ghost with gold sweep on hover
│  ├─ CustomCursor.tsx        Desktop dot+ring cursor (gsap.quickTo, mix-blend)
│  ├─ Footer.tsx              Editorial footer with reveal-on-scroll
│  ├─ GoldDivider.tsx         Reusable hairline (full / short / rule, opacities)
│  ├─ Header.tsx              Fixed header, nav, mobile sheet, scroll-state
│  ├─ Reveal.tsx              Scroll-reveal client wrapper (GSAP ScrollTrigger)
│  ├─ SectionLabel.tsx        Eyebrow with 32px gold rule
│  ├─ SocialIcons.tsx         Inline IG / LinkedIn / Behance SVGs
│  ├─ home/                   Home-only sections (Hero, Services, About, Work, CTA)
│  ├─ services/               ServicesHero, ServiceBlock
│  ├─ agency/                 AgencyHero, Story, DesignPrinciples, VisionMission
│  ├─ work/                   WorkHero, WorkGrid, CaseGlyph
│  └─ contact/                ContactHero, ContactForm, ContactInfo, WhatsAppWidget
└─ lib/
   └─ cn.ts                   Tiny class-name helper
```

---

## Pages

| Route | Description |
| --- | --- |
| `/` | Home — clip-reveal hero, 2×2 services, editorial about, 3-card work preview, final CTA |
| `/agency` | Story, six design principles in a 3×2 grid, vision / mission / tagline |
| `/services` | Detailed services with anchored index and four alternating editorial blocks |
| `/work` | Filterable grid of 3 placeholder case studies with shared glyph language |
| `/contact` | Two-column form + info + WhatsApp widget with gold pulse |

---

## Motion

Every section runs through GSAP and ScrollTrigger.

- **Page entry** — clip-reveal of headline lines (`yPercent: 110 → 0`,
  duration 1s, stagger 0.18s, `power4.out`) inside `overflow-hidden` masks.
- **Scroll-in** — fade + `y: 60 → 0`, `duration: 1`, `ease: power3.out`,
  `start: top 80%`, `once: true`.
- **Gold dividers** — `scaleX: 0 → 1` from `left center`,
  `duration: 1.2s`, `ease: power4.inOut`.
- **Buttons** — gold fill sweep from `origin: bottom`
  (`scaleY: 0 → 1`, `duration: 700ms`).
- **Custom cursor** — gold dot 12px + ring 40px, `gsap.quickTo` follow,
  scales to 1.6× on interactive elements, hidden under
  `prefers-reduced-motion` or non-pointer-fine devices.

All animations use `transform` and `opacity` only (GPU). Each component
honours `prefers-reduced-motion` and reverts its `gsap.context()` on
unmount to avoid leaks.

---

## Development

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run start        # serve the production build
npm run lint
```

Requires Node.js 18.18+ (Next.js 14 baseline).

---

## SEO & Metadata

- Root `metadata` in `app/layout.tsx` defines `title.template`,
  `openGraph`, `twitter`, `robots`, `alternates.canonical`, keywords.
- Each page exports its own `metadata` (title is short and goes through
  the `"%s — Lumus Agency"` template).
- `app/sitemap.ts` builds a static sitemap of the five public routes.
- `app/robots.ts` whitelists everything except `/api/` and references
  the sitemap.
- `app/icon.tsx`, `app/apple-icon.tsx`, `app/opengraph-image.tsx`
  and `app/twitter-image.tsx` generate brand-consistent images at build
  time via `next/og`.

---

## Deploy

Optimised for **Vercel** (zero-config Next.js 14 App Router).

```bash
# locally
npm run build && npm run start

# Vercel
# - import the repo
# - framework preset: Next.js
# - environment variables: none required (yet)
```

The `POST /api/contact` route currently validates and logs the payload
to the server console. Wire it to your transactional email or CRM
provider before launch.

---

## Status

Currently shipping the editorial v1 of the site:
home, agency, services, work, contact, contact API, full motion pass,
SEO and OG images. Case studies on `/work` are placeholders pending
real client material.

Crafted in Galway. From Latin *lumus* — light.
