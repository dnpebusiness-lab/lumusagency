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
