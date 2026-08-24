# TECHNICAL_PRIVACY_REQUIREMENTS.md

> **⚠️ Reconstructed artifact.**
> The Milestone 4A brief referenced a handoff package (`astra-voice-handoff/`) that is **not present in
> this repository**. This file was authored on 24 August 2026 from the requirements enumerated in the
> Milestone 4A instructions, so that the work had a written specification to implement against.
> If the original arrives, diff it against this file rather than assuming they agree.

> **Sintesi in italiano**
> Le regole tecniche di privacy che il codice deve rispettare nella tappa 4A, e i test che lo dimostrano.
> In breve: **nessun audio salvato**, avviso "sta parlando con un'AI" **prima** di raccogliere qualsiasi
> dato, log senza dati personali, e **mai** una garanzia di sicurezza su un allergene.
> Avere queste funzioni **non** rende il prodotto conforme al GDPR — vedi `SECURITY_AND_PRIVACY.md` §10.

Scope: Milestone 4A only. Milestone 6 (full retention tooling, data-subject portal, analytics) is
explicitly out of scope; only the narrow slice below is required now.

---

## TPR-1 · No stored audio

| # | Requirement | Enforcement | Test |
|---|---|---|---|
| TPR-1.1 | No audio file is written to storage in M4A. | No storage write path exists for audio. | `recording.test.ts` |
| TPR-1.2 | A `recording_url` (or `scrubbed_recording_url`) arriving in a vendor payload is **discarded**, never persisted. | Webhook mapper strips the field; the database additionally rejects it. | `recording.test.ts`, `tests/database/recording.test.ts` |
| TPR-1.3 | The rejection is fail-closed at the database, not only in application code. | `app.guard_recording_disabled()` trigger on `call_sessions`. | `tests/database/recording.test.ts` |
| TPR-1.4 | Live voice media may be processed transiently by the configured vendors. This is disclosed, not stored. | Disclosure script TPR-2. | — |

Rationale: an audio recording is personal data with a materially higher risk profile than a text
transcript, and Milestone 4A does not need it for any product purpose. The cheapest way to be safe
with a recording is not to have one.

## TPR-2 · AI and transcription disclosure

| # | Requirement | Enforcement | Test |
|---|---|---|---|
| TPR-2.1 | The agent states it is an automated/AI system **before** collecting any substantive information. | First turn of the built prompt; the disclosure is the opening sentence and the prompt forbids collecting data before it. | `disclosure.test.ts` |
| TPR-2.2 | The same first turn discloses that the call is transcribed and that audio is not recorded. | Disclosure script, no-stored-audio variant. | `disclosure.test.ts` |
| TPR-2.3 | Disclosure exists in every supported language and is delivered in the language the call opens in. | `compliance/06_AI_AND_RECORDING_DISCLOSURE_SCRIPTS.md`, EN + IT. | `disclosure.test.ts` |
| TPR-2.4 | If the caller interrupts the disclosure, it is **completed or replayed** before any data collection. | Prompt rule plus `disclosureNeedsReplay()`; replay is recorded as a separate event. | `disclosure.test.ts` |
| TPR-2.5 | Disclosure **version**, **language** and **completion timestamp** are recorded in an append-only event, and denormalised onto the call for display. | `call_events` (`ai_disclosure_started` / `ai_disclosure_completed`) + `call_sessions.disclosure_*`. | `tests/database/disclosure.test.ts` |
| TPR-2.6 | Scripts are versioned and configurable, and are intended to pass through the existing manager approval workflow after M4A. | `DISCLOSURE_SCRIPTS` registry keyed by version. | `disclosure.test.ts` |

## TPR-3 · Log redaction

| # | Requirement | Enforcement | Test |
|---|---|---|---|
| TPR-3.1 | Transcript content never appears in a log line. | `redactForLog()` drops known content keys. | `redaction.test.ts` |
| TPR-3.2 | A full phone number never appears in a log line; only `+353****4567` form. | `redactForLog()` + `maskPhoneNumber()`. | `redaction.test.ts` |
| TPR-3.3 | SMS bodies never appear in a log line. (No SMS is sent in M4A; the rule is enforced now so M5 inherits it.) | `redactForLog()`. | `redaction.test.ts` |
| TPR-3.4 | Secrets (API keys, service-role key, signatures, bearer tokens) never appear in a log line, including nested in an object. | `redactForLog()` recursive key match. | `redaction.test.ts` |
| TPR-3.5 | Errors returned to a client carry a correlation id and no internal detail. | `toPublicError()`. | `redaction.test.ts` |

