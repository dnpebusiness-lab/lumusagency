import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { sign } from 'retell-sdk'
import { RetellVoiceProvider, RETELL_SIGNATURE_HEADER } from '@/lib/providers/voice/retell'
import {
  buildIngestPayload,
  deriveIntents,
  deriveOutcome,
  type IngestContext,
} from '@/lib/voice/ingest'
import { asSuperuser, closePool, DEMO } from '../database/helpers'

/**
 * The webhook pipeline, end to end, against the real database.
 *
 * The HTTP handler's own wiring is covered by the build and by
 * scripts/replay-webhooks.mjs against a running deployment. What is proved here
 * is everything the handler delegates to: signature verification, vendor
 * mapping, derivation, and the transactional idempotent ingest.
 */

const API_KEY = 'test-retell-api-key-do-not-use-anywhere'
const provider = new RetellVoiceProvider({ apiKey: API_KEY })

function fixture(name: string): string {
  // Signed at use time, never checked in: the Retell signature covers
  // body + timestamp and would be permanently stale if stored.
  return JSON.stringify(JSON.parse(readFileSync(`tests/fixtures/retell/${name}.json`, 'utf8')))
}

async function headersFor(body: string, secret = API_KEY): Promise<Headers> {
  const headers = new Headers()
  headers.set(RETELL_SIGNATURE_HEADER, await sign(body, secret))
  return headers
}

const CONTEXT: IngestContext = {
  organisationId: DEMO.orgVindaro,
  locationId: DEMO.locationVindaro,
  locationName: 'Osteria Vindaro',
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'it'],
  recordingEnabled: false,
  callerSalt: 'test-salt-value',
}

beforeAll(async () => {
  process.env.ASTRA_VOICE_ACTIVATION_MODE = 'internal_evaluation'
})

afterAll(async () => {
  await asSuperuser(async (client) => {
    await client.query(
      `delete from public.call_sessions where provider_call_id like 'astra_fixture_%'`,
    )
    await client.query(`delete from public.webhook_events where event_id like '%astra_fixture_%'`)
  })
  await closePool()
})

describe('signature verification (VQ-027, VQ-029)', () => {
  it('accepts a correctly signed body', async () => {
    const body = fixture('call-ended-en')
    const result = await provider.verifyWebhook(body, await headersFor(body))
    expect(result.ok).toBe(true)
  })

  it('rejects a body signed with the wrong secret', async () => {
    const body = fixture('call-ended-en')
    const result = await provider.verifyWebhook(body, await headersFor(body, 'a-different-secret'))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('unauthorised')
  })

  it('rejects a body that was modified after signing', async () => {
    const body = fixture('call-ended-en')
    const headers = await headersFor(body)
    const tampered = body.replace('user_hangup', 'agent_hangup')
    const result = await provider.verifyWebhook(tampered, headers)
    expect(result.ok).toBe(false)
  })

  it('rejects a missing signature header', async () => {
    const result = await provider.verifyWebhook(fixture('call-ended-en'), new Headers())
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toMatch(/missing/i)
  })

  it('rejects a malformed signature', async () => {
    const headers = new Headers()
    headers.set(RETELL_SIGNATURE_HEADER, 'not-a-signature')
    const result = await provider.verifyWebhook(fixture('call-ended-en'), headers)
    expect(result.ok).toBe(false)
  })

  it('rejects a replay outside the vendor time window', async () => {
    const body = fixture('call-ended-en')
    // The Retell format is v={unix_ms},d={digest}. A signature made twenty
    // minutes ago is a valid digest for a stale timestamp, which is exactly the
    // replay case.
    const stale = await sign(body, API_KEY)
    const staleMs = Date.now() - 20 * 60 * 1000
    const digest = stale.split(',d=')[1]
    const headers = new Headers()
    headers.set(RETELL_SIGNATURE_HEADER, `v=${staleMs},d=${digest}`)

    const result = await provider.verifyWebhook(body, headers)
    expect(result.ok).toBe(false)
  })

  it('rejects a verified body that is not a recognised event', async () => {
    const body = JSON.stringify({ event: 'something_else', call: { call_id: 'x' } })
    const result = await provider.verifyWebhook(body, await headersFor(body))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('invalid_input')
  })
})

