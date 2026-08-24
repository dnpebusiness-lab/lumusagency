# 06 · AI and recording disclosure scripts

> **⚠️ Reconstructed artifact.** The referenced handoff package is not in this repository. These
> scripts were authored on 24 August 2026 to give Milestone 4A a versioned, testable disclosure.
> They have **not** been reviewed by a lawyer. Wording must be reviewed under Irish law and against
> the EU AI Act transparency obligation before any non-internal call.

> **Sintesi in italiano**
> Le frasi che l'agente dice per prime, prima di qualsiasi altra cosa: *"sta parlando con un assistente
> automatico"*, *"la conversazione viene trascritta"*, *"l'audio non viene registrato"*.
> Per la 4A si usano **solo** le versioni "senza audio registrato".

The canonical machine-readable copy lives in `src/lib/agent/disclosure.ts`. This document is the
human-reviewable source; the two are kept identical by `tests/unit/disclosure.test.ts`, which fails
if they drift.

---

## Rules that apply to every script

1. The disclosure is the **first substantive thing** the agent says, after at most a greeting fragment.
2. **No caller information is collected before it completes** — not a name, not a date, not a party size.
3. If the caller talks over it, the agent **finishes or replays** the material part before continuing.
   Barge-in is not disabled; the disclosure is repeated instead.
4. It is delivered in the language the call opens in, and repeated in the new language if the caller
   switches within the first two turns.
5. Version, language and completion time are recorded as an append-only call event.
6. Scripts are configurable per location and versioned. After Milestone 4A they pass through the same
   manager approval workflow as the rest of the knowledge base.

## Variants

Only the **no-stored-audio** variants are permitted in Milestone 4A. The recorded-call variants are
included for completeness and are **not selectable** while `recording_enabled = false`, which the
database enforces.

---

### v1 · `ai_no_recording` — English (en) — **M4A default**

> "You're through to {location_name}. Just so you know, I'm an automated assistant, this call is
> transcribed, and no audio recording is kept. How can I help?"

**Material part** (must complete before data collection): *"I'm an automated assistant, this call is
transcribed, and no audio recording is kept."*

### v1 · `ai_no_recording` — Italiano (it) — **M4A default**

> "Ha chiamato {location_name}. Le segnalo che sono un assistente automatico, la conversazione viene
> trascritta e non viene conservata alcuna registrazione audio. Come posso aiutarla?"

**Parte essenziale:** *"sono un assistente automatico, la conversazione viene trascritta e non viene
conservata alcuna registrazione audio."*

---

### v1 · `ai_with_recording` — English (en) — **not permitted in M4A**

> "You're through to {location_name}. I'm an automated assistant, and this call is recorded and
> transcribed. If you'd rather not be recorded, say so and I'll pass you to a colleague. How can I help?"

### v1 · `ai_with_recording` — Italiano (it) — **not permitted in M4A**

> "Ha chiamato {location_name}. Sono un assistente automatico e questa chiamata viene registrata e
> trascritta. Se preferisce non essere registrato me lo dica e la passo a un collega. Come posso aiutarla?"

---

### v1 · `replay` fragment — used when the caller interrupts

**English:** "Sorry, just to finish that — I'm an automated assistant and this call is transcribed,
with no audio recording kept."

**Italiano:** "Scusi, completo solo una cosa: sono un assistente automatico e la conversazione viene
trascritta, senza registrazione audio."

---

## Why the wording is what it is

- **"automated assistant"**, not "AI receptionist" or a person's name. A caller must not be able to
  believe they are speaking to a human, which is the substance of the AI Act transparency duty.
- **Transcription is disclosed separately from recording.** People hear "not recorded" and assume
  nothing is kept. A transcript is personal data, so it is named explicitly.
- **Short.** A disclosure the caller talks over is not a disclosure. Roughly one breath.
- **No consent language in the no-recording variant.** Nothing here asks for consent, because M4A
  does not rely on consent for anything; claiming to collect it would be worse than not mentioning it.

## Open items requiring legal review before a non-internal call

1. Whether this wording satisfies the EU AI Act transparency obligation for the Irish market.
2. Whether transcription requires a distinct lawful basis and, if so, which.
3. The wording needed for the recorded-call variants, which are unused in M4A.
4. What must be said when a caller discloses a health condition such as an allergy (GDPR Article 9).
