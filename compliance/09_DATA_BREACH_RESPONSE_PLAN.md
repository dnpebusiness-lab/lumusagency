# Personal-data breach response plan

Status: operational draft  
Controller incident contact: `[name / 24h channel]`  
Astra incident lead: `[name / 24h channel]`

## First 24 hours

1. Open an incident record; record discovery time and reporter.
2. Contain without destroying evidence: revoke/rotate credentials, isolate endpoint, block affected integration.
3. Preserve relevant redacted logs, webhook IDs, audit events and configuration snapshots.
4. Determine affected organisations, people, data, systems, dates and geography.
5. Notify each affected controller without undue delay; internal target: within 24 hours of Astra awareness.
6. Assign severity and legal/security/communications owners.
7. Do not include transcript bodies or full phone numbers in ordinary incident chat channels.

## Controller regulatory decision

The controller assesses risk to individuals. Where the breach presents risk, it must notify the Irish DPC within 72 hours of awareness. Where likely high risk, it must inform affected people without undue delay. Even where no notification is made, the decision and reasons must be documented.

Official source: https://www.dataprotection.ie/en/organisations/know-your-obligations/breach-notification

## Minimum incident record

- internal ID, discovery/awareness times and reporter;
- affected controllers/locations and provider(s);
- nature and cause, including whether ongoing;
- data categories and approximate people/records;
- likely consequences and risk assessment;
- containment, recovery and prevention measures;
- notification decisions, timing and copies;
- credentials rotated and systems validated;
- evidence owner and post-incident actions.

## Severity examples

| Severity | Example | Response |
|---|---|---|
| Critical | Cross-tenant transcript access; service-role key exposed; active export | immediate containment, executive/legal response |
| High | Caller health/allergy transcripts disclosed; forged bookings at scale | urgent containment and risk assessment |
| Medium | Limited metadata exposed without transcript/number | contain, investigate, document |
| Low | Attempt blocked; no personal data accessed | record security event; no breach claim without evidence |

## Communications template to controller

Subject: `[Initial/Update] Astra Voice personal-data incident — [ID]`

- Awareness time: `[UTC]`
- Affected service/location: `[details]`
- Known data/people: `[details]`
- What happened: `[facts; label assumptions]`
- Containment: `[actions]`
- Likely consequences: `[current assessment]`
- Recommended controller actions: `[actions]`
- Next update: `[time]`
- Incident contact: `[contact]`

## Recovery and closure

- Prove tenant isolation, auth, signature checks and secret scans are green.
- Validate restoration with synthetic data before reopening.
- Identify root cause and assign dated corrective actions.
- Update DPIA, threat model, tests, notices or contracts where needed.
- Obtain controller confirmation before closing.

