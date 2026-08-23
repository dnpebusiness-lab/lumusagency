# ARCHITECTURE — Astra Voice

> **Sintesi in italiano**
> Come è fatto il sistema, in tre frasi:
> **(1)** Il telefono squilla su un numero Twilio, la chiamata va a Retell che gestisce voce e conversazione.
> **(2)** Retell non sa nulla del ristorante: ogni volta che deve sapere o fare qualcosa
> (orari, allergeni, disponibilità, prenotare, mandare un SMS, passare a una persona)
> chiama **il nostro server**, che risponde solo con dati approvati dal manager.
> **(3)** Il nostro server salva tutto su Supabase (database) e lo mostra nella dashboard.
> Retell, Twilio e il sistema di prenotazioni sono dietro delle "prese elettriche" (interfacce):
> si possono cambiare senza riscrivere l'applicazione.

Version 1.0 · Milestone 1

---

## 1. System overview

```
   ┌──────────┐   PSTN    ┌──────────────┐   SIP/media   ┌─────────────┐
   │  Caller  │ ────────► │    Twilio    │ ──────────► │  Retell AI  │
   └──────────┘           │ number + SMS │             │ STT·LLM·TTS │
        ▲                 └──────────────┘             └──────┬──────┘
        │ transfer / SMS         ▲                            │
        │                        │ REST                       │ custom-function calls
        │                        │                            │ + lifecycle webhooks
        │                 ┌──────┴────────────────────────────▼──────┐
        └─────────────────┤        ASTRA VOICE (Next.js on Netlify)  │
                          │  /api/voice/*   tool endpoints           │
                          │  /api/webhooks/*  signed, idempotent     │
                          │  /app/(dashboard)/*  RSC + server actions│
                          └──────┬───────────────────────┬───────────┘
                                 │                       │
                    ┌────────────▼─────────┐   ┌─────────▼──────────┐
                    │  Supabase Postgres   │   │ Booking provider   │
                    │  RLS · Auth · Storage│   │ internal | cal.com │
                    └──────────────────────┘   └────────────────────┘
```

**The single most important architectural rule:** the voice vendor holds *no* business data.
Retell receives a system prompt that describes *behaviour*, and a set of tools. Every fact —
opening hours, a price, an allergen, whether a table is free — arrives only as the return value
of a call to our server. This is what makes "never invent anything" enforceable rather than hopeful.

## 2. Technology choices and why

| Layer | Choice | Why | Replaceable? |
|---|---|---|---|
| Web framework | Next.js 16 App Router, React 19, TypeScript strict | One codebase for dashboard + API; server components keep secrets server-side by construction | Core |
| Styling | Tailwind CSS + shadcn/ui (Radix) | Accessible primitives (WCAG AA) without inventing a design system | Yes |
| Database / Auth / Storage | Supabase (PostgreSQL) | Real Postgres with **Row Level Security** — tenancy enforced by the database, not by hope | Postgres is portable |
| Voice agent | Retell AI | Handles turn-taking, barge-in, low latency; months of work we do not repeat | **Yes — via `VoiceProvider`** |
| Telephony + SMS | Twilio | We own the phone number, so we can switch voice vendor without the restaurant reprinting menus | **Yes — via `TelephonyProvider` / `SmsProvider`** |
| Booking | `internal` engine (default) + Cal.com adapter | Most small restaurants have no booking system at all | **Yes — via `BookingProvider`** |
| Billing | Stripe (test mode) | Standard; tables and webhooks ready, no live keys in V1 | Yes |
| Hosting | Netlify + `@netlify/plugin-nextjs` | Requested; webhooks run as Node functions (raw body needed for signatures) | Yes |
| Tests | Vitest + Playwright + scripted call pack | Unit/integration/E2E/behavioural | — |

## 3. Provider abstractions (the "sockets")

All under `src/lib/providers/`. Application code never imports a vendor SDK directly.

