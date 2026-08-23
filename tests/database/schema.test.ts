import { afterAll, describe, expect, it } from 'vitest'
import { asSuperuser, closePool } from './helpers'

afterAll(closePool)

const REQUIRED_TABLES = [
  'profiles',
  'organisations',
  'organisation_members',
  'organisation_member_locations',
  'locations',
  'subscriptions',
  'agent_configurations',
  'business_hours',
  'escalation_rules',
  'allergens',
  'dietary_attributes',
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
  'webhook_events',
  'retention_jobs',
  'audit_logs',
] as const

const APPROVABLE_TABLES = [
  'knowledge_articles',
  'frequently_asked_questions',
  'menu_categories',
  'menu_items',
  'menu_item_allergens',
  'menu_item_dietary_attributes',
] as const

describe('schema', () => {
  it('creates every table required by the PRD', async () => {
    const present = await asSuperuser(async (client) => {
      const { rows } = await client.query<{ tablename: string }>(
        `select tablename from pg_tables where schemaname = 'public'`,
      )
      return rows.map((r) => r.tablename)
    })

    for (const table of REQUIRED_TABLES) {
      expect(present, `missing table: ${table}`).toContain(table)
    }
  })

  it('uses uuid primary keys everywhere', async () => {
    const offenders = await asSuperuser(async (client) => {
      const { rows } = await client.query<{ table_name: string; data_type: string }>(
        `select c.table_name, c.data_type
           from information_schema.table_constraints tc
           join information_schema.key_column_usage k
             on k.constraint_name = tc.constraint_name and k.table_schema = tc.table_schema
           join information_schema.columns c
             on c.table_schema = k.table_schema
            and c.table_name = k.table_name
            and c.column_name = k.column_name
          where tc.constraint_type = 'PRIMARY KEY'
            and tc.table_schema = 'public'
            and c.data_type <> 'uuid'`,
      )
      return rows
    })

    expect(offenders).toEqual([])
  })

  it('enables row level security on every table in public', async () => {
    const unprotected = await asSuperuser(async (client) => {
      const { rows } = await client.query<{ relname: string }>(
        `select c.relname
           from pg_class c
           join pg_namespace n on n.oid = c.relnamespace
          where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity`,
      )
      return rows.map((r) => r.relname)
    })

    expect(unprotected).toEqual([])
  })

  it('gives every approvable table the full approval column set', async () => {
    const columns = await asSuperuser(async (client) => {
      const { rows } = await client.query<{ table_name: string; column_name: string }>(
        `select table_name, column_name
           from information_schema.columns
          where table_schema = 'public' and table_name = any($1)`,
        [APPROVABLE_TABLES],
      )
      return rows
    })

    for (const table of APPROVABLE_TABLES) {
      const own = columns.filter((c) => c.table_name === table).map((c) => c.column_name)
      for (const required of [
        'approval_status',
        'approved_by',
        'approved_at',
        'version',
        'last_reviewed_at',
      ]) {
        expect(own, `${table}.${required}`).toContain(required)
      }
    }
  })

  it('requires cross_contamination_notes on both allergen-bearing tables', async () => {
    const found = await asSuperuser(async (client) => {
      const { rows } = await client.query<{ table_name: string }>(
        `select table_name from information_schema.columns
          where table_schema = 'public' and column_name = 'cross_contamination_notes'`,
      )
      return rows.map((r) => r.table_name).sort()
    })

    expect(found).toEqual(['menu_item_allergens', 'menu_items'])
  })

  it('defaults every approvable row to draft, so nothing is approved by accident', async () => {
    const defaults = await asSuperuser(async (client) => {
      const { rows } = await client.query<{ table_name: string; column_default: string | null }>(
        `select table_name, column_default from information_schema.columns
          where table_schema = 'public' and column_name = 'approval_status'`,
      )
      return rows
    })

    expect(defaults).not.toHaveLength(0)
    for (const row of defaults) {
      expect(row.column_default, row.table_name).toContain("'draft'")
    }
  })

  it('pins search_path on every SECURITY DEFINER function', async () => {
    const unsafe = await asSuperuser(async (client) => {
      const { rows } = await client.query<{ name: string }>(
        `select n.nspname || '.' || p.proname as name
           from pg_proc p
           join pg_namespace n on n.oid = p.pronamespace
          where n.nspname in ('app', 'agent')
            and p.prosecdef
            and (p.proconfig is null
                 or not exists (
                   select 1 from unnest(p.proconfig) cfg where cfg like 'search_path=%'))`,
      )
      return rows.map((r) => r.name)
    })

    expect(unsafe).toEqual([])
  })

  it('records a foreign key from reservations back to the call that created them', async () => {
    const exists = await asSuperuser(async (client) => {
      const { rows } = await client.query(
        `select 1 from information_schema.table_constraints
          where constraint_name = 'reservations_source_call_fk' and table_name = 'reservations'`,
      )
      return rows.length === 1
    })

    expect(exists).toBe(true)
  })
})
