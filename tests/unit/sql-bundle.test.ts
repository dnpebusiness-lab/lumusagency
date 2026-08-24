import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * supabase/dist/*.sql is a generated convenience: the same migrations, glued
 * together so a non-technical operator can paste them into the Supabase SQL
 * Editor without installing the CLI.
 *
 * A generated file that silently goes stale is worse than no generated file at
 * all — it would apply an older schema to a real project while looking current.
 * These tests fail the moment a migration is added, renamed or edited without
 * `npm run db:bundle`.
 */

const root = process.cwd()
const migrationsDir = join(root, 'supabase', 'migrations')
const distDir = join(root, 'supabase', 'dist')

const migrations = readdirSync(migrationsDir)
  .filter((name) => name.endsWith('.sql'))
  .sort()

const bundles = ['01_schema.sql', '02_event_types.sql', '03_voice.sql', '04_demo_data.sql'].map(
  (name) => ({ name, text: readFileSync(join(distDir, name), 'utf8') }),
)

const schemaBundles = bundles.slice(0, 3)

describe('supabase/dist SQL bundles', () => {
  it('carries every migration, in full', () => {
    const all = schemaBundles.map((b) => b.text).join('\n')
    for (const name of migrations) {
      const body = readFileSync(join(migrationsDir, name), 'utf8').trimEnd()
      expect(all, `${name} is missing from the bundles — run npm run db:bundle`).toContain(body)
    }
  })

  it('includes each migration exactly once', () => {
    const all = schemaBundles.map((b) => b.text).join('\n')
    for (const name of migrations) {
      const markers = all.split(`─── ${name} ───`).length - 1
      expect(markers, name).toBe(1)
    }
  })

  it('keeps the enum migration alone in part 2', () => {
    // PostgreSQL refuses to use an enum value added in the same transaction, and
    // the SQL Editor wraps one submission in one transaction. If ALTER TYPE ...
    // ADD VALUE ever shares a part with the code that uses it, the paste fails
    // on a real project.
    const part2 = bundles[1]!
    expect((part2.text.match(/─── \d+_/g) ?? []).length).toBe(1)
    expect(part2.text).toMatch(/alter type app\.call_event_type add value/)
    for (const bundle of [bundles[0]!, bundles[2]!]) {
      expect(bundle.text, bundle.name).not.toMatch(/alter type .* add value/i)
    }
  })

  it('keeps the demonstration seed in its own optional part', () => {
    const seed = readFileSync(join(root, 'supabase', 'seed.sql'), 'utf8').trimEnd()
    expect(bundles[3]!.text).toContain(seed)
    for (const bundle of schemaBundles) {
      expect(bundle.text, bundle.name).not.toContain('Osteria Vindaro')
    }
  })

  it('tells the reader not to edit it by hand', () => {
    for (const bundle of bundles) {
      expect(bundle.text, bundle.name).toContain('GENERATED FILE')
      expect(bundle.text, bundle.name).toContain('npm run db:bundle')
    }
  })
})
