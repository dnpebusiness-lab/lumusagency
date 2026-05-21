# Phase 10 — QA & Bug Fixing

## Objective
Test every aspect of the website systematically and produce a GO / NO-GO decision for launch. Fix all critical and major bugs before authorising deployment.

## Responsible Agent
QA Agent (`/agents/10-qa-agent.md`) + Performance Agent (`/agents/09-performance-agent.md`)
Skill to load: `qa-testing-skill.md` | `performance-optimisation-skill.md`

## Required Input
- Staging URL (final version with all fixes applied)
- Approved copy document (to check against)
- Approved sitemap (to verify all pages exist)

## Process

**Performance sub-phase:**
1. Performance Agent runs PageSpeed on all pages
2. Performance Agent applies optimisations
3. Performance Agent confirms targets met

**QA sub-phase:**
4. QA Agent tests all pages at all breakpoints
5. QA Agent tests all browsers
6. QA Agent tests all forms and interactive elements
7. QA Agent runs accessibility audit
8. QA Agent checks all content vs approved copy
9. QA Agent checks all metadata
10. QA Agent produces GO / NO-GO decision

**Fix cycle:**
11. Any bugs returned to Dev Agent for fixing
12. QA Agent re-tests fixed items
13. Orchestrator reviews final QA report

## Expected Output

Files:
- `[client-slug]-performance-report-v1.md` → `client-projects/[client-slug]/09-qa/`
- `[client-slug]-qa-report-v1.md` → `client-projects/[client-slug]/09-qa/`

## Quality Gate (Hard Stop)

Do NOT move to Phase 11 unless:
- [ ] QA Agent has issued GO status
- [ ] Zero critical bugs open
- [ ] Zero placeholder content
- [ ] All forms functional
- [ ] No console errors
- [ ] PageSpeed: ≥85 mobile, ≥90 desktop
- [ ] SSL active on staging
- [ ] Client has reviewed and approved staging

**This is a hard stop. No exceptions.**
