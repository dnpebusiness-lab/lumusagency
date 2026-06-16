# Command: Final Launch Check

You are performing the final check on the Lumus landing page (`index.html`) before it goes live. This is not an improvement pass — it is a verification pass. Do not make changes unless a Critical failure requires an immediate fix to unblock launch.

## What this command does

Run the Launch QA skill against the current state of `index.html` and produce a structured pass/fail report. Flag every item. Do not skip anything because it "looks fine."

## Pre-flight: read the file first

Before running any check, read `index.html` in full. Note:
- The file size
- Whether `claudeusercontent.com` appears anywhere (immediate Critical flag if yes)
- Whether the founder portrait has a real `<img>` or still uses the shimmer placeholder (immediate Critical flag if shimmer)
- Whether `<section id="services">` still has `display:none` (immediate High flag if yes)

## Checks to run

### 1. Critical blockers (any one of these = HOLD)
- [ ] No `claudeusercontent.com` references in the file
- [ ] Founder portrait has a real photo — not a CSS placeholder
- [ ] Form submits and success state appears (test with a real entry if possible, or verify the submission handler is wired)
- [ ] No placeholder text visible anywhere ("Lorem ipsum", "Photo coming", "TBC", "Insert", "Coming soon", "[REPLACE]" left unfilled)
- [ ] All nav links go to existing anchors or pages

### 2. High priority (fix before launch unless client has accepted risk)
- [ ] Favicon linked in `<head>`
- [ ] og:title, og:description, og:image all present
- [ ] Nav "Book a call" goes to a working destination
- [ ] Hero ghost button goes to a named destination
- [ ] hreflang it-IT either resolved (page exists) or removed
- [ ] Hidden services section removed or visible
- [ ] Portfolio "concept website" note rewritten or removed
- [ ] Form submit button has a specific label (not "Submit")
- [ ] Google Analytics tag present (`G-V314F6G5YY`)

### 3. SEO
- [ ] Title tag: present, under 60 characters, contains "Galway"
- [ ] Meta description: present, under 155 characters, contains service and location
- [ ] Canonical tag present
- [ ] No `noindex` in meta tags
- [ ] Schema JSON-LD present and valid (check for correct JSON syntax)
- [ ] Twitter card tags present

### 4. Accessibility
- [ ] All `<img>` tags have alt attributes
- [ ] All form `<input>` elements have associated `<label>` elements
- [ ] Page is navigable by keyboard (tab order logical, focus visible)
- [ ] Gold text `#D4A017` used only at large sizes or with high weight — not as small body text on dark bg

### 5. Mobile (375px)
- [ ] No horizontal scroll
- [ ] Hero CTAs visible above fold
- [ ] Form input font size ≥16px (prevents iOS auto-zoom on tap)
- [ ] All tap targets ≥44px height
- [ ] Mobile nav opens and closes

### 6. Technical
- [ ] Console: zero JS errors on page load
- [ ] Google Analytics request fires on load
- [ ] File size noted — flag if >500KB before images are added
- [ ] No hardcoded `localhost`, `127.0.0.1`, or `claudeusercontent.com` URLs

## Report format

**PRE-FLIGHT SUMMARY**
- File size: [X KB]
- claudeusercontent.com present: Yes (CRITICAL) / No
- Founder portrait: Real photo / Placeholder (CRITICAL)
- Hidden services section: Removed / Still present (HIGH)

**FAILURES**

| Item | Severity | Detail | Fix required |
|------|----------|--------|--------------|
| [item] | Critical/High/Low | [finding] | [action] |

**PASS LIST**
[List every item that passed — do not leave the pass list empty]

**SUMMARY**
- Critical failures: N
- High failures: N
- Low failures: N

**LAUNCH RECOMMENDATION**
- HOLD — [list the specific blockers]
- CLEAR — ready for deployment
- CLEAR WITH CONDITIONS — [list what must be done within N days of launch]
