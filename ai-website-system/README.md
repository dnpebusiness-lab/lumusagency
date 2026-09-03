# Lumus Agency — AI Website Creation System

A repeatable, agent-powered production system for building premium websites for local businesses, hospitality venues, cafés, restaurants, B&Bs, and service brands.

---

## What This Is

This is not a single website project. This is a **production system** — a structured team of specialised AI agents that works together to take any client from brief to launched website, consistently, at high quality, and faster than traditional workflows.

Every website built with this system must feel:
- **Premium** — not template-like, not cheap, not generic
- **Strategic** — every element exists for a specific reason
- **Conversion-focused** — designed to get the client real business results
- **Locally resonant** — feels right for the market, audience, and location
- **Fast and technically solid** — Core Web Vitals compliant by default

---

## Quick Start

1. Copy `/client-projects/_template/` → `/client-projects/[CLIENT-SLUG]/`
2. Fill in `00-project-brief.md` using `/templates/client-brief-template.md`
3. Open Claude Code and paste the contents of `/orchestrator/orchestrator-system-prompt.md`
4. Follow the 12-phase workflow in `/workflow/complete-workflow.md`
5. Load the relevant skills for the project type from `/skills/`

---

## System Structure

```
ai-website-system/
├── README.md                        ← You are here
├── SYSTEM_OVERVIEW.md               ← Architecture + implementation plan
├── orchestrator/
│   └── orchestrator-system-prompt.md
├── agents/
│   ├── 01-client-brief-agent.md
│   ├── 02-brand-strategy-agent.md
│   ├── 03-ux-sitemap-agent.md
│   ├── 04-copywriting-agent.md
│   ├── 05-ui-design-agent.md
│   ├── 06-frontend-dev-agent.md
│   ├── 07-seo-agent.md
│   ├── 08-cro-agent.md
│   ├── 09-performance-agent.md
│   ├── 10-qa-agent.md
│   ├── 11-deployment-agent.md
│   └── 12-maintenance-agent.md
├── workflow/
│   ├── complete-workflow.md
│   └── phases/
│       ├── phase-01-discovery.md
│       ├── phase-02-brand.md
│       ├── phase-03-sitemap-ux.md
│       ├── phase-04-copywriting.md
│       ├── phase-05-wireframe.md
│       ├── phase-06-ui-direction.md
│       ├── phase-07-development.md
│       ├── phase-08-seo.md
│       ├── phase-09-cro.md
│       ├── phase-10-qa.md
│       ├── phase-11-deployment.md
│       └── phase-12-post-launch.md
├── templates/
│   ├── client-brief-template.md
│   ├── homepage-strategy-template.md
│   ├── sitemap-template.md
│   ├── page-copy-template.md
│   ├── seo-page-brief-template.md
│   ├── cro-checklist.md
│   ├── qa-checklist.md
│   ├── launch-checklist.md
│   └── post-launch-report-template.md
├── skills/
│   ├── premium-website-design-skill.md
│   ├── hospitality-website-skill.md
│   ├── local-seo-skill.md
│   ├── conversion-copywriting-skill.md
│   ├── cro-audit-skill.md
│   ├── shopify-website-skill.md
│   ├── landing-page-skill.md
│   ├── technical-seo-skill.md
│   ├── performance-optimisation-skill.md
│   └── qa-testing-skill.md
├── quality-control/
│   ├── quality-control-system.md
│   └── anti-generic-checklist.md
├── automation/
│   └── automation-map.md
└── client-projects/
    └── _template/                   ← Copy this for each new client
```

---

## The Agent Team

| # | Agent | Core Role |
|---|---|---|
| 0 | **Orchestrator** | Project director — assigns, gates, controls quality |
| 1 | **Client Brief** | Extracts goals, audience, USP, competitors |
| 2 | **Brand Strategy** | Positioning, tone of voice, messaging framework |
| 3 | **UX / Sitemap** | Information architecture, page structure, user flow |
| 4 | **Copywriting** | All page copy — headlines, body, CTAs |
| 5 | **UI Design** | Visual direction, style system, component guidance |
| 6 | **Frontend Dev** | Builds the site — clean, fast, accessible |
| 7 | **SEO** | On-page SEO, metadata, schema, local signals |
| 8 | **CRO** | Conversion review — flow, friction, trust signals |
| 9 | **Performance** | Speed optimisation, Core Web Vitals |
| 10 | **QA** | Bug testing, cross-browser, mobile, accessibility |
| 11 | **Deployment** | Hosting, domain, DNS, CI/CD, go-live |
| 12 | **Maintenance** | Post-launch monitoring, improvements |

---

## Skill Activation Guide

| Client Type | Skills to Load |
|---|---|
| Restaurant / Café | `hospitality-website-skill` + `local-seo-skill` + `conversion-copywriting-skill` |
| B&B / Hotel | `hospitality-website-skill` + `local-seo-skill` + `premium-website-design-skill` |
| Service Business | `landing-page-skill` + `conversion-copywriting-skill` + `local-seo-skill` |
| E-commerce / Shopify | `shopify-website-skill` + `cro-audit-skill` + `technical-seo-skill` |
| Any website | `premium-website-design-skill` + `qa-testing-skill` + `performance-optimisation-skill` |

---

## The Non-Negotiables

Every website built with this system must:
- Pass the **"Could this belong to another business?"** test. If yes → revise.
- Have zero placeholder content at launch
- Have zero generic, filler copy
- Be tested on real mobile devices before sign-off
- Have all forms functional and tested
- Have metadata on every page
- Score green on Core Web Vitals
- Have a working contact method visible within 3 seconds of landing
