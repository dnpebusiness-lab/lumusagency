# Phase 11 — Deployment

## Objective
Deploy the approved, tested website to production. Set up domain, SSL, redirects, analytics, and verify everything works on the live URL.

## Responsible Agent
Deployment Agent (`/agents/11-deployment-agent.md`)

## Required Input
- QA Agent GO status (required)
- Orchestrator final sign-off checklist (required)
- Client approval of staging (required)
- Access to production hosting (Netlify)
- Domain registrar access
- Environment variables / API keys for production

## Process

1. Confirm all prerequisites met (GO, sign-off, client approval)
2. Deploy final build to production hosting
3. Configure custom domain
4. Set up SSL (automatic on Netlify)
5. Configure redirects
6. Verify live site fully functional
7. Submit sitemap to Google Search Console
8. Confirm analytics firing on production
9. Produce deployment report
10. Hand over credentials and documentation to client
11. Notify Maintenance Agent to begin monitoring

## Expected Output

- Live URL confirmed working
- File: `[client-slug]-deployment-report.md` → `client-projects/[client-slug]/10-deployment/`
- Client credentials document
- Handover documentation

## Quality Gate

Deployment is complete when:
- [ ] Site live at production domain
- [ ] HTTPS active (padlock visible)
- [ ] All pages loading
- [ ] All forms working on production
- [ ] Analytics firing
- [ ] Search Console verified
- [ ] Sitemap submitted
- [ ] Client notified and confirmed
- [ ] Credentials handed over

## Rollback Plan

If deployment fails or critical issue found after launch:
1. Revert to previous Netlify deploy (one click)
2. Diagnose issue
3. Fix on staging
4. Re-deploy after QA confirmation
