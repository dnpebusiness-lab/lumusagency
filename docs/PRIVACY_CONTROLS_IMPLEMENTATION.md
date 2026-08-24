# Privacy controls — implementation and evidence

> **Sintesi in italiano**
> `TECHNICAL_PRIVACY_REQUIREMENTS.md` (il tuo documento) dice **cosa** il software deve fare.
> Questo file dice **dove** è implementato e **quale test lo dimostra**, riga per riga.
> Le righe con 🔴 non sono ancora dimostrate.

Requirement source: [`TECHNICAL_PRIVACY_REQUIREMENTS.md`](../TECHNICAL_PRIVACY_REQUIREMENTS.md),
restored verbatim from the founder's M4A handoff package on 24 August 2026. Headings below follow
that document.

An earlier reconstruction of the requirements, written before the package arrived, is preserved at
[`reconstructed-superseded/`](./reconstructed-superseded/) for comparison. It is no longer
authoritative.

---

## Hard defaults

| Requirement | Implementation | Evidence |
|---|---|---|
| Live calls disabled until explicitly configured | `src/lib/security/gate.ts` — only the exact string `internal_evaluation` permits activation; checked before agent sync, tool answer and webhook processing | `tests/unit/gate.test.ts` (6) |
| Stored audio disabled globally and per location | `app.guard_recording_disabled()` trigger (migration 0012); mapper never carries a recording URL across the provider boundary | `tests/database/privacy.test.ts` (4), `tests/integration/retell-webhook.test.ts` |
| Retell commercial provisioning disabled | No provisioning route exists; `RETELL_VENDOR_CONSTRAINTS.md` records the gates | `tests/unit/provider-boundary.test.ts` |
| Transcript/summary pilot retention 30 days | Column default changed in migration 0012, within the existing 1–365 bound | `tests/database/privacy.test.ts` |
| Only synthetic demo data in M4A | Both seeded organisations are `is_demo = true`; fixtures use reserved-range numbers | `tests/database/schema.test.ts`, seed self-check |
| No health analytics, emotion recognition, voiceprints, training pipeline | None present | `tests/unit/provider-boundary.test.ts` — greps the tree and fails on a match |

## Required configuration

| Requirement | Implementation | Evidence |
|---|---|---|
| Live-call feature gate | `ASTRA_VOICE_ACTIVATION_MODE`, fail-closed | `tests/unit/gate.test.ts` |
| Provider selection per location | `locations.booking_provider`; voice provider resolved through `src/lib/providers/registry.ts` | typecheck + boundary test |
| Recording enabled/disabled | `agent_configurations.recording_enabled`, with a CHECK requiring a consent script and a trigger rejecting stored URLs | `tests/database/privacy.test.ts` |
| Transcription notice version EN/IT | `DISCLOSURE_VERSION` + `call_sessions.disclosure_version` / `disclosure_language` | `tests/unit/disclosure.test.ts` (17) |
| Retention days | `organisations.transcript_retention_days` | `tests/database/privacy.test.ts` |
| Human-transfer / callback configuration | `agent_configurations.transfer_number_e164`, `escalation_rules` | `tests/database/integrity.test.ts` |
| Legal-readiness status for a location | 🔴 **Not implemented.** No `legal_ready` field exists yet | — |
| Retell commercial-authorisation status | Recorded outside the repository by design, per your own package | `RETELL_VENDOR_CONSTRAINTS.md` |
| No client-side variable can bypass these gates | No `NEXT_PUBLIC_` secret exists | `tests/unit/provider-boundary.test.ts`, client bundle scan |

## Disclosure evidence

| Requirement | Implementation | Evidence |
|---|---|---|
| Script/version identifier | `call_sessions.disclosure_version` + `ai_disclosure_completed` event payload | `tests/database/privacy.test.ts` |
| Language | `call_sessions.disclosure_language` | ditto |
| Started/completed timestamp | `disclosure_completed_at`, plus append-only event types | ditto |
| Interrupted/replayed state | `ai_disclosure_replayed` event type; `disclosureNeedsReplay()` | `tests/unit/disclosure.test.ts` |
| Recording mode `disabled` | `recording_url_discarded` event; recording trigger | `tests/integration/retell-webhook.test.ts` |
| Prompt always places disclosure before substantive questions | `disclosureSection()` is the first section; `validateDisclosurePlacement()` **throws** on a prompt that removes or delays it | `tests/unit/prompt.test.ts` (21) |
| Tests fail if a prompt omits the literal AI identification or moves it after data collection | Exactly that assertion | `tests/unit/prompt.test.ts` |

## Data minimisation

| Requirement | Implementation | Evidence |
|---|---|---|
| No raw webhook bodies persisted | `webhook_events` stores vendor, event id, type and an optional digest — never the body | schema review, `tests/database/schema.test.ts` |
| Logs exclude transcript, full numbers, SMS bodies, secrets | `redactForLog()` — deny-by-key, recursive, depth-limited | `tests/unit/redaction.test.ts` (9) |
| Mask caller numbers for staff roles | Masked for **everyone** in M4A; unmasking needs an audited action, which is Milestone 6 | `tests/unit/calls-format.test.ts`, dashboard code |
| No provider recording URLs persisted when audio is off | Mapper discards, database rejects | `tests/integration/retell-webhook.test.ts` |
| No payment data, DOB, government identifiers | No such field exists in the schema | schema review |
| Allergy statements tagged, not copied into summaries | `escalation_reason = 'severe_allergy'`; the agent escalates rather than elaborating | `tests/unit/safety.test.ts` (15) |

