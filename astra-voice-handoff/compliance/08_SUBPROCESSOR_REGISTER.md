# Subprocessor register — approval draft

No vendor is approved for production merely because it appears here. Complete contracts, locations and transfer assessments before activation.

| Provider | Service/data | Expected location | Contract/transfer evidence | Status/action |
|---|---|---|---|---|
| Supabase | Auth, Postgres, storage; caller and restaurant data | Configure `eu-west-1` Ireland | DPA; confirm support/subprocessor transfers | Candidate; cloud project validation pending |
| Twilio | PSTN, numbers, SMS, live audio and metadata | Global; route-dependent | DPA; SCCs/TIA; data-residency and retention settings | Candidate; Irish number/account pending |
| Retell AI | Voice orchestration, live audio/transcript fragments, call analysis | Retell states services not currently operated in EU | DPA + SCCs + TIA; retention/PII controls; commercial permission | **Blocked for paying customers** |
| Netlify | Next.js hosting/functions, operational request data | Confirm selected service configuration | DPA; SCCs/TIA; log settings | Candidate; project pending |
| Booking provider | Contact and reservation data | Provider-dependent | DPA/role review/TIA | Internal engine first; external provider disabled |
| Stripe | Astra customer billing; normally no caller transcript/audio | Provider-dependent | DPA and controller notice | Later milestone only |
| Email provider | Staff auth/invite/reset emails | Provider-dependent | DPA/TIA | Supabase default or selected provider; confirm |
| Monitoring/error provider | Redacted technical telemetry only | Provider-dependent | DPA/TIA and body-scrubbing proof | Not selected; do not add silently |
| OpenAI | Only if selected directly or indirectly for LLM/Realtime processing | Configuration-dependent | DPA, data controls, TIA | Not approved by this register |

## Retell hard gate

As of 24 August 2026, standard Retell terms state that customers may not use the service to build a substitute or intermediary layer and restrict resale of generated voice outputs. Astra must receive written permission or a partner/reseller agreement covering its multi-tenant restaurant SaaS before any paying-customer deployment.

Terms: https://www.retellai.com/legal/terms-of-service

## Change procedure

1. Security and privacy review.
2. DPA/SCC/TIA and retention/training review.
3. At least the contractual notice period to restaurant controllers.
4. Record objections and alternative/termination path.
5. Update public list and this register.
6. Audit configuration after activation.

