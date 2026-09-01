import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { INTERNAL_EVALUATION } from '@/lib/security/gate'
import {
  hasRealVoice,
  PLACEHOLDER_VOICE_ID,
  toVoiceAgentConfig,
  type AgentConfigurationRow,
} from '@/lib/agent/config'
import type { VoiceAgentConfig } from '@/lib/providers/voice/types'

/**
 * What "Sync agent" actually sends.
 *
 * Every one of these assertions is a failure that happened on a real call
 * while the agent was configured by hand: an id that pointed at nothing, a
 * tool with no secret header, an engine that was recreated instead of updated.
 * The vendor is mocked because the point is the payload, not the network.
 */

const voiceList = vi.fn()
const llmCreate = vi.fn()
const llmUpdate = vi.fn()
const agentCreate = vi.fn()
const agentUpdate = vi.fn()
const agentRetrieve = vi.fn()

vi.mock('retell-sdk', () => {
  class MockRetell {
    llm = { create: llmCreate, update: llmUpdate }
    agent = { create: agentCreate, update: agentUpdate, retrieve: agentRetrieve }
    voice = { list: voiceList }
  }
  return { default: MockRetell, verify: vi.fn() }
})

const { RetellVoiceProvider } = await import('@/lib/providers/voice/retell')

const CONFIG: VoiceAgentConfig = {
  locationId: 'b0000000-0000-4000-8000-000000000001',
  organisationId: 'a0000000-0000-4000-8000-000000000001',
  locationName: 'Osteria Vindaro',
  timezone: 'Europe/Dublin',
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'it'],
  voiceId: 'retell-Cimo',
  greeting: { en: 'Good evening.', it: 'Buonasera.' },
  aiDisclosure: { en: null, it: null },
  transferEnabled: false,
  transferNumberE164: null,
  recordingEnabled: false,
  promptVersion: 1,
  providerAgentId: null,
}

function provider() {
  return new RetellVoiceProvider({
    apiKey: 'key_test',
    appUrl: 'https://astra.test',
    toolSecret: 'a-shared-secret-long-enough',
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.ASTRA_VOICE_ACTIVATION_MODE = INTERNAL_EVALUATION
  llmCreate.mockResolvedValue({ llm_id: 'llm_new' })
  llmUpdate.mockResolvedValue({ llm_id: 'llm_existing' })
  agentCreate.mockResolvedValue({ agent_id: 'agent_new' })
  agentUpdate.mockResolvedValue({ agent_id: 'agent_existing' })
})

afterEach(() => {
  delete process.env.ASTRA_VOICE_ACTIVATION_MODE
})

describe('syncAgent', () => {
  it('creates an engine and an agent when there is nothing at the vendor yet', async () => {
    const result = await provider().syncAgent(CONFIG)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.providerAgentId).toBe('agent_new')
    expect(result.data.created).toBe(true)
    expect(agentRetrieve).not.toHaveBeenCalled()
    expect(llmCreate).toHaveBeenCalledOnce()
    expect(agentCreate).toHaveBeenCalledOnce()
  })

  it('sends the prompt, the opening line and all three tools in one call', async () => {
    await provider().syncAgent(CONFIG)

    const llm = llmCreate.mock.calls[0]?.[0] as Record<string, unknown>
    expect(llm['start_speaker']).toBe('agent')
    expect(String(llm['general_prompt'])).toContain('You are Astra')
    expect(String(llm['begin_message'])).toContain('AI assistant')

    const tools = llm['general_tools'] as Record<string, unknown>[]
    expect(tools.map((t) => t['name'])).toEqual([
      'get_business_info',
      'search_menu',
      'get_allergen_info',
    ])
    for (const tool of tools) {
      expect(tool['url']).toMatch(/^https:\/\/astra\.test\/api\/voice\/tools\//)
      expect(tool['headers']).toEqual({ 'x-astra-tool-secret': 'a-shared-secret-long-enough' })
      expect(tool['timeout_ms']).toBe(10_000)
      expect(tool['args_at_root']).toBe(false)
      expect(tool['speak_after_execution']).toBe(true)
    }
  })

  it('points the agent at this deployment and keeps audio storage off', async () => {
    await provider().syncAgent(CONFIG)

    const agent = agentCreate.mock.calls[0]?.[0] as Record<string, unknown>
    expect(agent['webhook_url']).toBe('https://astra.test/api/webhooks/retell')
    expect(agent['data_storage_setting']).toBe('basic_attributes_only')
    expect(agent['voice_id']).toBe('retell-Cimo')
    expect(agent['timezone']).toBe('Europe/Dublin')
    expect(agent['language']).toEqual(['en-US', 'it-IT'])
    expect(agent['response_engine']).toEqual({ type: 'retell-llm', llm_id: 'llm_new' })
  })

  it('updates the existing engine in place rather than leaving an orphan', async () => {
    agentRetrieve.mockResolvedValue({
      agent_id: 'agent_existing',
      response_engine: { type: 'retell-llm', llm_id: 'llm_existing' },
    })

    const result = await provider().syncAgent({ ...CONFIG, providerAgentId: 'agent_existing' })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.created).toBe(false)
    expect(llmUpdate).toHaveBeenCalledWith('llm_existing', expect.any(Object))
    expect(llmCreate).not.toHaveBeenCalled()
    expect(agentUpdate).toHaveBeenCalledOnce()
    expect(agentCreate).not.toHaveBeenCalled()
  })

  it('recovers from a stored id that no longer exists at the vendor', async () => {
    // This is exactly what a placeholder like "agent_demo_vindaro" left behind:
    // every call answered, and nothing the caller asked reached the database.
    agentRetrieve.mockRejectedValue(new Error('agent not found'))

    const result = await provider().syncAgent({ ...CONFIG, providerAgentId: 'agent_stale' })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.providerAgentId).toBe('agent_new')
    expect(result.data.created).toBe(true)
  })

  it('refuses without an address to call back to', async () => {
    const p = new RetellVoiceProvider({ apiKey: 'key_test', toolSecret: 'a-secret-long-enough' })
    const result = await p.syncAgent(CONFIG)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.message).toMatch(/NEXT_PUBLIC_APP_URL/)
    expect(agentCreate).not.toHaveBeenCalled()
  })

  it('refuses to publish tools without the secret that protects them', async () => {
    const p = new RetellVoiceProvider({ apiKey: 'key_test', appUrl: 'https://astra.test' })
    const result = await p.syncAgent(CONFIG)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.message).toMatch(/ASTRA_TOOL_SHARED_SECRET/)
    expect(agentCreate).not.toHaveBeenCalled()
  })

  it('refuses when recording is switched on, before reaching the vendor', async () => {
    const result = await provider().syncAgent({ ...CONFIG, recordingEnabled: true })

    expect(result.ok).toBe(false)
    expect(agentCreate).not.toHaveBeenCalled()
    expect(llmCreate).not.toHaveBeenCalled()
  })

  it('stays shut when the activation gate is not open', async () => {
    process.env.ASTRA_VOICE_ACTIVATION_MODE = 'production'
    const result = await provider().syncAgent(CONFIG)

    expect(result.ok).toBe(false)
    expect(agentCreate).not.toHaveBeenCalled()
  })

  it('reports a vendor failure instead of claiming success', async () => {
    agentCreate.mockRejectedValue(new Error('voice_id not found'))
    const result = await provider().syncAgent(CONFIG)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.message).toContain('voice_id not found')
  })
})

