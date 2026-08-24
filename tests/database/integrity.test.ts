import { afterAll, describe, expect, it } from 'vitest'
import { DEMO, asSuperuser, asUser, closePool, expectFailure } from './helpers'

afterAll(closePool)

describe('integrity · no false confirmations', () => {
  it('refuses a confirmed reservation with no provider reference (PRD AC-04)', async () => {
    await asUser(DEMO.users.staff, async (client) => {
      const error = await expectFailure(
        client,
        `insert into public.reservations
           (organisation_id, location_id, status, customer_name, party_size, reserved_for, provider_reservation_id)
         values ($1, $2, 'confirmed', 'Wishful Thinking', 2, now() + interval '1 day', null)`,
        [DEMO.orgVindaro, DEMO.locationVindaro],
      )
      expect(error.message).toMatch(/reservations_confirmed_has_provider_ref/)
    })
  })

  it('refuses to promote a failed reservation to confirmed without a reference', async () => {
    await asUser(DEMO.users.staff, async (client) => {
      const error = await expectFailure(
        client,
        `update public.reservations set status = 'confirmed'
          where id = '51100000-0000-4000-8000-000000000003'`,
      )
      expect(error.message).toMatch(/reservations_confirmed_has_provider_ref/)
    })
  })

  it('refuses a failed reservation with no stated reason', async () => {
    await asUser(DEMO.users.staff, async (client) => {
      const error = await expectFailure(
        client,
        `insert into public.reservations
           (organisation_id, location_id, status, customer_name, party_size, reserved_for)
         values ($1, $2, 'failed', 'No Reason', 2, now() + interval '1 day')`,
        [DEMO.orgVindaro, DEMO.locationVindaro],
      )
      expect(error.message).toMatch(/reservations_failed_has_reason/)
    })
  })

  it('refuses an allergy flag with no allergy note', async () => {
    await asUser(DEMO.users.staff, async (client) => {
      const error = await expectFailure(
        client,
        `insert into public.reservations
           (organisation_id, location_id, status, customer_name, party_size, reserved_for, has_allergy_flag)
         values ($1, $2, 'pending', 'Flag Only', 2, now() + interval '1 day', true)`,
        [DEMO.orgVindaro, DEMO.locationVindaro],
      )
      expect(error.message).toMatch(/reservations_allergy_flag_consistent/)
    })
  })
})

describe('integrity · GDPR guards', () => {
  it('refuses a stored recording without recorded consent', async () => {
    await asSuperuser(async (client) => {
      await client.query('begin')
      const error = await expectFailure(
        client,
        `insert into public.call_sessions
           (organisation_id, location_id, provider_call_id, recording_url, recording_consent_given)
         values ($1, $2, 'test_no_consent', 'https://example.com/audio.mp3', false)`,
        [DEMO.orgVindaro, DEMO.locationVindaro],
      )
      // Two controls now cover this. The Milestone 2 CHECK constraint still
      // exists, but the Milestone 4A trigger (TPR-1.3) is stricter and fires
      // first: while recording is disabled for the location, a recording URL is
      // rejected whether or not consent was recorded. Either message is a pass;
      // silence would not be.
      expect(error.message).toMatch(
        /call_sessions_recording_requires_consent|audio recording is disabled/i,
      )
      await client.query('rollback')
    })
  })

  it('refuses recording to be enabled without a consent announcement', async () => {
    await asUser(DEMO.users.manager, async (client) => {
      const error = await expectFailure(
        client,
        `update public.agent_configurations
            set recording_enabled = true, recording_consent_en = null
          where location_id = $1`,
        [DEMO.locationVindaro],
      )
      expect(error.message).toMatch(/recording_requires_consent/)
    })
  })

  it('caps transcript retention so personal data cannot be kept indefinitely', async () => {
    await asUser(DEMO.users.owner, async (client) => {
      const error = await expectFailure(
        client,
        // 400 days breaks only the transcript ceiling; the metadata ceiling and
        // the ordering rule are both still satisfied, so the failure is unambiguous.
        `update public.organisations set transcript_retention_days = 400 where id = $1`,
        [DEMO.orgVindaro],
      )
      expect(error.message).toMatch(/transcript_retention_bounds/)
    })
  })

  it('requires a stated reason when a caller number is unmasked', async () => {
    await asSuperuser(async (client) => {
      await client.query('begin')
      const error = await expectFailure(
        client,
        `insert into public.audit_logs (organisation_id, action, entity_type, entity_id, reason)
         values ($1, 'unmask_pii', 'call_sessions', $2, null)`,
        [DEMO.orgVindaro, DEMO.calls.vindaroBookingFailure],
      )
      expect(error.message).toMatch(/unmask_has_reason/)
      await client.query('rollback')
    })
  })
})

