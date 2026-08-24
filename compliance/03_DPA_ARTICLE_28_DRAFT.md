# Data Processing Agreement — draft heads and clauses

**Not for signature. Irish solicitor review required.**

Between:

- Controller: `[restaurant legal name, company number, address]`
- Processor: `[Astra legal entity, company number, address]`

Effective date: `[date]`

## 1. Scope and precedence

This DPA governs personal data processed by Astra on behalf of the Controller in connection with Astra Voice. If it conflicts with the main services agreement on data protection, this DPA prevails.

## 2. Processing details

- Subject: inbound AI receptionist, restaurant information, call administration and reservations.
- Duration: service term plus approved deletion/return period.
- Nature: receive, transmit, transcribe, structure, store, retrieve, disclose to approved subprocessors, restrict, export and delete.
- Purposes: those documented in the service order and DPIA; no advertising, sale, unrelated profiling or model training by Astra.
- Data subjects: callers, guests, restaurant users and staff contacts.
- Data: phone numbers, voice/transcript content, call metadata, language/intent/outcome, reservation information, account/audit/security records; potentially allergy/health information supplied by callers.

## 3. Documented instructions

Astra will process personal data only on documented instructions, including instructions in the agreement, approved configuration and support tickets from authorised contacts. If law requires other processing, Astra will inform the Controller unless prohibited.

The Controller will not instruct Astra to process data unlawfully. Astra will promptly inform the Controller if an instruction appears to infringe data-protection law.

## 4. Confidentiality and personnel

Astra ensures authorised personnel are bound by confidentiality, receive suitable training and access data only to the extent required for their duties.

## 5. Security

Astra will maintain proportionate measures including:

- tenant isolation through PostgreSQL RLS and database-level tests;
- least-privilege access and server-only service credentials;
- encryption in transit and provider-supported encryption at rest;
- signed, replay-protected and idempotent webhooks;
- logging redaction and audited privileged access;
- approved-only knowledge and allergen controls;
- configurable retention and tested deletion;
- incident response, dependency management, backup and recovery procedures.

Detailed TOMs are attached as Schedule 2 and may be updated without materially reducing protection.

## 6. Subprocessors

The Controller provides general written authorisation for subprocessors listed in the current register. Astra will:

- give at least `[30]` days' notice of a new or replacement subprocessor;
- provide a reasonable objection process;
- impose materially equivalent data-protection obligations;
- remain responsible for subprocessor performance as required by Article 28;
- not activate Retell for paid customer processing without commercial permission and signed DPA/SCCs.

## 7. International transfers

Astra will not transfer EEA personal data to a third country without an applicable Chapter V mechanism. Where SCCs are used, the parties will complete modules, annexes and supplementary measures and document a Transfer Impact Assessment. The Controller authorises only transfers shown in the approved subprocessor register.

## 8. Data-subject requests

Astra will notify the Controller promptly of a request received directly and will not respond except on documented instruction or where legally required. Astra will provide reasonable search, export, correction, restriction and deletion assistance. Target acknowledgement to Controller: `[one business day]`; target technical response: `[five business days]`, subject to scope.

## 9. Personal-data breaches

Astra will notify the Controller without undue delay after becoming aware of a personal-data breach affecting Controller data, aiming for an initial notice within `[24 hours]`. Notice will include known nature, categories/approximate numbers, likely consequences, mitigation, contact and updates. Astra will preserve evidence and cooperate. The Controller remains responsible for regulatory/data-subject notification unless facts require otherwise.

## 10. DPIA and prior consultation

Astra will supply information and reasonable assistance for DPIAs and prior consultation under Articles 35–36, including data flows, security controls, subprocessors and transfer details.

## 11. Return and deletion

At termination and on instruction, Astra will return an export and securely delete personal data, except data legally required to be retained. Backup deletion periods and residual encrypted copies must be stated in Schedule 3. Deletion completion will be evidenced.

## 12. Audit and evidence

Astra will provide information reasonably necessary to demonstrate Article 28 compliance, including current policies, test evidence, subprocessor list and independent reports. Audit frequency, confidentiality, costs, scope and urgent-breach exceptions must be agreed by counsel.

## 13. Controller obligations

The Controller confirms that it:

- has lawful instructions and notices;
- controls the accuracy and approval of menu/allergen information;
- will not enable audio recording without documented legal approval;
- will keep authorised-user and transfer-contact information current;
- will notify Astra of rights requests and incidents promptly;
- will not place payment-card or unnecessary special-category data into knowledge fields.

## Schedule 1 — Processing particulars

Complete from `02_DATA_FLOW_AND_ROLES.md` and the final service order.

## Schedule 2 — Technical and organisational measures

Attach the approved production version of `SECURITY_AND_PRIVACY.md`, penetration-test summary and technical privacy requirements.

## Schedule 3 — Retention and deletion

Attach the approved retention schedule, provider deletion periods and exit plan.

## Schedule 4 — Approved subprocessors

Attach the signed-off subprocessor register, including processing location and transfer mechanism.

Official DPC guidance: https://www.dataprotection.ie/en/organisations/know-your-obligations/controller-and-processor-relationships

