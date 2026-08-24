# Record of processing activities — working draft

This register separates Astra's processor activities from its independent-controller activities. Complete contacts, legal bases and transfer mechanisms before launch.

## A. Astra acting as processor for restaurants

| Activity | Controller purpose | Data/people | Recipients | Transfer | Retention | Controls |
|---|---|---|---|---|---|---|
| AI inbound call | answer enquiries and route calls | caller number, voice stream, transcript, intent; callers | Twilio, voice provider, hosting, Supabase | provider-specific SCC/TIA | transcript 30-day pilot proposal | AI notice, minimisation, RBAC, RLS |
| Restaurant knowledge | communicate approved facts | menu, prices, allergens, policies; restaurant staff/callers | Supabase, hosting, voice tool outputs | provider-specific | contract term/version history | approval gate, sanitisation, audit |
| Reservation | respond to requested booking | name, phone, date/time, party size, notes; callers/guests | booking provider, Supabase, optional Twilio SMS | provider-specific | restaurant policy | read-back, confirmation only on success |
| Human escalation | connect caller to staff | numbers, reason, call ID | Twilio/voice provider, staff | provider-specific | minimal event log | mandatory triggers, failure fallback |
| Support/rights | resolve incidents and rights | scoped call/account records | authorised Astra personnel/providers | provider-specific | ticket policy | audited access, verification, redaction |

## B. Astra acting as controller

| Activity | Purpose | Candidate Art. 6 basis | Data/people | Retention | Recipients |
|---|---|---|---|---|---|
| Customer account and contract | provide/administer Astra subscription | contract/legal obligation | restaurant contacts and users | contract + approved period | hosting, email, billing |
| Billing | invoice and payment administration | contract/legal obligation | billing contacts, invoices, transaction refs | statutory period | Stripe/accounting provider |
| Security and fraud | protect platform and investigate abuse | legitimate interests | login/audit/IP/security events | approved security period | hosting/monitoring/security advisers |
| Aggregated service metrics | capacity and product operations | legitimate interests, only if truly minimised | non-identifying aggregate | approved period | internal only |

## Required completion fields

- controller/processor contacts and DPO where applicable;
- definitive Article 6 and Article 9 bases;
- categories of third-country transfers and safeguards;
- approved retention per data type;
- detailed technical/organisational measures;
- review date and owner.

