# Skill: Conversion UX
## Project context
Single-file landing page: `index.html`. The primary conversion goal is a **free Website & Brand Audit** request (a form with Name, Email, Website, and a "What's the biggest issue" textarea). Secondary goal is a discovery call booking. The audience is owners of premium local businesses in Galway and the west of Ireland — restaurants, hospitality, coffee shops, local service businesses. They are typically busy, slightly sceptical of agencies, and price-conscious.

Known issues to check every time:
- The nav CTA says "Book a call" but there is no calendar/booking link visible — it may be a dead button
- Two CTAs in the hero exist (primary + ghost) — the ghost button destination is unclear
- The audit form has a "Budget" or scope-related dropdown — verify it is not asking for unnecessary information before first contact
- The portfolio note "Every project below is a concept website" appears just as the visitor is evaluating whether to trust the work — this is a conversion killer

## When to use
Run this skill before any launch, after copy changes, or any time the enquiry rate is a concern. Also run when a new section is added that competes with the primary CTA.

## Goal
Remove every piece of friction between a local business owner landing on the page and submitting the audit form or booking a call. Make the next step feel low-risk, obvious, and worth 30 seconds of their time.

## Strict rules
- Primary CTA (the audit form) must be reachable without scrolling past more than two sections — verify position in page order
- The nav "Book a call" button must go somewhere — a working calendar URL, a mailto, or the form anchor. A dead button is a Critical failure
- Ghost button in hero: must have a clear, labelled destination — verify its `href`
- The audit form must have 4 fields or fewer before submission. Count the fields. If there is a budget dropdown, flag it — the visitor has not yet decided they want to hire anyone
- The "concept website" disclosure in the portfolio must be rewritten or repositioned — it should not appear inline with the work thumbnails as a caveat
- Trust signals (testimonials, credentials, client names, guarantees) must appear within scroll distance of the audit form — check what is near the form
- Mobile: audit form fields must be at least 44px tap height, font size at least 16px to prevent iOS zoom on focus
- Form submit button label must say what happens next ("Send my audit request" not "Submit")
- After submission: verify there is a visible success state — check for `.lead-success` CSS class and whether it is triggered

## What to check
- **Nav CTA:** does "Book a call" link to a real destination?
- **Hero ghost button:** what is its `href`?
- **Audit form:** field count, field labels (not placeholder-only), submit label, success state
- **Portfolio "concept" note:** exact location in markup, exact wording
- **Trust signals near form:** what appears above and below the form?
- **Mobile form:** tap target sizes, font size on inputs (must be ≥16px to avoid iOS zoom)
- **Page flow:** count scroll distance from hero to form — how many sections does a visitor pass?

## Output format
**Location:** [element or section]
**Issue:** [what is broken or missing]
**Fix:** [specific change]
**Impact:** High / Medium / Low

End with: the three changes most likely to increase audit form submissions, in priority order.
