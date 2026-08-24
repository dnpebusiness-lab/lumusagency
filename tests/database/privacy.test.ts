import { afterAll, describe, expect, it } from 'vitest'
import { DEMO, asSuperuser, asUser, closePool, expectFailure } from './helpers'

afterAll(closePool)

/** TECHNICAL_PRIVACY_REQUIREMENTS.md TPR-1, TPR-2.5 and TPR-5. */

describe('recording lockout (TPR-1.3)', () => {
  it('refuses a recording url while recording is disabled for the location', async () => {
    await asSuperuser(async (client) => {
      await client.query('begin')
      const error = await expectFailure(
        client,
        `insert into public.call_sessions
           (organisation_id, location_id, provider_call_id, recording_url, recording_consent_given)
         values ($1, $2, 'privacy_test_1', 'https://example.invalid/a.wav', true)`,
        [DEMO.orgVindaro, DEMO.locationVindaro],
      )
      expect(error.message).toMatch(/audio recording is disabled/i)
      await client.query('rollback')
    })
  })

  it('refuses a recording url added by a later update', async () => {
    await asSuperuser(async (client) => {
      await client.query('begin')
      await client.query(
        `insert into public.call_sessions (organisation_id, location_id, provider_call_id)
         values ($1, $2, 'privacy_test_2')`,
        [DEMO.orgVindaro, DEMO.locationVindaro],
      )
      const error = await expectFailure(
        client,
        `update public.call_sessions set recording_url = 'https://example.invalid/b.wav',
                                          recording_consent_given = true
          where provider_call_id = 'privacy_test_2'`,
      )
      expect(error.message).toMatch(/audio recording is disabled/i)
      await client.query('rollback')
    })
  })

  it('fails closed when a location has no agent configuration at all', async () => {
    await asSuperuser(async (client) => {
      await client.query('begin')
      const { rows } = await client.query<{ id: string }>(
        `insert into public.locations (organisation_id, name, slug, is_demo)
         values ($1, 'Unconfigured', 'unconfigured-privacy-test', true) returning id`,
        [DEMO.orgVindaro],
      )
      const error = await expectFailure(
        client,
        `insert into public.call_sessions
           (organisation_id, location_id, provider_call_id, recording_url, recording_consent_given)
         values ($1, $2, 'privacy_test_3', 'https://example.invalid/c.wav', true)`,
        [DEMO.orgVindaro, rows[0]!.id],
      )
      expect(error.message).toMatch(/audio recording is disabled/i)
      await client.query('rollback')
    })
  })

  it('holds no recording url anywhere in the seeded demo data', async () => {
    const count = await asSuperuser(async (client) => {
      const { rows } = await client.query<{ n: number }>(
        `select count(*)::int as n from public.call_sessions where recording_url is not null`,
      )
      return rows[0]!.n
    })
    expect(count).toBe(0)
  })
})

describe('disclosure evidence (TPR-2.5)', () => {
  it('refuses a completion timestamp with no version or language', async () => {
    await asSuperuser(async (client) => {
      await client.query('begin')
      const error = await expectFailure(
        client,
        `insert into public.call_sessions
           (organisation_id, location_id, provider_call_id, disclosure_completed_at)
         values ($1, $2, 'disclosure_test_1', now())`,
        [DEMO.orgVindaro, DEMO.locationVindaro],
      )
      expect(error.message).toMatch(/disclosure_evidence_complete/)
      await client.query('rollback')
    })
  })

  it('accepts a complete disclosure record', async () => {
    await asSuperuser(async (client) => {
      await client.query('begin')
      const { rows } = await client.query(
        `insert into public.call_sessions
           (organisation_id, location_id, provider_call_id,
            disclosure_version, disclosure_language, disclosure_completed_at)
         values ($1, $2, 'disclosure_test_2', 'v1', 'en', now())
         returning disclosure_version`,
        [DEMO.orgVindaro, DEMO.locationVindaro],
      )
      expect(rows).toHaveLength(1)
      await client.query('rollback')
    })
  })

  it('has the append-only disclosure event types available', async () => {
    const values = await asSuperuser(async (client) => {
      const { rows } = await client.query<{ label: string }>(
        `select e.enumlabel::text as label from pg_enum e
           join pg_type t on t.oid = e.enumtypid
          where t.typname = 'call_event_type'`,
      )
      return rows.map((r) => r.label)
    })
    expect(values).toContain('ai_disclosure_started')
    expect(values).toContain('ai_disclosure_completed')
    expect(values).toContain('ai_disclosure_replayed')
    expect(values).toContain('recording_url_discarded')
  })

  it('defaults a new call to the internal evaluation flag', async () => {
    await asSuperuser(async (client) => {
      await client.query('begin')
      const { rows } = await client.query<{ is_internal_evaluation: boolean }>(
        `insert into public.call_sessions (organisation_id, location_id, provider_call_id)
         values ($1, $2, 'internal_flag_test') returning is_internal_evaluation`,
        [DEMO.orgVindaro, DEMO.locationVindaro],
      )
      expect(rows[0]!.is_internal_evaluation).toBe(true)
      await client.query('rollback')
    })
  })
})

