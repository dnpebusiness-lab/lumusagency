/**
 * Flatten a voice vendor's custom-function envelope into the flat object the
 * tool schemas describe.
 *
 * Retell posts { call, name, args } to a custom function rather than the flat
 * body — verified against what the dashboard actually sends. Our fixtures and
 * tests post the flat form. Both must work: the flat form is the contract, the
 * envelope is one vendor's packaging of it, and keeping the translation here
 * rather than in the route means a second provider costs one function.
 */
export function normaliseToolInput(raw: unknown): unknown {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return raw
  const body = raw as Record<string, unknown>

  if (typeof body.call_id === 'string') return body

  const call = body.call
  const callId =
    typeof call === 'object' && call !== null
      ? (call as Record<string, unknown>).call_id
      : undefined
  if (typeof callId !== 'string') return body

  const args =
    typeof body.args === 'object' && body.args !== null && !Array.isArray(body.args)
      ? (body.args as Record<string, unknown>)
      : {}

  // call_id is written LAST, deliberately. It decides which call — and so which
  // restaurant — this request may read, and it must come from the vendor's own
  // call object, never from args the model composed. If a model-supplied
  // args.call_id could win, a prompt-injected agent could name somebody else's
  // call and read another tenant's data.
  return { ...args, call_id: callId }
}