```ts
// src/lib/providers/booking/types.ts
export interface BookingProvider {
  readonly id: 'internal' | 'calcom' | 'google-calendar'
  checkAvailability(input: AvailabilityQuery): Promise<Result<AvailabilitySlot[]>>
  createReservation(input: CreateReservationInput): Promise<Result<ReservationRef>>
  cancelReservation(ref: ReservationRef): Promise<Result<void>>
}

export interface VoiceProvider {
  readonly id: 'retell'
  syncAgent(config: AgentConfiguration): Promise<Result<AgentRef>>
  verifyWebhook(rawBody: string, headers: Headers): Result<VoiceWebhookEvent>
  transferCall(callId: string, e164: string): Promise<Result<void>>
}

export interface SmsProvider  { send(input: SmsInput): Promise<Result<SmsRef>> }
export interface TelephonyProvider { provisionNumber(...): Promise<Result<PhoneNumberRef>> }
```

Two rules make the abstraction real rather than decorative:

1. **Nothing throws across the boundary.** Every method returns `Result<T> = {ok:true,data:T} | {ok:false,error:ProviderError}`. A vendor outage is a *value* the agent logic must handle, not an exception that can be swallowed and turned into a false confirmation.
2. **Providers are resolved per location at runtime** from `locations.booking_provider`, not imported statically. Adding a provider is a new folder plus one registry line.

## 4. Request paths

### 4.1 Voice tool call (the hot path)
```
Retell → POST /api/voice/tools/{tool}
  1. verify Retell signature (raw body, timing-safe)      → 401
  2. rate-limit by call_id + tool                          → 429
  3. zod-validate payload                                  → 400
  4. resolve location from the call session
  5. execute (knowledge query | availability | book | sms | transfer)
  6. append a call_events row (audit trail of every tool call & result)
  7. return a SHORT, speakable, structured result
```
Tools returned to Retell in V1: `get_business_info`, `search_menu`, `get_allergen_info`,
`check_availability`, `create_reservation`, `send_sms`, `request_transfer`, `log_escalation`.

Tool responses are **short and pre-shaped for speech** (e.g. `{ "spoken": "Sabato alle 20 abbiamo posto per quattro.", "data": {...} }`). This is what keeps the agent from reading paragraphs aloud.

### 4.2 Lifecycle webhook
```
Retell/Twilio/Stripe → POST /api/webhooks/{vendor}
  1. read RAW body (no JSON parsing before signature check)
  2. verify signature; reject replay outside a 5-minute window
  3. INSERT into webhook_events (unique on vendor+event_id)  ← idempotency gate
     - conflict → 200 OK, do nothing
  4. process inside a DB transaction
  5. mark processed / record failure for retry
```

### 4.3 Dashboard
React Server Components read through the **user's** Supabase client, so RLS applies to every
query. Mutations go through server actions that: check role → zod-validate → write in a
transaction → write `audit_logs`. The `service_role` key is used **only** by webhook and tool
routes, never in anything a browser can reach.

## 5. Data model

26 tables, implemented in Milestone 2 (`supabase/migrations/`). Every tenant table carries
`organisation_id`, and `tests/database/rls.test.ts` asserts that the list of tenant tables it walks is
exactly the set of tables with that column — so a new table cannot quietly escape the isolation test.

**Tenancy & identity**
`organisations` · `locations` · `profiles` (mirrors `auth.users`) · `organisation_members` (role) ·
`organisation_member_locations` (scopes a location manager) · `subscriptions`

**Agent configuration**
`agent_configurations` (greeting, languages, voice, transfer number, closed-hours behaviour, prompt version) · `business_hours` (regular + special/holiday overrides) · `escalation_rules`

**Knowledge (all approval-gated)**
`knowledge_articles` · `menu_categories` · `menu_items` · `dietary_attributes` · `menu_item_allergens` · `frequently_asked_questions`
Every one of these has: `approval_status ('draft'|'pending'|'approved'|'archived')`, `approved_by`, `approved_at`, `version`.
**Tool endpoints filter on `approval_status = 'approved'` at the query layer — there is no code path that can read unapproved rows into a phone call.**

