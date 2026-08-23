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

20 core entities plus 4 operational ones. Every business table carries `organisation_id`.

**Tenancy & identity**
`organisations` · `locations` · `users` (mirrors `auth.users`) · `organisation_members` (role) · `subscriptions`

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

**Reference:** `allergens` (the 14 EU-regulated allergens, seeded).

Full DDL lands in Milestone 2 under `supabase/migrations/`.

### RLS model
```sql
-- one helper, used by every policy
create function app.current_org_ids() returns setof uuid
  language sql stable security definer as $$
    select organisation_id from public.organisation_members
    where user_id = auth.uid() and status = 'active' $$;

-- pattern applied to every business table
create policy read_own_org on public.<table> for select
  using (organisation_id in (select app.current_org_ids()));
```
Write policies additionally require role ∈ (`owner`,`manager`); approval columns require an
explicit `approve_*` policy. RLS is **forced** (`alter table ... force row level security`) so
even the table owner cannot bypass it accidentally.

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
