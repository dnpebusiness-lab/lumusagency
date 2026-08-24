#!/usr/bin/env node
/**
 * Replay signed Retell webhook fixtures against a running deployment.
 *
 * This is how the Milestone 4A pipeline is exercised without a telephone: it
 * signs each fixture with the real Retell scheme at the moment of sending, so
 * the receiving endpoint performs genuine signature verification and genuine
 * replay-window checking.
 *
 * Usage:
 *   RETELL_API_KEY=... node scripts/replay-webhooks.mjs [--base http://localhost:3000] [--stale]
 *
 * Flags:
 *   --base <url>   target deployment (default http://localhost:3000)
 *   --stale        sign with a 20-minute-old timestamp, to prove the replay
 *                  window rejects it
 *   --tamper       modify the body after signing, to prove verification rejects it
 *   --once <name>  send a single fixture instead of the whole lifecycle
 *
 * The Retell signing secret is the API key (retell-sdk@5.64.0, verified
 * 24 Aug 2026). Nothing is printed that could reveal it.
 */

import { readFileSync, readdirSync } from 'node:fs'
import { sign } from 'retell-sdk'

const args = process.argv.slice(2)
function flag(name, fallback = undefined) {
  const index = args.indexOf(`--${name}`)
  if (index === -1) return fallback
  const value = args[index + 1]
  return value && !value.startsWith('--') ? value : true
}

const BASE = flag('base', 'http://localhost:3000')
const STALE = args.includes('--stale')
const TAMPER = args.includes('--tamper')
const ONCE = flag('once')

const apiKey = process.env.RETELL_API_KEY
if (!apiKey) {
  console.error('RETELL_API_KEY is not set. Export it in your shell; never paste it into a chat.')
  process.exit(1)
}

const LIFECYCLE = ['call-started-en', 'call-ended-en', 'call-analyzed-en', 'call-analyzed-it']
const available = readdirSync('tests/fixtures/retell')
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace(/\.json$/, ''))

const chosen = ONCE ? [String(ONCE)] : LIFECYCLE
for (const name of chosen) {
  if (!available.includes(name)) {
    console.error(`Unknown fixture "${name}". Available: ${available.join(', ')}`)
    process.exit(1)
  }
}

let failures = 0

for (const name of chosen) {
  const body = JSON.stringify(
    JSON.parse(readFileSync(`tests/fixtures/retell/${name}.json`, 'utf8')),
  )

  let signature = await sign(body, apiKey)
  if (STALE) {
    // Keep the digest, move the timestamp out of the window: exactly a replay.
    const digest = signature.split(',d=')[1]
    signature = `v=${Date.now() - 20 * 60 * 1000},d=${digest}`
  }

  const sent = TAMPER ? body.replace('user_hangup', 'agent_hangup') : body

  const response = await fetch(`${BASE}/api/webhooks/retell`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-retell-signature': signature },
    body: sent,
  })

  const text = await response.text()
  const expectedRejection = STALE || TAMPER
  const rejected = response.status === 401

  const verdict = expectedRejection
    ? rejected
      ? 'PASS (correctly rejected)'
      : 'FAIL (should have been rejected)'
    : response.ok
      ? 'PASS'
      : 'FAIL'

  if (verdict.startsWith('FAIL')) failures += 1

  console.log(`${verdict.padEnd(30)} ${name.padEnd(34)} ${response.status} ${text.slice(0, 160)}`)
}

if (failures > 0) {
  console.error(`\n${failures} fixture(s) did not behave as expected.`)
  process.exit(1)
}
console.log('\nAll fixtures behaved as expected.')
