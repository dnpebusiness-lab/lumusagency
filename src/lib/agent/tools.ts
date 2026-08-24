import { z } from 'zod'

/**
 * The agent's tool allow-list and its input schemas.
 *
 * Milestone 4A ships three read-only knowledge tools and nothing else. The list
 * is the blast radius of a successful prompt injection: an attacker who fully
 * controls the model's instructions still cannot book, text, transfer or write,
 * because no such tool exists to call.
 *
 * Booking, SMS and transfer arrive in Milestone 5. They are deliberately absent
 * here rather than stubbed, because a stub is something that can accidentally
 * return success.
 */

export const AGENT_TOOL_NAMES = ['get_business_info', 'search_menu', 'get_allergen_info'] as const

export type AgentToolName = (typeof AGENT_TOOL_NAMES)[number]

export function isAgentToolName(value: string): value is AgentToolName {
  return (AGENT_TOOL_NAMES as readonly string[]).includes(value)
}

/**
 * Every tool call carries the vendor call id, which is how the endpoint resolves
 * the location, scopes the rate limit and writes the call event. It is not
 * supplied by the model as free text: the vendor injects it.
 */
const baseInput = z.object({
  call_id: z.string().min(1).max(128),
})

export const getBusinessInfoInput = baseInput.extend({
  /** Optional hint about what the caller asked, used only for the event log. */
  topic: z.string().max(64).optional(),
})

export const searchMenuInput = baseInput.extend({
  query: z.string().max(120).optional(),
  limit: z.coerce.number().int().min(1).max(20).optional(),
})

export const getAllergenInfoInput = baseInput.extend({
  /** Either an exact dish slug or free text the caller used. */
  menu_item: z.string().min(1).max(120),
  /** The allergen code the caller named, if any. */
  allergen_code: z.string().max(40).optional(),
  /** Verbatim caller phrasing, used only to detect severity. Never stored. */
  caller_phrasing: z.string().max(400).optional(),
})

export const TOOL_INPUT_SCHEMAS = {
  get_business_info: getBusinessInfoInput,
  search_menu: searchMenuInput,
  get_allergen_info: getAllergenInfoInput,
} as const satisfies Record<AgentToolName, z.ZodTypeAny>

/**
 * The shape every tool returns.
 *
 * `spoken` is pre-shaped for speech and is what the agent is expected to say;
 * `data` is the structured backing so the model can answer a follow-up without
 * a second round trip. Keeping the spoken form short here, rather than trusting
 * the model to summarise, is what stops the agent reading a menu aloud.
 */
export interface ToolResponse<T = unknown> {
  readonly spoken: string
  readonly data: T
  /** Present when the agent must hand over rather than answer. */
  readonly escalate?: {
    readonly reason: 'severe_allergy' | 'outside_approved_information' | 'tool_failure'
    readonly spoken: string
  }
  /** Carried on every allergen response so it cannot be lost in transit. */
  readonly safety_directive?: string
}

/** Honest failure shape. A tool that cannot answer says so; it never guesses. */
export function toolFailure(
  reason: 'outside_approved_information' | 'tool_failure',
  spoken: string,
): ToolResponse<null> {
  return {
    spoken,
    data: null,
    escalate: { reason, spoken },
  }
}
