# IMPLEMENTATION PLAN — Astra Voice

> **Sintesi in italiano**
> Il piano di lavoro, diviso in 9 tappe (Milestone 0 → 8).
> Ogni tappa ha: cosa consegno, come si verifica che funzioni, e cosa serve **da te**
> (di solito: creare un account e incollare una chiave in Netlify — mai qui in chat).
> Regola che mi sono dato: **una tappa non è finita finché lint, type-check, test e build non passano**,
> e io ti riporto i comandi esatti eseguiti e il loro risultato, anche quando falliscono.

Version 1.0 · Milestone 1

---

## Working method

1. One milestone at a time. No giant untested code dumps.
2. After every milestone: `npm run format:check && npm run lint && npm run typecheck && npm run test && npm run build` — results reported verbatim, failures included.
3. Every milestone ends with a commit on `claude/astra-os-project-27x14j`.
4. A feature is not complete until a test proves it. "It compiles" is not evidence.
5. Mock data is labelled as mock. Mocks never appear in a production code path.

---

## Milestone 0 — Repository inspection ✅ DONE

**Delivered:** repository inspected; pre-existing `DSCF1867.jpg` and `.claude/skills/` preserved; assumptions recorded in `ASSUMPTIONS.md`; no blocking questions found for M1.
**Acceptance:** `ASSUMPTIONS.md` exists; no user file modified or deleted. ✅

## Milestone 1 — Documentation and scaffold ✅ DONE

**Delivers**
- `PRD.md`, `ARCHITECTURE.md`, `SECURITY_AND_PRIVACY.md`, `IMPLEMENTATION_PLAN.md`, `TASKS.md`, `README.md`, `.env.example`
- Next.js 16 + TypeScript strict + Tailwind v4 + shadcn/ui-style component scaffold
- ESLint, Prettier, Vitest, Playwright configured
- Netlify deployment config
- Base layout, design tokens, health-check route

**Acceptance**
- [x] All six documents present and internally consistent
- [x] `npm run format:check`, `lint`, `typecheck`, `test`, `build` all pass (17 tests, 0 failures)
- [x] `.env.example` lists every variable with source and required-when
- [x] No secret in the repository; `.next/static` scanned for secret patterns — clean
- [x] `npm audit` reports 0 vulnerabilities
- [x] App boots and `/api/health` returns `{"status":"ok"}` (verified with a running server)

**Needed from you:** nothing.

## Milestone 2 — Data foundation ✅ DONE

**Delivered**
- 10 SQL migrations creating 26 tables, 22 enums, indexes, foreign keys and the CHECK constraints that encode the safety rules
- RLS enabled on every table in `public`, ~60 policies, all privileges revoked from `anon`, column-level grants where a role may write only part of a row
- Authorisation helpers (`app.org_ids`, `app.is_org_member`, `app.can_manage_location`, …) and the guard triggers for approval, membership and platform-role escalation
- The `agent` schema: approved-data-only views and functions, reachable by `service_role` alone
- Supabase Auth with the current SSR approach: email + password, password reset, protected routes via `proxy.ts`, POST-only sign-out, automatic profile creation by trigger. Magic link is prepared (the callback route already handles it) but not enabled
- Organisation bootstrap RPC, location management, member roles
- Seed data for two invented restaurants: 18 menu items (16 approved, 2 not), 35 allergen declarations, 20 dietary attributes, 13 FAQs, 7 knowledge articles, 12 calls with transcripts/summaries/events, 5 reservations, 144 audit rows
- `scripts/db-local.sh` for environments without Docker, plus `supabase/config.toml` and `SUPABASE_SETUP.md`

**Acceptance**
- [x] Migrations apply cleanly to an empty database, verified repeatedly from zero
- [x] RLS cross-tenant test suite green — every tenant table, both directions (AC-13)
- [x] Role permissions tested for owner, admin, manager, staff and viewer
- [x] Seed produces a browsable demo restaurant, flagged `is_demo`
- [x] Approval columns default to `draft` — asserted by test, not by memory
- [x] `format:check`, `lint`, `typecheck`, `test` (125), `build` all pass
- [ ] **Not verified:** migrations against hosted Supabase; email confirmation and password-reset flows end to end; `npm run db:types` (needs Docker or the linked project)