## TPR-4 · Allergen and safety answers

| # | Requirement | Enforcement | Test |
|---|---|---|---|
| TPR-4.1 | A serious/severe allergy never receives a safety guarantee, in any language. | `assessAllergenQuestion()` returns `escalate` with no dish claim. | `safety.test.ts` |
| TPR-4.2 | Cross-contamination uncertainty never receives a safety guarantee. | Same; `may_contain` is reported as risk, never as absence. | `safety.test.ts` |
| TPR-4.3 | A missing approval never receives a safety guarantee — an undeclared allergen is "not confirmed", never "does not contain". | `agent.get_allergen_info` `undeclared` array + `safety.test.ts`. | `safety.test.ts` |
| TPR-4.4 | Only item-specific approved `contains` declarations may be spoken as fact. | `buildAllergenAnswer()` speaks `contains` only. | `safety.test.ts` |
| TPR-4.5 | An unknown or unapproved question produces an honest refusal and a human fallback. | Prompt rule + `outside_approved_information` escalation. | `safety.test.ts` |
| TPR-4.6 | A dietary attribute (vegan, dairy-free) is never used to answer an allergen question. | `dietary_attributes.is_safety_claim = false` and the tool never joins them into an allergen answer. | `tests/database/agent-surface.test.ts` |

## TPR-5 · Retention

| # | Requirement | Enforcement | Test |
|---|---|---|---|
| TPR-5.1 | Pilot default retention for transcripts and summaries is **30 days**. | Column default changed in migration 0011, within the existing 1–365 constraint. | `tests/database/retention.test.ts` |
| TPR-5.2 | `call_sessions.retention_expires_at` is set from the organisation's policy when the call record is created. | `app.set_call_retention()` trigger. | `tests/database/retention.test.ts` |
| TPR-5.3 | Deletion is a real, testable operation: expired transcripts and summaries are removed while current data survives. | `app.run_transcript_retention()` + `retention_jobs` evidence row. | `tests/database/retention.test.ts` |
| TPR-5.4 | Call **metadata** is not deleted by the transcript job; it has a longer, separate policy. | Function only touches transcripts and summaries. | `tests/database/retention.test.ts` |

Scheduling the job, the retention settings UI and data-subject tooling stay in Milestone 6.

## TPR-6 · Prohibited features

None of the following exists in the codebase, and none may be added without a fresh privacy review:

- emotion or sentiment **recognition from voice** (a vendor-provided text sentiment label on a summary is stored, and is not voice biometrics);
- voice biometrics or speaker identification;
- voice cloning;
- caller profiling or cross-call behavioural linkage;
- any use of caller data for model training.

`tests/unit/prohibited-features.test.ts` greps the source tree for the corresponding vendor
configuration keys and fails if one appears.

## TPR-7 · Vendor and commercial gate

| # | Requirement | Enforcement | Test |
|---|---|---|---|
| TPR-7.1 | The Retell adapter may only activate for internal, non-paying technical evaluation. | `assertInternalEvaluation()`, fail-closed. | `gate.test.ts` |
| TPR-7.2 | A missing or false gate prevents non-internal activation. | Default is denied; only an explicit `internal_evaluation` value permits activation. | `gate.test.ts` |
| TPR-7.3 | No self-service customer provisioning, billing or production enablement path for Retell exists. | No such route or action in the codebase. | manual review |
| TPR-7.4 | A paying-customer launch requires written Retell partner/reseller permission, a DPA, SCCs and a transfer assessment. | Documented in `RETELL_VENDOR_CONSTRAINTS.md`. | — |

## What this document does not do

It does not make Astra Voice legally compliant. It is a list of engineering controls. The legal work
— DPIA, lawful basis for Article 9 health data disclosed by callers, controller/processor
agreements, international transfer assessments, AI Act disclosure wording reviewed under Irish law —
is listed in `SECURITY_AND_PRIVACY.md` §10 and none of it is delivered by code.
