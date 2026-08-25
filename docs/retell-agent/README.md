# Retell agent configuration — what to paste, and where

> **Sintesi in italiano**
> Questa cartella contiene il testo esatto da incollare nel pannello Retell per creare
> l'agente vocale. I file sono **generati** dal codice: non modificarli a mano, altrimenti
> l'agente al telefono direbbe cose diverse da quelle che il codice garantisce.

Milestone 4A configures the Retell agent by hand, in the vendor dashboard. That is a
deliberate limit, not an oversight: automatic provisioning is a Milestone 5 concern, and
`RETELL_VENDOR_CONSTRAINTS.md` forbids building a self-service path to this vendor before
the commercial gates are cleared.

Everything here is generated from the same modules the application uses, so what a caller
hears cannot silently diverge from what the code promises.

| File | Where it goes in Retell |
|---|---|
| `system_prompt.txt` | Agent → **Prompt** (the system/global prompt) |
| `first_message.txt` | Agent → **Begin message** |
| `tools.json` | Agent → **Functions** — one custom function per entry |

## Regenerating

```bash
ASTRA_WRITE_AGENT_ARTIFACTS=1 npx vitest run tests/unit/retell-agent-artifacts.test.ts
```

Without that variable the same test *checks* the files instead of writing them, and fails
if the prompt builder, the disclosure wording or the tool allow-list has moved on. A stale
file here would be worse than no file: it would look authoritative while describing an
agent that no longer exists.

## Placeholders you must replace

`tools.json` contains two placeholders, because neither belongs in a repository:

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