**Needed from you:** a Supabase project (free tier) — `SUPABASE_SETUP.md` walks through it. Keys go into `.env.local` or Netlify, **never into chat**.

## Milestone 4A — Voice vertical slice ✅ IMPLEMENTATION COMPLETE, LIVE PROOF PENDING

Taken out of order, deliberately: a narrow vertical slice through the whole product proves the
architecture end to end far earlier than another milestone of dashboard would.

**Delivered**
- 4 additive migrations (0011–0014): AI-disclosure evidence, a fail-closed recording lockout, a
  30-day pilot retention default with a testable deletion routine, approved-data-only voice tool
  entry points, and one transactional idempotent call-ingest function.
- `VoiceProvider` interface created to the `ARCHITECTURE.md` §3 shape (it had been designed but
  never implemented), plus the Retell adapter — the only file permitted to import the vendor SDK.
- Fail-closed commercial gate: `ASTRA_VOICE_ACTIVATION_MODE` must be exactly `internal_evaluation`.
- Bilingual prompt builder containing no restaurant facts, versioned AI/transcription disclosure
  with interruption replay, prompt-injection sanitisation and data boundaries, allergen answer
  shaping that never guarantees safety.
- Three read-only tool endpoints with a shared secret, per-call rate limits and honest failure
  responses; signed, replay-protected, idempotent lifecycle webhook.
- Minimal Calls dashboard: filterable list with masked numbers, detail with transcript, summary and
  event timeline, demo/live and recording-off badges.
- Realistic signed fixtures and a replay script that exercises verification, the replay window and
  the ingest without a telephone.

**Acceptance**
- [x] Fixture replay produces one complete call with transcript, summary, intent and outcome
- [x] Invalid signature, tampered body and stale replay each write nothing
- [x] Duplicate delivery processed exactly once
- [x] Organisation A cannot read organisation B call data
- [x] Unapproved menu and allergen rows never reach the tools
- [x] Prompt injection stored in knowledge does not alter instructions
- [x] EN and IT disclose AI and transcription before any data collection; interruption replays
- [x] Recording-off mode stores no audio and no recording URL
- [x] Severe allergy and absence-inference never produce a safety guarantee
- [x] Expired transcripts deleted while current data survives
- [x] `format:check`, `lint`, `typecheck`, `test` (255), `build`, `audit --production` all pass
- [x] Accessibility and responsive checks pass at 375/768/1440 for every credential-free page
- [ ] **Calls dashboard accessibility/responsive proof** — spec written, skipped until credentials
- [ ] **One live English and one live Italian call** — blocked on Retell and Twilio accounts

**Needed from you:** see `docs/M4A_LIVE_TEST_RUNBOOK.md`.

## Milestone 3 — Dashboard and knowledge management ← NEXT

**Delivers**
- The six dashboard areas, responsive from 375 px
- Knowledge editors: business info, FAQs, menu categories/items/prices, allergen matrix, policies
- Approval workflow UI (draft → pending → approved) with role gating and diff view
- Empty/loading/error states throughout; accessible components (keyboard, focus, labels, contrast)
- A real design system: typography scale, spacing, colour tokens, light/dark

**Acceptance**
- [ ] A manager changes hours, a price and an allergen entirely from the UI (AC-15)
- [ ] Approval gate visibly blocks unapproved data
- [ ] Playwright + axe accessibility checks pass (AC-18)
- [ ] Works at 375 px, 768 px, 1440 px
- [ ] Every mutation writes an `audit_logs` row (AC-16)

**Needed from you:** feedback on look and feel after seeing it.

## Milestone 4 — Voice integration

**Delivers**
- `VoiceProvider` + Retell implementation; agent sync from `agent_configurations`
- Prompt builder: behaviour rules, bilingual handling, short-utterance style, tool descriptions
- Knowledge tool endpoints (`get_business_info`, `search_menu`, `get_allergen_info`) — approved rows only
- Signed, idempotent webhooks for call start / end / analysis
- Persistence of call sessions, events, transcripts, summaries, intents, outcomes
- Local webhook fixtures and a replay script (no phone needed to test)
- Prompt-injection sanitisation with tests

