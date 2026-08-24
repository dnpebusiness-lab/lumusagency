import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  DISCLOSURE_VERSION,
  allDisclosures,
  assertDisclosurePermitted,
  disclosureNeedsReplay,
  getDisclosure,
  mayCollectCallerData,
} from '@/lib/agent/disclosure'

/**
 * The compliance document is prose: it wraps lines and quotes the scripts inside
 * markdown blockquotes. Comparing raw text would fail on formatting rather than
 * on wording, so both sides are flattened to a single whitespace-normalised
 * string first. The check is still exact on words and punctuation.
 */
function flatten(text: string): string {
  return text
    .split('\n')
    .map((line) => line.replace(/^\s*>\s?/, ''))
    .join(' ')
    .replace(/\s+/g, ' ')
}

const COMPLIANCE_DOC = flatten(
  readFileSync('compliance/06_AI_AND_RECORDING_DISCLOSURE_SCRIPTS.md', 'utf8'),
)

/** TECHNICAL_PRIVACY_REQUIREMENTS.md TPR-2. */
describe('AI and transcription disclosure', () => {
  it('exists in both supported languages', () => {
    for (const language of ['en', 'it'] as const) {
      const script = getDisclosure(language, {
        locationName: 'Osteria Vindaro',
        recordingEnabled: false,
      })
      expect(script.language).toBe(language)
      expect(script.full.length).toBeGreaterThan(40)
    }
  })

  it('states automated assistant, transcription and no recording in English', () => {
    const script = getDisclosure('en', { locationName: 'Osteria Vindaro', recordingEnabled: false })
    expect(script.full).toMatch(/automated assistant/i)
    expect(script.full).toMatch(/transcribed/i)
    expect(script.full).toMatch(/no audio recording/i)
  })

  it('states the same three things in Italian', () => {
    const script = getDisclosure('it', { locationName: 'Osteria Vindaro', recordingEnabled: false })
    expect(script.full).toMatch(/assistente automatico/i)
    expect(script.full).toMatch(/trascritta/i)
    expect(script.full).toMatch(/nessuna|non viene conservata/i)
  })

  it('substitutes the location name', () => {
    const script = getDisclosure('en', {
      locationName: 'Kestrel Coffee House',
      recordingEnabled: false,
    })
    expect(script.full).toContain('Kestrel Coffee House')
    expect(script.full).not.toContain('{location_name}')
  })

  it('selects the no-recording variant when recording is off', () => {
    const script = getDisclosure('en', { locationName: 'X', recordingEnabled: false })
    expect(script.variant).toBe('ai_no_recording')
    expect(assertDisclosurePermitted(script)).toBeNull()
  })

  it('refuses the recorded variant in Milestone 4A', () => {
    const script = getDisclosure('en', { locationName: 'X', recordingEnabled: true })
    expect(script.variant).toBe('ai_with_recording')
    expect(assertDisclosurePermitted(script)).toMatch(/not permitted in Milestone 4A/i)
  })

  it('blocks data collection until the disclosure has completed', () => {
    expect(mayCollectCallerData({ startedAt: null, completedAt: null, interrupted: false })).toBe(
      false,
    )
    expect(
      mayCollectCallerData({
        startedAt: '2026-08-24T10:00:00Z',
        completedAt: null,
        interrupted: true,
      }),
    ).toBe(false)
    expect(
      mayCollectCallerData({
        startedAt: '2026-08-24T10:00:00Z',
        completedAt: '2026-08-24T10:00:06Z',
        interrupted: false,
      }),
    ).toBe(true)
  })

  it('requires a replay when the caller interrupted before it finished', () => {
    expect(
      disclosureNeedsReplay({
        startedAt: '2026-08-24T10:00:00Z',
        completedAt: null,
        interrupted: true,
      }),
    ).toBe(true)
  })

  it('does not replay a disclosure that already completed', () => {
    expect(
      disclosureNeedsReplay({
        startedAt: '2026-08-24T10:00:00Z',
        completedAt: '2026-08-24T10:00:06Z',
        interrupted: true,
      }),
    ).toBe(false)
  })

  it('provides a shorter replay line in each language', () => {
    for (const language of ['en', 'it'] as const) {
      const script = getDisclosure(language, { locationName: 'X', recordingEnabled: false })
      expect(script.replay.length).toBeGreaterThan(20)
      expect(script.replay.length).toBeLessThan(script.full.length + 40)
    }
  })

  it('carries a version on every script', () => {
    for (const script of allDisclosures()) {
      expect(script.version).toBe(DISCLOSURE_VERSION)
    }
  })

  /**
   * Drift guard. The wording a lawyer reviews in the compliance document must be
   * the wording a caller actually hears, so the code and the document are
   * compared rather than trusted to stay in step.
   */
  it('matches the reviewed compliance document word for word', () => {
    for (const script of allDisclosures()) {
      const withPlaceholder = flatten(script.full)
      expect(
        COMPLIANCE_DOC.includes(withPlaceholder),
        `script drifted from compliance doc: [${script.variant}/${script.language}] ${withPlaceholder}`,
      ).toBe(true)
    }
  })

  it('has the replay fragments in the compliance document too', () => {
    for (const script of allDisclosures()) {
      if (script.variant !== 'ai_no_recording') continue
      expect(
        COMPLIANCE_DOC.includes(flatten(script.replay)),
        `replay drifted: ${script.language}`,
      ).toBe(true)
    }
  })
})
