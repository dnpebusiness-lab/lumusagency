# Phase 3 — Sitemap & UX Structure

## Objective
Define the information architecture of the website — which pages exist, why they exist, how they connect, and what the primary conversion journey looks like.

## Responsible Agent
UX / Sitemap Agent (`/agents/03-ux-sitemap-agent.md`)

## Required Input
- Approved Client Brief
- Approved Brand Strategy
- Client's requested pages (from brief)

## Process

1. Orchestrator briefs UX Agent with brief + brand strategy
2. UX Agent maps the primary user journey
3. UX Agent defines the minimum viable page set
4. UX Agent documents the content hierarchy for each page
5. Orchestrator reviews for conversion logic and mobile experience
6. If approved → version and save.

## Expected Output

File: `[client-slug]-sitemap-ux-v1.md`
Saved to: `client-projects/[client-slug]/03-sitemap/`

Contents:
- Primary conversion goal
- Primary user journey map
- Full sitemap (page by page)
- Navigation structure (primary + footer)
- Content hierarchy for each page
- Conversion flow analysis
- Mobile-first considerations
- Pages NOT recommended (with reasons)
- UX risks flagged

## Quality Gate

Do NOT approve and move to Phase 4 unless:
- [ ] Every page has a clear, specific purpose
- [ ] Primary conversion path is 2 clicks or fewer from any page
- [ ] Navigation has 6 or fewer primary items
- [ ] Mobile user needs are explicitly addressed
- [ ] Content hierarchy defined for each page
- [ ] No unnecessary pages included
- [ ] UX risks documented

## Common Issues to Watch For

- Too many pages (more than 8 for a simple local business site)
- Contact page buried — contact must be 1 click from anywhere
- Weak or absent above-fold content hierarchy
- No mobile-specific navigation logic
- Multiple competing CTAs on the same page
