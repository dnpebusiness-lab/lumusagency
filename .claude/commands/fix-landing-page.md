# Command: Fix Landing Page

You are improving the Lumus landing page (`index.html`) — a single-file HTML page for a one-person creative studio in Galway, Ireland. The goal is to make it feel human, credible, conversion-focused, and ready for a real client to see.

## What this command does

Run all five improvement passes on `index.html` in this order:

1. **Anti-AI Copywriter** — rewrite generic, vague, or AI-flavoured copy
2. **Website Art Director** — fix visual hierarchy, spacing, and remove placeholder states
3. **Conversion UX** — fix CTAs, form friction, trust signals, and mobile conversion path
4. **Local SEO** — fix title, meta, schema, Open Graph, and local signals
5. **Launch QA** — verify all known pre-classified failures are resolved

## Rules before you start

- Read `index.html` fully before making any change
- Make all changes in a single editing pass per section — do not make multiple small edits that could conflict
- Do not remove animations, the design system tokens, or any working interactive behaviour unless it is explicitly listed as a problem
- Do not add new sections, new services, or new content that was not already in the page — only improve what exists
- Do not invent client information (real phone number, real address, real testimonials) — use `[REPLACE]` placeholders for anything that requires real data from the client
- After all changes: report what was changed, what was skipped (and why), and what still requires client input before launch

## Known issues to fix (pre-classified, do not skip)

These were identified in the initial audit. Fix all of them:

**Critical**
- Remove the entire tweaks-panel React code block (search for `claudeusercontent.com` — everything from that `<script>` tag to its closing tag must be deleted)
- Founder portrait: the `.founder-portrait` div uses a CSS shimmer as a placeholder. Add a real `<img>` tag if a photo is available, or replace the entire founder section with a credible text-only alternative that does not expose a placeholder state to visitors

**High**
- Remove `display:none` from `<section id="services">` or delete the section — it is a hidden duplicate of the services already shown in the problem/solution section
- Add favicon `<link rel="icon">` to `<head>`
- Add og:title, og:description, og:image to `<head>`
- Verify or fix the nav "Book a call" `href` — must go to a real destination
- Verify or fix the hero ghost button `href`
- Rewrite or reposition the portfolio "concept website" disclosure — it must not appear as an inline caveat next to the work

**Copy (High)**
- Rewrite or replace the tagline "we light the way" — it says nothing specific
- Remove the duplicate "Turn visitors into enquiries" that appears in two service descriptions
- Replace all adjective-only service descriptions with descriptions that name the actual deliverable
- Fix the hero sub-headline if it contains filler phrases

**SEO (Medium)**
- Add canonical tag
- Add Twitter card meta tags
- Add LocalBusiness schema JSON-LD
- Evaluate hreflang it-IT — if the Italian page does not exist, remove the tags

## Output after completion

Produce a change log:

**Changed:** [element] → [what was done]
**Skipped:** [element] → [reason]
**Needs client input:** [element] → [what is needed]

Then state: is the page ready for launch review, or are there still blockers?
