# Skill: Launch QA

## When to Use
Run this skill before any website goes live, after a major redesign, or after content has been handed over from a client. Also run after deployment to catch environment-specific issues. Do not skip any section because the site "looks fine" — visual inspection misses most of what this skill catches.

## Goal
Ensure the site is free of broken functionality, placeholder content, missing metadata, accessibility blockers, and build errors before it is seen by real visitors or indexed by search engines.

## Strict Rules
- Every item in the checklist below must be checked and recorded — not skimmed
- A "pass" requires evidence (e.g. screenshot, URL, validation result) — not assumption
- Any Critical item blocks launch. No exceptions
- Any placeholder text (Lorem ipsum, "Your Name Here", "Coming soon", "TBC", "Insert image") is a Critical failure regardless of location
- A form that does not send or does not confirm submission is a Critical failure
- A missing favicon is a High failure — it signals an unfinished site to users and some tools
- Check on real mobile viewport (375px width) not just browser responsive mode if possible

## What to Check

### Content
- [ ] No Lorem ipsum or placeholder text anywhere (check all pages, footers, modals, tooltips)
- [ ] No broken or dummy images (check src attributes, missing alt text, 404 image responses)
- [ ] No "test", "sample", or "demo" content visible to users
- [ ] All phone numbers, emails, and addresses are real and correct
- [ ] All team names, bios, and photos are final and approved

### Links & Navigation
- [ ] All internal links resolve (no 404s)
- [ ] All external links open correctly and use target="_blank" with rel="noopener"
- [ ] Navigation works on mobile (hamburger menu opens and closes, all items tappable)
- [ ] Logo links to homepage
- [ ] 404 page exists and is branded

### Forms
- [ ] Every form submits successfully
- [ ] Every form shows a confirmation message or redirects after submission
- [ ] Form data reaches the intended destination (email inbox or CRM — verify with a test submission)
- [ ] Required field validation works
- [ ] No form sends to a placeholder or developer email address

### Metadata & SEO
- [ ] Every page has a unique title tag (not the default CMS title)
- [ ] Every page has a meta description
- [ ] Canonical tags are present and correct
- [ ] robots.txt exists and does not block indexing of production pages
- [ ] sitemap.xml exists and is linked in robots.txt
- [ ] No noindex tags left from staging environment

### Open Graph & Social
- [ ] og:title present on all key pages
- [ ] og:description present on all key pages
- [ ] og:image present, minimum 1200×630px, not a placeholder
- [ ] Twitter card meta tags present
- [ ] Test with a link preview tool to confirm image and title render correctly

### Technical
- [ ] Favicon present in browser tab (multiple sizes: 16×16, 32×32, 180×180 apple-touch-icon)
- [ ] Site loads over HTTPS with valid certificate
- [ ] No mixed content warnings (HTTP assets on an HTTPS page)
- [ ] Console shows no JavaScript errors on page load
- [ ] No build errors or warnings in the deployment log
- [ ] Google Analytics or agreed tracking is firing (verify in real-time view or network tab)

### Accessibility
- [ ] All images have alt text (decorative images use alt="")
- [ ] All form inputs have associated labels (not placeholder-only)
- [ ] Focus states are visible on interactive elements (tab through the page)
- [ ] Colour contrast on body text meets WCAG AA (4.5:1 minimum)
- [ ] Page can be navigated by keyboard alone

### Mobile
- [ ] Page layout does not break at 375px width
- [ ] No horizontal scroll on any page
- [ ] Tap targets are at least 44×44px
- [ ] Font sizes are at minimum 15px for body copy
- [ ] CTAs are visible without scrolling on mobile

## Output Format
Produce a QA report with two sections:

**Section 1 — Failures**
List every failed item:

**Item:** [checklist item name]
**Status:** Critical / High / Low
**Detail:** [what was found — exact URL, element, or screenshot reference]
**Fix:** [what needs to be done before launch]

**Section 2 — Summary**
- Total items checked
- Critical failures (count) — blocks launch if > 0
- High failures (count)
- Low failures (count)
- Launch recommendation: HOLD or CLEAR (with conditions if any)
