# Phase 4 — Copywriting

## Objective
Write all copy for every page of the website — headlines, body copy, CTAs, navigation labels, and metadata. Every word must match the brand voice and drive the primary conversion goal.

## Responsible Agent
Copywriting Agent (`/agents/04-copywriting-agent.md`)
Skill to load: `conversion-copywriting-skill.md` | `hospitality-website-skill.md` (if applicable)

## Required Input
- Approved Client Brief
- Approved Brand Strategy
- Approved Sitemap + Content Hierarchy
- Any client-supplied testimonials or proof points
- Any client-supplied facts, figures, or credentials

## Process

1. Orchestrator briefs Copywriting Agent with all approved docs
2. Orchestrator specifies which skills to load
3. Copywriting Agent writes copy page by page
4. Copywriting Agent flags any missing assets or information
5. Orchestrator reviews against brand voice and copy rules
6. If approved → version and save. If not → specific revision instructions (quote the problem, give direction).

## Expected Output

File: `[client-slug]-copy-all-pages-v1.md`
Saved to: `client-projects/[client-slug]/04-copy/`

One file per page OR one file containing all pages, clearly sectioned.

Contents per page:
- SEO title (60 chars max)
- Meta description (155 chars max)
- Hero headline (H1)
- Hero subheadline
- Primary CTA
- All section headlines (H2, H3)
- All body copy
- All CTAs
- Navigation label
- Any missing assets flagged

## Quality Gate

Do NOT approve and move to Phase 5 unless:
- [ ] Every page is complete — no placeholders
- [ ] Zero banned phrases
- [ ] All CTAs specify action AND implication
- [ ] Tone matches approved brand voice document exactly
- [ ] Every page has a unique H1
- [ ] Every page has unique metadata
- [ ] Copy passes the "could this be anyone else's?" test — if yes, revise
- [ ] Copy read aloud sounds like a real person, not an AI
- [ ] Missing assets clearly flagged

## Common Issues to Watch For

- AI-sounding phrases ("in today's world", "more than just", "at the heart of")
- Headlines that are clever but communicate nothing
- CTAs that are generic ("Click here", "Learn more", "Book now" without context)
- Body copy that describes what the business does rather than what the customer gets
- Testimonial placeholders instead of real content
- Copy that could work for any competitor in the category