**Calls**
`call_sessions` (times, caller number, direction, outcome, intent, language, reservation & transfer status, escalation reason) · `call_events` (append-only: every tool call, result, error, state change) · `call_transcripts` (turn-level, speaker, timing) · `call_summaries` (model-generated summary + intent + sentiment)

**Operations**
`reservations` (with `source_call_id`, provider ref, status) · `audit_logs` (actor, entity, before/after JSONB) · `webhook_events` (idempotency) · `sms_messages` · `retention_jobs`

**Reference (not tenant-owned):** `allergens` (the 14 EU-regulated allergens) · `dietary_attributes`

### Roles

Two separate vocabularies, on purpose. `app.org_role` covers the five roles inside an organisation:
`organisation_owner`, `organisation_admin`, `location_manager`, `staff`, `viewer`.
`platform_role` is a property of the *person* (us, the platform operator) and lives on `profiles`,
so no edit to a membership row can ever escalate into it.

### Constraints that encode product rules

A handful of rules are expressed as CHECK constraints rather than application logic, because they are
the ones where a bug would be expensive:

| Constraint | What it makes impossible |
|---|---|
| `reservations_confirmed_has_provider_ref` | a "confirmed" booking with no provider reference — the database half of AC-04 |
| `menu_item_allergens_free_from_requires_review` | an approved "free from" claim with no review date and no cross-contamination note |
| `escalation_rules_mandatory_reasons_enabled` | switching off the severe-allergy, complaint, caller-request or out-of-scope escalation |
| `agent_configurations_recording_requires_consent` | enabling call recording without a consent announcement |
| `call_sessions_recording_requires_consent` | storing a recording for a call with no recorded consent |
| `organisations_transcript_retention_bounds` | keeping transcripts longer than 365 days |
| `menu_items_approved_has_price` | an approved dish the agent would have to quote without a price |

### The approval gate

Two triggers, applied to all six approvable tables:

1. Only someone who may manage the location can set `approval_status = 'approved'`.
2. **Any content change to an approved row drops it back to `draft`** and clears its approver — even
   if the same statement also asks for approval, because SQL cannot distinguish a deliberate
   re-approval from a client echoing the column back. Approval is therefore a separate, explicit act:
   Save, then Approve. Editing the allergen list of an approved dish silently un-publishes it from
   the agent until a manager signs it off again.

### RLS model
```sql
-- one helper, used by every policy (migration 0007)
create function app.org_ids() returns setof uuid
  language sql stable security definer set search_path = '' as $$
    select organisation_id from public.organisation_members
    where user_id = auth.uid() and status = 'active' $$;

-- read pattern, applied to every tenant table
create policy <table>_select on public.<table> for select to authenticated
  using (app.is_org_member(organisation_id));

-- write pattern for location-scoped content
create policy <table>_update on public.<table> for update to authenticated
  using (app.can_manage_location(location_id))
  with check (app.is_org_member(organisation_id) and app.can_manage_location(location_id));
```

Reads require organisation membership; writes require the privilege to manage that specific
location, which owners and admins hold implicitly and a `location_manager` holds only for the
locations assigned to them in `organisation_member_locations`. Every privilege is revoked from
`anon`. Append-only tables have SELECT policies only. `FORCE ROW LEVEL SECURITY` is deliberately not
used — see `SECURITY_AND_PRIVACY.md` §2 for why, and Milestone 8 for the follow-up.

## 6. Dashboard information architecture

