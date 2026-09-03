# QA Checklist

> Complete this checklist before every launch. All items must be checked.
> Any NO in the CRITICAL section = NO-GO for launch.

---

## CLIENT: [Name]
## DATE: [Date]
## QA BY: QA Agent
## STAGING URL: [URL]

---

## SECTION 1: CONTENT ACCURACY

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1.1 | All copy matches the approved copy document | Y/N | |
| 1.2 | Business name spelled correctly on every page | Y/N | |
| 1.3 | Phone number correct on every page | Y/N | |
| 1.4 | Email address correct on every page | Y/N | |
| 1.5 | Physical address correct and complete | Y/N | |
| 1.6 | Opening hours correct | Y/N | |
| 1.7 | All navigation labels correct | Y/N | |
| 1.8 | All CTAs match approved copy | Y/N | |
| 1.9 | Social media links correct and pointing to right accounts | Y/N | |
| 1.10 | Footer content complete and accurate | Y/N | |

---

## SECTION 2: NO PLACEHOLDER CONTENT (CRITICAL)

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 2.1 | Zero Lorem ipsum text anywhere | Y/N | |
| 2.2 | Zero [placeholder] or [TBD] text | Y/N | |
| 2.3 | Zero placeholder images | Y/N | |
| 2.4 | Zero template variable text ({{name}}, etc.) | Y/N | |
| 2.5 | All testimonials are real (not placeholder quotes) | Y/N | |

---

## SECTION 3: FUNCTIONALITY (CRITICAL)

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 3.1 | All internal links work (no 404s) | Y/N | |
| 3.2 | All external links work and open correctly | Y/N | |
| 3.3 | Navigation links work on desktop | Y/N | |
| 3.4 | Navigation links work on mobile | Y/N | |
| 3.5 | Mobile menu opens and closes correctly | Y/N | |
| 3.6 | Contact form submits successfully | Y/N | |
| 3.7 | Contact form shows confirmation after submission | Y/N | |
| 3.8 | Contact form email arrives in client inbox | Y/N | |
| 3.9 | Phone number is click-to-call on mobile | Y/N | |
| 3.10 | Email link opens email client | Y/N | |
| 3.11 | Booking system / third-party widgets functional | Y/N | N/A |
| 3.12 | Any e-commerce functionality tested | Y/N | N/A |
| 3.13 | Google Map loads and is interactive | Y/N | N/A |

---

## SECTION 4: TECHNICAL (CRITICAL)

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 4.1 | No JavaScript console errors on any page | Y/N | |
| 4.2 | SSL / HTTPS active (padlock showing) | Y/N | |
| 4.3 | 404 page exists and is styled | Y/N | |
| 4.4 | Favicon displays correctly | Y/N | |
| 4.5 | Page titles set on all pages | Y/N | |
| 4.6 | Meta descriptions set on all pages | Y/N | |
| 4.7 | OG tags set for social sharing | Y/N | |
| 4.8 | robots.txt in place and correct | Y/N | |
| 4.9 | sitemap.xml exists and is valid | Y/N | |
| 4.10 | Cookie consent working (if required) | Y/N | |

---

## SECTION 5: PERFORMANCE (CRITICAL)

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 5.1 | PageSpeed desktop score ≥ 90 | Y/N | Score: |
| 5.2 | PageSpeed mobile score ≥ 85 | Y/N | Score: |
| 5.3 | LCP < 2.5 seconds | Y/N | Value: |
| 5.4 | CLS < 0.1 | Y/N | Value: |
| 5.5 | INP < 200ms | Y/N | Value: |
| 5.6 | All images in WebP format | Y/N | |
| 5.7 | No images over 200KB | Y/N | |

---

## SECTION 6: MOBILE RESPONSIVENESS

| # | Check | Breakpoint | Status | Notes |
|---|-------|------------|--------|-------|
| 6.1 | No horizontal scroll | 320px | Y/N | |
| 6.2 | Text readable without zoom | 320px | Y/N | |
| 6.3 | CTAs tap-target ≥ 44px | 375px | Y/N | |
| 6.4 | Navigation functional | 375px | Y/N | |
| 6.5 | Images not cropped badly | 768px | Y/N | |
| 6.6 | Layout correct | 1024px | Y/N | |
| 6.7 | Layout correct | 1440px | Y/N | |

---

## SECTION 7: ACCESSIBILITY

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 7.1 | All images have alt text | Y/N | |
| 7.2 | All form inputs have associated labels | Y/N | |
| 7.3 | Colour contrast ≥ 4.5:1 for body text | Y/N | |
| 7.4 | Keyboard navigation works (Tab through page) | Y/N | |
| 7.5 | Focus states visible on all interactive elements | Y/N | |
| 7.6 | Skip to content link present | Y/N | |
| 7.7 | No content only accessible on hover | Y/N | |
| 7.8 | Icon buttons have aria-labels | Y/N | |

---

## CROSS-BROWSER RESULTS

| Browser | Pass/Fail | Issues Found |
|---------|-----------|-------------|
| Chrome desktop | | |
| Safari desktop | | |
| Firefox desktop | | |
| Chrome mobile | | |
| Safari mobile (iOS) | | |

---

## BUGS LOG

| # | Page | Browser | Description | Priority | Status |
|---|------|---------|-------------|----------|--------|
| 1 | | | | | |

---

## FINAL DECISION

**LAUNCH DECISION:** [ ] GO ✅  [ ] NO-GO ❌  [ ] CONDITIONAL GO ⚠️

**Blockers** (if NO-GO or CONDITIONAL):
1.
2.

**QA Sign-off:**
