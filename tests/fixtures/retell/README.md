# Retell webhook fixtures

Realistic Retell lifecycle payloads for the Milestone 4A vertical slice.

**Vendor shape source:** `retell-sdk@5.64.0`, inspected 24 August 2026
(`node_modules/retell-sdk/resources/call.d.ts`). Every field used here is defined
by the SDK. Nothing is invented; anything the SDK does not define is absent.

**Signatures are not stored in these files.** They are generated at replay and
test time with the SDK's own `sign()`, because the Retell signature covers
`body + timestamp` and a checked-in signature would be permanently expired by its
own ±5 minute replay window. Signing at use time is also the only way the tests
can exercise the *stale timestamp* rejection path deliberately.

| File | What it is for |
|---|---|
| `call-started-en.json` | Lifecycle open. No transcript yet. |
| `call-ended-en.json` | English information call with the AI disclosure as the first agent turn. |
| `call-analyzed-en.json` | The same call with the vendor's summary and sentiment. |
| `call-analyzed-it.json` | Italian call, used to prove language handling end to end. |
| `call-analyzed-with-recording.json` | Carries `recording_url` and `scrubbed_recording_url`, which must be discarded and never persisted (TPR-1.2). |

`agent_id` is `agent_demo_vindaro`, which the seed writes onto the demo
location's agent configuration so the webhook can route the call.
