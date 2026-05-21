# Phase 8 — SEO Setup

## Objective
Implement a complete, correct on-page and local SEO setup that gives the website the strongest possible foundation for ranking in local search.

## Responsible Agent
SEO Agent (`/agents/07-seo-agent.md`)
Skill to load: `local-seo-skill.md` | `technical-seo-skill.md`

## Required Input
- Approved page copy (final)
- Approved sitemap
- Staging URL
- Business NAP (Name, Address, Phone) in exact format to use everywhere
- Business category and services
- Google Business Profile access (if existing)

## Process

1. Orchestrator briefs SEO Agent with copy + sitemap + staging URL
2. SEO Agent writes keyword map and optimised metadata
3. SEO Agent audits heading hierarchy
4. SEO Agent writes schema markup (JSON-LD)
5. SEO Agent reviews image alt text
6. SEO Agent produces local SEO checklist
7. SEO Agent implements or specifies all technical items
8. Orchestrator reviews for completeness and accuracy

## Expected Output

File: `[client-slug]-seo-brief-v1.md`
Saved to: `client-projects/[client-slug]/07-seo/`

Contents:
- Keyword map (page by page)
- Final title tags (all pages)
- Final meta descriptions (all pages)
- Heading hierarchy audit
- Schema markup (JSON-LD, ready to implement)
- Technical SEO checklist
- Local SEO checklist
- Image alt text audit

## Quality Gate

Do NOT approve and pass to CRO Agent unless:
- [ ] Every page has a unique title tag (55–60 chars with keyword)
- [ ] Every page has a unique meta description (150–155 chars with CTA)
- [ ] Schema markup written for LocalBusiness + breadcrumbs
- [ ] Heading hierarchy correct on all pages
- [ ] All image alt texts reviewed
- [ ] Local SEO checklist minimum: NAP consistent, Google Business Profile instructions ready
- [ ] No keyword stuffing anywhere
