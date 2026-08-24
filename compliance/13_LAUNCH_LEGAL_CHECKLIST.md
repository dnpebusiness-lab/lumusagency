# Launch legal and safety checklist

## Gate A — internal developer call only

- [ ] Supabase project in EU region; migrations and hosted RLS tests green.
- [ ] Only synthetic restaurant data and team-owned test numbers.
- [ ] Audio recording disabled in Astra, Retell/Twilio and all provider settings.
- [ ] AI/transcription disclosure enabled and tested EN/IT.
- [ ] Retell use limited to internal evaluation; no paying restaurant onboarded.
- [ ] Provider keys are server-side and never pasted into chat/repository.
- [ ] Call can be deleted immediately after the test.

## Gate B — controlled external pilot with real callers

All items below require written evidence:

- [ ] Astra legal entity and contracting details established.
- [ ] Restaurant-controller and Astra-processor roles confirmed.
- [ ] Final DPIA signed by controller with DPO/solicitor advice.
- [ ] Article 6 lawful bases documented.
- [ ] Article 9 condition for allergy/health data documented.
- [ ] DPA Article 28 signed with restaurant.
- [ ] Service agreement allocates data accuracy and allergen responsibilities.
- [ ] Caller privacy notice published and linked from restaurant channels.
- [ ] AI/transcription script approved and deployed.
- [ ] Subprocessor DPAs/SCCs/TIAs complete; provider training/retention settings evidenced.
- [ ] Retell written commercial permission/partner agreement received, or Retell replaced.
- [ ] Retention periods approved; deletion job and provider deletion tested.
- [ ] Rights-request and breach contacts named and rehearsed.
- [ ] Written FSAI-compliant allergen information remains available; AI does not replace it.
- [ ] Restaurant has working, staffed escalation/callback process.
- [ ] Independent security review/penetration test completed; critical/high issues closed.
- [ ] Cyber/professional indemnity and relevant liability cover confirmed.
- [ ] Voice QA release thresholds met.

## Gate C — paying customer

- [ ] Pricing, telecom overages, VAT/tax, SLA and support terms agreed.
- [ ] Production environment separate from demo; demo accounts/passwords absent.
- [ ] Backups/restoration, monitoring, incident on-call and secret rotation tested.
- [ ] Number ownership/portability and exit process agreed.
- [ ] Final production-readiness review maps evidence to AC-01…AC-20.

No checkbox may be marked complete by assertion alone. Link evidence, date and owner.

