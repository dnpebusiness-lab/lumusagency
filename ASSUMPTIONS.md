# ASSUMPTIONS.md — Astra Voice

> **Sintesi in italiano**
> Questo file elenca tutte le decisioni che ho preso al posto tuo per non bloccare il lavoro.
> Ogni riga è una **scelta reversibile**: se una non ti piace, dimmelo e la cambio.
> Le decisioni marcate 🔴 vanno confermate prima di andare in produzione con clienti reali.

Last updated: 2026-08-23 · Milestone 0

---

## 0. Repository state at Milestone 0 (inspection result)

The repository `dnpebusiness-lab/lumusagency` was inspected before any file was written.

| Path | Status | Action taken |
|---|---|---|
| `DSCF1867.jpg` (10.7 MB) | Pre-existing user file, unrelated to this project | **Preserved, untouched.** Not deleted, not moved. |
| `.claude/skills/ui-ux-pro-max/` | Pre-existing Claude Code skill installed by the user | **Preserved, untouched.** |
| `.git/` | 2 commits: `5887a60` (skill install), `d201f61` (image upload) | Left intact. Work continues on branch `claude/astra-os-project-27x14j`. |
| Everything else | Empty | Greenfield — no risk of overwriting user work. |

There is **no pre-existing application code**, no `package.json`, no CI config, no database.
This is a clean start, which removes the main risk of Milestone 0 (destroying user work).

Toolchain available in this environment: Node v22.22.2, npm 10.9.7, git 2.43.0, Python 3.11.15.

---

## 1. Documentation language

- **A-01** All repository documentation (`PRD.md`, `ARCHITECTURE.md`, etc.) is written **in English**, because it must be readable by any engineer, contractor or investor you bring in later, and because all the underlying tools (Supabase, Retell, Twilio, Stripe) document themselves in English.
- **A-02** Every document opens with a **"Sintesi in italiano"** box so you can understand the substance without reading the technical body.
- **A-03** Our conversation stays 100% in Italian.
- 🔵 Reversible: if you prefer full Italian docs, say so and I translate them.

## 2. Product & brand

- **A-10** Working name: **Astra Voice**. It is a placeholder. A trademark search (EUIPO + Irish CRO) has **not** been done. 🔴 Required before any commercial launch or printed material.
- **A-11** We build an **independent** product. No Slang AI code, copy, design, prompt, asset or protected content is reproduced. Only the *product category* (AI phone receptionist for restaurants) is shared, and product categories are not protectable.
- **A-12** Target market V1: **Ireland** (Dublin first), operating under EU/Irish law. Secondary: Italy. This drives GDPR, `Europe/Dublin` timezone, EUR currency, and `+353` phone formatting defaults.

## 3. Pilot restaurant (seed data)

- **A-20** The fictional pilot restaurant used in seed data is **"Trattoria Marea"**, a fictional Italian restaurant in Dublin 2. It is clearly labelled as demo data (`is_demo = true` on the organisation row) so it can never be confused with a real client.
- **A-21** All demo phone numbers use reserved test ranges. All demo emails use `@example.com`. No real person's data is ever committed to the repository.
- **A-22** Business hours in the seed data reflect a realistic Dublin restaurant (closed Mondays, split lunch/dinner service).

## 4. Voice & telephony architecture

- **A-30** **Retell AI** owns the real-time voice loop (speech-to-text, LLM turn-taking, text-to-speech, barge-in/interruption). We do **not** build our own audio pipeline in V1 — that would be months of work for a worse result.
- **A-31** Our application is the **source of truth and the tool layer**. Retell calls *our* HTTPS endpoints ("custom functions") to check availability, create a reservation, send an SMS, or trigger a transfer. Retell never invents data.
- **A-32** The phone number is a **Twilio** number connected to Retell (Retell supports importing a Twilio number via Elastic SIP Trunking). Rationale: owning the number in Twilio means we can change voice vendor later without the restaurant changing its printed phone number. 🔵 If Retell-native numbers turn out to be simpler in Milestone 4, I will document the change.
- **A-33** SMS is sent via **Twilio Programmable Messaging** from a separate messaging-capable number or alphanumeric sender ID.
- **A-34** Language detection: the agent starts in the location's `default_language`, greets bilingually if the location enables it, and switches language when the caller's speech is detected in the other supported language. V1 supports exactly **English (en-IE/en-GB) and Italian (it-IT)**. Not "auto-detect any language".
- **A-35** Voice cloning is out of scope. We use Retell's stock voices, selected per location from an allow-list we curate.

## 5. Reservations

- **A-40** V1 ships **two** booking providers behind one interface:
  1. `internal` — an availability engine in our own database (opening hours + capacity per time slot + party-size rules). This is the **default**, because most small restaurants have no booking system at all, and it lets the pilot run without a third-party account.
  2. `calcom` — a Cal.com adapter, as the first true external integration.
  A `google-calendar` adapter is designed for but **not implemented** in V1.
