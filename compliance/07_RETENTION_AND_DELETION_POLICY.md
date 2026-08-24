# Retention and deletion policy — draft

Owner: `[controller]`  
Technical operator: `[Astra entity]`  
Status: legal approval required

## Principles

- Keep the minimum data for a defined purpose.
- Audio recording is off for M4A.
- Retention is enforced by code and database jobs, not a document alone.
- Provider-side retention must be configured separately and evidenced.
- Legal hold is exceptional, documented and access-restricted.

## Pilot schedule

| Data | Proposed period | Trigger | Deletion/action |
|---|---:|---|---|
| Stored call audio | Disabled | n/a | provider recording disabled; verify no retained recording URL |
| Transcript turns | 30 days | call end | hard-delete or irreversibly anonymise |
| Call summary/intent | 30 days | call end | hard-delete or aggregate without identifiers |
| Caller number in call history | 90 days, pending review | call end | delete/tokenise; retain only non-identifying metrics |
| Reservation details | restaurant-selected, pending review | reservation date/end | delete under restaurant booking policy |
| Webhook payload/body | do not persist unless required | receipt | retain event ID/status only; redact payload |
| Audit/security logs | 12 months, pending review | event | delete; restrict access |
| Support tickets | contract term + 90 days, pending review | closure/termination | delete or redact |
| Backups | `[provider period]` | backup creation | age out automatically; no restoration beyond purpose |

Existing database maxima are safety ceilings, not approved default retention.

## Deletion implementation

The daily retention job must:

1. select records using controller-approved location settings;
2. delete dependent transcript/summary/recording references in a transaction;
3. retain only a non-sensitive `retention_jobs` evidence record;
4. report counts and failures without recording deleted content;
5. retry safely and alert after repeated failure;
6. be covered by a scheduled-job test proving real deletion.

## Provider deletion

For each provider, record:

- configured retention value;
- whether audio/transcripts/logs are stored;
- training/analytics setting;
- deletion API or support process;
- backup-deletion period;
- evidence date and owner.

Retell currently documents per-agent retention and privacy/PII controls, but it does not currently operate services in the EU. Configuration and signed DPA/SCCs do not replace a transfer assessment.

Source: https://docs.retellai.com/general/compliance

## Rights requests and termination

- Verified rights requests override routine schedules where legally required.
- At contract end, provide the agreed export and delete within `[30]` days, subject to backups and legal holds.
- Issue a deletion completion record to the controller.
- Changes to periods require DPIA/notice review and an audit-log entry.

