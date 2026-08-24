import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  AGENT_NAME,
  DISCLOSURE_VERSION,
  allDisclosures,
  assertDisclosurePermitted,
  disclosureFragments,
  disclosureNeedsReplay,
  getDisclosure,
  getPrivacyScripts,
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

/**
 * Requirements: TECHNICAL_PRIVACY_REQUIREMENTS.md "Disclosure evidence" and
 * compliance/12_AI_ACT_ARTICLE_50_CHECKLIST.md.
 */
describe('AI and privacy disclosure', () => {
  it('names the assistant, as the AI Act checklist requires', () => {
    for (const language of ['en', 'it'] as const) {
      const script = getDisclosure(language, {
        locationName: 'Osteria Vindaro',
        recordingEnabled: false,
      })
      expect(script.full).toContain(AGENT_NAME)
    }
  })

  it('identifies the restaurant in the first turn', () => {
    for (const language of ['en', 'it'] as const) {
      const script = getDisclosure(language, {
        locationName: 'Osteria Vindaro',
        recordingEnabled: false,
      })
      expect(script.full).toContain('Osteria Vindaro')
      expect(script.full).not.toContain('[Restaurant]')
      expect(script.full).not.toContain('[Ristorante]')
    }
  })

  it('describes transcription without calling it a recording', () => {
    const en = getDisclosure('en', { locationName: 'X', recordingEnabled: false })
    expect(en.full).toMatch(/transcript/i)
    const it = getDisclosure('it', { locationName: 'X', recordingEnabled: false })
    expect(it.full).toMatch(/trascrizione|trascritta/i)
  })

  it('tells the caller a person can be asked for at any time', () => {
    expect(getDisclosure('en', { locationName: 'X', recordingEnabled: false }).full).toMatch(
      /member of staff at any time/i,
    )
    expect(getDisclosure('it', { locationName: 'X', recordingEnabled: false }).full).toMatch(
      /persona in qualsiasi momento/i,
    )
  })

  it('offers the shorter approved phrasing as an alternative', () => {
    for (const language of ['en', 'it'] as const) {
      const short = getDisclosure(language, {
        locationName: 'X',
        recordingEnabled: false,
        length: 'short',
      })
      const full = getDisclosure(language, { locationName: 'X', recordingEnabled: false })
      expect(short.full.length).toBeLessThan(full.full.length)
      expect(short.full).toContain(AGENT_NAME)
    }
  })

  it('never uses "by continuing you consent" as a substitute for a lawful basis', () => {
    for (const script of allDisclosures()) {
      expect(script.full).not.toMatch(/by continuing.{0,20}consent/i)
      expect(script.full).not.toMatch(/proseguendo.{0,20}accett/i)
    }
  })

  it('selects the no-recording variant when recording is off, and permits it', () => {
    const script = getDisclosure('en', { locationName: 'X', recordingEnabled: false })
    expect(script.variant).toBe('ai_no_recording')
    expect(assertDisclosurePermitted(script)).toBeNull()
  })

  it('refuses the recorded-call flow in Milestone 4A', () => {
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

  it('replays the material part, naming the AI and the transcription', () => {
    for (const language of ['en', 'it'] as const) {
      const script = getDisclosure(language, { locationName: 'X', recordingEnabled: false })
      const normalised = script.replay.toLowerCase().replace(/[^a-z ]/g, '')
      for (const fragment of disclosureFragments(language)) {
        expect(normalised, `${language} replay missing "${fragment}"`).toContain(fragment)
      }
    }
  })

  it('carries a version on every script', () => {
    for (const script of allDisclosures()) {
      expect(script.version).toBe(DISCLOSURE_VERSION)
    }
  })

  /**
   * Drift guard against the founder's own reviewed document. The wording a
   * solicitor and the pilot restaurant sign off must be the wording a caller
   * hears, so the two are compared rather than trusted to stay in step.
   */
  it('matches compliance/06 word for word, with the placeholder intact', () => {
    for (const language of ['en', 'it'] as const) {
      for (const length of ['full', 'short'] as const) {
        const script = getDisclosure(language, {
          locationName: language === 'it' ? '[Ristorante]' : '[Restaurant]',
          recordingEnabled: false,
          length,
        })
        expect(
          COMPLIANCE_DOC.includes(flatten(script.full)),
          `drifted from compliance/06: [${language}/${length}] ${script.full}`,
        ).toBe(true)
      }
    }
  })

  it('keeps the privacy answers word for word too', () => {
    for (const language of ['en', 'it'] as const) {
      const scripts = getPrivacyScripts(language)
      expect(
        COMPLIANCE_DOC.includes(flatten(scripts.privacyDetails)),
        `privacy details drifted: ${language}`,
      ).toBe(true)
      expect(
        COMPLIANCE_DOC.includes(flatten(scripts.refusesTranscription)),
        `refusal script drifted: ${language}`,
      ).toBe(true)
    }
  })

  it('has an approved answer for a caller who refuses transcription', () => {
    // A P0 release blocker in voice_qa/VOICE_TEST_CASES.csv, and the one route
    // that cannot be improvised: transcription is required to operate.
    expect(getPrivacyScripts('en').refusesTranscription).toMatch(
      /can’t continue through the AI service/i,
    )
    expect(getPrivacyScripts('it').refusesTranscription).toMatch(/non posso continuare/i)
  })

  it('answers "are you recording me?" accurately', () => {
    expect(getPrivacyScripts('en').privacyDetails).toMatch(/does not store an audio recording/i)
    expect(getPrivacyScripts('it').privacyDetails).toMatch(/non viene salvata una registrazione/i)
  })
})
