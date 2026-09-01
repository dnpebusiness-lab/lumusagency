# Retell agent configuration

> **Sintesi in italiano**
> Normalmente non serve toccare niente qui: nella dashboard, in **Impostazioni →
> Agente vocale**, il pulsante *Sync* riscrive l'agente dal database. Questi file
> sono la stessa configurazione su carta, per leggerla o per ricostruire l'agente
> a mano se l'applicazione non riesce a raggiungere il fornitore. Sono **generati**
> dal codice: non modificarli a mano.

**The application configures the agent.** Settings → Voice agent → pick a voice, then
*Sync*. The voice list is read live from the vendor, so no identifier is ever copied by
hand; the seed's `demo-voice-placeholder` is treated as "not chosen" and refuses to sync
rather than being sent to the vendor as if it were a voice.

*Sync* sends the
whole configuration — prompt, opening line, voice, language, timezone, webhook and all
three tools — from `agent_configurations` to the vendor, and records the agent id it gets
back. Nothing needs to be typed into the vendor's dashboard.

That is `RetellVoiceProvider.syncAgent()`, and it stays behind the fail-closed activation
gate: it is the internal, non-paying technical evaluation described in
`RETELL_VENDOR_CONSTRAINTS.md`, not self-service provisioning for customers.

The files in this folder are the same configuration written out, generated from the same
builders (`src/lib/providers/voice/retell/definition.ts`) the sync uses — so the paper copy
and the live agent cannot disagree. Use them to review what is sent, or to rebuild the
agent by hand when the application cannot reach the vendor.

| File | What it is |
|---|---|
| `system_prompt.txt` | Agent → **Prompt** (the system/global prompt) |
| `first_message.txt` | Agent → **Begin message** |
| `tools.json` | Agent → **Functions** — one custom function per entry |
| `agent.json` | The whole agent as one import — the same thing *Sync* sends |

## Regenerating

```bash
ASTRA_WRITE_AGENT_ARTIFACTS=1 npx vitest run tests/unit/retell-agent-artifacts.test.ts
```

Without that variable the same test *checks* the files instead of writing them, and fails
if the prompt builder, the disclosure wording or the tool allow-list has moved on. A stale
file here would be worse than no file: it would look authoritative while describing an
agent that no longer exists.

## Why the button exists

Configuring by hand meant roughly twenty fields across four dialogs, and each one was a
chance to put a header name in the wrong box, leave a tool timeout at the vendor's
two-minute default, or leave an agent id in the database pointing at an agent that had
been deleted. Every one of those happened, and each cost a live call: the phone answered
and the caller was told the restaurant's own opening hours could not be confirmed.

Pressing *Sync* overwrites all of it from one row that a manager already edits.

## Placeholders in the published files

The published files carry two placeholders, because neither belongs in a repository. A
sync substitutes them from the environment; only a hand-import needs them replaced:

* `<YOUR_APP_URL>` — the public HTTPS address of the deployment, e.g. its `.netlify.app`
  address. It is not a secret; it is simply per-deployment.
* `<ASTRA_TOOL_SHARED_SECRET>` — the value of that environment variable, configured as the
  `x-astra-tool-secret` header on **every** function. **Never** commit it, paste it into a
  chat, or read it aloud.

## The two settings that are not optional

* **Audio recording OFF.** The database rejects a recording URL while the location has
  recording disabled, so leaving it on produces failed ingests rather than a stored file.
  Switch it off at the vendor as well; do not rely on the database to be the only guard.
* **Webhook URL** → `<YOUR_APP_URL>/api/webhooks/retell`. Without it the call happens but
  nothing is ever recorded, and the dashboard stays empty.

## What is deliberately absent

No booking, SMS or transfer function. Milestone 4A is information-only, and the tool list
is the blast radius of a successful prompt injection: an attacker who fully controls the
model's instructions still cannot write anything, because no tool that writes exists.