## Allergen safety

| Requirement | Implementation | Evidence |
|---|---|---|
| Query only approved, item-specific rows | `agent` schema views + `voice_*` RPCs, service-role only | `tests/database/agent-surface.test.ts`, `tests/database/privacy.test.ts` |
| Speak factual "contains" and approved cross-contamination notes | `assessAllergenQuestion()` — only `contains` is speakable as fact | `tests/unit/safety.test.ts` |
| Never infer free-from, safety or absence from missing data | Undeclared returns `not_confirmed` with no speakable fact | `tests/unit/safety.test.ts` |
| Serious allergy / cross-contamination / uncertainty escalates | Severity checked **before** any data is consulted | `tests/unit/safety.test.ts` |
| Provide a link to written allergen information | 🟠 **Adapted.** M4A cannot send anything, so the prompt offers to **read** it or give the direct contact. Sending arrives with SMS in Milestone 5 | `tests/unit/prompt.test.ts` |
| Tests for unapproved item, missing declaration, injection | Present | `tests/unit/safety.test.ts`, `tests/unit/sanitise.test.ts`, `tests/database/privacy.test.ts` |
| Test for **conflicting** declaration | 🔴 **Not implemented.** A dish declared both `contains` and `free_from` for one allergen is prevented by a unique constraint, but there is no test asserting the agent's behaviour if it ever occurred | — |

## Webhooks and calls

| Requirement | Implementation | Evidence |
|---|---|---|
| Raw-body signature verified before parsing | `RetellVoiceProvider.verifyWebhook()`; route reads `request.text()` | `tests/integration/retell-webhook.test.ts` (18) |
| Replay window and idempotency key | SDK ±5 min window; `webhook_events (vendor, event_id)` unique | ditto |
| Complete call sessions stored from fixtures and live events | `voice_ingest_call_event()` — one transaction | ditto |
| Never convert a failure into a spoken success | `Result` contract; `toolFailure()`; `reservations_confirmed_has_provider_ref` | `tests/integration/voice-tools.test.ts`, `tests/database/integrity.test.ts` |
| Correlate by stable vendor call id; prevent cross-location reassignment | `unique (provider, provider_call_id)`; location resolved from the vendor agent id | `tests/integration/retell-webhook.test.ts` |

## Retention

| Requirement | Implementation | Evidence |
|---|---|---|
| Daily deletion route authenticated as a scheduled job | 🔴 **Not implemented.** `app.run_transcript_retention()` exists and is service-role only, but no `/api/cron/retention` route and no schedule yet | — |
| Delete transcript/summary/audio references per location settings | Function deletes transcripts and summaries past the deadline | `tests/database/privacy.test.ts` |
| Evidence row with counts, not content | `retention_jobs` | ditto |
| Integration test proving only expired data is deleted | Present | ditto |

## Dashboard M4A slice

| Requirement | Implementation | Evidence |
|---|---|---|
| Authenticated `/dashboard/calls` list | Built, RLS-scoped through the user's client | build + `tests/e2e/calls-dashboard.spec.ts` (skipped) |
| Filters for status/language/date | `CallFilters` | ditto |
| Detail with metadata, redacted number, transcript, summary, timeline | Built | ditto |
| Demo/live badge and recording-off indicator | Built | ditto |
| Currently deployed disclosure script/version displayed (compliance/12) | Panel on `/dashboard/calls` | ditto |
| Empty / loading / error states | Built | ditto |
| Responsive 375/768/1440 | 🟠 Proven for every credential-free page; the Calls page specs **skip** until Supabase credentials exist | `tests/e2e/public-pages.spec.ts` (30 pass) |

## Release-blocking tests

| Requirement | Status |
|---|---|
| Hosted Supabase migrations and generated types validated | 🔴 **Not done** — no hosted project yet |
| RLS cross-tenant suite green | ✅ against a real PostgreSQL server with the real migrations |
| Invalid / duplicate webhook tests | ✅ |
| Unapproved data and injection tests | ✅ |
| AI disclosure EN/IT prompt tests | ✅ |
| Recording-off test proving no URL is stored | ✅ |
| Retention deletion test | ✅ |
| One internal live EN call and one IT call in the dashboard | 🔴 **Not done** |
| format, lint, typecheck, tests, build green | ✅ |

---

## Summary of what is genuinely not done

1. **Hosted Supabase validation** — everything runs against a local PostgreSQL 16 server.
2. **The two live calls.**
3. **Scheduled retention route** — the deletion function exists and is tested; nothing calls it on a schedule.
4. **`legal_ready` per-location field** — not modelled.
5. **Conflicting-allergen-declaration behavioural test.**
6. **Calls dashboard accessibility and responsive proof** — specs written, skipping.

Items 3–5 are small and were not in the Milestone 4A vertical slice. They are listed here so they
are not mistaken for done.