describe('integrity · safety rules that cannot be switched off', () => {
  it('refuses to disable the severe-allergy escalation', async () => {
    await asUser(DEMO.users.manager, async (client) => {
      const error = await expectFailure(
        client,
        `update public.escalation_rules set is_enabled = false
          where location_id = $1 and reason = 'severe_allergy'`,
        [DEMO.locationVindaro],
      )
      expect(error.message).toMatch(/mandatory_reasons_enabled/)
    })
  })

  it('refuses to disable complaint, caller-request and out-of-scope escalations', async () => {
    for (const reason of ['complaint', 'caller_request', 'outside_approved_information']) {
      await asUser(DEMO.users.manager, async (client) => {
        const error = await expectFailure(
          client,
          `update public.escalation_rules set is_enabled = false
            where location_id = $1 and reason = $2`,
          [DEMO.locationVindaro, reason],
        )
        expect(error.message, reason).toMatch(/mandatory_reasons_enabled/)
      })
    }
  })

  it('allows a discretionary escalation to be disabled', async () => {
    await asUser(DEMO.users.manager, async (client) => {
      const result = await client.query(
        `update public.escalation_rules set is_enabled = false
          where location_id = $1 and reason = 'large_group'`,
        [DEMO.locationVindaro],
      )
      expect(result.rowCount).toBe(1)
    })
  })

  it('refuses an active agent with a transfer number that is not E.164', async () => {
    await asUser(DEMO.users.manager, async (client) => {
      const error = await expectFailure(
        client,
        `update public.agent_configurations set transfer_number_e164 = '01 555 0141'
          where location_id = $1`,
        [DEMO.locationVindaro],
      )
      expect(error.message).toMatch(/transfer_number_format/)
    })
  })
})

describe('integrity · privilege escalation guards', () => {
  it('stops staff promoting themselves', async () => {
    await asUser(DEMO.users.staff, async (client) => {
      // Blocked by RLS before the trigger is ever reached: staff may not write
      // memberships at all, so the row is invisible to the UPDATE and nothing
      // changes. No error is raised because there is nothing to raise one about.
      const result = await client.query(
        `update public.organisation_members set role = 'organisation_owner' where user_id = $1`,
        [DEMO.users.staff],
      )
      expect(result.rowCount).toBe(0)

      const { rows } = await client.query<{ role: string }>(
        'select role from public.organisation_members where user_id = $1',
        [DEMO.users.staff],
      )
      expect(rows[0]?.role).toBe('staff')
    })
  })

  it('stops an admin promoting themselves to owner', async () => {
    await asUser(DEMO.users.admin, async (client) => {
      const error = await expectFailure(
        client,
        `update public.organisation_members set role = 'organisation_owner' where user_id = $1`,
        [DEMO.users.admin],
      )
      expect(error.message).toMatch(/cannot change their own role/i)
    })
  })

  it('stops an admin granting ownership to somebody else', async () => {
    await asUser(DEMO.users.admin, async (client) => {
      const error = await expectFailure(
        client,
        `update public.organisation_members set role = 'organisation_owner' where user_id = $1`,
        [DEMO.users.staff],
      )
      expect(error.message).toMatch(/only an organisation owner can grant or revoke ownership/i)
    })
  })

  it('lets an owner grant ownership', async () => {
    await asUser(DEMO.users.owner, async (client) => {
      const result = await client.query(
        `update public.organisation_members set role = 'organisation_owner' where user_id = $1`,
        [DEMO.users.admin],
      )
      expect(result.rowCount).toBe(1)
    })
  })

  it('never lets an organisation be left without an owner', async () => {
    await asUser(DEMO.users.owner, async (client) => {
      const error = await expectFailure(
        client,
        `delete from public.organisation_members where user_id = $1 and organisation_id = $2`,
        [DEMO.users.owner, DEMO.orgVindaro],
      )
      expect(error.message).toMatch(/at least one active owner/i)
    })
  })

  it('stops a user making themselves a platform administrator', async () => {
    await asUser(DEMO.users.owner, async (client) => {
      const error = await expectFailure(
        client,
        `update public.profiles set platform_role = 'platform_admin' where id = $1`,
        [DEMO.users.owner],
      )
      expect(error.message).toMatch(
        /platform_role can only be changed by a platform administrator/i,
      )
    })
  })

  it('lets a user edit their own harmless profile fields', async () => {
    await asUser(DEMO.users.staff, async (client) => {
      const result = await client.query(
        `update public.profiles set full_name = 'Aoife B.' where id = $1`,
        [DEMO.users.staff],
      )
      expect(result.rowCount).toBe(1)
    })
  })

  it("stops a user editing somebody else's profile", async () => {
    await asUser(DEMO.users.staff, async (client) => {
      const result = await client.query(
        `update public.profiles set full_name = 'Hacked' where id = $1`,
        [DEMO.users.owner],
      )
      expect(result.rowCount).toBe(0)
    })
  })
})