describe('vendor mapping', () => {
  it('maps an English analysed call into our vocabulary', async () => {
    const body = fixture('call-analyzed-en')
    const result = await provider.verifyWebhook(body, await headersFor(body))
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const event = result.data
    expect(event.kind).toBe('call_analyzed')
    expect(event.eventId).toBe('call_analyzed:astra_fixture_en_001')
    expect(event.providerCallId).toBe('astra_fixture_en_001')
    expect(event.fromNumberE164).toBe('+353871110042')
    expect(event.durationSeconds).toBe(41)
    expect(event.transcript).toHaveLength(4)
    expect(event.transcript[0]?.speaker).toBe('agent')
    expect(event.transcript[1]?.speaker).toBe('caller')
    expect(event.summary).toMatch(/opens on Mondays/i)
    expect(event.sentiment).toBe('neutral')
    expect(event.recordingUrlDiscarded).toBe(false)
  })

  it('flags a recording url as discarded and never carries it (VQ-023)', async () => {
    const body = fixture('call-analyzed-with-recording')
    const result = await provider.verifyWebhook(body, await headersFor(body))
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.data.recordingUrlDiscarded).toBe(true)
    // The URL must not survive anywhere on the normalised event.
    expect(JSON.stringify(result.data)).not.toContain('example.invalid')
  })
})

describe('derivation', () => {
  it('detects the caller intent from what the caller said', () => {
    expect(
      deriveIntents([
        {
          turnIndex: 0,
          speaker: 'caller',
          content: 'Are you open on a Monday?',
          startedAtMs: null,
          endedAtMs: null,
        },
      ]).primary,
    ).toBe('hours')
    expect(
      deriveIntents([
        {
          turnIndex: 0,
          speaker: 'caller',
          content: 'avete piatti vegani?',
          startedAtMs: null,
          endedAtMs: null,
        },
      ]).primary,
    ).toBe('menu')
  })

  it('always promotes an allergen intent above the others', () => {
    const intents = deriveIntents([
      {
        turnIndex: 0,
        speaker: 'caller',
        content: 'I want to book a table, and I have a nut allergy',
        startedAtMs: null,
        endedAtMs: null,
      },
    ])
    expect(intents.primary).toBe('allergen')
  })

  it('leaves the intent unset rather than guessing', () => {
    expect(
      deriveIntents([
        {
          turnIndex: 0,
          speaker: 'caller',
          content: 'mmm hello',
          startedAtMs: null,
          endedAtMs: null,
        },
      ]).primary,
    ).toBeNull()
  })

  it('never derives a reservation outcome in Milestone 4A', () => {
    const outcome = deriveOutcome({
      kind: 'call_ended',
      eventId: 'x',
      providerCallId: 'x',
      providerAgentId: null,
      fromNumberE164: null,
      toNumberE164: null,
      startedAt: null,
      endedAt: null,
      durationSeconds: 30,
      disconnectionReason: 'user_hangup',
      transcript: [
        {
          turnIndex: 0,
          speaker: 'caller',
          content: 'book me a table',
          startedAtMs: null,
          endedAtMs: null,
        },
      ],
      summary: null,
      sentiment: null,
      successful: true,
      inVoicemail: false,
      costCents: null,
      metadata: {},
      recordingUrlDiscarded: false,
    })
    expect(outcome).toBe('resolved_information')
    expect(outcome).not.toBe('reservation_created')
  })
})