**Acceptance**
- [ ] Replaying fixtures produces complete, correct call records (AC-01)
- [ ] Invalid signature → 401; duplicate delivery → processed exactly once (AC-14)
- [ ] Unapproved rows never returned by any tool endpoint (AC-10)
- [ ] Injection payload in the knowledge base does not change behaviour (AC-12)
- [ ] One real inbound test call answered in EN and one in IT (AC-02)

**Needed from you:** Retell account + API key; Twilio account + one Irish number.

## Milestone 5 — Action tools (reservation, SMS, transfer)

**Delivers**
- `BookingProvider` interface, `internal` availability engine, Cal.com adapter
- `check_availability` / `create_reservation` with read-back confirmation flow
- `SmsProvider` (Twilio) + templates in EN/IT
- `request_transfer` with warm/cold transfer and failure fallback
- Escalation rules engine (large group, complaint, severe allergy, uncertainty, explicit request, out-of-scope)
- Fault injection harness: forced failures for booking, SMS and transfer

**Acceptance**
- [ ] Reservation created only on `Result.ok` (AC-04)
- [ ] Booking failure → honest message + `failed` record + escalation, never a confirmation (AC-05)
- [ ] SMS failure does not falsify a confirmed reservation (AC-06)
- [ ] Transfer failure admitted and logged (AC-07)
- [ ] All six transfer triggers fire (AC-08)
- [ ] Severe allergy always transfers and logs an allergen escalation (AC-11)

**Needed from you:** the staff transfer phone number; Cal.com key only if you want that provider.

## Milestone 6 — Analytics, audit and retention

**Delivers**
- Overview metrics and trends; intent distribution; escalation report
- Audit-log viewer with filters
- Retention settings UI + scheduled deletion job + `retention_jobs` records
- Phone-number masking by role, with unmasking audited
- Operator tooling for export/delete by caller number

**Acceptance**
- [ ] Metrics match the underlying rows (verified by a test that computes them independently)
- [ ] Retention job actually deletes expired data (AC-17)
- [ ] `staff` sees masked numbers; unmasking by a manager is audited

**Needed from you:** decide retention periods (defaults proposed in `ASSUMPTIONS.md`).

## Milestone 7 — Billing foundations and multi-tenant onboarding

**Delivers**
- Stripe **test mode**: products, prices, checkout, customer portal, subscription webhooks
- `subscriptions` table wired to entitlements (plan limits: locations, monthly minutes)
- Self-serve onboarding: create organisation → location → hours → knowledge → number
- Second demo organisation to prove isolation in real use

**Acceptance**
- [ ] A test-mode subscription completes and updates `subscriptions`
- [ ] Plan limits enforced server-side
- [ ] Onboarding produces a working agent without engineering help
- [ ] Two organisations coexist with zero data leakage

**Needed from you:** Stripe account (test mode only — no live key in V1).

## Milestone 8 — Tests, deployment, operations, final review

**Delivers**
- Full automated suite: unit, integration, RLS, webhook, E2E
- `TEST_PLAN.md` with 20+ scripted call scenarios and honest recorded results
- CI pipeline (format, lint, typecheck, test, build)
- `docs/DEPLOYMENT.md`, `docs/API_AND_WEBHOOKS.md`, `docs/RUNBOOK.md`
- Known limitations + production-readiness checklist
- Final code review against the PRD and every acceptance criterion

**Acceptance**
- [ ] All AC-01…AC-20 explicitly marked pass or fail, with evidence
- [ ] CI green on the branch
- [ ] A new engineer can deploy from `DEPLOYMENT.md` alone
- [ ] Every unmet item is written down, not hidden

**Needed from you:** a Netlify project connected to this repository.

---

## Sequencing rationale

Data model before UI, UI before voice, voice before actions. Reason: the agent can only be as good
as the approved data behind it, so the approval workflow must exist *before* a phone call can reach
it. Actions (booking/SMS/transfer) come last among the functional milestones because they are the
ones that can produce a **false confirmation**, and they need the fault-injection harness that only
makes sense once the call pipeline is real.

## Risk-driven ordering

The two failure modes that would kill this product are (a) a wrong allergen answer and (b) telling a
caller "you're booked" when they are not. Both are addressed structurally — approval gate in M2/M3,
`Result`-based tool contracts in M5 — rather than by prompt wording, and both have dedicated
release-blocking acceptance criteria.
