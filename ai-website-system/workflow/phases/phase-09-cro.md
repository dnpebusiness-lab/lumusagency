# Phase 9 — CRO Review

## Objective
Review the complete website from the perspective of a potential customer and identify every barrier to conversion. Produce specific, actionable fixes and apply all high-priority items before launch.

## Responsible Agent
CRO Agent (`/agents/08-cro-agent.md`)
Skill to load: `cro-audit-skill.md`

## Required Input
- Staging URL (with SEO implemented)
- Approved Client Brief (to understand primary goal + audience)
- Approved Brand Strategy (to stay within brand)

## Process

1. Orchestrator briefs CRO Agent with staging URL + brief + brand strategy
2. CRO Agent reviews site as a potential customer
3. CRO Agent applies the 5-question framework (Clarity, Trust, Friction, Motivation, Distraction)
4. CRO Agent produces prioritised CRO report
5. Orchestrator reviews report and approves fixes
6. High priority fixes are implemented by Dev Agent
7. CRO Agent confirms fixes applied

## Expected Output

File: `[client-slug]-cro-report-v1.md`
Saved to: `client-projects/[client-slug]/08-cro/`

Contents:
- Executive summary + overall score
- High priority issues (with specific fixes + examples)
- Medium priority improvements
- Low priority optimisations
- CTA audit (every CTA)
- Trust signal audit
- Form audit
- Mobile CRO audit
- Priority action list

## Quality Gate

Do NOT approve and pass to Performance Agent unless:
- [ ] All high priority issues have been fixed
- [ ] CTA audit complete (every CTA reviewed)
- [ ] Trust signal audit complete
- [ ] Mobile conversion specifically reviewed
- [ ] All fixes are within brand guardrails
