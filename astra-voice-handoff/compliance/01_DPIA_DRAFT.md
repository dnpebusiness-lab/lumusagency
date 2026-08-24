# Data Protection Impact Assessment — Astra Voice

Version: draft 0.1  
Date: 24 August 2026  
Jurisdiction: Ireland / European Union  
Owner: `[restaurant legal name]`, assisted by `[Astra legal entity]`  
Status: **not approved — solicitor/DPO review required before live external calls**

## 1. Executive decision

A DPIA is required before the live pilot. Astra Voice introduces new voice technology, systematic processing of callers, transcripts that may include health information, and international transfers. The Irish Data Protection Commission says a DPIA is mandatory for new high-risk processing and must be performed before processing begins.

This document is a working draft. The restaurant, as expected controller for guest-call processing, remains accountable for the final DPIA. Astra, as expected processor for those activities, will provide technical information and assistance. Roles must be confirmed case by case.

## 2. Processing described

An inbound caller contacts a restaurant. Twilio carries the call. A voice provider conducts a two-way AI conversation. Astra's server supplies only manager-approved restaurant information and receives lifecycle/tool events. Supabase stores call metadata, transcript turns, summary, intent, outcome and any reservation details. Authorised restaurant staff access the data through a multi-tenant dashboard.

V1 purposes:

- answer routine restaurant enquiries;
- communicate approved hours, directions, menu and allergen information;
- identify requests that require a person;
- prepare or create a reservation only after explicit confirmation and a successful provider response;
- maintain an operational record and diagnose failures;
- protect callers and restaurants through audit and escalation.

Prohibited secondary purposes for the pilot:

- advertising or caller profiling;
- outbound marketing;
- emotion recognition or biometric categorisation;
- voice cloning or speaker identification;
- training Astra models on caller content;
- sale of caller data;
- automated decisions with legal or similarly significant effect.

## 3. People and data

Data subjects:

- callers and prospective guests;
- guests named in a reservation;
- restaurant employees receiving transfers or using the dashboard;
- authorised Astra support personnel where strictly necessary.

Data categories:

- phone number and call timestamps;
- spoken words converted into transcript;
- language, intent, outcome and call summary;
- name, booking date/time, party size and contact details;
- operational events, IP address and audit records;
- potentially special-category health information where a caller mentions an allergy, disability or health need.

Audio recording is **disabled by default and for M4A**. Voice media will still pass transiently through telephony/voice providers to enable the conversation. Provider retention and training settings must be documented and configured to the minimum available.

## 4. Roles requiring confirmation

Working allocation:

- Restaurant: controller for guest-call, menu, allergen and reservation processing.
- Astra: processor for the restaurant's instructed guest-call processing.
- Astra: independent controller for its own account administration, security, fraud prevention and billing records.
- Twilio, Supabase, hosting provider and voice provider: subprocessors for guest-call processing where contracted through Astra.

Any use by Astra for product analytics beyond strictly aggregated, non-identifying metrics requires a separate assessment and notice.

## 5. Necessity and proportionality

Necessary:

- call content is needed to answer the caller;
- contact and booking details are needed to create and confirm a reservation;
- a minimal transcript is needed for dashboard visibility, quality investigation and dispute handling during the pilot;
- security and webhook events are needed for integrity and fraud prevention.

Limits:

- no audio storage in the pilot;
- no collection of date of birth, payment data, government identifiers or unrelated sensitive data;
- severe-allergy discussions transfer to a person and are not expanded by the AI;
- transcript retention defaults to 30 days for the pilot, subject to legal approval;
- staff receive role-based access; caller numbers are masked for staff roles;
- unapproved knowledge never reaches the caller;
- restaurant users must explicitly approve menu/allergen content after every change.

Alternatives considered:

- ordinary voicemail: less data, but does not resolve enquiries or bookings;
- human-only calls: lower AI risk, but does not solve missed calls during peaks;
- no transcript: lower privacy risk, but removes dashboard proof and incident investigation;
- full audio recording: rejected for the pilot because it is not proportionate to proving the vertical slice.

## 6. Lawful-basis decisions — legal owner must complete

