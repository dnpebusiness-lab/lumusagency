import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '../..')

/**
 * Builds the test database from zero before the database suite runs: drop,
 * recreate, apply every migration in order, load the seed.
 *
 * This is also the migration validation itself — if any migration fails to
 * apply to an empty database, the whole suite fails here rather than producing
 * a confusing downstream error.
 */
export default function setup(): void {
  if (process.env.ASTRA_SKIP_DB_SETUP === '1') return

  execFileSync(resolve(repoRoot, 'scripts/db-local.sh'), ['reset'], {
    cwd: repoRoot,
    env: { ...process.env, ASTRA_LOCAL_DB: process.env.ASTRA_LOCAL_DB ?? 'astra_test' },
    stdio: 'inherit',
  })
}
