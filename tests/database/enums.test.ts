import { afterAll, describe, expect, it } from 'vitest'
import { asSuperuser, closePool } from './helpers'
import { DATABASE_ENUMS, MANDATORY_ESCALATION_REASONS } from '@/lib/db/enums'

afterAll(closePool)

/**
 * Anti-drift guard. `supabase gen types` needs Docker, which this environment
 * does not have, so src/lib/db/enums.ts is maintained by hand. This test makes
 * that safe: any enum value added, removed or renamed in a migration without
 * updating TypeScript fails CI immediately.
 */
describe('TypeScript enums match the database', () => {
  it('has the same values, in the same order, for every enum', async () => {
    const fromDatabase = await asSuperuser(async (client) => {
      const { rows } = await client.query<{ enum_name: string; values: string[] }>(
        `select t.typname as enum_name,
                -- cast to text[]: node-pg has no parser for the internal name[] type
                array_agg(e.enumlabel::text order by e.enumsortorder) as values
           from pg_type t
           join pg_enum e on e.enumtypid = t.oid
           join pg_namespace n on n.oid = t.typnamespace
          where n.nspname = 'app'
          group by t.typname`,
      )
      return Object.fromEntries(rows.map((r) => [r.enum_name, r.values]))
    })

    expect(Object.keys(fromDatabase).sort()).toEqual(Object.keys(DATABASE_ENUMS).sort())

    for (const [name, values] of Object.entries(DATABASE_ENUMS)) {
      expect(fromDatabase[name], `enum app.${name}`).toEqual([...values])
    }
  })

  it('lists exactly the escalation reasons the database refuses to disable', async () => {
    const fromConstraint = await asSuperuser(async (client) => {
      const { rows } = await client.query<{ definition: string }>(
        `select pg_get_constraintdef(oid) as definition
           from pg_constraint
          where conname = 'escalation_rules_mandatory_reasons_enabled'`,
      )
      return rows[0]!.definition
    })

    for (const reason of MANDATORY_ESCALATION_REASONS) {
      expect(fromConstraint, `mandatory reason ${reason}`).toContain(reason)
    }
  })
})
