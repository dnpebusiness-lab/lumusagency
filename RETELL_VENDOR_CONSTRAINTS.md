# RETELL_VENDOR_CONSTRAINTS.md

> **Sintesi in italiano**
> Retell è usato **solo** per una valutazione tecnica interna e non a pagamento.
> Non è un percorso verso il lancio commerciale finché non abbiamo un permesso scritto da Retell.
> Il codice ha un interruttore che, se manca o è falso, **impedisce** l'attivazione.

Recorded 24 August 2026. Not legal advice.

## What was found

Retell's standard Terms, as reviewed on 24 August 2026, restrict resale and use of the service as a
substitute or intermediary layer offered onward to third parties. Astra Voice, sold to restaurants as
a paid product, would be exactly that. This is a **commercial and contractual** constraint, not a
technical one, and it is not solved by writing better code.

## What Milestone 4A therefore is

An **internal, non-paying technical evaluation** of whether the vendor is fit for purpose. Nothing
more. Concretely:

- calls are placed by our own team, to our own test number;
- no restaurant customer is onboarded, billed or given access;
- no self-service provisioning path for Retell exists in the codebase;
- the demo restaurant is fictional and flagged `is_demo`.

## The gate

`src/lib/security/gate.ts` implements a **fail-closed** server-side gate.

- The environment variable `ASTRA_VOICE_ACTIVATION_MODE` must be exactly `internal_evaluation`.
- Missing, empty, misspelled or any other value ⇒ **denied**.
- The gate is checked before agent synchronisation, before a tool endpoint answers, and before a
  webhook is processed into domain data.
- There is no override flag, no "force" parameter and no way to set it from the browser.

`tests/unit/gate.test.ts` asserts the denial path for a missing value, an empty value, a wrong value
and a value that merely looks similar.

## Hard gates before a single paying customer

None of these can be satisfied by this repository. All are required.

1. **Written permission from Retell** — a partner, reseller or OEM agreement that explicitly permits
   offering the service onward as part of a paid product.
2. **Data Processing Agreement** with Retell, and with Twilio, naming them as sub-processors.
3. **Standard Contractual Clauses and a Transfer Impact Assessment** — Retell, Twilio and the
   underlying model providers process personal data outside the EEA.
4. **DPIA** covering voice processing, transcription and the health data callers volunteer.
5. **Controller/processor agreement with each restaurant**, with a published sub-processor list.
6. **AI Act transparency wording** reviewed under Irish law.
7. **Allergen liability allocation** between us and the restaurant, aligned with FSAI rules.

## If permission is refused

The `VoiceProvider` interface is the insurance policy. Replacing Retell means writing one adapter
under `src/lib/providers/voice/` and changing one registry line. No application, database or
dashboard code imports the Retell SDK — `tests/unit/provider-boundary.test.ts` enforces that by
scanning the source tree.

## Claim we are not making

Nothing in this repository establishes legal compliance, and no statement here should be read as
confirming that the evaluation described is permitted. It is our good-faith reading of the position,
written down so it can be checked by somebody qualified.
