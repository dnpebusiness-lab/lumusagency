# Skill: Local SEO

## When to Use
Run this skill when a website serves customers in a specific city, region, or service area and needs to rank in local search results. Triggers: no location in title tags, missing or thin meta descriptions, headings that do not include service and location, no FAQ section, no schema markup, missing or generic alt text, no local trust signals.

## Goal
Make every page clearly legible to search engines as a local business serving a specific place with specific services. Every on-page signal should reinforce location, service, and credibility.

## Strict Rules
- Title tag format: [Primary Service] in [City] | [Business Name] — max 60 characters
- Meta description must include service, city, and one concrete differentiator — max 155 characters
- H1 must include both the primary service and the location. Only one H1 per page
- Do not keyword-stuff. If a phrase appears more than once per 150 words, remove the duplicate
- Every image must have an alt attribute. Alt text for service/location images must include the service and location naturally ("plumber fixing boiler in Manchester kitchen" not "image1" or "our team")
- NAP (Name, Address, Phone) must be identical in format to Google Business Profile — check spacing, abbreviations, and phone number format
- FAQ section must target real questions people search for, not questions that exist to praise the business
- Schema: LocalBusiness or relevant subtype (e.g. Plumber, LegalService) must be present on the homepage. Include name, address, telephone, openingHours, geo coordinates, and url
- Do not create separate pages per suburb unless each page has genuinely unique content of at least 400 words

## What to Check
- **Title tag:** present, correct format, under 60 characters, includes service + location
- **Meta description:** present, under 155 characters, includes service + city + differentiator
- **H1:** one per page, includes service and location
- **H2s:** do they cover logical subtopics a local searcher would care about (e.g. service areas, process, cost, credentials)?
- **Body copy:** does it mention the city and surrounding areas naturally? Does it describe the actual local service (not generic filler)?
- **Images:** all have alt text, service/location images include relevant terms
- **NAP consistency:** check footer, contact page, and any embedded map against Google Business Profile format
- **FAQ:** minimum 4 questions, targeting search intent ("How much does X cost in Y?", "Do you serve Z area?")
- **Schema markup:** validate with schema.org or Google Rich Results Test — flag missing or invalid fields
- **Internal links:** does the homepage or service page link to location or suburb pages where relevant?
- **Page speed:** flag any image over 200KB on mobile — slow pages lose local rankings

## Output Format
For each issue found, output:

**Element:** [title tag / H1 / schema / alt text / etc.]
**Current state:** [exact current content or "missing"]
**Required change:** [exact replacement text or specific instruction]
**Reason:** [one sentence — why this matters for local ranking]

After all items, include a ready-to-use block:
- Proposed title tag
- Proposed meta description
- Proposed H1
- 4 FAQ questions with suggested answers (2–3 sentences each)
- LocalBusiness schema JSON-LD stub with placeholder values marked [REPLACE]
