import { afterAll, describe, expect, it } from 'vitest'
import {
  DEMO,
  asAnon,
  asServiceRole,
  asSuperuser,
  asUser,
  assertStillAuthenticated,
  closePool,
  expectFailure,
} from './helpers'

afterAll(closePool)

/**
 * Every table that carries an organisation_id and therefore belongs to exactly
 * one tenant. The cross-tenant test walks this whole list: adding a tenant table
 * without adding it here would leave a hole, so the list is asserted against the
 * live schema in the first test below.
 */
const TENANT_TABLES = [
  'organisation_members',
  'organisation_member_locations',
  'locations',
  'subscriptions',
  'agent_configurations',
  'business_hours',
  'escalation_rules',
  'knowledge_articles',
  'frequently_asked_questions',
  'menu_categories',
  'menu_items',
  'menu_item_allergens',
  'menu_item_dietary_attributes',
  'call_sessions',
  'call_events',
  'call_transcripts',
  'call_summaries',
  'reservations',
  'sms_messages',
  'audit_logs',
  'retention_jobs',
  'webhook_events',
] as const

describe('RLS · the tenant-table list is complete', () => {
  it('covers every table in public that has an organisation_id column', async () => {
    const actual = await asSuperuser(async (client) => {
      const { rows } = await client.query<{ table_name: string }>(
        `select table_name from information_schema.columns
          where table_schema = 'public' and column_name = 'organisation_id'
          order by table_name`,
      )
      return rows.map((r) => r.table_name)
    })

    // organisations itself is keyed by id rather than organisation_id and is
    // covered separately below.
    expect([...TENANT_TABLES].sort()).toEqual(actual.sort())
  })
})

describe('RLS · cross-organisation isolation (PRD AC-13)', () => {
  it('shows the Kestrel owner zero Vindaro rows in every tenant table', async () => {
    const leaks: string[] = []

    await asUser(DEMO.users.kestrelOwner, async (client) => {
      for (const table of TENANT_TABLES) {
        const { rows } = await client.query<{ count: string }>(
          `select count(*)::text as count from public.${table} where organisation_id = $1`,
          [DEMO.orgVindaro],
        )
        if (Number(rows[0]?.count ?? '0') > 0) leaks.push(`${table}: ${rows[0]?.count}`)
      }
    })

    expect(leaks).toEqual([])
  })

  it('shows the Vindaro owner zero Kestrel rows in every tenant table', async () => {
    const leaks: string[] = []

    await asUser(DEMO.users.owner, async (client) => {
      for (const table of TENANT_TABLES) {
        const { rows } = await client.query<{ count: string }>(
          `select count(*)::text as count from public.${table} where organisation_id = $1`,
          [DEMO.orgKestrel],
        )
        if (Number(rows[0]?.count ?? '0') > 0) leaks.push(`${table}: ${rows[0]?.count}`)
      }
    })

    expect(leaks).toEqual([])
  })

  it('hides the other organisation itself', async () => {
    const visible = await asUser(DEMO.users.kestrelOwner, async (client) => {
      const { rows } = await client.query<{ id: string }>('select id from public.organisations')
      return rows.map((r) => r.id)
    })

    expect(visible).toEqual([DEMO.orgKestrel])
  })

  it('cannot be defeated by asking for a specific foreign id', async () => {
    // The archetypal attack: change the id in the request and hope the server
    // trusts it. RLS never consults a client-supplied organisation id.
    const rows = await asUser(DEMO.users.kestrelOwner, async (client) => {
      const result = await client.query(`select * from public.menu_items where location_id = $1`, [
        DEMO.locationVindaro,
      ])
      return result.rows
    })

    expect(rows).toHaveLength(0)
  })

  it('refuses to write a row into another organisation', async () => {
    await asUser(DEMO.users.kestrelOwner, async (client) => {
      const error = await expectFailure(
        client,
        `insert into public.menu_categories (organisation_id, location_id, slug, name_en)
         values ($1, $2, 'smuggled', 'Smuggled')`,
        [DEMO.orgVindaro, DEMO.locationVindaro],
      )
      expect(error.message).toMatch(/row-level security/i)
    })
  })

  it('refuses to move one of its own rows into another organisation', async () => {
    await asUser(DEMO.users.kestrelOwner, async (client) => {
      const error = await expectFailure(
        client,
        `update public.locations set organisation_id = $1 where id = $2`,
        [DEMO.orgVindaro, DEMO.locationKestrel],
      )
      expect(error.message).toMatch(/row-level security/i)
    })
  })
})