- **A-41** A reservation is only ever confirmed to the caller **after** the provider returns success. A failed provider call produces a *request* record with status `failed`/`pending_staff` and the agent says the truth ("I couldn't complete that, let me pass you to a colleague").
- **A-42** Large groups (default: **more than 8 guests**) are never auto-booked. They are escalated to staff. Threshold is configurable per location.

## 6. Access, roles and tenancy

- **A-50** Authentication: **Supabase Auth**, email + magic link (no passwords to leak). Optional password login can be added later.
- **A-51** Roles per organisation: `owner`, `manager`, `staff`, plus a platform-level `support` role used only by us with explicit, audited access.
  - `owner`: everything including billing and deleting the organisation
  - `manager`: knowledge base, agent settings, approvals, staff invitations
  - `staff`: read calls and reservations, no settings, no approvals
- **A-52** Multi-tenancy from day one: every business table carries `organisation_id`, and PostgreSQL **Row Level Security** enforces it. One restaurant is the pilot, but the schema never needs to be rewritten to add the second.
- **A-53** Only a `manager` or `owner` may **approve** menu/allergen/knowledge records. Approval is the gate that lets data reach a live phone call.

## 7. Data protection (GDPR posture)

- **A-60** Default retention: **transcripts 90 days**, **call metadata 24 months**, **audio recordings disabled by default**. Configurable per location, with a hard maximum enforced server-side.
- **A-61** Call **recording** is off unless the location explicitly enables it *and* configures a consent announcement. Transcripts (text) are treated as personal data too.
- **A-62** Caller phone numbers are stored, but shown masked in the UI to `staff` role and unmasked to `manager`/`owner`, with the unmasking written to `audit_logs`.
- **A-63** Application logs are **redacted**: no full phone numbers, no transcript bodies, no tokens.
- **A-64** 🔴 **Nothing in this repository makes the product legally compliant.** A DPIA, a Data Processing Agreement with each restaurant, a privacy notice, a call-recording consent script reviewed by an Irish solicitor, and vendor transfer assessments (Retell/Twilio/OpenAI are US-based) are all **required before a real customer call**. Tracked in `SECURITY_AND_PRIVACY.md`.

## 8. Allergens (safety-critical)

- **A-70** The agent may **only** state allergen facts that come from approved structured rows (`menu_item_allergens` with `approval_status = 'approved'`). It may never reason from a dish name or description.
- **A-71** The agent never says a dish is "safe" for a severe allergy. It states what the restaurant declared, distinguishes *contains* from *may contain (cross-contamination)*, and for any severe/anaphylactic mention it **transfers to a human** and logs an allergen escalation.
- **A-72** Every change to allergen data is versioned in `audit_logs` with before/after values and the user who made it.

## 9. Billing

- **A-80** Stripe in **test mode only** in V1. Subscription tables and webhooks exist so billing can be switched on without a migration, but no live key is ever committed or configured in V1.

## 10. Technical defaults

- **A-90** Next.js 16 (App Router) + React 19 + TypeScript in **strict** mode (with `noUncheckedIndexedAccess`). Tailwind CSS v4 + shadcn/ui-style components on Radix. Next 16 rather than 15: during Milestone 1 the Next 15 tree pulled in `postcss` and `sharp` security advisories; on Next 16 `npm audit` reports 0 vulnerabilities.
- **A-91** Deployment target **Netlify** (`@netlify/plugin-nextjs`). Webhook endpoints run as Node serverless functions (not Edge) because they need raw-body signature verification and the Supabase service role key.
- **A-92** Database migrations are plain SQL files under `supabase/migrations/`, applied with the Supabase CLI. No ORM migration magic — SQL is auditable and portable.
- **A-93** Testing: **Vitest** for unit/integration, **Playwright** for the dashboard end-to-end, plus a scripted **call evaluation pack** (`tests/call-scenarios/`) with at least 20 scenarios.
- **A-94** Package manager: **npm** (already present in the environment, no extra install step for you).

## 11. What I am explicitly NOT building in V1

Phone ordering, phone payments, outbound marketing calls, loyalty, delivery, full POS integration, native mobile apps, custom voice cloning, enterprise analytics. Confirmed out of scope by your brief.

---

## Open questions (none of these block Milestone 1)

| # | Question | Needed by | My default if you don't answer |
|---|---|---|---|
| Q1 | Is the pilot restaurant real, and where is it? | Milestone 2 (seed) | Fictional Dublin restaurant, demo-flagged |
| Q2 | Does the pilot already use a booking system (OpenTable, Resy, TheFork, Cal.com, none)? | Milestone 5 | `internal` provider |
| Q3 | Do you already own a Twilio number, or should the pilot get a new one? | Milestone 4 | New Twilio Irish local number |
| Q4 | Should calls be **recorded** (audio), or transcript-only? | Milestone 4 | Transcript only, recording off |
| Q5 | Which staff phone number receives transfers, and during which hours? | Milestone 5 | Single configurable number, business hours only |
| Q6 | Preferred domain for the dashboard? | Milestone 8 | Netlify subdomain |
