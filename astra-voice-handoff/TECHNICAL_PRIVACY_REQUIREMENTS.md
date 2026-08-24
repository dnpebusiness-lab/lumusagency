# Technical privacy and launch requirements for M4A

These requirements convert the compliance drafts into testable software behaviour. Claude Code must inspect the current schema and reuse existing fields/constraints before adding any migration.

## Hard defaults

- Live calls disabled until explicitly configured.
- Stored audio recording disabled globally and per location.
- Retell commercial customer provisioning disabled until written permission is recorded outside the repository.
- Transcript/summary pilot retention default: 30 days, within existing database bounds.
- Only synthetic demo restaurant data in M4A.
- No special-category/health analytics, emotion recognition, voiceprints or model-training pipeline.

## Required configuration

Use existing naming where available. If absent, introduce server-only configuration with fail-closed validation for:

- live-call feature gate;
- provider selection per location;
- recording enabled/disabled;
- transcription notice version EN/IT;
- retention days;
- human-transfer/callback configuration;
- legal-readiness status for a location;
- Retell commercial-authorisation status for non-internal use.

Do not expose a client-side environment variable that can bypass these gates.

## Disclosure evidence

Persist or append a call event recording:

- script/version identifier;
- language;
- disclosure started/completed timestamp;
- interrupted/replayed state;
- recording mode (`disabled` in M4A).

The prompt builder must always place the disclosure before substantive questions. Tests must fail if a configured prompt omits the literal AI identification or moves it after data collection.

## Data minimisation

- Do not store raw webhook bodies after successful processing.
- Structured logs never include transcript text, full phone numbers, SMS bodies or secrets.
- Mask caller numbers for staff roles.
- Do not persist provider recording URLs when audio recording is off.
- Do not request or store payment data, date of birth or government identifiers.
- Treat allergy/health statements as sensitive; tag the escalation without copying unnecessary detail into summaries.

## Allergen safety

- Query only approved, item-specific allergen rows.
- Speak factual “contains [x]” information and approved cross-contamination notes.
- Never infer `free-from`, safety or absence from missing data.
- Serious allergy/cross-contamination/uncertainty triggers escalation.
- Provide/send a link to written restaurant allergen information when configured.
- Add tests for unapproved item, missing declaration, conflicting declaration and prompt injection.

## Webhooks and calls

- Verify raw-body signature before JSON parsing.
- Enforce replay window and idempotency key.
- Store complete call sessions from fixtures and live events.
- Never convert provider/tool failure into a spoken success.
- Correlate by stable vendor/call ID; prevent cross-location reassignment.

## Retention

- Daily deletion route must be authenticated as a scheduled job.
- Delete transcript/summary/audio references according to location settings.
- Create an evidence row containing counts/status, not deleted content.
- Add an integration test that inserts expired and non-expired records and proves only expired data is deleted.

## Dashboard M4A slice

Build only what is needed to prove the product:

- authenticated `/dashboard/calls` list;
- filters for status/language/date;
- detail view with metadata, redacted caller number, transcript, summary and event timeline;
- clear demo/live badge and recording-off indicator;
- empty/loading/error states;
- RLS-scoped server reads and responsive layout at 375/768/1440 px.

## Release-blocking tests

- hosted Supabase migrations and generated types validated;
- RLS cross-tenant suite green remotely or against an equivalent clean database;
- invalid/duplicate webhook tests;
- unapproved data and injection tests;
- AI disclosure EN/IT prompt tests;
- recording-off test proving no URL/audio field is stored;
- retention deletion test;
- one internal live EN call and one IT call visible in dashboard;
- format, lint, typecheck, tests and build all green.

