# Data-subject request procedure

Status: draft  
Primary controller contact: `[restaurant privacy channel]`

## Intake

Requests may concern access, correction, deletion, restriction, objection or portability. Record:

- date/time and channel;
- request wording and requested right;
- restaurant/location and approximate call date/time;
- safe contact details;
- identity-verification status;
- deadline, owner and actions.

Never ask for more identity data than necessary. A phone number alone may be insufficient where disclosure would expose another person's reservation or transcript.

## Roles

- Restaurant verifies the requester, decides the response and communicates with the person.
- Astra searches, exports, restricts, corrects or deletes on documented restaurant instruction.
- Astra forwards direct requests to the relevant controller without giving substantive disclosure unless authorised or legally required.

## Technical search

Use exact, audited operator tools. Search only the controller's organisation by:

- normalised E.164 number and stable caller reference;
- date/time window;
- reservation reference;
- verified account identifier where available.

Every unmask/search/export/delete action must produce an audit event without copying sensitive content into logs.

## Response workflow

1. Acknowledge receipt.
2. Identify controller/location and verify identity proportionately.
3. Clarify scope if required without delaying unfairly.
4. Place a restriction/legal hold only where justified.
5. Astra produces structured data and source-system list.
6. Controller reviews third-party data, legal exceptions and redactions.
7. Controller sends response securely and records completion.
8. Astra executes approved deletion/correction across primary systems and opens provider deletion requests where needed.

## Service targets

- Astra acknowledgement to controller: one business day.
- Standard technical search/export: five business days.
- Urgent restriction after verified instruction: one business day.
- Legal deadline: controller/DPO tracks the applicable GDPR period; these internal targets do not replace it.

## Export format

Prefer machine-readable JSON/CSV plus a human-readable summary containing:

- call metadata;
- transcript turns and summary, if still retained;
- booking/SMS records;
- purpose, source, categories, recipients and retention information;
- relevant automated logic description.

Do not export secrets, internal security rules, unrelated caller data or other tenants' data.

