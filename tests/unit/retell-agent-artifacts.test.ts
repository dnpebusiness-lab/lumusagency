import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildAgentPrompt } from '@/lib/agent/prompt'
import { getDisclosure } from '@/lib/agent/disclosure'
import { AGENT_TOOL_NAMES, TOOL_INPUT_SCHEMAS } from '@/lib/agent/tools'
import {
  buildRetellAgentImport,
  buildRetellTools,
  type RetellDefinitionInput,
} from '@/lib/providers/voice/retell/definition'
import type { VoiceAgentConfig } from '@/lib/providers/voice/types'

/**
 * docs/retell-agent/* is the agent on paper: what the application sends when
 * you press "Sync agent", written out so it can be read, reviewed, or imported
 * by hand if the application cannot reach the vendor.
 *
 * It is generated from the same builders the adapter uses, so the two cannot
 * disagree. A stale file here would be worse than no file — it would look
 * authoritative while describing an agent that no longer exists — so the same
 * test both writes the files (with ASTRA_WRITE_AGENT_ARTIFACTS=1) and, by
 * default, fails when they have fallen behind the code.
 */

/** Matches the seeded demo location, which is what M4A actually deploys. */
const DEMO: VoiceAgentConfig = {
  locationId: 'b0000000-0000-4000-8000-000000000001',
  organisationId: 'a0000000-0000-4000-8000-000000000001',
  locationName: 'Osteria Vindaro',
  timezone: 'Europe/Dublin',
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'it'],
  voiceId: 'retell-Cimo',
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

/**
 * The published files must never carry a real address or a real secret: they
 * live in the repository, and a rotated secret pasted into a doc is a secret
 * that is no longer rotated.
 */
const INPUT: RetellDefinitionInput = {
  config: DEMO,
  appUrl: '<YOUR_APP_URL>',
  toolSecret: '<ASTRA_TOOL_SHARED_SECRET>',
}

/**
 * One argument object per tool, in the shape the published parameter schema
 * describes. Proving these pass the route's own validation is what stops the
 * documented schema and the accepted schema from drifting apart.
 */
const EXAMPLES: Record<string, Record<string, unknown>> = {
  get_business_info: { call_id: 'call_demo', topic: 'opening hours' },
  search_menu: { call_id: 'call_demo', query: 'pasta' },
  get_allergen_info: {
    call_id: 'call_demo',
    menu_item: 'tagliatelle',
    caller_phrasing: 'I have a severe nut allergy',
  },
}

const TOOLS = buildRetellTools(INPUT)
const AGENT = buildRetellAgentImport(INPUT)

const dir = join(process.cwd(), 'docs', 'retell-agent')
const artefacts: Record<string, string> = {
  'system_prompt.txt': `${buildAgentPrompt(DEMO).text}\n`,
  'first_message.txt': `${getDisclosure('en', { locationName: DEMO.locationName, recordingEnabled: false }).full}\n`,
  'tools.json': `${JSON.stringify(TOOLS, null, 2)}\n`,
  'agent.json': `${JSON.stringify(AGENT, null, 2)}\n`,
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

  it('publishes every tool on the allow-list, and no others', () => {
    expect(TOOLS.map((t) => t.name).sort()).toEqual([...AGENT_TOOL_NAMES].sort())
  })

  it('publishes payloads the endpoints actually accept', () => {
    for (const tool of TOOLS) {
      const schema = TOOL_INPUT_SCHEMAS[tool.name as keyof typeof TOOL_INPUT_SCHEMAS]
      expect(schema.safeParse(EXAMPLES[tool.name]).success, tool.name).toBe(true)
    }
  })

  it('never carries a real address or a real secret', () => {
    for (const [name, content] of Object.entries(artefacts)) {
      expect(content, name).not.toMatch(/https:\/\/(?!<)/)
    }
    expect(artefacts['tools.json']).toContain('<YOUR_APP_URL>')
    expect(artefacts['tools.json']).toContain('<ASTRA_TOOL_SHARED_SECRET>')
  })

  it('carries the whole configuration in one importable document', () => {
    const agent = JSON.parse(artefacts['agent.json'] as string)
    expect(agent.retellLlmData.general_tools).toHaveLength(3)
    expect(agent.retellLlmData.start_speaker).toBe('agent')
    expect(agent.retellLlmData.begin_message).toContain('AI assistant')
    expect(agent.data_storage_setting).toBe('basic_attributes_only')
    expect(agent.timezone).toBe('Europe/Dublin')
    expect(agent.language).toEqual(['en-US', 'it-IT'])
    expect(agent.webhook_url).toBe('<YOUR_APP_URL>/api/webhooks/retell')
    // An import creates its own ids; a copied one would edit somebody else's agent.
    expect(agent.agent_id).toBeUndefined()
    expect(agent.response_engine.llm_id).toBeUndefined()
  })

  it('sets every tool field that has cost a live call', () => {
    for (const tool of TOOLS) {
      // The vendor's own two-minute default is a caller listening to silence.
      expect(tool.timeout_ms).toBe(10_000)
      // args_at_root true would strip the call object the endpoint reads the
      // restaurant from, and every answer would come back empty.
      expect(tool.args_at_root).toBe(false)
      expect(tool.speak_during_execution).toBe(false)
      // Without this the agent looks the answer up and then says nothing.
      expect(tool.speak_after_execution).toBe(true)
      expect(Object.keys(tool.headers ?? {})).toEqual(['x-astra-tool-secret'])
      expect(tool.url).toBe(`<YOUR_APP_URL>/api/voice/tools/${tool.name}`)
    }
    // end_call is absent on purpose: the prompt says no other tool exists.
    expect(TOOLS.map((t) => t.name)).not.toContain('end_call')
  })

  it('keeps the safety-critical tool marked as such', () => {
    const allergen = TOOLS.find((t) => t.name === 'get_allergen_info')
    expect(allergen?.description).toMatch(/SAFETY-CRITICAL/)
    expect(allergen?.description).toMatch(/ONLY source of allergen facts/)
  })

  it('trims a trailing slash rather than publishing a doubled path', () => {
    const [tool] = buildRetellTools({ ...INPUT, appUrl: 'https://example.test/' })
    expect(tool?.url).toBe('https://example.test/api/voice/tools/get_business_info')
  })
})
