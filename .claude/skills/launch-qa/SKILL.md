# Skill: Launch QA
## Project context
Single-file landing page: `index.html`. No build step. No framework. Opens directly in a browser. All CSS and JS are inline. Google Analytics tag `G-V314F6G5YY` is present.

Known issues that must be verified on every QA run — these were identified during the initial audit and are pre-classified as failures until confirmed fixed:

| Issue | Pre-classified severity |
|---|---|
| Founder portrait is a CSS shimmer placeholder | Critical |
| Tweaks panel React code (claudeusercontent.com refs) present in file | Critical |
| `<section id="services">` hidden with `display:none` | High |
| No favicon linked in `<head>` | High |
| No og:image meta tag | High |
| No og:title or og:description meta tags | High |
| hreflang points to `./it/index.html` which does not exist | High |
| Nav "Book a call" button destination unverified | High |
| Hero ghost button `href` unverified | High |
| Portfolio "concept website" disclosure visible inline with work | High |
| No schema markup | Medium |
| No canonical tag | Medium |
| No Twitter card meta tags | Medium |

## When to use
Run this skill before the page goes live, after any batch of changes, and after deployment to verify nothing broke in the environment. Do not skip sections because "it looks fine" — visual inspection misses most of what this skill catches.

## Strict rules
- Every item in the checklist below must be checked and given a Pass / Fail / N/A
- Critical failures block launch with no exceptions
- High failures block launch unless the client has explicitly accepted the risk in writing
- The tweaks panel code check: search the file for `claudeusercontent.com` — if found, it is a Critical failure regardless of whether the panel is visible
- The founder portrait check: search for `shimmer` animation on `.founder-portrait::before` — if the real photo `<img>` is absent, it is Critical
- Form submission must be tested with a real test entry — do not mark as Pass without a live test

## What to check

### Pre-classified failures (verify fixed)
- [ ] Founder portrait: real `<img>` present inside `.founder-portrait`, shimmer removed
- [ ] Tweaks panel: no `claudeusercontent.com` references anywhere in the file
- [ ] Hidden services section: `<section id="services">` removed or `display:none` removed and content merged
- [ ] Favicon: `<link rel="icon">` present in `<head>` with a real file reference
- [ ] og:image, og:title, og:description: all three present in `<head>`
- [ ] hreflang it-IT: either `./it/index.html` exists or hreflang tags removed
- [ ] Nav "Book a call": `href` goes to a working calendar URL, mailto, or form anchor
- [ ] Hero ghost button: `href` goes to a named, working destination
- [ ] Portfolio "concept" note: rewritten or removed so it does not appear as a mid-page caveat

### Content
- [ ] No Lorem ipsum or placeholder text anywhere
- [ ] No "Photo coming", "TBC", "Insert image", or "Coming soon" visible
- [ ] All phone numbers, email addresses, and the Galway address are real and correct
- [ ] All nav links scroll to existing sections

### Forms
- [ ] Audit form submits successfully (test with a real entry)
- [ ] Success state appears after submission (`.lead-success.show`)
- [ ] Form data reaches the intended destination (email or CRM — verify with test)
- [ ] Submit button label is specific ("Send my audit request" — not "Submit")
- [ ] Required field validation works client-side

### Metadata & SEO
- [ ] Title tag present, under 60 characters, includes Galway
- [ ] Meta description present, under 155 characters
- [ ] Canonical tag present
- [ ] No `noindex` meta tag left from development

### Technical
- [ ] Page loads over HTTPS (once hosted)
- [ ] Console shows zero JavaScript errors on load
- [ ] Google Analytics fires (check Network tab for `googletagmanager.com` request)
- [ ] No references to `claudeusercontent.com` or `localhost` in the live file
- [ ] File size is reasonable for a landing page (current: ~284KB — flag if above 500KB after images)

### Accessibility
- [ ] All `<img>` tags have alt attributes (decorative images use `alt=""`)
- [ ] All form inputs have associated `<label>` elements (not placeholder-only)
- [ ] Focus states visible when tabbing through interactive elements
- [ ] Gold text on dark background meets WCAG AA contrast (4.5:1) — the `--text` value `rgba(255,255,255,0.62)` on `#0A0A0A` passes; verify gold `#D4A017` on `#0A0A0A` for small body text

### Mobile (test at 375px)
- [ ] No horizontal scroll
- [ ] Hero CTAs visible without scrolling
- [ ] Form inputs ≥16px font size (prevents iOS auto-zoom)
- [ ] Tap targets ≥44px height on all buttons and links
- [ ] Navigation hamburger opens and closes correctly
- [ ] Text does not overlap or clip in any section

## Output format
**Section 1 — Failures**

**Item:** [name]
**Status:** Critical / High / Low
**Detail:** [exact finding]
**Fix:** [what to do]

**Section 2 — Summary**
- Total items checked: N
- Critical failures: N — launch is BLOCKED if > 0
- High failures: N
- Low failures: N
- **Launch recommendation: HOLD / CLEAR** (with conditions if any)
