import { userInfo } from 'node:os'
import { Pool, type PoolClient } from 'pg'

/**
 * Test harness for the database layer.
 *
 * These tests run against a real PostgreSQL server with the real migrations and
 * the real seed applied (scripts/db-local.sh). They are the only way to prove a
 * Row Level Security policy actually works: RLS cannot be unit-tested in
 * TypeScript, because the thing being tested is the database's own decision.
 *
 * `asUser` reproduces exactly what PostgREST does after it has verified a JWT:
 * it switches to the `authenticated` role and puts the verified claims into the
 * request.jwt.claims setting, which is where auth.uid() reads from.
 */

export const DEMO = {
  orgVindaro: 'a0000000-0000-4000-8000-000000000001',
  orgKestrel: 'a0000000-0000-4000-8000-000000000002',
  locationVindaro: 'b0000000-0000-4000-8000-000000000001',
  locationKestrel: 'b0000000-0000-4000-8000-000000000002',
  users: {
    owner: 'c0000000-0000-4000-8000-000000000001',
    admin: 'c0000000-0000-4000-8000-000000000002',
    manager: 'c0000000-0000-4000-8000-000000000003',
    staff: 'c0000000-0000-4000-8000-000000000004',
    viewer: 'c0000000-0000-4000-8000-000000000005',
    kestrelOwner: 'c0000000-0000-4000-8000-000000000006',
  },
  emails: {
    owner: 'owner.demo@example.com',
    manager: 'manager.demo@example.com',
    staff: 'staff.demo@example.com',
    viewer: 'viewer.demo@example.com',
    kestrelOwner: 'kestrel.owner.demo@example.com',
  },
  menuItems: {
    approvedGnocchi: '31100000-0000-4000-8000-000000000008',
    draftCalamari: '31100000-0000-4000-8000-000000000004',
    pendingBistecca: '31100000-0000-4000-8000-000000000013',
    approvedSorbetto: '31100000-0000-4000-8000-000000000018',
    approvedInsalata: '31100000-0000-4000-8000-000000000015',
  },
  calls: {
    vindaroBookingFailure: '41100000-0000-4000-8000-000000000008',
  },
} as const

let pool: Pool | undefined

export function getPool(): Pool {
  if (!pool) {
    pool = process.env.DATABASE_URL
      ? new Pool({ connectionString: process.env.DATABASE_URL })
      : new Pool({
          // Unix socket: peer authentication, so there is no password to store
          // anywhere for local testing.
          host: process.env.PGHOST ?? '/var/run/postgresql',
          database: process.env.ASTRA_LOCAL_DB ?? 'astra_test',
          user: process.env.PGUSER ?? userInfo().username,
        })
  }
  return pool
}

export async function closePool(): Promise<void> {
  await pool?.end()
  pool = undefined
}

/** Run a query with full privileges (migrations, fixtures, assertions on raw state). */
export async function asSuperuser<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect()
  try {
    return await fn(client)
  } finally {
    client.release()
  }
}

/**
 * Run a block as an authenticated end user, inside a transaction that is always
 * rolled back so tests never contaminate each other.
 */
export async function asUser<T>(
  userId: string,
  fn: (client: PoolClient) => Promise<T>,
  options: { email?: string } = {},
): Promise<T> {
  const client = await getPool().connect()
  try {
    await client.query('begin')
    await client.query('select set_config($1, $2, true)', [
      'request.jwt.claims',
      JSON.stringify({
        sub: userId,
        role: 'authenticated',
        email: options.email ?? 'test@example.com',
        aud: 'authenticated',
      }),
    ])
    await client.query('set local role authenticated')
    return await fn(client)
  } finally {
    await client.query('rollback').catch(() => undefined)
    client.release()
  }
}

/** Run a block as an unauthenticated visitor (the anon role, no JWT). */
export async function asAnon<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect()
  try {
    await client.query('begin')
    await client.query('set local role anon')
    return await fn(client)
  } finally {
    await client.query('rollback').catch(() => undefined)
    client.release()
  }
}

/** Run a block as the trusted backend (service_role, which bypasses RLS). */
export async function asServiceRole<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect()
  try {
    await client.query('begin')
    await client.query('set local role service_role')
    return await fn(client)
  } finally {
    await client.query('rollback').catch(() => undefined)
    client.release()
  }
}

/** Count rows visible to the current session, tolerating a permission denial as 0. */
export async function countVisible(client: PoolClient, table: string): Promise<number> {
  const result = await client.query<{ count: string }>(
    `select count(*)::text as count from public.${table}`,
  )
  return Number(result.rows[0]?.count ?? '0')
}

let savepointCounter = 0

/**
 * Assert that a statement fails, and return the error for further assertions.
 *
 * Recovery uses a SAVEPOINT rather than rollback-and-begin. That matters: the
 * session identity established by asUser is set with SET LOCAL, so rolling the
 * whole transaction back would silently drop back to the superuser role and
 * every later assertion in the same block would be testing nothing.
 */
export async function expectFailure(
  client: PoolClient,
  sql: string,
  params: unknown[] = [],
): Promise<Error> {
  const savepoint = `sp_${++savepointCounter}`
  await client.query(`savepoint ${savepoint}`)
  try {
    await client.query(sql, params)
  } catch (error) {
    await client.query(`rollback to savepoint ${savepoint}`)
    return error as Error
  }
  await client.query(`rollback to savepoint ${savepoint}`)
  throw new Error(`expected the statement to fail but it succeeded: ${sql}`)
}

/**
 * Assert that the current session still holds the identity it was given.
 * Guards against a test silently escalating to superuser mid-block.
 */
export async function assertStillAuthenticated(client: PoolClient): Promise<void> {
  const { rows } = await client.query<{ current_user: string }>('select current_user')
  if (rows[0]?.current_user !== 'authenticated') {
    throw new Error(`session lost its authenticated role (now: ${rows[0]?.current_user})`)
  }
}
