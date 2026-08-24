# Prompt for Claude Code — Astra Voice Milestone 4A

Copy everything below into Claude Code from the root of the **actual Astra Voice repository**. Also place the `astra-voice-handoff/` folder in the repository root or make its files available to Claude.

---

You are continuing the existing Astra Voice repository. Do not start a new application and do not rebuild completed work.

## Read first, in this order

Read these files completely before editing:

1. `PRD.md`
2. `ARCHITECTURE.md`
3. `SECURITY_AND_PRIVACY.md`
4. `IMPLEMENTATION_PLAN.md`
5. `SUPABASE_SETUP.md`
6. every file under `astra-voice-handoff/`
7. `ASSUMPTIONS.md`, `TASKS.md`, `README.md`, `.env.example`, `package.json`
8. existing migrations, provider interfaces, auth/database code and tests relevant to this work

Then inspect `git status`, the current branch and the repository tree. Preserve all user files and unrelated changes. Never print, commit, copy into logs or request that the user paste a secret into chat.

## Current state

Milestone 1 is complete and validated. Milestone 2 is complete locally: 26 tables, RLS/policies, auth, demo restaurants and tests exist. Do not recreate Milestone 2.

The next deliverable is a deliberately narrow **Milestone 4A vertical slice**:

> A team member calls a real test number, Astra identifies itself as AI, handles a safe information request using approved demo data, the signed lifecycle webhook is processed, and exactly one complete call appears in a minimal Calls dashboard.

We are temporarily skipping the full Milestone 3 UI. Build only the Calls UI required to prove the vertical slice. Full reservations, SMS and transfer actions remain Milestone 5; do not fake or prematurely implement them.

## Legal/vendor constraint

Retell's standard Terms reviewed on 24 August 2026 restrict resale and use as a substitute/intermediary layer. Implement the Retell adapter only for an internal, non-paying technical evaluation behind the existing `VoiceProvider` abstraction. Do not implement self-service customer provisioning, billing or a production enablement path for Retell.

Use a fail-closed server-side commercial/live gate. A missing or false gate must prevent non-internal activation. Document that a paying-customer launch requires written Retell partner/reseller permission, DPA/SCCs and transfer assessment. Do not claim legal compliance.

Audio recording must remain disabled in M4A. Do not persist an audio file or recording URL. Live voice media may be processed transiently by the configured providers. Transcription is allowed only with the mandatory notice and the synthetic/internal test restrictions in the handoff package.

## Phase 0 — preflight report

Before editing, report concisely:

- actual branch and dirty files;
- relevant existing schema/tables/columns and provider interfaces;
- whether current code/docs differ from the stated Milestone 2 status;
- exact migration(s), if any, you believe are necessary;
- a small implementation plan and risks.

Do not ask non-blocking questions. Stop only for an account action or secret that cannot be completed locally.

## Phase 1 — hosted Supabase validation

Guide the user through account-side actions without receiving secrets in chat. The user must create a free Supabase test project in `eu-west-1 (Ireland)` and place values only in `.env.local`/Netlify.

Then, where credentials and CLI access are locally available:

1. link the correct test project;
2. apply the existing migrations to a clean hosted project;
3. do not run the demo seed until you have confirmed this is a disposable test project;
4. generate/check Supabase types using the repository's existing script;
5. verify auth profile trigger, email/password flow and password-reset flow as far as the hosted project permits;
6. execute hosted/clean-database RLS and integrity checks;
7. run the SQL checks from `SUPABASE_SETUP.md`;
8. evaluate, but do not casually enable, `FORCE ROW LEVEL SECURITY`; record evidence and the reason for the decision.

Never use production or unknown projects. Show the project ref/URL only in redacted form.

## Phase 2 — minimal Calls dashboard

Implement an authenticated, RLS-scoped vertical slice:

- `/dashboard/calls`: call list with status, language, start time, duration, intent/outcome and masked caller number;
- filter by date, language and outcome/status;
- call detail route or panel with transcript turns, summary and call-event timeline;
- clear demo/live badge and “audio recording off” indicator;
- loading, empty and error states;
- keyboard/focus/labels/contrast suitable for WCAG 2.1 AA;
- responsive proof at 375, 768 and 1440 px;
- no browser use of service-role credentials;
- no edits to the remaining dashboard areas beyond safe navigation placeholders if needed.

Server Components/queries must use the authenticated user's Supabase client so RLS is authoritative. Privileged server clients are only for webhook/tool/cron paths.

## Phase 3 — Retell internal-evaluation provider

Use the existing `VoiceProvider` interface. Application/domain code must not import the Retell SDK directly.

Implement only what M4A needs:

