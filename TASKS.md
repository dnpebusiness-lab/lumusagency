# TASKS — Astra Voice (prioritised backlog)

> **Sintesi in italiano**
> La lista dei lavori in ordine di priorità.
> **P0** = senza questo il prodotto non esiste o è pericoloso. **P1** = serve per la V1.
> **P2** = migliora la V1. **P3** = dopo la V1.
> Ogni riga ha un criterio di accettazione: come si verifica che sia davvero fatta.

Status legend: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked

---

## P0 — Safety and integrity (release blockers)

| # | Task | M | Acceptance | Status |
|---|---|---|---|---|
| T-001 | Approval gate on all knowledge/menu/allergen reads | M2/M4 | No query path returns `approval_status != 'approved'` to a tool (AC-10) | [x] DB layer done, `agent` schema + 10 tests; tool endpoints in M4 |
| T-002 | Allergen answers from structured data only, never inferred | M4 | Injection + inference scenarios show refusal; agent cites declared data only | [~] `agent.get_allergen_info` separates contains / may_contain / free_from / undeclared and never asserts safety |
| T-003 | Severe-allergy mandatory transfer + escalation log | M5 | Scenario ALL-01/02 transfers and writes an allergen escalation (AC-11) | [ ] |
| T-004 | `Result`-typed tool contracts; confirmation only on `ok:true` | M5 | Fault-injection tests produce zero false confirmations (AC-04…07) | [ ] |
| T-005 | RLS enabled on every table in `public`; all privileges revoked from `anon` | M2 | Cross-tenant suite returns 0 rows for the other org on every table, both directions (AC-13) | [x] |
| T-006 | Webhook signature verification + replay window | M4 | Invalid signature → 401, no writes (AC-14) | [ ] |
| T-007 | Webhook idempotency via unique `(vendor,event_id)` | M4 | Duplicate delivery processed exactly once (AC-14) | [ ] |
| T-008 | Prompt-injection sanitisation on write + delimiting on read | M4 | Stored payload does not alter behaviour (AC-12) | [ ] |
| T-009 | Secrets server-side only; CI check on the client bundle | M1/M8 | Grep of build output finds no secret pattern | [ ] |
| T-010 | Audit logging on every settings change, approval and PII unmask | M3/M6 | Every mutation produces an `audit_logs` row with before/after (AC-16) | [~] triggers on 14 tables, approve/unapprove recorded distinctly; viewer UI in M6 |

## P1 — Core V1 functionality

| # | Task | M | Acceptance | Status |
|---|---|---|---|---|
| T-020 | Documentation set (PRD/ARCH/SEC/PLAN/TASKS/README) | M1 | Present, consistent, reviewed | [x] |
| T-021 | Next.js 16 + TS strict + Tailwind v4 + component scaffold | M1 | lint/typecheck/test/build pass | [x] |
| T-022 | `.env.example` with source and required-when per variable | M1 | Founder can obtain every credential unaided | [x] |
| T-023 | Database schema + migrations (26 tables) | M2 | Applies cleanly to an empty DB | [x] |
| T-024 | Supabase Auth (email+password), password reset, protected routes | M2 | Code complete; **email flows not yet tested end to end** (no hosted project) | [~] |
| T-025 | Organisation + location management | M2 | Create/edit/list, role-gated | [x] |
| T-026 | Seed data for the demo restaurants | M2 | 18 menu items, 35 allergen rows, 13 FAQs, 12 calls, 5 reservations, both tenants `is_demo` | [x] |
| T-027 | Dashboard shell, navigation, design tokens | M3 | Responsive 375/768/1440, dark mode | [ ] |
| T-028 | Overview metrics | M3/M6 | Numbers match independently computed values | [ ] |
| T-029 | Call list + detail (transcript, summary, outcome, events) | M3 | Searchable, filterable, paginated | [ ] |
| T-030 | Reservation list + detail with source call link | M3 | Status transitions visible | [ ] |
| T-031 | Knowledge editors + approval workflow UI | M3 | Manager edits and approves without code (AC-15) | [ ] |
| T-032 | Agent settings UI (greeting, languages, voice, transfer, hours behaviour) | M3 | Changes reach the agent without deployment | [ ] |
| T-033 | `VoiceProvider` + Retell adapter + agent sync | M4 | Config change propagates to the live agent | [ ] |
| T-034 | Prompt builder with bilingual + short-speech rules | M4 | EN and IT calls stay in language (AC-02) | [ ] |
| T-035 | Knowledge tool endpoints | M4 | Short speakable responses, approved data only | [ ] |
| T-036 | Call lifecycle webhooks + persistence | M4 | Fixture replay yields complete records (AC-01) | [ ] |
| T-037 | `BookingProvider` interface + `internal` engine | M5 | Availability respects hours, capacity, party size | [ ] |
| T-038 | Cal.com adapter | M5 | Same interface, integration test against sandbox | [ ] |
| T-039 | Reservation tool with mandatory read-back | M5 | Read-back precedes every creation (AC-04) | [ ] |
| T-040 | SMS provider + EN/IT templates | M5 | Confirmation delivered in call language | [ ] |
| T-041 | Transfer tool + failure fallback | M5 | Failure admitted and logged (AC-07) | [ ] |
| T-042 | Escalation rules engine | M5 | All six triggers fire (AC-08) | [ ] |
| T-043 | Retention settings + deletion job | M6 | Expired transcripts actually deleted (AC-17) | [ ] |
| T-044 | 20+ scripted call scenarios with expected outcomes | M8 | `TEST_PLAN.md` with honest results | [ ] |
| T-045 | CI pipeline | M8 | Green on the branch | [ ] |
| T-046 | Deployment + API/webhook + runbook documentation | M8 | New engineer deploys from docs alone | [ ] |

## P2 — Valuable for V1 if time allows

| # | Task | M | Acceptance | Status |
|---|---|---|---|---|
| T-060 | Stripe test-mode subscriptions + entitlements | M7 | Test checkout updates `subscriptions` | [ ] |
| T-061 | Self-serve multi-tenant onboarding | M7 | Second org onboarded with no engineering | [ ] |
| T-062 | Audit-log viewer with filters | M6 | Filter by actor, entity, date | [ ] |
| T-063 | Escalation reporting and intent analytics | M6 | Top intents and escalation reasons charted | [ ] |
| T-064 | Phone-number masking by role | M6 | `staff` sees masked; unmask audited | [ ] |
| T-065 | Fault-injection harness as a reusable test utility | M5 | One switch forces each provider to fail | [ ] |
| T-066 | Operator export/delete by caller number (GDPR requests) | M6 | Produces a complete export, deletes fully | [ ] |
| T-067 | Alerting on webhook failures and call anomalies | M8 | Alert fires in a simulated outage | [ ] |

## P3 — After V1 (explicitly deferred)

Google Calendar adapter · self-service data-subject portal · phone ordering · payments ·
outbound calls · loyalty · delivery · POS integration · native apps · voice cloning ·
enterprise analytics · multi-location routing · WhatsApp channel · more languages.

---

## Critical path

```
T-023 schema ─► T-024 auth ─► T-026 seed ─► T-031 knowledge+approval ─► T-035 knowledge tools
                                                                              │
T-033 Retell ─► T-036 webhooks ──────────────────────────────────────────────►┤
                                                                              ▼
                                        T-037/039 booking ─► T-041 transfer ─► T-044 scenarios
```
Everything on this line is P0 or P1. Anything not on it can slip without endangering the pilot.
