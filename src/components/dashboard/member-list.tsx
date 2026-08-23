'use client'

import { useActionState } from 'react'
import { inviteMember, updateMemberRole, type ActionState } from '@/app/(dashboard)/actions'
import { ROLE_LABELS } from '@/lib/auth/rbac'
import type { OrgRole } from '@/lib/db/enums'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { Field } from '@/components/ui/field'
import { Input, Select } from '@/components/ui/input'
import { SubmitButton } from '@/components/auth/submit-button'

export interface MemberView {
  id: string
  role: OrgRole
  status: string
  userId: string
  email: string
  fullName: string | null
}

export function MemberList({
  organisationId,
  currentUserId,
  members,
  canManage,
  assignableRoles,
}: {
  organisationId: string
  currentUserId: string
  members: MemberView[]
  canManage: boolean
  assignableRoles: readonly OrgRole[]
}) {
  const [roleState, roleAction] = useActionState<ActionState, FormData>(updateMemberRole, {})
  const [inviteState, inviteAction] = useActionState<ActionState, FormData>(inviteMember, {})

  return (
    <div className="space-y-4">
      {roleState.error ? <Alert tone="danger">{roleState.error}</Alert> : null}
      {roleState.message ? <Alert tone="success">{roleState.message}</Alert> : null}

      <ul className="space-y-2">
        {members.map((member) => {
          const isSelf = member.userId === currentUserId
          return (
            <li
              key={member.id}
              className="border-ink-200 dark:border-ink-800 dark:bg-ink-900 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border bg-white px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{member.fullName ?? member.email}</p>
                <p className="text-ink-500 dark:text-ink-400 truncate text-xs">{member.email}</p>
              </div>

              {member.status !== 'active' ? <Badge tone="warning">{member.status}</Badge> : null}

              <div className="ml-auto">
                {/* A member can never change their own role: the database
                    refuses it, so the control is not offered either. */}
                {canManage && !isSelf && assignableRoles.includes(member.role) ? (
                  <form action={roleAction} className="flex items-center gap-2">
                    <input type="hidden" name="organisationId" value={organisationId} />
                    <input type="hidden" name="memberId" value={member.id} />
                    <label htmlFor={`role-${member.id}`} className="sr-only">
                      Role for {member.email}
                    </label>
                    <Select
                      id={`role-${member.id}`}
                      name="role"
                      defaultValue={member.role}
                      className="h-8 w-44"
                    >
                      {assignableRoles.map((role) => (
                        <option key={role} value={role}>
                          {ROLE_LABELS[role].en}
                        </option>
                      ))}
                    </Select>
                    <button type="submit" className="text-xs underline underline-offset-4">
                      Save
                    </button>
                  </form>
                ) : (
                  <Badge tone={isSelf ? 'accent' : 'neutral'}>
                    {ROLE_LABELS[member.role].en}
                    {isSelf ? ' · you' : ''}
                  </Badge>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {canManage ? (
        <details className="border-ink-200 dark:border-ink-800 dark:bg-ink-900 rounded-md border bg-white p-4">
          <summary className="cursor-pointer text-sm font-medium">Add somebody</summary>
          <form action={inviteAction} className="mt-4 space-y-4" noValidate>
            <input type="hidden" name="organisationId" value={organisationId} />

            {inviteState.error ? <Alert tone="danger">{inviteState.error}</Alert> : null}
            {inviteState.message ? <Alert tone="success">{inviteState.message}</Alert> : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="invite-email"
                label="Email address"
                hint="They need an Astra Voice account already. Emailed invitations arrive in Milestone 7."
                errors={inviteState.fieldErrors?.email}
              >
                <Input name="email" type="email" required />
              </Field>
              <Field id="invite-role" label="Role" errors={inviteState.fieldErrors?.role}>
                <Select name="role" defaultValue="staff">
                  {assignableRoles.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role].en}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <SubmitButton pendingLabel="Adding…">Add member</SubmitButton>
          </form>
        </details>
      ) : null}
    </div>
  )
}