describe('listVoices', () => {
  it('describes voices in our own vocabulary, sorted by name', async () => {
    voiceList.mockResolvedValue([
      { voice_id: 'v2', voice_name: 'Nina', gender: 'female', accent: 'Irish' },
      {
        voice_id: 'v1',
        voice_name: 'Cimo',
        gender: 'male',
        accent: 'American',
        preview_audio_url: 'https://audio.test/cimo.mp3',
      },
    ])

    const result = await provider().listVoices()

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.map((v) => v.name)).toEqual(['Cimo', 'Nina'])
    expect(result.data[0]).toEqual({
      id: 'v1',
      name: 'Cimo',
      gender: 'male',
      accent: 'American',
      previewUrl: 'https://audio.test/cimo.mp3',
    })
    expect(result.data[1]?.previewUrl).toBeNull()
  })

  it('stays shut when the activation gate is not open', async () => {
    process.env.ASTRA_VOICE_ACTIVATION_MODE = ''
    const result = await provider().listVoices()

    expect(result.ok).toBe(false)
    expect(voiceList).not.toHaveBeenCalled()
  })
})

const ROW: AgentConfigurationRow = {
  location_id: CONFIG.locationId,
  organisation_id: CONFIG.organisationId,
  default_language: 'en',
  supported_languages: ['en', 'it'],
  greeting_en: 'Good evening.',
  greeting_it: 'Buonasera.',
  ai_disclosure_en: null,
  ai_disclosure_it: null,
  voice_id: 'retell-Cimo',
  retell_agent_id: 'agent_existing',
  transfer_enabled: false,
  transfer_number_e164: null,
  recording_enabled: false,
  prompt_version: 1,
  locations: { name: 'Osteria Vindaro', timezone: 'Europe/Dublin' },
}

describe('reading the configuration out of the database', () => {
  it('carries the location name and timezone across', () => {
    const result = toVoiceAgentConfig(ROW)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.locationName).toBe('Osteria Vindaro')
    expect(result.data.timezone).toBe('Europe/Dublin')
    expect(result.data.providerAgentId).toBe('agent_existing')
  })

  it('accepts the embedded location however the client returns it', () => {
    const result = toVoiceAgentConfig({
      ...ROW,
      locations: [{ name: 'Osteria Vindaro', timezone: 'Europe/Rome' }],
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.timezone).toBe('Europe/Rome')
  })

  it('explains itself rather than sending an agent with no voice', () => {
    const result = toVoiceAgentConfig({ ...ROW, voice_id: null })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.message).toMatch(/voice/i)
  })

  it('treats the seed placeholder as no voice at all', () => {
    // It reads like a value and the vendor rejects it. Refusing here means the
    // person sees "pick a voice", not a vendor error code they cannot act on.
    expect(hasRealVoice(PLACEHOLDER_VOICE_ID)).toBe(false)
    expect(hasRealVoice('retell-Cimo')).toBe(true)

    const result = toVoiceAgentConfig({ ...ROW, voice_id: PLACEHOLDER_VOICE_ID })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.message).toMatch(/no voice has been chosen/i)
  })

  it('refuses a restaurant with recording switched on', () => {
    const result = toVoiceAgentConfig({ ...ROW, recording_enabled: true })
    expect(result.ok).toBe(false)
  })

  it('never leaves the supported-language list empty', () => {
    const result = toVoiceAgentConfig({ ...ROW, supported_languages: null })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.supportedLanguages).toEqual(['en'])
  })
})
