# M4A_LIVE_TEST_RUNBOOK.md — from green fixtures to a real phone call

> **Sintesi in italiano**
> Il codice della Milestone 4A è finito e testato con dati finti.
> Per sentirlo davvero al telefono servono quattro account e cinque valori, che tu inserisci
> **solo** in `.env.local` o in Netlify — **mai in chat, mai su GitHub**.
> Questa guida elenca esattamente cosa fare e in che ordine.

Status at the time of writing: **implementation complete; live proof pending.**
No live call has been made. Nothing in this repository claims otherwise.

---

## Before you start — the one thing that is not technical

Retell's standard Terms, reviewed 24 August 2026, restrict resale and use as a substitute or
intermediary layer. What follows is an **internal, non-paying technical evaluation** by our own
team, on our own number. It is not a soft launch and it must not be shown to a restaurant as a
product they can buy. `RETELL_VENDOR_CONSTRAINTS.md` lists the seven hard gates that must be
cleared before a single paying customer, starting with written permission from Retell.

The code enforces this with a fail-closed switch: `ASTRA_VOICE_ACTIVATION_MODE` must be exactly
`internal_evaluation`, or the agent, the tools and the webhook all refuse to work.

---

## Step 1 · Supabase (~15 minutes, free)

Follow `SUPABASE_SETUP.md`. It is unchanged except that Milestone 4A adds four migrations, so
`supabase db push` now applies fourteen files rather than ten.

Afterwards, confirm the Milestone 4A objects landed:

```sql
-- Should return 5 rows.
select routine_name from information_schema.routines
 where routine_schema = 'public' and routine_name like 'voice\_%';

-- Should return 't'.
select exists (select 1 from information_schema.columns
  where table_name = 'call_sessions' and column_name = 'disclosure_completed_at') as ok;
```

## Step 2 · Retell (~10 minutes)

1. Create an account at **https://retellai.com**.
2. **Set a spending cap immediately.** Retell bills per minute and a misconfigured agent is an
   invoice, not just a bug.
3. Dashboard → **API Keys** → create one. It goes in `RETELL_API_KEY`.
4. Leave `RETELL_WEBHOOK_SECRET` **empty**. Verified against `retell-sdk@5.64.0`: Retell signs
   webhooks with the API key itself, and the code falls back to it.
5. Dashboard → **Webhooks** → point it at `https://<your-deployment>/api/webhooks/retell`.
6. Create the agent from our configuration rather than by hand — the prompt, the disclosure and the
   tool list all come from the database. The agent id Retell gives you goes into
   `agent_configurations.retell_agent_id` for the demo location:

   ```sql
   update public.agent_configurations
      set retell_agent_id = '<the agent id from Retell>'
    where location_id = 'b0000000-0000-4000-8000-000000000001';
   ```

   The webhook uses this to work out which restaurant a call belongs to. Without it, a deployment
   with more than one location returns `no_matching_location` and processes nothing.

7. Configure the three custom functions, each POSTing to
   `https://<your-deployment>/api/voice/tools/<name>` with a custom header
   `x-astra-tool-secret: <ASTRA_TOOL_SHARED_SECRET>`:
   `get_business_info`, `search_menu`, `get_allergen_info`.
8. **Leave call recording OFF.** The database rejects a recording URL while it is off, so turning it
   on produces failed ingests rather than a stored recording — but do not rely on that: switch it
   off at the vendor too.

## Step 3 · Twilio (allow several days)

1. Create an account at **https://twilio.com**.
2. Buy an **Irish local number**. Twilio requires regulatory address documentation for Irish
   numbers and approval is not instant — **start this first**, it is the long pole.
3. Connect the number to Retell (Retell → Phone Numbers → import from Twilio, via Elastic SIP
   Trunking).
4. `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` go in the environment. Milestone 4A does not send
   SMS, so `TWILIO_MESSAGING_FROM` can stay empty.

## Step 4 · A public HTTPS URL

Retell must be able to reach the webhook. Either deploy to Netlify, or expose a local server with a
tunnel. `NEXT_PUBLIC_APP_URL` should match whatever that is.

## Step 5 · The five values you set yourself

Generate the two secrets locally. Never type them into a chat.

```bash
openssl rand -base64 32   # -> ASTRA_TOOL_SHARED_SECRET
openssl rand -base64 32   # -> ASTRA_CALLER_HASH_SALT
```

| Variable | Value |
|---|---|
| `ASTRA_VOICE_ACTIVATION_MODE` | exactly `internal_evaluation` |
| `RETELL_API_KEY` | from Retell |
| `ASTRA_TOOL_SHARED_SECRET` | generated above |
| `ASTRA_CALLER_HASH_SALT` | generated above |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` | from Twilio |

---

## Step 6 · Prove the pipeline before you dial

This is the point of the replay script: it exercises real signature verification, the real replay
window and the real ingest, without a phone.

```bash
export RETELL_API_KEY=...              # in your shell, not in a file you commit
npm run build && npm start             # or point at your deployment

npm run voice:replay -- --base https://<your-deployment>          # expect: all PASS
npm run voice:replay -- --base https://<your-deployment> --stale  # expect: correctly rejected
npm run voice:replay -- --base https://<your-deployment> --tamper # expect: correctly rejected
```

Then open `/dashboard/calls`. You should see the two fixture calls, one English and one Italian,
each with a transcript, a summary, an event timeline, a masked caller number and a green
**Disclosure: Given** badge.

If the disclosure badge says **Not recorded**, stop. It means the agent did not say the mandatory
line, and that is a defect to fix before any real call.

## Step 7 · The two live calls

One English, one Italian, both from our own team, both to our own test number.

For each call:

1. Ask a safe information question — opening hours, or whether there are vegan dishes.
2. Confirm you hear the disclosure **before** anything else is asked of you.
3. Interrupt the agent mid-sentence at least once and confirm it yields.
4. Hang up.
5. Open `/dashboard/calls` and confirm **exactly one** call row, with the right language, a
   complete transcript, a summary, and the disclosure badge green.
6. Then update `voice_qa/VOICE_TEST_CASES.csv`: `VQ-100` and `VQ-101` move from `not-run` to
   `pass` — **only if they actually did**.

Do not ask the agent to book a table expecting it to work. It cannot, and it is instructed to say
so plainly. Asking anyway is itself worth doing once: what you want to hear is an honest refusal
and an offer of the direct number, never "I've noted that down".

## Step 8 · Clean up

The test calls contain your colleagues' phone numbers, which are personal data.

```sql
-- Remove the internal evaluation calls once the evidence is recorded.
delete from public.call_sessions
 where is_internal_evaluation
   and started_at < now() - interval '7 days';
```

Or wait: the 30-day pilot retention deletes the transcripts on its own, and
`app.run_transcript_retention()` can be run on demand.

---

## If you cannot get credentials

Nothing is blocked except the live proof itself. Everything else — 255 automated tests, the whole
database layer, the signed-fixture pipeline, the dashboard — is already green and stays green. The
honest status remains **"implementation complete; live proof pending"** until a real call has been
answered and appears in the dashboard.