- agent synchronisation from approved `agent_configurations`;
- bilingual EN/IT prompt builder;
- mandatory first-turn AI/transcription disclosure with version/language/completion evidence;
- barge-in and short spoken responses;
- custom tools: `get_business_info`, `search_menu`, `get_allergen_info`;
- approved-data-only database functions/views already designed in M2;
- call start/update/end/analysis webhooks;
- complete persistence to existing call session, event, transcript and summary tables;
- prompt-injection sanitisation/data boundaries;
- fixture replay script and realistic signed fixtures.

If the current Retell webhook/API shape differs from documentation or existing assumptions, use the official current Retell documentation and installed SDK types as sources of truth. Record the exact version/date. Do not invent signature formats or event fields.

## Phase 4 — privacy and safety controls

Implement `TECHNICAL_PRIVACY_REQUIREMENTS.md`, reusing current schema before adding columns.

Required behaviour:

- stored audio off and recording URLs discarded/rejected;
- AI disclosure before substantive collection, including replay if interrupted;
- disclosure version, language and completion timestamp in a suitable append-only event/field;
- structured logs redact transcript, full phone number, SMS body and secrets;
- serious allergy, cross-contamination uncertainty and missing approval never receive a safety guarantee;
- only item-specific approved “contains” declarations may be spoken;
- unknown/unapproved questions produce an honest refusal/human fallback;
- transcript/summary pilot retention defaults to 30 days, within existing database constraints;
- retention deletion is testable, but do not broaden scope into all of Milestone 6;
- no emotion recognition, biometrics, voice cloning, caller profiling or model-training feature.

The first-turn scripts are in `compliance/06_AI_AND_RECORDING_DISCLOSURE_SCRIPTS.md`. Keep them configurable, versioned and manager-approved later; for M4A use the no-stored-audio versions only.

## Phase 5 — webhooks and security

For every provider webhook:

1. read raw body;
2. verify the real vendor signature before JSON parsing;
3. reject invalid signature with 401 and no domain writes;
4. reject replay outside the configured window where supported;
5. enforce idempotency through existing `webhook_events` uniqueness;
6. process related writes transactionally;
7. return success for an already processed duplicate without duplicating rows;
8. log only redacted metadata/correlation IDs.

Validate payloads with Zod. Rate-limit tool endpoints by call ID/tool. Never turn a timeout, malformed response or vendor error into a successful spoken result.

## Phase 6 — tests and live proof

Add/extend tests proving at minimum:

- fixture produces one complete call record with transcript, summary, intent and outcome;
- invalid signature writes nothing;
- duplicate delivery processes exactly once;
- organisation A cannot read organisation B call data;
- unapproved menu/allergen rows never reach tools;
- prompt injection stored in knowledge does not alter instructions;
- EN and IT prompts disclose AI/transcription before data collection;
- interrupted disclosure is completed/replayed;
- recording-off mode stores no audio or recording URL;
- severe-allergy and absence-inference cases do not produce a safety guarantee;
- Calls dashboard renders correct RLS-scoped data and responsive/accessibility tests pass for the slice;
- expired transcript/summary test data is deleted while current data remains.

Use `voice_qa/VOICE_TEST_CASES.csv` as the behavioural test registry. Automate fixtures where practical and leave live/accent cases clearly marked manual, never falsely passed.

After fixtures are green, pause only for the user to configure these values locally, never in chat:

- Supabase values already documented;
- Retell API key, webhook secret and test agent/phone configuration;
- Twilio credentials/test Irish number or approved SIP route;
- public HTTPS webhook base URL.

Then perform one internal English and one internal Italian live test call. Each must result in exactly one correct call record visible in the dashboard. Delete or minimise test data after recording evidence. If live credentials are unavailable, stop with exact account-side steps and leave all automated evidence green; do not invent a live pass.

## Scope exclusions

Do not implement now:

- full Milestone 3 knowledge/settings/reservations dashboard;
- reservation creation, SMS confirmation or real transfer logic from Milestone 5;
- Stripe/billing/onboarding;
- audio recording;
- paying customer activation;
- marketing site redesign;
- a replacement architecture or ORM.

If a caller asks to book during M4A, the agent must honestly state that it cannot complete the booking in this test configuration and offer the configured human/direct-contact fallback. It must never say a booking was created.

## Quality gates

Run and report exact output for the repository's scripts, including at least:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

Also run the appropriate database, integration and Playwright/axe commands defined by the repository. Run `npm audit --production` and scan the built client bundle for secret names/patterns. Do not hide failures.

## Final handoff

Finish with:

1. changed-file list and purpose;
2. migrations applied and hosted project validation evidence;
3. tests/commands with exact pass/fail counts;
4. automated vs manual voice scenarios and honest results;
5. live-call proof or exact blocker;
6. remaining legal/vendor hard gates;
7. secrets/account actions required from the founder;
8. rollback steps;
9. recommended next milestone: full M3 or M5, based on evidence.

Do not declare M4A complete unless the inbound call and dashboard loop has been demonstrated live. If only fixtures pass, label it “implementation complete; live proof pending”.

---

