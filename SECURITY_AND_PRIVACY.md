# SECURITY AND PRIVACY — Astra Voice

> **Sintesi in italiano**
> Qui c'è come proteggiamo i dati e cosa **non** è ancora a posto legalmente.
> Punto più importante, in chiaro: **avere queste funzioni non rende il prodotto "conforme al GDPR".**
> Registrare telefonate e trascrizioni in Irlanda/UE richiede un avvocato, una valutazione d'impatto (DPIA),
> contratti con i ristoranti e un avviso di consenso. La sezione §10 elenca esattamente cosa serve
> **prima** di far rispondere l'AI a un cliente vero. Non saltarla.

Version 1.0 · Milestone 1 · Jurisdiction: Ireland / EU

---

## 1. Threat model (what we are actually defending against)

| # | Threat | Impact | Primary control |
|---|---|---|---|
| T1 | Cross-tenant data access (restaurant A reads restaurant B) | Fatal to the business | PostgreSQL RLS on every table, anon revoked, tested at SQL level |
| T2 | Forged webhook creating fake calls/reservations | Data integrity, fraud | Signature verification + replay window + idempotency |
| T3 | Prompt injection via knowledge-base content | Agent says harmful/false things | Sanitise on write, delimit on read, tool allow-list |
| T4 | **Wrong allergen information reaching a caller** | **Physical harm** | Approval gate, no inference, mandatory escalation |
| T5 | Credential exposure in the browser bundle | Total compromise | Server-only secrets, no `NEXT_PUBLIC_` secret, boundary lint rule |
| T6 | Personal data over-retention | Regulatory + reputational | Configurable retention + enforced deletion job |
| T7 | Toll fraud / abuse of the phone number | Direct financial loss | Rate limits, per-location call caps, anomaly alerts |
| T8 | Insider / support access to customer calls | Trust, GDPR | Explicit support role, every access audited |
| T9 | Transcript leakage through application logs | GDPR breach | Structured logging with redaction, never log bodies |
| T10 | Caller impersonation to obtain someone's reservation | Privacy | No reservation lookup by phone alone in V1 |

## 2. Tenancy isolation

