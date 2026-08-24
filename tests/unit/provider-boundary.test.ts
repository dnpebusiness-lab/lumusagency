import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Structural tests, not behavioural ones. They enforce the two boundaries that
 * documentation alone has never once kept intact on a real codebase.
 */

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) sourceFiles(full, out)
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full)
  }
  return out
}

const FILES = sourceFiles('src')

describe('vendor SDK boundary', () => {
  it('confines retell-sdk imports to the Retell adapter', () => {
    const offenders = FILES.filter(
      (file) =>
        /from\s+['"]retell-sdk['"]|require\(['"]retell-sdk['"]\)/.test(
          readFileSync(file, 'utf8'),
        ) && !file.startsWith(join('src', 'lib', 'providers', 'voice', 'retell')),
    )
    expect(
      offenders,
      'Only the Retell adapter may import the vendor SDK. See ARCHITECTURE.md section 3.',
    ).toEqual([])
  })

  it('keeps the adapter behind the VoiceProvider interface for application code', () => {
    const offenders = FILES.filter((file) => {
      if (file.startsWith(join('src', 'lib', 'providers'))) return false
      return /from\s+['"]@\/lib\/providers\/voice\/retell/.test(readFileSync(file, 'utf8'))
    })
    expect(offenders, 'Resolve the provider through getVoiceProvider() instead.').toEqual([])
  })
})

describe('service-role boundary', () => {
  it('never uses the service-role client outside webhook, tool and cron paths', () => {
    const allowed = [
      join('src', 'lib', 'supabase', 'server.ts'),
      join('src', 'app', 'api', 'webhooks'),
      join('src', 'app', 'api', 'voice'),
      join('src', 'app', 'api', 'cron'),
    ]
    const offenders = FILES.filter((file) => {
      if (allowed.some((prefix) => file.startsWith(prefix))) return false
      return /createServiceRoleClient/.test(readFileSync(file, 'utf8'))
    })
    expect(
      offenders,
      'The service role bypasses RLS and belongs only to trusted server paths.',
    ).toEqual([])
  })

  it('never exposes a secret through a NEXT_PUBLIC_ variable', () => {
    const offenders: string[] = []
    for (const file of FILES) {
      const source = readFileSync(file, 'utf8')
      for (const match of source.matchAll(/NEXT_PUBLIC_[A-Z0-9_]+/g)) {
        if (/SECRET|SERVICE_ROLE|API_KEY|TOKEN|PASSWORD|SALT/.test(match[0])) {
          offenders.push(`${file}: ${match[0]}`)
        }
      }
    }
    expect(offenders).toEqual([])
  })
})

describe('prohibited features (TPR-6)', () => {
  it('contains no voice biometrics, cloning, profiling or training feature', () => {
    const forbidden = [
      /voice[_-]?clon/i,
      /speaker[_-]?identif/i,
      /voice[_-]?print/i,
      /biometric/i,
      /emotion[_-]?recognition/i,
      /caller[_-]?profil/i,
      /train(ing)?[_-]?on[_-]?call/i,
    ]
    const offenders: string[] = []
    for (const file of FILES) {
      const source = readFileSync(file, 'utf8')
      for (const pattern of forbidden) {
        // The prohibition list in a comment is allowed; a real identifier is not.
        const hit = source.match(pattern)
        if (
          hit &&
          !/TPR-6|prohibited|never|must not|forbidden/i.test(
            source.slice(Math.max(0, (hit.index ?? 0) - 200), (hit.index ?? 0) + 200),
          )
        ) {
          offenders.push(`${file}: ${hit[0]}`)
        }
      }
    }
    expect(offenders).toEqual([])
  })

  it('never enables vendor audio storage', () => {
    const adapter = readFileSync(
      join('src', 'lib', 'providers', 'voice', 'retell', 'index.ts'),
      'utf8',
    )
    expect(adapter).toMatch(/opt_out_sensitive_data_storage:\s*true/)
  })

  it('never persists a recording url from the mapper', () => {
    const mapper = readFileSync(
      join('src', 'lib', 'providers', 'voice', 'retell', 'mapper.ts'),
      'utf8',
    )
    // The mapper may notice a recording URL, but must not carry it across.
    expect(mapper).toMatch(/recordingUrlDiscarded/)
    expect(mapper).not.toMatch(/recordingUrl:\s*call\.recording_url/)
  })
})