| Processing | Candidate basis | Decision/evidence required |
|---|---|---|
| Answering enquiries | Art. 6(1)(f) legitimate interests may be considered | Legitimate Interests Assessment by restaurant |
| Steps requested to make a booking | Art. 6(1)(b) may apply | Solicitor confirms scope before contract with guest |
| Transcript for operations/quality | Art. 6(1)(f) may be considered | Necessity, balancing test, notice, opt-out/human route |
| Security/fraud logs | Art. 6(1)(f) and/or legal obligation | Documented assessment |
| Allergy/health information | **Article 9 condition required in addition to Art. 6** | Solicitor selects and documents a valid condition; explicit consent must not be assumed |
| Audio recording | Not enabled | New legal review and affirmative mechanism before enabling |

The greeting must not say “by continuing you consent” unless counsel has deliberately chosen consent and the product can support freely given, specific, informed, unambiguous refusal without detriment.

## 7. Risk register

Scale: likelihood (L) and impact (I) from 1–5; residual risk is provisional.

| ID | Risk to people | L/I before | Controls | Residual | Owner |
|---|---|---:|---|---:|---|
| R1 | Wrong allergen statement causes physical harm | 3/5 | Approved-only structured data; exact dish mapping; severe-allergy transfer; no inference; audit | 2/5 | Restaurant + Astra |
| R2 | False booking confirmation | 3/4 | Confirmation only after `Result.ok`; read-back; fault tests | 1/4 | Astra |
| R3 | Caller does not know it is AI or transcribed | 4/3 | Mandatory first-turn AI/privacy notice; logged version and timestamp | 1/2 | Restaurant + Astra |
| R4 | Health data appears in transcript | 4/4 | Minimal questions; rapid transfer; short retention; restricted access; redact where feasible | 2/4 | Controller |
| R5 | Cross-tenant disclosure | 2/5 | RLS on every tenant table; SQL isolation suite; service-role separation | 1/5 | Astra |
| R6 | Vendor/international transfer not understood | 4/4 | DPA/SCC/TIA per vendor; subprocessor register; EU Supabase region | 2/4 | Both |
| R7 | Transcript/audio used by provider for training | 3/4 | Opt out; minimal provider storage; contractual review; no audio storage | 1/4 | Astra |
| R8 | Unauthorised staff or support access | 3/4 | RBAC; masked numbers; audited support access; least privilege | 1/3 | Both |
| R9 | Webhook forgery/replay | 3/4 | Raw-body signature verification; five-minute window; idempotency | 1/3 | Astra |
| R10 | Excessive retention | 4/3 | Default 30 days; bounded setting; deletion job with proof | 1/2 | Both |
| R11 | Caller cannot exercise rights | 3/3 | Published channel; verified export/delete workflow; controller/processor SLA | 1/2 | Restaurant |
| R12 | Retell commercial terms invalidate service model | 3/4 | Written partner/reseller permission or replace provider | 1/4 after approval | Astra |
| R13 | Recognition failure for Irish accent/noise | 4/3 | 40-case QA pack; transfer/fallback; threshold gates | 2/2 | Astra |
| R14 | Secrets exposed in client/logs | 2/5 | Server-only secrets; bundle scan; structured redacted logs; rotation | 1/4 | Astra |

## 8. Data-subject consultation

Before the pilot, document one of:

- feedback from pilot restaurant staff and at least five representative callers using synthetic scenarios; or
- a reasoned explanation from the controller why consultation was not appropriate.

Record whether callers understood the AI disclosure, transcription notice and human-transfer option.

## 9. Sign-off

The pilot cannot use real external callers until the following are complete:

- lawful bases selected and recorded;
- Article 9 condition approved;
- privacy notice and scripts approved;
- DPA and subprocessors approved;
- transfer assessment completed;
- retention approved and deletion tested;
- residual high risks accepted by the controller or escalated to the DPC where required.

| Role | Name | Decision | Date |
|---|---|---|---|
| Restaurant controller | `[name]` | `[approve/reject]` | `[date]` |
| DPO/privacy adviser | `[name]` | `[advice]` | `[date]` |
| Astra security owner | `[name]` | `[approve/reject]` | `[date]` |
| Solicitor | `[name]` | `[reviewed]` | `[date]` |

## Official sources

- Irish DPC DPIA guidance: https://www.dataprotection.ie/en/organisations/know-your-obligations/data-protection-impact-assessments
- Irish DPC controller/processor guidance: https://www.dataprotection.ie/en/organisations/know-your-obligations/controller-and-processor-relationships
- EU AI Act Article 50 FAQ: https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act