describe('RLS · unauthenticated access', () => {
  it('denies the anon role every business table', async () => {
    const readable: string[] = []

    await asAnon(async (client) => {
      for (const table of [...TENANT_TABLES, 'organisations', 'profiles']) {
        try {
          await client.query(`select 1 from public.${table} limit 1`)
          readable.push(table)
        } catch {
          // Expected: permission denied.
        }
      }
    })

    expect(readable).toEqual([])
  })

  it('denies an authenticated session with no membership', async () => {
    const orphan = '00000000-0000-4000-8000-0000000000ff'
    const counts = await asUser(orphan, async (client) => {
      const orgs = await client.query('select 1 from public.organisations')
      const calls = await client.query('select 1 from public.call_sessions')
      return { orgs: orgs.rowCount, calls: calls.rowCount }
    })

    expect(counts).toEqual({ orgs: 0, calls: 0 })
  })
})

describe('RLS · role permissions inside one organisation', () => {
  it('lets every role read the call history of its own organisation', async () => {
    for (const [role, userId] of Object.entries({
      owner: DEMO.users.owner,
      admin: DEMO.users.admin,
      manager: DEMO.users.manager,
      staff: DEMO.users.staff,
      viewer: DEMO.users.viewer,
    })) {
      const count = await asUser(userId, async (client) => {
        const { rows } = await client.query<{ count: string }>(
          'select count(*)::text as count from public.call_sessions',
        )
        return Number(rows[0]?.count ?? '0')
      })
      expect(count, `${role} should see the call history`).toBeGreaterThan(0)
    }
  })

  it('lets a manager edit menu content for the location they run', async () => {
    await asUser(DEMO.users.manager, async (client) => {
      const result = await client.query(
        `update public.menu_items set description_en = 'edited by the manager' where id = $1`,
        [DEMO.menuItems.approvedGnocchi],
      )
      expect(result.rowCount).toBe(1)
    })
  })

  it('refuses menu edits from staff', async () => {
    await asUser(DEMO.users.staff, async (client) => {
      const result = await client.query(
        `update public.menu_items set description_en = 'edited by staff' where id = $1`,
        [DEMO.menuItems.approvedGnocchi],
      )
      // RLS makes the row invisible to the UPDATE rather than raising: no row
      // is matched, so nothing changes.
      expect(result.rowCount).toBe(0)
    })
  })

  it('refuses menu edits from a viewer', async () => {
    await asUser(DEMO.users.viewer, async (client) => {
      const result = await client.query(
        `update public.menu_items set description_en = 'edited by viewer' where id = $1`,
        [DEMO.menuItems.approvedGnocchi],
      )
      expect(result.rowCount).toBe(0)
    })
  })

  it('refuses menu inserts from a viewer', async () => {
    await asUser(DEMO.users.viewer, async (client) => {
      const error = await expectFailure(
        client,
        `insert into public.menu_categories (organisation_id, location_id, slug, name_en)
         values ($1, $2, 'viewer-category', 'Nope')`,
        [DEMO.orgVindaro, DEMO.locationVindaro],
      )
      expect(error.message).toMatch(/row-level security/i)
    })
  })

  it('lets staff update a reservation but not a viewer', async () => {
    await asUser(DEMO.users.staff, async (client) => {
      const result = await client.query(
        `update public.reservations set status = 'seated' where id = '51100000-0000-4000-8000-000000000001'`,
      )
      expect(result.rowCount).toBe(1)
    })

    await asUser(DEMO.users.viewer, async (client) => {
      const result = await client.query(
        `update public.reservations set status = 'seated' where id = '51100000-0000-4000-8000-000000000001'`,
      )
      expect(result.rowCount).toBe(0)
    })
  })

  it('restricts a location manager to the locations assigned to them', async () => {
    // Give the organisation a second location that the manager is NOT assigned to.
    const secondLocation = await asSuperuser(async (client) => {
      const { rows } = await client.query<{ id: string }>(
        `insert into public.locations (organisation_id, name, slug, is_demo)
         values ($1, 'Second demo location', 'second-demo', true)
         on conflict (organisation_id, slug) do update set name = excluded.name
         returning id`,
        [DEMO.orgVindaro],
      )
      return rows[0]!.id
    })

    try {
      await asUser(DEMO.users.manager, async (client) => {
        const assigned = await client.query(
          `update public.locations set directions_note = 'manager edit' where id = $1`,
          [DEMO.locationVindaro],
        )
        expect(assigned.rowCount, 'assigned location should be editable').toBe(1)

        const unassigned = await client.query(
          `update public.locations set directions_note = 'manager edit' where id = $1`,
          [secondLocation],
        )
        expect(unassigned.rowCount, 'unassigned location must not be editable').toBe(0)
      })

      // An admin, by contrast, covers every location implicitly.
      await asUser(DEMO.users.admin, async (client) => {
        const result = await client.query(
          `update public.locations set directions_note = 'admin edit' where id = $1`,
          [secondLocation],
        )
        expect(result.rowCount).toBe(1)
      })
    } finally {
      await asSuperuser(async (client) => {
        await client.query('delete from public.locations where id = $1', [secondLocation])
      })
    }
  })

  it('restricts audit logs to owners and admins', async () => {
    const forOwner = await asUser(DEMO.users.owner, async (client) => {
      const { rows } = await client.query<{ count: string }>(
        'select count(*)::text as count from public.audit_logs',
      )
      return Number(rows[0]!.count)
    })
    expect(forOwner).toBeGreaterThan(0)

    for (const userId of [DEMO.users.manager, DEMO.users.staff, DEMO.users.viewer]) {
      const count = await asUser(userId, async (client) => {
        const { rows } = await client.query<{ count: string }>(
          'select count(*)::text as count from public.audit_logs',
        )
        return Number(rows[0]!.count)
      })
      expect(count).toBe(0)
    }
  })

  it('restricts billing to owners and admins', async () => {
    const forOwner = await asUser(DEMO.users.owner, async (client) => {
      const { rows } = await client.query('select 1 from public.subscriptions')
      return rows.length
    })
    expect(forOwner).toBe(1)

    for (const userId of [DEMO.users.manager, DEMO.users.staff, DEMO.users.viewer]) {
      const rows = await asUser(userId, async (client) => {
        const result = await client.query('select 1 from public.subscriptions')
        return result.rows.length
      })
      expect(rows).toBe(0)
    }
  })

  it('makes call records append-only for tenant users', async () => {
    await asUser(DEMO.users.owner, async (client) => {
      for (const table of ['call_events', 'call_transcripts', 'call_summaries', 'audit_logs']) {
        const error = await expectFailure(client, `delete from public.${table}`)
        expect(error.message, table).toMatch(/permission denied/i)
        await assertStillAuthenticated(client)
      }
    })
  })

  it('lets staff annotate a call but not rewrite its outcome', async () => {
    await asUser(DEMO.users.staff, async (client) => {
      const annotated = await client.query(
        `update public.call_sessions set caller_name = 'Corrected Name' where id = $1`,
        [DEMO.calls.vindaroBookingFailure],
      )
      expect(annotated.rowCount).toBe(1)

      const error = await expectFailure(
        client,
        `update public.call_sessions set outcome = 'reservation_created' where id = $1`,
        [DEMO.calls.vindaroBookingFailure],
      )
      expect(error.message).toMatch(/permission denied/i)
      await assertStillAuthenticated(client)
    })
  })
})

describe('RLS · the service role is the trusted backend', () => {
  it('can read across organisations, as webhooks and cron jobs require', async () => {
    const orgs = await asServiceRole(async (client) => {
      const { rows } = await client.query<{ count: string }>(
        'select count(*)::text as count from public.organisations',
      )
      return Number(rows[0]!.count)
    })

    expect(orgs).toBeGreaterThanOrEqual(2)
  })

  it('can read webhook_events, which no tenant user can touch at all', async () => {
    await asServiceRole(async (client) => {
      await expect(client.query('select * from public.webhook_events')).resolves.toBeDefined()
    })

    await asUser(DEMO.users.owner, async (client) => {
      const error = await expectFailure(
        client,
        'insert into public.webhook_events (vendor, event_id) values (1,2)',
      )
      expect(error.message).toMatch(/permission denied/i)
    })
  })
})
