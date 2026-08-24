#!/usr/bin/env node
// =============================================================================
// bundle-sql.mjs — build paste-ready SQL bundles for the Supabase SQL Editor
// =============================================================================
// The primary route to a hosted project is the CLI (`supabase link` then
// `supabase db push`), which applies supabase/migrations/*.sql individually and
// records them in the migration history. That route needs the CLI installed.
//
// This script produces the same SQL as a handful of files a non-technical
// operator can paste into the Supabase SQL Editor instead. It concatenates the
// migrations in filename order — it never rewrites them — so the two routes
// cannot diverge.
//
// Why four parts and not one:
//   * PART 2 is migration 0011 alone. PostgreSQL refuses to USE an enum value
//     added in the same transaction, and the SQL Editor wraps one submission in
//     one transaction. Merging it into part 1 or 3 makes the paste fail.
//   * PART 4 is the demonstration seed, which must stay optional: it is loaded
//     only into a disposable test project.
//
// Usage: npm run db:bundle
// =============================================================================
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const migrationsDir = join(root, 'supabase', 'migrations')
const distDir = join(root, 'supabase', 'dist')

/** Filename prefix (the timestamp) of the enum-only migration. */
const ENUM_ONLY = '20260824001100'

const migrations = readdirSync(migrationsDir)
  .filter((name) => name.endsWith('.sql'))
  .sort()

const enumIndex = migrations.findIndex((name) => name.startsWith(ENUM_ONLY))
if (enumIndex === -1) {
  throw new Error(
    `bundle-sql: migration ${ENUM_ONLY}* not found — refusing to emit a bundle that would fail on ALTER TYPE ... ADD VALUE`,
  )
}

const parts = [
  {
    file: '01_schema.sql',
    title: 'PART 1 of 4 · Schema, security and the agent read surface',
    files: migrations.slice(0, enumIndex),
  },
  {
    file: '02_event_types.sql',
    title: 'PART 2 of 4 · New call event types (must run on its own)',
    files: [migrations[enumIndex]],
  },
  {
    file: '03_voice.sql',
    title: 'PART 3 of 4 · Privacy controls, voice tools and call ingest',
    files: migrations.slice(enumIndex + 1),
  },
  {
    file: '04_demo_data.sql',
    title: 'PART 4 of 4 · Demonstration data (disposable test projects ONLY)',
    files: [],
    extra: join(root, 'supabase', 'seed.sql'),
  },
]

function header(title) {
  return [
    '-- =============================================================================',
    `-- ${title}`,
    '-- =============================================================================',
    '-- GENERATED FILE — do not edit. Rebuild with: npm run db:bundle',
    '--',
    '-- Astra Voice · concatenation of the migrations in supabase/migrations/, in',
    '-- order, for pasting into the Supabase SQL Editor when the CLI is not',
    '-- available. The CLI path (supabase db push) remains the primary route and',
    '-- applies the same files individually.',
    '--',
    '-- Run the parts IN ORDER. Part 2 exists on its own because PostgreSQL forbids',
    '-- using an enum value in the same transaction that added it, and the SQL Editor',
    '-- wraps a submission in one transaction.',
    '-- =============================================================================',
    '',
  ].join('\n')
}

mkdirSync(distDir, { recursive: true })

for (const part of parts) {
  const chunks = [header(part.title)]
  for (const name of part.files) {
    chunks.push(`-- ─── ${name} ───`)
    chunks.push(readFileSync(join(migrationsDir, name), 'utf8').trimEnd(), '')
  }
  if (part.extra) {
    chunks.push('-- ─── seed.sql ───')
    chunks.push(readFileSync(part.extra, 'utf8').trimEnd(), '')
  }
  const out = chunks.join('\n')
  writeFileSync(join(distDir, part.file), out)
  const lines = out.split('\n').length
  console.log(`  supabase/dist/${part.file}  (${lines} lines)`)
}

console.log('bundle-sql: done')
