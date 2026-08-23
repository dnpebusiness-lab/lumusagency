import type { OrgRole } from '@/lib/db/enums'

/**
 * The permission matrix, as pure functions.
 *
 * This is the *second* enforcement point, not the first. Row Level Security in
 * PostgreSQL is authoritative; these helpers exist so the interface can hide
 * controls a user cannot use and so server actions can fail fast with a
 * readable message instead of a database error.
 *
 * If the two ever disagree, the database wins and this file is the bug.
 * tests/database/rls.test.ts is the check that keeps them aligned.
 */

export type Permission =
  | 'org:view'
  | 'org:manage'
  | 'org:delete'
  | 'billing:view'
  | 'members:manage'
  | 'members:grant_ownership'
  | 'locations:create'
  | 'locations:manage'
  | 'knowledge:view'
  | 'knowledge:edit'
  | 'knowledge:approve'
  | 'agent:configure'
  | 'calls:view'
  | 'calls:annotate'
  | 'reservations:view'
  | 'reservations:manage'
  | 'audit:view'
  | 'retention:configure'

const MATRIX: Record<OrgRole, readonly Permission[]> = {
  organisation_owner: [
    'org:view',
    'org:manage',
    'org:delete',
    'billing:view',
    'members:manage',
    'members:grant_ownership',
    'locations:create',
    'locations:manage',
    'knowledge:view',
    'knowledge:edit',
    'knowledge:approve',
    'agent:configure',
    'calls:view',
    'calls:annotate',
    'reservations:view',
    'reservations:manage',
    'audit:view',
    'retention:configure',
  ],
  organisation_admin: [
    'org:view',
    'org:manage',
    'billing:view',
    'members:manage',
    'locations:create',
    'locations:manage',
    'knowledge:view',
    'knowledge:edit',
    'knowledge:approve',
    'agent:configure',
    'calls:view',
    'calls:annotate',
    'reservations:view',
    'reservations:manage',
    'audit:view',
  ],
  location_manager: [
    'org:view',
    'locations:manage',
    'knowledge:view',
    'knowledge:edit',
    'knowledge:approve',
    'agent:configure',
    'calls:view',
    'calls:annotate',
    'reservations:view',
    'reservations:manage',
  ],
  staff: [
    'org:view',
    'knowledge:view',
    'calls:view',
    'calls:annotate',
    'reservations:view',
    'reservations:manage',
  ],
  viewer: ['org:view', 'knowledge:view', 'calls:view', 'reservations:view'],
}

export function permissionsFor(role: OrgRole): readonly Permission[] {
  return MATRIX[role]
}

export function can(role: OrgRole | null | undefined, permission: Permission): boolean {
  if (!role) return false
  return MATRIX[role].includes(permission)
}

/**
 * A location_manager is additionally scoped to the locations assigned to them.
 * Owners and admins implicitly cover every location in the organisation.
 */
export function canManageLocation(
  role: OrgRole | null | undefined,
  locationId: string,
  assignedLocationIds: readonly string[],
): boolean {
  if (!role) return false
  if (role === 'organisation_owner' || role === 'organisation_admin') return true
  if (role === 'location_manager') return assignedLocationIds.includes(locationId)
  return false
}

export const ROLE_LABELS: Record<OrgRole, { en: string; it: string; description: string }> = {
  organisation_owner: {
    en: 'Owner',
    it: 'Titolare',
    description: 'Full control, including billing and deleting the organisation.',
  },
  organisation_admin: {
    en: 'Administrator',
    it: 'Amministratore',
    description: 'Everything except ownership transfer and deleting the organisation.',
  },
  location_manager: {
    en: 'Location manager',
    it: 'Responsabile sede',
    description: 'Runs the locations assigned to them: menu, knowledge, approvals, agent settings.',
  },
  staff: {
    en: 'Staff',
    it: 'Personale',
    description:
      'Sees calls and reservations, and updates reservations. No settings, no approvals.',
  },
  viewer: {
    en: 'Viewer',
    it: 'Sola lettura',
    description: 'Read-only access to calls, reservations and the knowledge base.',
  },
}

/** Roles a user with the given role is allowed to assign to somebody else. */
export function assignableRoles(role: OrgRole | null | undefined): readonly OrgRole[] {
  if (role === 'organisation_owner') {
    return ['organisation_owner', 'organisation_admin', 'location_manager', 'staff', 'viewer']
  }
  if (role === 'organisation_admin') {
    return ['location_manager', 'staff', 'viewer']
  }
  return []
}
