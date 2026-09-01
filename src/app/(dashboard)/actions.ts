'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireSession, assertPermission, membershipFor } from '@/lib/auth/session'
import { ACTIVE_ORG_COOKIE } from '@/lib/auth/active-organisation'
import { assignableRoles } from '@/lib/auth/rbac'
import { locationSchema, memberInviteSchema, organisationSchema } from '@/lib/validation/auth'
import {
  AGENT_CONFIGURATION_COLUMNS,
  toVoiceAgentConfig,
  type AgentConfigurationRow,
} from '@/lib/agent/config'
import { getVoiceProvider } from '@/lib/providers/registry'

export interface ActionState {
  error?: string
  message?: string
  fieldErrors?: Record<string, string[]>
}

function fieldErrorsOf(error: z.ZodError): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '_')
    result[key] = [...(result[key] ?? []), issue.message]
  }
  return result
}

export async function switchOrganisation(formData: FormData): Promise<void> {
  const context = await requireSession()
  const organisationId = String(formData.get('organisationId') ?? '')

  // Only an organisation the user actually belongs to may become active.
  if (!membershipFor(context, organisationId)) return

  const cookieStore = await cookies()
  cookieStore.set(ACTIVE_ORG_COOKIE, organisationId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })

  revalidatePath('/', 'layout')
}

export async function createOrganisation(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession()

  const parsed = organisationSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    timezone: formData.get('timezone') || undefined,
    countryCode: formData.get('countryCode') || undefined,
  })

  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) }

  const supabase = await createServerSupabaseClient()

  // A single SECURITY DEFINER call creates the organisation, the founding owner
  // membership and the trial subscription in one transaction. Doing it as three
  // client-side inserts would leave an orphan organisation on any failure.
  const { data, error } = await supabase.rpc('create_organisation', {
    p_name: parsed.data.name,
    p_slug: parsed.data.slug,
    p_timezone: parsed.data.timezone,
    p_country_code: parsed.data.countryCode,
  })

  if (error) {
    return {
      error:
        error.message.includes('organisations_slug_unique') || error.code === '23505'
          ? 'That address is already taken. Try another one.'
          : 'We could not create the organisation. Please try again.',
    }
  }

  const cookieStore = await cookies()
  cookieStore.set(ACTIVE_ORG_COOKIE, String(data), { httpOnly: true, sameSite: 'lax', path: '/' })

  revalidatePath('/', 'layout')
  redirect('/settings')
}

export async function createLocation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const context = await requireSession()

  const parsed = locationSchema.safeParse({
    organisationId: formData.get('organisationId'),
    name: formData.get('name'),
    slug: formData.get('slug'),
    addressLine1: formData.get('addressLine1') ?? '',
    city: formData.get('city') ?? '',
    postalCode: formData.get('postalCode') ?? '',
    phoneE164: formData.get('phoneE164') ?? '',
    timezone: formData.get('timezone') || undefined,
    maxPartySizeAutoBook: formData.get('maxPartySizeAutoBook') || undefined,
  })

  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) }

  // Fails fast with a readable message. RLS is still the real gate.
  try {
    assertPermission(context, parsed.data.organisationId, 'locations:create')
  } catch {
    return { error: 'You do not have permission to add a location.' }
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('locations').insert({
    organisation_id: parsed.data.organisationId,
    name: parsed.data.name,
    slug: parsed.data.slug,
    address_line1: parsed.data.addressLine1 || null,
    city: parsed.data.city || null,
    postal_code: parsed.data.postalCode || null,
    phone_e164: parsed.data.phoneE164 || null,
    timezone: parsed.data.timezone,
    max_party_size_auto_book: parsed.data.maxPartySizeAutoBook,
  })

  if (error) {
    return {
      error:
        error.code === '23505'
          ? 'A location with that address already exists in this organisation.'
          : 'We could not add the location. Please try again.',
    }
  }

  revalidatePath('/settings')
  return { message: 'Location added.' }
}

export async function updateMemberRole(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await requireSession()

  const parsed = z
    .object({
      organisationId: z.string().uuid(),
      memberId: z.string().uuid(),
      role: z.enum([
        'organisation_owner',
        'organisation_admin',
        'location_manager',
        'staff',
        'viewer',
      ]),
    })
    .safeParse({
      organisationId: formData.get('organisationId'),
      memberId: formData.get('memberId'),
      role: formData.get('role'),
    })

  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) }

  let membership
  try {
    membership = assertPermission(context, parsed.data.organisationId, 'members:manage')
  } catch {
    return { error: 'You do not have permission to change roles.' }
  }

  if (!assignableRoles(membership.role).includes(parsed.data.role)) {
    return { error: 'You cannot assign that role.' }
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('organisation_members')
    .update({ role: parsed.data.role })
    .eq('id', parsed.data.memberId)
    .eq('organisation_id', parsed.data.organisationId)

  if (error) {
    // The database guards are the authority here: self-promotion, granting
    // ownership without being an owner, and removing the last owner all raise.
    return { error: humaniseDatabaseError(error.message) }
  }

  revalidatePath('/settings')
  return { message: 'Role updated.' }
}

