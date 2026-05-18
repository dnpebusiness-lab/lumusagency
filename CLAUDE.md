# Lumus Agency — Lead Generation System

## What this project is

A repeatable, data-driven lead generation and outreach system for Lumus,
a marketing agency that helps local businesses in Galway and Mayo improve
their digital presence.

## Agency context

- **Agency:** Lumus
- **Focus:** Local businesses in Galway, Liosban, Salthill, Oranmore, Westport, Mayo
- **Target sectors:** Cafés, restaurants, pubs, B&Bs, hotels, barbers, hair salons, beauty salons, gyms, clinics, takeaways, independent retail
- **Services:** Website redesign, Google Business Profile optimisation, Instagram management, brand identity, local SEO, photography, email marketing, reputation management
- **Tone:** Friendly, direct, no jargon, British/Irish English

## System overview

Five scripts run in sequence each week:

1. `scripts/01_find_leads.py` — creates a new leads CSV for the week
2. `scripts/02_score_leads.py` — scores each lead's digital presence (0–100)
3. `scripts/03_write_outreach.py` — generates personalised Email A, Email B, DM, Follow-ups
4. `scripts/04_weekly_report.py` — produces a performance report
5. `scripts/05_learn_and_adapt.py` — updates strategy based on results

## Key files

- `config/lumus_config.py` — all system settings (locations, sectors, scoring)
- `leads/leads_YYYY-WW.csv` — the working CRM file (one per week)
- `data/strategy.json` — current adaptive strategy
- `outreach/templates/email_templates.md` — master email templates
- `skills/*.md` — reference guides for each workflow phase

## Skills available

- `skills/local-lead-research.md` — how to find leads
- `skills/digital-audit.md` — how to audit a business's digital presence
- `skills/lumus-outreach.md` — how to write and send outreach
- `skills/offer-matching.md` — service-to-weakness matching
- `skills/follow-up-writing.md` — follow-up writing principles

## CSV columns (do not change order)

Date Added, Business Name, Sector, Location, Website, Instagram,
Google Business Profile, Email, Phone, Main Weakness, Commercial Opportunity,
Recommended Lumus Service, Priority Score, Outreach Angle,
Email Version A, Email Version B, Instagram DM, Follow-Up 1, Follow-Up 2,
Status, Response, Result, Notes, Next Action

## Writing style rules

- British English always (colour, organise, tailored)
- Short sentences and short paragraphs
- No marketing jargon
- Specific and direct — never vague
- Sound like a real person from Galway, not a template
