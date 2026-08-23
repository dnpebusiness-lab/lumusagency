import { afterAll, describe, expect, it } from 'vitest'
import { asAnon, asSuperuser, asUser, closePool, expectFailure } from './helpers'

afterAll(closePool)

const NEWCOMER = '00000000-0000-4000-8000-00000000cafe'

describe('organisation bootstrap', () => {
  it('creates the organisation, the owner membership and the trial subscription in one call', async () => {
    await asSuperuser(async (setup) => {
      await setup.query(
        `insert into auth.users (id, aud, role, email)
         values ($1, 'authenticated', 'authenticated', 'founder@example.com')
         on conflict (id) do nothing`,
        [NEWCOMER],
      )
    })

    try {
      const orgId = await asUser(NEWCOMER, async (client) => {
        const { rows } = await client.query<{ create_organisation: string }>(
          `select public.create_organisation('Trattoria Test', 'trattoria-test')`,
        )
        const id = rows[0]!.create_organisation

        const membership = await client.query<{ role: string; status: string }>(
          'select role, status from public.organisation_members where organisation_id = $1',
          [id],
        )
        expect(membership.rows).toHaveLength(1)
        expect(membership.rows[0]).toMatchObject({ role: 'organisation_owner', status: 'active' })

        const subscription = await client.query(
          'select 1 from public.subscriptions where organisation_id = $1',
          [id],
        )
        expect(subscription.rowCount).toBe(1)

        return id
      })

      expect(orgId).toMatch(/^[0-9a-f-]{36}$/)
    } finally {
      await asSuperuser(async (client) => {
        await client.query('delete from public.organisations where slug = $1', ['trattoria-test'])
        await client.query('delete from auth.users where id = $1', [NEWCOMER])
      })
    }
  })

  it('refuses to run without an authenticated user', async () => {
    await asAnon(async (client) => {
      const error = await expectFailure(
        client,
        `select public.create_organisation('Anon Co', 'anon-co')`,
      )
      expect(error.message).toMatch(/permission denied|authentication required/i)
    })
  })

  it('rejects a slug that does not match the required format', async () => {
    await asSuperuser(async (setup) => {
      await setup.query(
        `insert into auth.users (id, aud, role, email)
         values ($1, 'authenticated', 'authenticated', 'founder2@example.com')
         on conflict (id) do nothing`,
        [NEWCOMER],
      )
    })

    try {
      await asUser(NEWCOMER, async (client) => {
        const error = await expectFailure(
          client,
          `select public.create_organisation('Bad Slug', 'Bad Slug!')`,
        )
        expect(error.message).toMatch(/organisations_slug_format/)
      })
    } finally {
      await asSuperuser(async (client) => {
        await client.query('delete from auth.users where id = $1', [NEWCOMER])
      })
    }
  })
})