describe('retention (TPR-5)', () => {
  it('uses the 30-day pilot default for the demo organisations', async () => {
    const days = await asSuperuser(async (client) => {
      const { rows } = await client.query<{ transcript_retention_days: number }>(
        'select transcript_retention_days from public.organisations where id = $1',
        [DEMO.orgVindaro],
      )
      return rows[0]!.transcript_retention_days
    })
    expect(days).toBe(30)
  })

  it('stamps every call with a retention deadline', async () => {
    const missing = await asSuperuser(async (client) => {
      const { rows } = await client.query<{ n: number }>(
        'select count(*)::int as n from public.call_sessions where retention_expires_at is null',
      )
      return rows[0]!.n
    })
    expect(missing).toBe(0)
  })

  it('falls back to the shortest window rather than keeping data forever', async () => {
    const days = await asSuperuser(async (client) => {
      const { rows } = await client.query<{ default_days: string }>(
        `select column_default as default_days from information_schema.columns
          where table_name = 'organisations' and column_name = 'transcript_retention_days'`,
      )
      return rows[0]!.default_days
    })
    expect(days).toContain('30')
  })

  it('deletes expired transcripts and summaries while current data survives (VQ-031)', async () => {
    await asSuperuser(async (client) => {
      await client.query('begin')

      // One expired call and one current call, both real rows.
      const expired = await client.query<{ id: string }>(
        `insert into public.call_sessions
           (organisation_id, location_id, provider_call_id, started_at, retention_expires_at)
         values ($1, $2, 'retention_expired', now() - interval '90 days', now() - interval '1 day')
         returning id`,
        [DEMO.orgVindaro, DEMO.locationVindaro],
      )
      const current = await client.query<{ id: string }>(
        `insert into public.call_sessions
           (organisation_id, location_id, provider_call_id, started_at, retention_expires_at)
         values ($1, $2, 'retention_current', now(), now() + interval '29 days')
         returning id`,
        [DEMO.orgVindaro, DEMO.locationVindaro],
      )

      for (const call of [expired.rows[0]!.id, current.rows[0]!.id]) {
        await client.query(
          `insert into public.call_transcripts
             (organisation_id, call_session_id, turn_index, speaker, content)
           values ($1, $2, 0, 'caller', 'I have a nut allergy')`,
          [DEMO.orgVindaro, call],
        )
        await client.query(
          `insert into public.call_summaries (organisation_id, call_session_id, summary)
           values ($1, $2, 'Caller mentioned an allergy.')`,
          [DEMO.orgVindaro, call],
        )
      }

      const { rows: result } = await client.query<{
        transcripts_deleted: number
        summaries_deleted: number
      }>('select * from app.run_transcript_retention($1)', [DEMO.orgVindaro])

      expect(result[0]!.transcripts_deleted).toBeGreaterThanOrEqual(1)
      expect(result[0]!.summaries_deleted).toBeGreaterThanOrEqual(1)

      const remaining = await client.query<{ n: number }>(
        `select count(*)::int as n from public.call_transcripts where call_session_id = $1`,
        [expired.rows[0]!.id],
      )
      expect(remaining.rows[0]!.n, 'expired transcript should be gone').toBe(0)

      const survived = await client.query<{ n: number }>(
        `select count(*)::int as n from public.call_transcripts where call_session_id = $1`,
        [current.rows[0]!.id],
      )
      expect(survived.rows[0]!.n, 'current transcript must survive').toBe(1)

      // Metadata is a separate, longer policy and must not be touched.
      const metadata = await client.query<{ n: number }>(
        `select count(*)::int as n from public.call_sessions where id = $1`,
        [expired.rows[0]!.id],
      )
      expect(metadata.rows[0]!.n, 'call metadata must survive the transcript job').toBe(1)

      await client.query('rollback')
    })
  })

  it('records evidence of every retention run', async () => {
    await asSuperuser(async (client) => {
      await client.query('begin')
      await client.query('select * from app.run_transcript_retention($1)', [DEMO.orgVindaro])
      const { rows } = await client.query<{ status: string }>(
        `select status from public.retention_jobs order by started_at desc limit 1`,
      )
      expect(rows[0]!.status).toBe('succeeded')
      await client.query('rollback')
    })
  })

  it('is not callable by a tenant user', async () => {
    await asUser(DEMO.users.owner, async (client) => {
      const error = await expectFailure(client, 'select * from app.run_transcript_retention()')
      expect(error.message).toMatch(/permission denied/i)
    })
  })
})

describe('voice tool entry points', () => {
  it('are not callable by a dashboard user, however privileged', async () => {
    await asUser(DEMO.users.owner, async (client) => {
      for (const fn of [
        `select public.voice_get_business_info('${DEMO.locationVindaro}')`,
        `select * from public.voice_search_menu('${DEMO.locationVindaro}', null, 5)`,
        `select public.voice_resolve_menu_item('${DEMO.locationVindaro}', 'gnocchi')`,
        `select public.voice_ingest_call_event('{}'::jsonb)`,
      ]) {
        const error = await expectFailure(client, fn)
        expect(error.message, fn).toMatch(/permission denied/i)
      }
    })
  })

  it('resolve only approved dishes (VQ-008)', async () => {
    await asSuperuser(async (client) => {
      const approved = await client.query<{ id: string | null }>(
        `select public.voice_resolve_menu_item($1, 'gnocchi') as id`,
        [DEMO.locationVindaro],
      )
      expect(approved.rows[0]!.id).toBe(DEMO.menuItems.approvedGnocchi)

      // "Fried calamari" is seeded as a draft and must be invisible.
      const draft = await client.query<{ id: string | null }>(
        `select public.voice_resolve_menu_item($1, 'calamari') as id`,
        [DEMO.locationVindaro],
      )
      expect(draft.rows[0]!.id).toBeNull()

      // "Grilled ribeye" is pending review and must also be invisible.
      const pending = await client.query<{ id: string | null }>(
        `select public.voice_resolve_menu_item($1, 'ribeye') as id`,
        [DEMO.locationVindaro],
      )
      expect(pending.rows[0]!.id).toBeNull()
    })
  })
})
