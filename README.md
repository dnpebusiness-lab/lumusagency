# Astra Voice

**AI voice receptionist for restaurants.** Answers inbound calls 24/7 in English and Italian,
answers only from information the restaurant has approved, takes reservations, sends an SMS
confirmation, and hands the call to a human whenever a human is needed.

> **Sintesi in italiano**
> Questo è il repository del prodotto. Se sei il fondatore e vuoi capire il progetto,
> leggi in quest'ordine: **PRD.md** (cosa costruiamo) → **IMPLEMENTATION_PLAN.md** (in che ordine)
> → **ASSUMPTIONS.md** (le decisioni prese al posto tuo) → **SECURITY_AND_PRIVACY.md §10**
> (cosa manca legalmente prima di usarlo con clienti veri).
> Per far partire il progetto sul tuo computer, vai alla sezione *Quick start* qui sotto.

🔴 **Status: pilot build, Milestone 2.** Database, authentication and multi-tenant access control are
built and tested. Not connected to a phone number, not legally reviewed, not for use with real
callers. See [`SECURITY_AND_PRIVACY.md`](./SECURITY_AND_PRIVACY.md) §10.

---

## Documentation map

| Document | What it answers |
|---|---|
| [`PRD.md`](./PRD.md) | What we are building, for whom, and the 20 acceptance criteria that define "done" |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | How the system is put together and why each technology was chosen |
| [`SECURITY_AND_PRIVACY.md`](./SECURITY_AND_PRIVACY.md) | Threat model, tenancy isolation, GDPR posture, and what still needs a lawyer |
| [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) | The nine milestones, what each delivers, and what is needed from the founder |
| [`TASKS.md`](./TASKS.md) | Prioritised backlog with per-task acceptance criteria |
| [`ASSUMPTIONS.md`](./ASSUMPTIONS.md) | Every decision made without asking, and how to reverse it |
| [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) | **In italiano** — how to create the free Supabase project, where each key goes, how to apply migrations and how to check that RLS is on |
| `TEST_PLAN.md` | *(Milestone 8)* 20+ scripted call scenarios and honest results |
| `docs/DEPLOYMENT.md` | *(Milestone 8)* how to deploy |
| `docs/API_AND_WEBHOOKS.md` | *(Milestone 8)* endpoint and webhook reference |

## How it works, briefly

```
Caller → Twilio number → Retell AI (voice) → Astra Voice API → Supabase (Postgres + RLS)
                                                  │
                                                  ├─ knowledge tools (approved data only)
                                                  ├─ booking provider (internal | Cal.com)
                                                  ├─ SMS (Twilio)
                                                  └─ human transfer
```

The voice vendor holds **no** business data. Every fact the agent states — an opening hour, a
price, an allergen, a free table — is the return value of a call to our server, filtered to rows a
manager has explicitly approved. That is what makes "the agent never invents anything" an
enforceable property rather than a hope.

## Quick start

```bash
npm install
cp .env.example .env.local     # the app still boots with no credentials
npm run dev                    # http://localhost:3000
```

Health check: `curl http://localhost:3000/api/health`

To work on the database, see [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md). With Docker:
`npm run db:start && npm run db:reset`. Without Docker, against a local PostgreSQL server:
`scripts/db-local.sh reset`.

Demo sign-ins created by the seed (demo password `AstraDemo!2026`, test projects only):
`owner.demo@example.com`, `admin.demo@example.com`, `manager.demo@example.com`,
`staff.demo@example.com`, `viewer.demo@example.com`.

### Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, strict, no emit |
| `npm run test` | Vitest: unit, integration and database tests (rebuilds the test database first) |
| `npm run test:db` | Just the database suite: schema, RLS, approval gate, agent surface, integrity |
| `npm run db:reset` | Drop, migrate and seed the local database |
| `npm run db:types` | Regenerate TypeScript types (needs Docker or a linked project) |
| `npm run test:e2e` | Playwright end-to-end *(from Milestone 3)* |
| `npm run format` | Prettier |
| `npm run check` | format + lint + typecheck + test — run this before every commit |

## Project structure

```
src/
  app/            routes: marketing, auth, dashboard, api (voice tools, webhooks, cron)
  components/     UI and feature components
  lib/
    providers/    voice · sms · telephony · booking  ← vendor code lives ONLY here
    agent/        prompt builder, tool schemas, input sanitisation
    db/           typed queries and transactions
    security/     signatures, rate limiting, redaction, RBAC
    validation/   zod schemas shared by client and server
supabase/
  migrations/     plain SQL, applied with the Supabase CLI
  seed/           demo restaurant (clearly flagged as demo data)
tests/
  unit/ integration/ e2e/ call-scenarios/ fixtures/
```

## Non-negotiable engineering rules

These exist because breaking them is how this specific product hurts someone:

1. **A confirmation is only ever spoken on a successful tool result.** Providers return `Result<T>`; they do not throw across the boundary. (`src/lib/result.ts`)
2. **Allergen and menu answers come only from approved structured rows.** Never inferred from a dish name or description.
3. **Severe-allergy enquiries always transfer to a human** and always write an escalation record.
4. **Row Level Security is the tenancy boundary**, not application code. The permission matrix in
   `src/lib/auth/rbac.ts` exists to shape the UI and produce readable errors; if it ever disagrees
   with the database, the database is right and that file is the bug.
5. **Secrets never cross into the browser.** Nothing sensitive is ever `NEXT_PUBLIC_`.
6. **Webhooks are signature-verified and idempotent** before anything is written.
7. **Knowledge-base content is untrusted input** and cannot alter agent instructions.
8. **A feature is not complete until a test proves it.** Failing tests are reported, not hidden.

## Current limitations

- No voice integration yet — that is Milestone 4. The dashboard screens for calls, reservations,
  knowledge and agent settings arrive in Milestone 3.
- The migrations have **not** yet been applied to a hosted Supabase project, only to a real local
  PostgreSQL 16 server. The email confirmation and password-reset flows are written but **not yet
  tested end to end**, because they need Supabase's mail service.
- `npm run db:types` needs Docker, which the build environment lacks, so `src/lib/db/enums.ts` is
  hand-maintained — with a test that fails on any drift from the database.
- Voice quality, latency and accent handling depend on Retell, a third party we do not control.
- Strong regional accents and noisy rooms will degrade recognition; escalation to a human is the mitigation, not a fix.
- **The software is not legally compliant by virtue of its features.** A DPIA, DPAs, consent scripts, transfer assessments and AI-disclosure wording all require professional review before a real caller is answered.

## Licence

Proprietary. All rights reserved. Independent implementation — no third-party product's code,
copy, design or protected assets are reproduced.