| Route | Contents |
|---|---|
| `/dashboard` | **Overview** — total calls, answered, missed/failed, reservations created, transfers, top intents, trend chart |
| `/dashboard/calls` | **Calls** — searchable/filterable history; detail: transcript, summary, outcome, duration, escalation reason, tool-event timeline |
| `/dashboard/reservations` | **Reservations** — list, status, customer, date/time/party size, link to source call |
| `/dashboard/knowledge` | **Knowledge** — business info, FAQs, menu (categories/items/prices), allergens, policies, with the approval workflow |
| `/dashboard/agent` | **Agent settings** — greeting, languages, voice, transfer number, escalation rules, closed-hours behaviour, prompt preview |
| `/dashboard/settings` | **Organisation** — locations, staff access & roles, data-retention, integrations, (billing) |

Design direction: restrained, dense, operational — a tool for a busy host stand, not a marketing
page. Real typographic hierarchy, one accent colour, tabular data that stays legible at 375 px.
Explicitly **not** the generic purple-gradient AI-dashboard look.

## 7. Prompt-injection defence

Knowledge-base content is written by restaurant staff and is therefore untrusted input that
reaches an LLM. Four layers:

1. **Structure over prose** — the agent receives typed fields (`price_cents`, `contains_allergen`), not free text, wherever possible.
2. **Sanitisation on write** — strip/flag instruction-like patterns ("ignore previous", "system:", role markers, fenced blocks) and reject control characters.
3. **Delimiting on read** — knowledge is injected inside explicit data boundaries with a standing instruction that content within them is *data, never instructions*.
4. **Capability limits** — the agent cannot call a tool that is not in its allow-list, cannot change its own configuration, and cannot reach an arbitrary URL. The blast radius of a successful injection is bounded by the tool list.

## 8. Failure behaviour (why we never lie to a caller)

| Failure | Agent says | System does |
|---|---|---|
| Booking provider down | "I can't complete the booking right now — let me pass you to a colleague." | `reservations.status='failed'`, escalation, `call_events` error row |
| Slot unavailable | offers nearest alternatives returned by the tool | nothing written |
| SMS fails | "The table is booked. The text didn't go through, but you're confirmed for 8pm." | reservation stays `confirmed`, `sms_messages.status='failed'` |
| Transfer fails | "I can't reach a colleague — may I take your number for a call back?" | `transfer_status='failed'`, escalation logged |
| Tool timeout | filler + retry once, then escalate | timeout recorded |
| Unknown question | "I don't have that confirmed — I'll pass you to someone who does." | escalation with reason `outside_approved_information` |

The invariant, enforced in code and in tests: **a confirmation sentence may only be spoken on a
`Result.ok === true`.** AC-04 to AC-07 exist to prove it.

## 9. Repository layout

```
src/
  app/
    (marketing)/                 public landing
    (auth)/                      sign-in, invite acceptance
    (dashboard)/                 the six dashboard areas
    api/
      voice/tools/[tool]/        Retell custom-function endpoints
      webhooks/retell|twilio|stripe/
      cron/retention/
  components/{ui,dashboard,knowledge,calls}/
  lib/
    providers/{voice,sms,telephony,booking}/
    agent/                       prompt builder, tool schemas, sanitisation
    db/                          typed queries, transactions
    security/                    signatures, rate limit, redaction, rbac
    validation/                  zod schemas shared client+server
supabase/migrations/             plain SQL
supabase/seed/                   demo restaurant
tests/{unit,integration,e2e,call-scenarios,fixtures}/
docs/                           API_AND_WEBHOOKS.md, DEPLOYMENT.md, RUNBOOK.md
```

## 10. Deliberate trade-offs

- **Vendor lock-in accepted, isolated.** Retell is the fastest route to a working voice agent; the `VoiceProvider` interface is the insurance policy.
- **No ORM.** Typed SQL + generated Supabase types. Less magic, migrations you can read.
- **Netlify Node functions, not Edge.** Raw-body signature verification and the service-role key need a Node runtime.
- **Internal booking engine first.** Ships the pilot without waiting on a third-party account, and doubles as the fallback when an external provider is down.
- **Approval workflow from day one.** It is friction, and it is the only thing that makes the allergen guarantee real.
