import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildAgentPrompt } from '@/lib/agent/prompt'
import { getDisclosure } from '@/lib/agent/disclosure'
import { AGENT_TOOL_NAMES, TOOL_INPUT_SCHEMAS } from '@/lib/agent/tools'
import type { VoiceAgentConfig } from '@/lib/providers/voice/types'

/**
 * docs/retell-agent/* is the text a person pastes into the Retell dashboard by
 * hand. Milestone 4A has no automatic provisioning, so those files are the only
 * thing standing between the code's guarantees and what a caller actually hears.
 *
 * A stale file here is worse than no file: it looks authoritative while
 * describing an agent that no longer exists. So the same test both writes the
 * files (with ASTRA_WRITE_AGENT_ARTIFACTS=1) and, by default, fails when they
 * have fallen behind the prompt builder, the disclosure wording or the tool
 * allow-list.
 */

/** Matches the seeded demo location, which is what M4A actually deploys. */
const DEMO: VoiceAgentConfig = {
  locationId: 'b0000000-0000-4000-8000-000000000001',
  organisationId: 'a0000000-0000-4000-8000-000000000001',
  locationName: 'Osteria Vindaro',
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'it'],
  voiceId: 'demo-voice',
  greeting: {
    en: 'Good evening, Osteria Vindaro. How can I help?',
    it: 'Buonasera, Osteria Vindaro. Come posso aiutarla?',
  },
  aiDisclosure: { en: null, it: null },
  transferEnabled: false,
  transferNumberE164: null,
  recordingEnabled: false,
  promptVersion: 1,
  providerAgentId: null,
}

const APP_URL = '<YOUR_APP_URL>'
const SECRET = '<ASTRA_TOOL_SHARED_SECRET>'

interface RetellFunction {
  readonly name: string
  readonly description: string
  readonly url: string
  readonly headers: Record<string, string>
  readonly speak_during_execution: boolean
  readonly speak_after_execution: boolean
  readonly parameters: Record<string, unknown>
  /** Not sent to Retell; proves the documented shape is one the endpoint accepts. */
  readonly example: Record<string, unknown>
}

const CALL_ID = {
  type: 'string',
  description: 'The Retell call id. Retell fills this in; never invent it.',
}

function fn(
  name: string,
  description: string,
  properties: Record<string, unknown>,
  required: string[],
  example: Record<string, unknown>,
): RetellFunction {
  return {
    name,
    description,
    url: `${APP_URL}/api/voice/tools/${name}`,
    headers: { 'x-astra-tool-secret': SECRET },
    // Retell holds the line while the call is in flight rather than filling the
    // silence: a spoken filler invented by the model is a fact the restaurant
    // never approved.
    speak_during_execution: false,
    speak_after_execution: false,
    parameters: { type: 'object', properties: { call_id: CALL_ID, ...properties }, required },
    example,
  }
}

const FUNCTIONS: RetellFunction[] = [
  fn(
    'get_business_info',
    'Everything the restaurant has approved about itself: opening hours, when the kitchen stops taking orders, address and directions, phone, plus its own written answers to common questions — parking, accessibility, children, dogs, wifi, the head chef, seating, payment, dress code, groups, anything else it has published. Call this for ANY question about the restaurant that is not a dish or an allergen, and call it before saying you cannot confirm something.',
    {
      topic: {
        type: 'string',
        description: 'What the caller asked about, e.g. "opening hours". Optional.',
      },
    },
    ['call_id'],
    { call_id: 'call_demo', topic: 'opening hours' },
  ),
  fn(
    'search_menu',
    'Search the approved menu. Returns only items the restaurant has approved; unapproved items do not exist as far as this call is concerned.',
    {
      query: { type: 'string', description: 'What the caller asked for, in their own words.' },
      limit: { type: 'integer', description: 'How many items to return. Default is small.' },
    },
    ['call_id'],
    { call_id: 'call_demo', query: 'pasta' },
  ),
  fn(
    'get_allergen_info',
    'Allergen declarations for one dish. SAFETY-CRITICAL: this is the ONLY source of allergen facts. Pass the caller’s own wording in caller_phrasing so a severe allergy can be detected and escalated.',
    {
      menu_item: { type: 'string', description: 'The dish the caller named.' },
      allergen_code: {
        type: 'string',
        description: 'The allergen the caller named, if any, e.g. "peanuts".',
      },
      caller_phrasing: {
        type: 'string',
        description:
          'The caller’s exact words about their allergy. Used only to detect severity; never stored.',
      },
    },
    ['call_id', 'menu_item'],
    {
      call_id: 'call_demo',
      menu_item: 'tagliatelle',
      caller_phrasing: 'I have a severe nut allergy',
    },
  ),
]

const dir = join(process.cwd(), 'docs', 'retell-agent')
const artefacts: Record<string, string> = {
  'system_prompt.txt': `${buildAgentPrompt(DEMO).text}\n`,
  'first_message.txt': `${getDisclosure('en', { locationName: DEMO.locationName, recordingEnabled: false }).full}\n`,
  'tools.json': `${JSON.stringify(FUNCTIONS, null, 2)}\n`,
}

if (process.env.ASTRA_WRITE_AGENT_ARTIFACTS === '1') {
  mkdirSync(dir, { recursive: true })
  for (const [name, content] of Object.entries(artefacts)) {
    writeFileSync(join(dir, name), content)
  }
}

describe('docs/retell-agent artefacts', () => {
  for (const [name, expected] of Object.entries(artefacts)) {
    it(`${name} is in step with the code`, () => {
      expect(existsSync(join(dir, name)), `${name} is missing`).toBe(true)
      expect(
        readFileSync(join(dir, name), 'utf8'),
        `${name} is stale — regenerate with ASTRA_WRITE_AGENT_ARTIFACTS=1`,
      ).toBe(expected)
    })
  }

  it('documents every tool on the allow-list, and no others', () => {
    expect(FUNCTIONS.map((f) => f.name).sort()).toEqual([...AGENT_TOOL_NAMES].sort())
  })

  it('documents payloads the endpoints actually accept', () => {
    // The published parameter schema is hand-written; this proves an argument
    // object built from it survives the same validation the route applies.
    for (const f of FUNCTIONS) {
      const schema = TOOL_INPUT_SCHEMAS[f.name as keyof typeof TOOL_INPUT_SCHEMAS]
      expect(schema.safeParse(f.example).success, f.name).toBe(true)
    }
  })

  it('never carries a real address or a real secret', () => {
    const json = artefacts['tools.json'] as string
    expect(json).toContain('<YOUR_APP_URL>')
    expect(json).toContain('<ASTRA_TOOL_SHARED_SECRET>')
    expect(json).not.toMatch(/https:\/\/(?!<)/)
  })

  it('keeps the safety-critical tool marked as such', () => {
    const allergen = FUNCTIONS.find((f) => f.name === 'get_allergen_info')
    expect(allergen?.description).toMatch(/SAFETY-CRITICAL/)
    expect(allergen?.description).toMatch(/ONLY source of allergen facts/)
  })
})