export async function inviteMember(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const context = await requireSession()

  const parsed = memberInviteSchema.safeParse({
    organisationId: formData.get('organisationId'),
    email: formData.get('email'),
    role: formData.get('role'),
  })

  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) }

  let membership
  try {
    membership = assertPermission(context, parsed.data.organisationId, 'members:manage')
  } catch {
    return { error: 'You do not have permission to invite people.' }
  }

  if (!assignableRoles(membership.role).includes(parsed.data.role)) {
    return { error: 'You cannot assign that role.' }
  }

  const supabase = await createServerSupabaseClient()

  // V1 invites an existing account. Emailing an invitation to somebody with no
  // account requires the Supabase admin API and is Milestone 7 work; saying so
  // is better than pretending an email was sent.
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', parsed.data.email)
    .maybeSingle()

  if (!profile) {
    return {
      error:
        'That person does not have an Astra Voice account yet. Ask them to create one first, then invite them.',
    }
  }

  const { error } = await supabase.from('organisation_members').insert({
    organisation_id: parsed.data.organisationId,
    user_id: profile.id,
    role: parsed.data.role,
    status: 'active',
    invited_by: context.userId,
    accepted_at: new Date().toISOString(),
  })

  if (error) {
    return {
      error:
        error.code === '23505'
          ? 'That person is already a member of this organisation.'
          : humaniseDatabaseError(error.message),
    }
  }

  revalidatePath('/settings')
  return { message: 'Member added.' }
}

/**
 * Choose the voice a caller hears.
 *
 * Small on its own, and the reason it exists is not: without it the only way
 * to set a voice is a SQL statement pasted into a database console, and the
 * value it needs is an identifier that only exists inside the vendor's
 * dashboard. That is two places to make a typo before a single call is made.
 */
export async function updateAgentVoice(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await requireSession()
  const organisationId = String(formData.get('organisationId') ?? '')
  const locationId = String(formData.get('locationId') ?? '')
  const voiceId = String(formData.get('voiceId') ?? '').trim()

  try {
    assertPermission(context, organisationId, 'agent:configure')
  } catch {
    return { error: 'You do not have permission to configure the agent.' }
  }

  if (!voiceId) return { error: 'Choose a voice first.' }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('agent_configurations')
    .update({ voice_id: voiceId })
    .eq('location_id', locationId)
    .eq('organisation_id', organisationId)

  if (error) return { error: 'We could not save that voice.' }

  revalidatePath('/settings')
  return { message: 'Voice saved. Synchronise to send it to the phone line.' }
}

/**
 * Push this restaurant's configuration to the voice vendor.
 *
 * This exists because the alternative — typing twenty fields into the vendor's
 * dashboard — is what actually broke the agent, repeatedly: a header in the
 * wrong box, a tool timeout left at the vendor's default, an agent id in the
 * database that pointed at nothing. Everything the vendor needs now comes from
 * the row the manager already edits, and pressing this button overwrites all
 * of it.
 *
 * The activation gate still applies: this is the internal, non-paying
 * technical evaluation described in RETELL_VENDOR_CONSTRAINTS.md, not
 * self-service provisioning.
 */
export async function syncVoiceAgent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const context = await requireSession()
  const organisationId = String(formData.get('organisationId') ?? '')
  const locationId = String(formData.get('locationId') ?? '')

  try {
    assertPermission(context, organisationId, 'agent:configure')
  } catch {
    return { error: 'You do not have permission to configure the agent.' }
  }

  const supabase = await createServerSupabaseClient()
  const { data: row, error } = await supabase
    .from('agent_configurations')
    .select(AGENT_CONFIGURATION_COLUMNS)
    .eq('location_id', locationId)
    .eq('organisation_id', organisationId)
    .maybeSingle()

  if (error) return { error: 'We could not read this restaurant’s agent settings.' }
  if (!row) {
    return {
      error:
        'This restaurant has no agent settings yet, so there is nothing to send to the vendor.',
    }
  }

  const config = toVoiceAgentConfig(row as unknown as AgentConfigurationRow)
  if (!config.ok) return { error: config.error.message }

  const provider = getVoiceProvider()
  if (!provider.ok) return { error: provider.error.message }

  const synced = await provider.data.syncAgent(config.data)
  // Deliberately verbatim. A synchronisation that half-worked and reported
  // success is the failure this whole button was built to end.
  if (!synced.ok) return { error: synced.error.message }

  const { error: writeError } = await supabase
    .from('agent_configurations')
    .update({ retell_agent_id: synced.data.providerAgentId, synced_at: synced.data.syncedAt })
    .eq('location_id', locationId)

  if (writeError) {
    return {
      error: `The agent was updated at the vendor (id ${synced.data.providerAgentId}) but we could not record that here. Nothing is lost; try again.`,
    }
  }

  revalidatePath('/settings')

  return {
    message: synced.data.created
      ? `A new agent was created: ${synced.data.providerAgentId}. Point your phone number at it in the vendor dashboard — the old agent is still answering until you do.`
      : `Agent ${synced.data.providerAgentId} updated. Prompt, opening line and all three tools were overwritten with what is in this database.`,
  }
}

/**
 * Turns a database guard into something a restaurant manager can act on,
 * without leaking schema internals into the browser.
 */
function humaniseDatabaseError(message: string): string {
  if (message.includes('cannot change their own role')) return 'You cannot change your own role.'
  if (message.includes('only an organisation owner'))
    return 'Only an owner can grant or remove ownership.'
  if (message.includes('at least one active owner'))
    return 'An organisation must always have at least one owner.'
  if (message.includes('platform_role')) return 'That change is not allowed.'
  return 'We could not save that change.'
}
