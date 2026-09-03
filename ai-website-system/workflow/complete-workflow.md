# Complete Website Creation Workflow

> This is the master workflow document. Use it to track every project from brief to launch.
> Each phase links to its detailed phase file in `/workflow/phases/`.

---

## WORKFLOW AT A GLANCE

```
Phase 1  ───► CLIENT DISCOVERY
           Agent: Client Brief Agent
           Output: Structured Project Brief
           Gate: All sections complete, primary goal specific, USPs genuine
           ↓
Phase 2  ───► BRAND & POSITIONING
           Agent: Brand Strategy Agent
           Output: Brand Strategy Document
           Gate: Differentiator ownable, tone of voice with examples, key messages specific
           ↓
Phase 3  ───► SITEMAP & UX STRUCTURE
           Agent: UX/Sitemap Agent
           Output: Sitemap + User Flow Document
           Gate: Every page justified, conversion path 2 clicks max, mobile needs addressed
           ↓
Phase 4  ───► COPYWRITING
           Agent: Copywriting Agent
           Output: Complete page copy for all pages
           Gate: Zero banned phrases, all CTAs specific, tone matches brand, no placeholders
           ↓
Phase 5  ───► WIREFRAME LOGIC
           Agent: UI Design Agent
           Output: Wireframe Logic Document (layout + components)
           Gate: All components listed, all pages structured, conversion flow documented
           ↓
Phase 6  ───► VISUAL DIRECTION
           Agent: UI Design Agent
           Output: Visual Direction Document (full style system)
           Gate: All hex values specific, typography complete, developer needs no visual decisions
           ↓
Phase 7  ───► DEVELOPMENT
           Agent: Frontend Dev Agent
           Output: Built website on staging
           Gate: All pages built, all copy correct, all forms working, no console errors
           ↓
Phase 8  ───► SEO SETUP
           Agent: SEO Agent
           Output: SEO Implementation Brief + Implementation
           Gate: All metadata unique, schema valid, local SEO complete
           ↓
Phase 9  ───► CRO REVIEW
           Agent: CRO Agent
           Output: CRO Report + Fixes Applied
           Gate: All high priority issues resolved
           ↓
Phase 10 ───► PERFORMANCE
           Agent: Performance Agent
           Output: Performance Report + Optimisations Applied
           Gate: PageSpeed ≥85 mobile, ≥90 desktop, Core Web Vitals green
           ↓
Phase 11 ───► QA & BUG FIXING
           Agent: QA Agent
           Output: QA Report + GO decision
           Gate: Zero critical bugs, zero placeholders, all forms working, GO status
           ↓
Phase 12 ───► DEPLOYMENT
           Agent: Deployment Agent
           Output: Live website + Deployment Report
           Gate: All checklist items confirmed, client approved, analytics firing
           ↓
Ongoing  ───► MAINTENANCE
           Agent: Maintenance Agent
           Output: Monthly reports + ongoing improvements
```

---

## PROJECT TRACKING TEMPLATE

Copy this into every client project folder as `project-status.md`:

```
# Project Status — [Client Name]
Last updated: [Date]

## Phases

| Phase | Status | Approved Version | Date Approved | Notes |
|-------|--------|-----------------|---------------|-------|
| 1. Client Brief | ☐ Not started | — | — | |
| 2. Brand Strategy | ☐ Not started | — | — | |
| 3. Sitemap & UX | ☐ Not started | — | — | |
| 4. Copywriting | ☐ Not started | — | — | |
| 5. Wireframe Logic | ☐ Not started | — | — | |
| 6. Visual Direction | ☐ Not started | — | — | |
| 7. Development | ☐ Not started | — | — | |
| 8. SEO Setup | ☐ Not started | — | — | |
| 9. CRO Review | ☐ Not started | — | — | |
| 10. Performance | ☐ Not started | — | — | |
| 11. QA | ☐ Not started | — | — | |
| 12. Deployment | ☐ Not started | — | — | |

## Current Blockers
[List any open blockers]

## Open Questions for Client
[List any questions awaiting client response]

## Approved Documents
[Running list of approved docs with versions]
- Client Brief: [version] — [date]
- Brand Strategy: [version] — [date]
- ...
```

---

## SKILLS QUICK REFERENCE

Load the appropriate skills before starting the relevant phases:

| Skill | Load Before Phase |
|-------|-------------------|
| `premium-website-design-skill` | Phase 6 (Visual Direction) |
| `hospitality-website-skill` | Phase 4 (Copywriting) + Phase 6 (UI) |
| `local-seo-skill` | Phase 8 (SEO Setup) |
| `conversion-copywriting-skill` | Phase 4 (Copywriting) |
| `cro-audit-skill` | Phase 9 (CRO Review) |
| `landing-page-skill` | Phase 5 (Wireframe) if single-page site |
| `technical-seo-skill` | Phase 8 (SEO Setup) |
| `performance-optimisation-skill` | Phase 10 (Performance) |
| `qa-testing-skill` | Phase 11 (QA) |

---

## TYPICAL TIMELINES

| Project Type | Total Phases | Realistic Timeline |
|---|---|---|
| Simple 4-5 page local business | All 12 phases | 2–3 weeks with AI system |
| Restaurant / Café with menu | All 12 phases | 2–3 weeks |
| B&B / Hotel | All 12 phases + booking integration | 3–4 weeks |
| Shopify store | Modified phases | 3–4 weeks |
| Landing page only | Phases 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12 | 1–2 weeks |

---

## PHASE DEPENDENCIES

```
Phase 1 must complete before: Phase 2
Phase 2 must complete before: Phase 3, Phase 4 (partially)
Phase 3 must complete before: Phase 4 (fully), Phase 5
Phase 4 must complete before: Phase 5, Phase 6, Phase 7
Phase 5 must complete before: Phase 6
Phase 6 must complete before: Phase 7
Phase 7 must complete before: Phase 8, Phase 9, Phase 10, Phase 11
All phases 8-10 must complete before: Phase 11
Phase 11 GO must complete before: Phase 12
```
