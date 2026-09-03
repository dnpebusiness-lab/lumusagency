# Phase 7 — Development

## Objective
Build the complete, production-ready website on a staging environment. Implement the approved design, copy, and structure exactly as specified. No creative decisions to be made by the developer.

## Responsible Agent
Frontend Dev Agent (`/agents/06-frontend-dev-agent.md`)

## Required Input
- Approved Wireframe Logic document
- Approved Visual Direction document
- Approved page copy (all pages, final version)
- Client logo and brand assets
- All photography/images
- Tech stack decision (default: Astro + Tailwind + Netlify)

## Process

1. Orchestrator briefs Frontend Dev Agent with all approved documents
2. Dev Agent sets up project with agreed tech stack
3. Dev Agent implements design system as CSS custom properties
4. Dev Agent builds all reusable components
5. Dev Agent builds all pages
6. Dev Agent optimises images and checks forms
7. Dev Agent deploys to staging
8. Orchestrator reviews staging build
9. If approved → pass to SEO Agent.

## Expected Output

- Live staging URL
- GitHub repository with clean, documented code
- Pre-handoff checklist complete

## Quality Gate

Do NOT approve and pass to SEO Agent unless:
- [ ] All pages built with correct content
- [ ] Site matches visual direction document
- [ ] All images optimised (WebP, correct dimensions)
- [ ] All forms functional (submit + confirmation)
- [ ] Responsive at 320px, 768px, 1024px, 1440px
- [ ] No console errors on any page
- [ ] No broken internal links
- [ ] Favicon and basic metadata in place
- [ ] Deploy preview URL accessible

## Common Issues to Watch For

- Developer making visual decisions not in the spec (wrong fonts, colours, spacing)
- Copy errors (typos, missing sections, wrong text)
- Images not optimised (massive file sizes, wrong format)
- Forms not sending emails
- Mobile navigation not working on real devices
- CLS issues from images without explicit dimensions