describe('integrity · automatic profile creation', () => {
  it('creates a profile when a new auth user appears', async () => {
    await asSuperuser(async (client) => {
      await client.query('begin')
      const id = '00000000-0000-4000-8000-00000000abcd'
      await client.query(
        `insert into auth.users (id, aud, role, email, raw_user_meta_data)
         values ($1, 'authenticated', 'authenticated', 'newcomer@example.com',
                 '{"full_name":"New Comer","locale":"it"}'::jsonb)`,
        [id],
      )

      const { rows } = await client.query<{
        email: string
        full_name: string
        locale: string
        platform_role: string
      }>('select email, full_name, locale, platform_role from public.profiles where id = $1', [id])

      expect(rows[0]?.email).toBe('newcomer@example.com')
      expect(rows[0]?.full_name).toBe('New Comer')
      expect(rows[0]?.locale).toBe('it')
      // Crucially, user-supplied metadata cannot grant platform privilege.
      expect(rows[0]?.platform_role).toBe('member')
      await client.query('rollback')
    })
  })

  it('ignores a platform_role smuggled into sign-up metadata', async () => {
    await asSuperuser(async (client) => {
      await client.query('begin')
      const id = '00000000-0000-4000-8000-00000000dcba'
      await client.query(
        `insert into auth.users (id, aud, role, email, raw_user_meta_data)
         values ($1, 'authenticated', 'authenticated', 'sneaky@example.com',
                 '{"full_name":"Sneaky","platform_role":"platform_admin"}'::jsonb)`,
        [id],
      )

      const { rows } = await client.query<{ platform_role: string }>(
        'select platform_role from public.profiles where id = $1',
        [id],
      )

      expect(rows[0]?.platform_role).toBe('member')
      await client.query('rollback')
    })
  })
})

describe('integrity · derived values', () => {
  it('computes call duration from the timestamps rather than trusting the vendor', async () => {
    await asSuperuser(async (client) => {
      await client.query('begin')
      const { rows } = await client.query<{ duration_seconds: number }>(
        `insert into public.call_sessions
           (organisation_id, location_id, provider_call_id, status, started_at, ended_at, duration_seconds)
         values ($1, $2, 'duration_test', 'completed', now() - interval '90 seconds', now(), 99999)
         returning duration_seconds`,
        [DEMO.orgVindaro, DEMO.locationVindaro],
      )

      expect(rows[0]?.duration_seconds).toBeGreaterThanOrEqual(89)
      expect(rows[0]?.duration_seconds).toBeLessThanOrEqual(91)
      await client.query('rollback')
    })
  })

  it('bumps the version on every content change', async () => {
    await asUser(DEMO.users.manager, async (client) => {
      const first = await client.query<{ version: number }>(
        `update public.menu_items set description_en = 'v2' where id = $1 returning version`,
        [DEMO.menuItems.approvedSorbetto],
      )
      const second = await client.query<{ version: number }>(
        `update public.menu_items set description_en = 'v3' where id = $1 returning version`,
        [DEMO.menuItems.approvedSorbetto],
      )

      expect(second.rows[0]!.version).toBe(first.rows[0]!.version + 1)
    })
  })
})
