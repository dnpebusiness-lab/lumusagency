import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/voice/tools/[tool]/route'
import { rateLimitForTool } from '@/lib/security/rate-limit'
import { toolFailure } from '@/lib/agent/tools'

/**
 * Security paths of the voice tool endpoint.
 *
 * Every case here returns BEFORE the handler constructs a Supabase client, so
 * they exercise the real route with no hosted project. The data paths are
 * covered by tests/database/privacy.test.ts against the real RPCs, and by
 * scripts/replay-webhooks.mjs against a running deployment.
 */

const SECRET = 'test-tool-shared-secret-value-32chars'

function request(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest('https://astra.test/api/voice/tools/get_business_info', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  process.env.ASTRA_VOICE_ACTIVATION_MODE = 'internal_evaluation'
  process.env.ASTRA_TOOL_SHARED_SECRET = SECRET
})

afterEach(() => {
  delete process.env.ASTRA_VOICE_ACTIVATION_MODE
  delete process.env.ASTRA_TOOL_SHARED_SECRET
})

describe('activation gate on the tool endpoint', () => {
  it('refuses every request when the gate is not set', async () => {
    delete process.env.ASTRA_VOICE_ACTIVATION_MODE
    const response = await POST(request({ call_id: 'x' }, { 'x-astra-tool-secret': SECRET }), {
      params: Promise.resolve({ tool: 'get_business_info' }),
    })
    expect(response.status).toBe(403)
  })

  it('refuses when the gate holds any other value', async () => {
    process.env.ASTRA_VOICE_ACTIVATION_MODE = 'production'
    const response = await POST(request({ call_id: 'x' }, { 'x-astra-tool-secret': SECRET }), {
      params: Promise.resolve({ tool: 'get_business_info' }),
    })
    expect(response.status).toBe(403)
  })
})

describe('tool endpoint authentication', () => {
  it('rejects a request with no secret', async () => {
    const response = await POST(request({ call_id: 'x' }), {
      params: Promise.resolve({ tool: 'get_business_info' }),
    })
    expect(response.status).toBe(401)
  })

  it('rejects a wrong secret', async () => {
    const response = await POST(request({ call_id: 'x' }, { 'x-astra-tool-secret': 'wrong' }), {
      params: Promise.resolve({ tool: 'get_business_info' }),
    })
    expect(response.status).toBe(401)
  })

  it('accepts the secret as a bearer token as well', async () => {
    // Reaches past authentication and fails later for want of a database, which
    // is the point: 401 would mean the header form was not recognised.
    const response = await POST(request({ call_id: 'x' }, { authorization: `Bearer ${SECRET}` }), {
      params: Promise.resolve({ tool: 'get_business_info' }),
    }).catch(() => ({ status: 500 }) as { status: number })
    expect(response.status).not.toBe(401)
  })

  it('fails closed when no secret is configured at all', async () => {
    delete process.env.ASTRA_TOOL_SHARED_SECRET
    const response = await POST(request({ call_id: 'x' }, { 'x-astra-tool-secret': '' }), {
      params: Promise.resolve({ tool: 'get_business_info' }),
    })
    expect(response.status).toBe(401)
  })
})

describe('tool allow-list', () => {
  it('refuses a tool that is not on the list', async () => {
    for (const tool of ['create_reservation', 'send_sms', 'request_transfer', 'drop_tables']) {
      const response = await POST(request({ call_id: 'x' }, { 'x-astra-tool-secret': SECRET }), {
        params: Promise.resolve({ tool }),
      })
      expect(response.status, tool).toBe(404)
    }
  })

  it('rejects a malformed body before touching anything', async () => {
    const bad = new NextRequest('https://astra.test/api/voice/tools/get_business_info', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-astra-tool-secret': SECRET },
      body: 'not json',
    })
    const response = await POST(bad, { params: Promise.resolve({ tool: 'get_business_info' }) })
    expect(response.status).toBe(400)
  })

  it('rejects input that fails the schema', async () => {
    const response = await POST(request({ nope: true }, { 'x-astra-tool-secret': SECRET }), {
      params: Promise.resolve({ tool: 'get_business_info' }),
    })
    expect(response.status).toBe(400)
  })
})

describe('failure never becomes a successful spoken result (VQ-032)', () => {
  it('shapes a tool failure as an escalation, not an answer', () => {
    const failure = toolFailure('tool_failure', 'I could not check that just now.')
    expect(failure.data).toBeNull()
    expect(failure.escalate?.reason).toBe('tool_failure')
    expect(failure.spoken).not.toMatch(/yes|confirmed|booked|safe/i)
  })

  it('shapes an unknown question as an honest refusal', () => {
    const failure = toolFailure('outside_approved_information', 'I do not have that confirmed.')
    expect(failure.escalate?.reason).toBe('outside_approved_information')
    expect(failure.data).toBeNull()
  })
})

describe('rate limits (VQ-033)', () => {
  it('defines a bounded ceiling for every tool', () => {
    for (const tool of ['get_business_info', 'search_menu', 'get_allergen_info']) {
      const limit = rateLimitForTool(tool)
      expect(limit.calls).toBeGreaterThan(0)
      expect(limit.calls).toBeLessThanOrEqual(30)
      expect(limit.windowSeconds).toBeGreaterThan(0)
    }
  })

  it('applies a default ceiling to anything unrecognised', () => {
    expect(rateLimitForTool('something_new').calls).toBeGreaterThan(0)
  })
})