- Every business table has `organisation_id NOT NULL`.
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` on **every** table in `public` (asserted by test, not by memory).
- Policies derive access from `organisation_members` for `auth.uid()`; there is no client-supplied org id anywhere in a policy. Changing an id in a request therefore achieves nothing — proved by a dedicated test.
- Policies are granted `TO authenticated` only, and **every privilege is revoked from `anon`**, so an unauthenticated request is refused by the grant system before a policy is even consulted.
- Column-level grants narrow writes further where a role may only touch part of a row: `staff` can write `call_sessions.caller_name` and `escalation_notes` and nothing else on that table.
- Append-only tables (`call_events`, `call_transcripts`, `call_summaries`, `audit_logs`) have SELECT policies only, and INSERT/UPDATE/DELETE revoked from `authenticated`.
- The dashboard uses the **user's** JWT-scoped Supabase client. The `service_role` key exists only inside webhook/tool/cron routes.
- A dedicated test suite (`tests/database/rls.test.ts`) authenticates as the owner of organisation A and asserts that **every** tenant table returns zero rows for organisation B, in both directions. This is AC-13 and it is a release blocker.

**`FORCE ROW LEVEL SECURITY` is deliberately not enabled** (Milestone 2 decision). FORCE also
subjects the *table owner* to the policies, and on Supabase the table owner is the same role that
runs migrations, the SECURITY DEFINER audit triggers and the seed — exactly the trusted server-side
path that the design reserves for webhooks and administrative operations. Turning it on without a
real Supabase project to test against would have been a change we could not verify. Evaluating it on
the hosted project is a Milestone 8 hardening item, tracked in the checklist below.

**A note on SECURITY DEFINER.** Authorisation helpers that must read `organisation_members` past RLS
are SECURITY DEFINER with a pinned empty `search_path`. The functions that decide *who is calling*
(`app.is_trusted_backend()` and the three guard triggers) are deliberately SECURITY INVOKER: as
DEFINER they would see the function owner rather than the caller and would silently return "trusted"
for everybody. That mistake was made and caught by `tests/database/integrity.test.ts` during
Milestone 2; the tests remain as the regression guard.

## 3. Roles and permissions

| Capability | owner | manager | staff | support (us) |
|---|:--:|:--:|:--:|:--:|
| View calls, transcripts, reservations | ✅ | ✅ | ✅ | ✅ audited |
| Unmask caller phone number | ✅ | ✅ | ❌ masked | ✅ audited |
| Edit knowledge / menu / allergens | ✅ | ✅ | ❌ | ❌ |
| **Approve** knowledge / menu / allergens | ✅ | ✅ | ❌ | ❌ |
| Agent settings, escalation rules | ✅ | ✅ | ❌ | ❌ |
| Invite/remove staff, change roles | ✅ | ✅ (not owner) | ❌ | ❌ |
| Retention settings, delete organisation, billing | ✅ | ❌ | ❌ | ❌ |

Enforced twice: in RLS policies (authoritative) and in server actions (fast, friendly errors).

## 4. Webhook security

1. **Raw body first.** The body is read as text and signature-verified *before* any parsing.
2. **Timing-safe HMAC comparison** (`crypto.timingSafeEqual`), never `===`.
3. **Replay protection:** reject events whose timestamp is outside a ±5 minute window.
4. **Idempotency:** `webhook_events (vendor, event_id)` has a unique constraint; a duplicate delivery hits the conflict and returns `200` without reprocessing. Vendors retry — this is normal, not exceptional.
5. **Transactional processing:** a webhook that writes a call, transcript and reservation writes them in one transaction, so a partial failure leaves no half-state.
6. **Fail closed:** unverifiable signature → `401`, nothing written, nothing logged beyond the rejection.

## 5. Input validation and rate limiting

- Every external input (webhooks, tool calls, forms, query strings) passes a **zod** schema at the boundary. Nothing untyped reaches business logic.
- Rate limits: per-IP on auth routes, per-`call_id`+tool on voice tools, per-organisation daily call and SMS caps (a runaway agent is also a runaway invoice).
- Server-side validation is authoritative; client validation is only UX.
- SMS bodies are built from templates with escaped variables — callers cannot dictate arbitrary SMS content.

## 6. Secrets

- Nothing sensitive is ever prefixed `NEXT_PUBLIC_`. Only the Supabase URL and anon key are public, by design.
- Secrets live in Netlify environment variables (production) and `.env.local` (local, git-ignored).
- `.env.example` documents every variable: what it is, where to obtain it, and whether it is needed for local / test / production.
- A CI check greps the build output for known secret name patterns and fails the build on a hit.
- Rotation: any key pasted into a chat, a screenshot, an issue or a log is considered burned and must be rotated.

## 7. Logging and redaction

- Structured JSON logs. **Never logged:** transcript bodies, full caller numbers, SMS bodies, tokens, service-role key, customer email addresses.
- Phone numbers appear as `+353****1234`. A stable hashed `caller_ref` is used for correlation instead of the raw number.
- Errors returned to clients are generic (`"Unable to process request"` + a correlation id). Stack traces and vendor messages stay server-side.
- `audit_logs` records: actor, action, entity, entity id, before/after JSONB, IP, timestamp — for every settings change, every approval, every phone-number unmasking, every support access.

## 8. Personal data inventory

| Data | Category | Where | Default retention |
|---|---|---|---|
| Caller phone number | Personal | `call_sessions`, `reservations` | 24 months (metadata) |
| Transcript | Personal, potentially special-category (allergies = **health data**) | `call_transcripts` | **90 days** |
| Audio recording | Personal + biometric-adjacent | Supabase Storage | **disabled by default** |
| Summary | Personal | `call_summaries` | 90 days |
| Reservation details | Personal | `reservations` | 24 months |
| Staff account data | Personal | `users` | life of account + 30 days |

⚠️ **A caller stating an allergy is disclosing health data.** Under GDPR Article 9 that is
special-category data and needs an explicit lawful basis. This is one of the strongest reasons the
severe-allergy path transfers to a human quickly and stores the minimum necessary.

## 9. Retention, consent and data-subject rights

- Retention is configurable per location, bounded by a server-enforced maximum. A daily job (`/api/cron/retention`) hard-deletes expired transcripts, summaries and recordings and records the run in `retention_jobs`.
- Recording consent: if a location enables audio recording, the agent **must** play the configured consent announcement first; the setting cannot be saved without a consent script.
- Data-subject requests: V1 provides export and delete-by-caller-number tooling for an operator. It is **not** a self-service portal — that is post-V1 and must be designed with legal input.

## 10. 🔴 What is NOT delivered — required before a real customer call

**The presence of the features above does not make Astra Voice legally compliant.**
The following require professional legal review and are outside what software can provide:

1. **DPIA** (Data Protection Impact Assessment) — near-certainly mandatory: systematic monitoring, voice data, health data.
2. **Lawful basis** for recording/transcribing, and specifically for Article 9 health data disclosed by callers.
3. **Data Processing Agreement** with each restaurant (they are controller, we are processor) and a documented sub-processor list.
4. **International transfers** — Retell, Twilio, OpenAI and Stripe process data outside the EEA. Transfer Impact Assessments and SCCs are required.
5. **Consent / notification script** for recorded calls, reviewed under Irish law.
6. **Privacy notice** for callers and for the restaurant's own website.
7. **AI transparency** — under the EU AI Act, callers must be informed they are speaking with an AI system. Our greeting must state it; the exact wording should be reviewed.
8. **Allergen liability** — allocation of responsibility between us and the restaurant, and alignment with FSAI (Food Safety Authority of Ireland) allergen-information rules, must be in the contract.
9. **Retention periods** confirmed against Irish/EU expectations rather than our engineering defaults.
10. **Penetration test** and an independent security review before the first paying customer.
11. **Breach-notification procedure** (72 hours) with named responsibilities.
12. **Insurance** — professional indemnity covering AI-provided information.

Items 1, 2, 3, 5, 7 and 8 are, in my judgement, **hard blockers** for a live pilot with real callers.

## 11. Production-readiness security checklist

- [x] RLS enabled on every table in `public`; cross-tenant test suite green (22 tests, both directions)
- [ ] `FORCE ROW LEVEL SECURITY` evaluated against the hosted Supabase project
- [ ] All webhooks signature-verified, replay-protected, idempotent — with tests
- [ ] No secret reachable from the browser bundle (automated check in CI)
- [ ] Rate limits active on auth, tool and webhook routes
- [ ] Retention job running on a schedule and verified to actually delete
- [ ] Audit logging on every settings change, approval and PII unmasking
- [ ] Prompt-injection test suite green
- [ ] Dependency audit clean (`npm audit --production`)
- [ ] Error responses carry no internal detail
- [ ] Secret rotation procedure written and tested
- [ ] Backup and restore tested (not just enabled)
- [ ] Incident runbook written, on-call path defined
- [ ] Legal items in §10 signed off in writing
