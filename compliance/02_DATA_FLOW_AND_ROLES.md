# Data flow and GDPR roles

Status: draft for legal and architecture review

## Flow

```text
Caller
  -> PSTN / Twilio number
  -> voice provider (Retell candidate)
  -> Astra voice tool endpoints and signed lifecycle webhooks
  -> Supabase Postgres in EU region
  -> authenticated restaurant dashboard

Astra tool endpoints
  -> approved restaurant knowledge
  -> optional booking provider
  -> optional Twilio SMS
  -> human transfer number
```

## Stage-by-stage inventory

| Stage | Data | Purpose | Recipient | Default storage |
|---|---|---|---|---|
| Telephony | numbers, timestamps, live audio | connect call | Twilio | vendor-controlled; contract review required |
| Voice interaction | live audio, transcript fragments, tool inputs/outputs | conduct conversation | voice provider | minimum available; audio recording off |
| Astra tools | call ID, location ID, approved facts, booking inputs | answer or perform authorised action | Astra server | events only, redacted logs |
| Astra database | metadata, transcript, summary, outcome | operations and dashboard | Supabase | transcript/summary pilot default 30 days |
| Dashboard | above data according to role | restaurant operations | authorised staff | no browser cache of secrets; session-controlled |
| SMS | phone number, approved template and booking detail | confirmation/link | Twilio | vendor policy + Astra status record |
| Booking | contact and reservation data | reserve table | internal/approved provider | according to restaurant policy |

## Working role allocation

### Restaurant as controller

The restaurant determines why guest calls are answered, what information is communicated, the reservation purpose, who among its staff may access calls, and approved retention within Astra's bounds.

Restaurant responsibilities include:

- select and document lawful bases;
- approve caller notice and AI script;
- keep menu, prices, policies and allergen data accurate and written at the point required by food law;
- approve knowledge after every edit;
- handle rights requests and complaints, with Astra assistance;
- provide a working escalation number and trained human staff;
- never represent the service as emergency or medical advice.

### Astra as processor

Astra processes caller information on documented restaurant instructions to provide the service. It must:

- act only on documented instructions;
- protect confidentiality and security;
- manage approved subprocessors;
- assist with data-subject requests, breaches and DPIAs;
- delete or return data at termination;
- make relevant compliance evidence available.

### Astra as independent controller

For limited purposes Astra may be an independent controller: restaurant account management, contracts, billing, platform-security records and abuse prevention. These uses need a separate Astra privacy notice and retention schedule.

## Decisions still required

- Confirm role allocation in the DPA; factual control prevails over contract labels.
- Determine whether Retell is permitted commercially and sign its DPA/SCCs.
- Complete a Transfer Impact Assessment for every non-EEA transfer.
- Confirm whether any provider uses caller data for training and disable it contractually/configurationally.
- Decide the Article 9 condition for allergy/health information.
- Confirm controller-to-caller rights channel and identity-verification method.

