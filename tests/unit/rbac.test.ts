import { describe, expect, it } from 'vitest'
import { ORG_ROLES } from '@/lib/db/enums'
import {
  assignableRoles,
  can,
  canManageLocation,
  permissionsFor,
  ROLE_LABELS,
} from '@/lib/auth/rbac'

describe('permission matrix', () => {
  it('covers every organisation role', () => {
    for (const role of ORG_ROLES) {
      expect(permissionsFor(role).length, role).toBeGreaterThan(0)
      expect(ROLE_LABELS[role]).toBeDefined()
    }
  })

  it('gives a viewer no write permission at all', () => {
    const writePermissions = permissionsFor('viewer').filter((permission) =>
      /manage|edit|approve|configure|create|delete|annotate/.test(permission),
    )
    expect(writePermissions).toEqual([])
  })

  it('nests the roles: viewer ⊂ staff ⊂ location_manager', () => {
    const viewer = new Set(permissionsFor('viewer'))
    const staff = new Set(permissionsFor('staff'))
    const manager = new Set(permissionsFor('location_manager'))

    for (const permission of viewer) expect(staff.has(permission), permission).toBe(true)
    for (const permission of staff) expect(manager.has(permission), permission).toBe(true)
  })

  it('lets only owners and admins approve content', () => {
    expect(can('organisation_owner', 'knowledge:approve')).toBe(true)
    expect(can('organisation_admin', 'knowledge:approve')).toBe(true)
    expect(can('location_manager', 'knowledge:approve')).toBe(true)
    expect(can('staff', 'knowledge:approve')).toBe(false)
    expect(can('viewer', 'knowledge:approve')).toBe(false)
  })

  it('reserves deletion and billing changes for the owner', () => {
    expect(can('organisation_owner', 'org:delete')).toBe(true)
    expect(can('organisation_admin', 'org:delete')).toBe(false)
    expect(can('organisation_owner', 'retention:configure')).toBe(true)
    expect(can('organisation_admin', 'retention:configure')).toBe(false)
  })

  it('hides audit logs from staff and viewers', () => {
    expect(can('organisation_admin', 'audit:view')).toBe(true)
    expect(can('location_manager', 'audit:view')).toBe(false)
    expect(can('staff', 'audit:view')).toBe(false)
    expect(can('viewer', 'audit:view')).toBe(false)
  })

  it('treats a missing role as no permission', () => {
    expect(can(null, 'org:view')).toBe(false)
    expect(can(undefined, 'calls:view')).toBe(false)
  })
})

describe('location scoping', () => {
  const assigned = ['loc-a']

  it('lets owners and admins manage any location', () => {
    expect(canManageLocation('organisation_owner', 'loc-z', [])).toBe(true)
    expect(canManageLocation('organisation_admin', 'loc-z', [])).toBe(true)
  })

  it('restricts a location manager to their assigned locations', () => {
    expect(canManageLocation('location_manager', 'loc-a', assigned)).toBe(true)
    expect(canManageLocation('location_manager', 'loc-b', assigned)).toBe(false)
  })

  it('lets staff and viewers manage nothing', () => {
    expect(canManageLocation('staff', 'loc-a', assigned)).toBe(false)
    expect(canManageLocation('viewer', 'loc-a', assigned)).toBe(false)
  })
})

describe('role assignment', () => {
  it('lets only an owner grant ownership', () => {
    expect(assignableRoles('organisation_owner')).toContain('organisation_owner')
    expect(assignableRoles('organisation_admin')).not.toContain('organisation_owner')
    expect(assignableRoles('organisation_admin')).not.toContain('organisation_admin')
  })

  it('lets nobody below admin assign a role', () => {
    expect(assignableRoles('location_manager')).toEqual([])
    expect(assignableRoles('staff')).toEqual([])
    expect(assignableRoles('viewer')).toEqual([])
    expect(assignableRoles(null)).toEqual([])
  })
})
