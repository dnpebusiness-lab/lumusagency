# Skill: Local SEO
## Project context
Single-file landing page: `index.html`. Business: Lumus, a creative studio. Location: Galway, Ireland. Services: brand identity, website design, social content, graphic design. Target clients: restaurants, hospitality, coffee shops, local service businesses in Galway and the west of Ireland.

Current state of the file (verified):
- Title tag: `Lumus — Premium Brand & Web Design · Galway` (present, includes location)
- Meta description: present ("Lumus is a creative studio in Galway. We build premium brands, websites and digital presence that earn trust faster and win more enquiries.")
- hreflang: en-IE and it-IT configured — the Italian version (`./it/index.html`) does not exist yet
- No schema markup visible in the file
- No favicon linked in `<head>` (only a `<template>` SVG used by the canvas tool)
- No og:image, no Twitter card tags
- Alt text status: unknown — page has no `<img>` tags with real images visible in the markup (images appear to be CSS backgrounds or the portfolio section uses inline styles)

## When to use
Run this skill before launch and after any copy or structural changes. The page currently has the basics (title, meta desc, location in title) but is missing schema, social meta, and a favicon — all of which affect how the page appears in search results and when shared.

## Goal
Make every on-page signal confirm to Google that this is a real, local business in Galway offering specific creative services. Make social sharing produce a correct preview. Eliminate signals that suggest the page is unfinished (missing favicon, missing og:image).

## Strict rules
- Title tag format: `[Primary Service] in [City] | [Business Name]` — max 60 characters. Current title uses em-dash format which is acceptable but should be checked for character count
- Meta description: must include service, city, and one differentiator that is not just "premium" — max 155 characters
- H1: one per page, must include both service type and location. Verify the current H1 — the hero headline is large display text but may be split across multiple `<span>` elements for animation; confirm it reads correctly as a single H1
- No og:image is a High failure — social shares will produce a blank card. A 1200×630px image must be referenced
- No favicon is a High failure — add at minimum a 32×32 favicon reference in `<head>`
- The Italian hreflang points to a file that does not exist — this is an SEO error. Either create the Italian page or remove the hreflang tags
- Schema: LocalBusiness or CreativeWork type should be added. Must include: name, address (Galway, Ireland), telephone (if available), url, and at minimum one service offered
- The page has no `robots.txt` or `sitemap.xml` referenced — flag for creation at launch

## What to check
- **Title tag:** character count, includes Galway, includes primary service
- **Meta description:** character count, specific differentiator present
- **H1:** what is the actual rendered text of the H1? (check inside the `<span>` elements for animation)
- **Canonical tag:** present or missing?
- **og:title, og:description, og:image:** all three present?
- **Twitter card tags:** present?
- **Favicon:** linked in `<head>`?
- **Schema JSON-LD:** present in `<head>` or `<body>`?
- **hreflang it-IT:** does `./it/index.html` exist? If not, flag for removal
- **Alt text:** scan all `<img>` tags for missing or empty alt attributes
- **NAP:** Name, Address, Phone — is the address visible anywhere on the page (footer, contact section)?

## Output format
**Element:** [title tag / H1 / og:image / schema / etc.]
**Current state:** [exact current content or "missing"]
**Required change:** [exact replacement or specific instruction]
**Reason:** [one sentence]

After all items, provide ready-to-use blocks:
- Proposed title tag (with character count)
- Proposed meta description (with character count)
- LocalBusiness schema JSON-LD stub with Lumus-specific values filled where known, `[REPLACE]` where not