describe('ingest (VQ-025, VQ-026, VQ-028)', () => {
  async function ingest(fixtureName: string) {
    const body = fixture(fixtureName)
    const verified = await provider.verifyWebhook(body, await headersFor(body))
    if (!verified.ok) throw new Error('fixture failed verification')
    const payload = buildIngestPayload(verified.data, CONTEXT)
    return asSuperuser(async (client) => {
      const { rows } = await client.query<{ voice_ingest_call_event: Record<string, unknown> }>(
        'select public.voice_ingest_call_event($1::jsonb)',
        [JSON.stringify(payload)],
      )
      return rows[0]!.voice_ingest_call_event
    })
  }

  it('produces exactly one complete call from the English lifecycle', async () => {
    await ingest('call-started-en')
    await ingest('call-ended-en')
    const analysed = await ingest('call-analyzed-en')

    expect(analysed.duplicate).toBe(false)

    await asSuperuser(async (client) => {
      const call = await client.query(
        `select id, status, outcome, detected_language, primary_intent, duration_seconds,
                disclosure_version, disclosure_language, disclosure_completed_at, recording_url
           from public.call_sessions where provider_call_id = 'astra_fixture_en_001'`,
      )
      expect(call.rows).toHaveLength(1)
      const row = call.rows[0] as Record<string, unknown>
      expect(row.status).toBe('completed')
      expect(row.outcome).toBe('resolved_information')
      expect(row.detected_language).toBe('en')
      expect(row.primary_intent).toBe('hours')
      expect(row.duration_seconds).toBe(41)
      expect(row.recording_url).toBeNull()

      // Disclosure evidence, read from what the agent actually said.
      expect(row.disclosure_version).toBe('v1')
      expect(row.disclosure_language).toBe('en')
      expect(row.disclosure_completed_at).not.toBeNull()

      const transcript = await client.query(
        `select count(*)::int as n from public.call_transcripts where call_session_id = $1`,
        [row.id],
      )
      expect((transcript.rows[0] as { n: number }).n).toBe(4)

      const summary = await client.query(
        `select summary, sentiment from public.call_summaries where call_session_id = $1`,
        [row.id],
      )
      expect(summary.rows).toHaveLength(1)
      expect((summary.rows[0] as { sentiment: string }).sentiment).toBe('neutral')

      const events = await client.query(
        `select event_type from public.call_events where call_session_id = $1 order by sequence`,
        [row.id],
      )
      const kinds = events.rows.map((e) => (e as { event_type: string }).event_type)
      expect(kinds).toContain('call_started')
      expect(kinds).toContain('ai_disclosure_completed')
      expect(kinds).toContain('call_ended')
    })
  })

  it('does not duplicate the transcript when the analysed event resends it', async () => {
    await asSuperuser(async (client) => {
      const { rows } = await client.query<{ n: number }>(
        `select count(*)::int as n
           from public.call_transcripts t
           join public.call_sessions c on c.id = t.call_session_id
          where c.provider_call_id = 'astra_fixture_en_001'`,
      )
      expect(rows[0]!.n).toBe(4)
    })
  })

  it('processes a duplicate delivery exactly once', async () => {
    const again = await ingest('call-analyzed-en')
    expect(again.duplicate).toBe(true)
    expect(again.processed).toBe(false)

    await asSuperuser(async (client) => {
      const { rows } = await client.query<{ n: number }>(
        `select count(*)::int as n from public.call_sessions where provider_call_id = 'astra_fixture_en_001'`,
      )
      expect(rows[0]!.n).toBe(1)
    })
  })

  it('handles an Italian call and keeps the language', async () => {
    await ingest('call-analyzed-it')

    await asSuperuser(async (client) => {
      const { rows } = await client.query(
        `select detected_language, disclosure_language, primary_intent
           from public.call_sessions where provider_call_id = 'astra_fixture_it_001'`,
      )
      expect(rows).toHaveLength(1)
      const row = rows[0] as Record<string, unknown>
      expect(row.detected_language).toBe('it')
      expect(row.disclosure_language).toBe('it')
      expect(row.primary_intent).toBe('menu')
    })
  })

  it('stores no recording url even when the vendor sent one (VQ-023)', async () => {
    await ingest('call-analyzed-with-recording')

    await asSuperuser(async (client) => {
      const { rows } = await client.query(
        `select recording_url from public.call_sessions where provider_call_id = 'astra_fixture_recording_001'`,
      )
      expect(rows).toHaveLength(1)
      expect((rows[0] as { recording_url: string | null }).recording_url).toBeNull()

      // The discard is auditable rather than silent.
      const events = await client.query<{ event_type: string }>(
        `select e.event_type from public.call_events e
           join public.call_sessions c on c.id = e.call_session_id
          where c.provider_call_id = 'astra_fixture_recording_001'`,
      )
      expect(events.rows.map((r) => r.event_type)).toContain('recording_url_discarded')

      // And no row anywhere holds the URL.
      const leak = await client.query<{ n: number }>(
        `select count(*)::int as n from public.call_events where payload::text like '%example.invalid%'`,
      )
      expect(leak.rows[0]!.n).toBe(0)
    })
  })
})
