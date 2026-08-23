import { afterAll, describe, expect, it } from 'vitest'
import { DEMO, asSuperuser, asUser, closePool, expectFailure } from './helpers'

afterAll(closePool)

/**
 * The approval gate is the mechanism behind the allergen guarantee. These tests
 * exercise it at the database level, where it is enforced, rather than through
 * the UI, where it is merely displayed.
 */
describe('approval gate', () => {
  it('lets a location manager approve content for their location', async () => {
    await asUser(DEMO.users.manager, async (client) => {
      const { rows } = await client.query<{ approval_status: string; approved_by: string | null }>(
        `update public.menu_items
            set approval_status = 'approved'
          where id = $1
        returning approval_status, approved_by`,
        [DEMO.menuItems.draftCalamari],
      )

      expect(rows[0]?.approval_status).toBe('approved')
      expect(rows[0]?.approved_by).toBe(DEMO.users.manager)
    })
  })

  it('refuses approval from staff', async () => {
    await asUser(DEMO.users.staff, async (client) => {
      const result = await client.query(
        `update public.menu_items set approval_status = 'approved' where id = $1`,
        [DEMO.menuItems.draftCalamari],
      )
      // RLS hides the row from the UPDATE entirely, so nothing is approved.
      expect(result.rowCount).toBe(0)
    })
  })

  it('refuses approval from a manager of a different organisation', async () => {
    await asUser(DEMO.users.kestrelOwner, async (client) => {
      const result = await client.query(
        `update public.menu_items set approval_status = 'approved' where id = $1`,
        [DEMO.menuItems.draftCalamari],
      )
      expect(result.rowCount).toBe(0)
    })
  })

  it('un-approves a row whose content changes without a new approval decision', async () => {
    await asUser(DEMO.users.manager, async (client) => {
      const before = await client.query<{ approval_status: string }>(
        'select approval_status from public.menu_items where id = $1',
        [DEMO.menuItems.approvedGnocchi],
      )
      expect(before.rows[0]?.approval_status).toBe('approved')

      const { rows } = await client.query<{
        approval_status: string
        approved_by: string | null
        approved_at: string | null
        version: number
      }>(
        `update public.menu_items set price_cents = 1900 where id = $1
         returning approval_status, approved_by, approved_at, version`,
        [DEMO.menuItems.approvedGnocchi],
      )

      // Changing a price silently would let the agent quote a price nobody signed off.
      expect(rows[0]?.approval_status).toBe('draft')
      expect(rows[0]?.approved_by).toBeNull()
      expect(rows[0]?.approved_at).toBeNull()
      expect(rows[0]?.version).toBe(2)
    })
  })

  it('un-approves an allergen row when its declared presence changes', async () => {
    await asUser(DEMO.users.manager, async (client) => {
      const { rows } = await client.query<{ approval_status: string }>(
        `update public.menu_item_allergens
            set presence = 'may_contain'
          where menu_item_id = $1
            and allergen_id = (select id from public.allergens where code = 'nuts')
        returning approval_status`,
        [DEMO.menuItems.approvedGnocchi],
      )

      expect(rows[0]?.approval_status).toBe('draft')
    })
  })

  it('requires approval to be a separate act, even if the same statement asks for it', async () => {
    // Deliberate design decision. SQL cannot distinguish "the user re-approved
    // this" from "the client sent the column back unchanged", so an edit to an
    // approved row always drops it to draft. Re-approval is then a second,
    // explicit action — which is exactly how the dashboard will present it:
    // Save, then Approve.
    await asUser(DEMO.users.manager, async (client) => {
      const edited = await client.query<{ approval_status: string }>(
        `update public.menu_items
            set description_en = 'Reworded and signed off in the same edit.',
                approval_status = 'approved'
          where id = $1
        returning approval_status`,
        [DEMO.menuItems.approvedGnocchi],
      )
      expect(edited.rows[0]?.approval_status).toBe('draft')

      const reapproved = await client.query<{
        approval_status: string
        approved_by: string | null
      }>(
        `update public.menu_items set approval_status = 'approved' where id = $1
         returning approval_status, approved_by`,
        [DEMO.menuItems.approvedGnocchi],
      )
      expect(reapproved.rows[0]?.approval_status).toBe('approved')
      expect(reapproved.rows[0]?.approved_by).toBe(DEMO.users.manager)
    })
  })

  it('does not un-approve a row when only bookkeeping columns change', async () => {
    await asUser(DEMO.users.manager, async (client) => {
      const { rows } = await client.query<{ approval_status: string }>(
        `update public.menu_items set display_order = display_order + 1 where id = $1
         returning approval_status`,
        [DEMO.menuItems.approvedSorbetto],
      )

      expect(rows[0]?.approval_status).toBe('approved')
    })
  })

  it('refuses an approved row that names no approver', async () => {
    // The CHECK constraint is the last line of defence if a trigger is ever
    // dropped: an approved row without an approver simply cannot exist.
    await asSuperuser(async (client) => {
      await client.query('begin')
      await client.query('alter table public.menu_items disable trigger menu_items_guard_approval')
      const error = await expectFailure(
        client,
        `insert into public.menu_items
           (organisation_id, location_id, category_id, slug, name_en, price_cents, approval_status)
         values ($1, $2, '21100000-0000-4000-8000-000000000001', 'ghost', 'Ghost dish', 100, 'approved')`,
        [DEMO.orgVindaro, DEMO.locationVindaro],
      )
      expect(error.message).toMatch(/menu_items_approved_has_approver/)
      await client.query('rollback')
    })
  })

  it('refuses an approved dish with no price', async () => {
    await asUser(DEMO.users.manager, async (client) => {
      const error = await expectFailure(
        client,
        `insert into public.menu_items
           (organisation_id, location_id, category_id, slug, name_en, price_cents, approval_status)
         values ($1, $2, '21100000-0000-4000-8000-000000000001', 'priceless', 'Priceless', null, 'approved')`,
        [DEMO.orgVindaro, DEMO.locationVindaro],
      )
      expect(error.message).toMatch(/menu_items_approved_has_price/)
    })
  })

  it('refuses an approved "free from" allergen claim with no review and no cross-contamination note', async () => {
    await asUser(DEMO.users.manager, async (client) => {
      const error = await expectFailure(
        client,
        `insert into public.menu_item_allergens
           (organisation_id, menu_item_id, allergen_id, presence, approval_status, last_reviewed_at, cross_contamination_notes)
         values ($1, $2, (select id from public.allergens where code = 'peanuts'), 'free_from', 'approved', null, null)`,
        [DEMO.orgVindaro, DEMO.menuItems.approvedSorbetto],
      )
      expect(error.message).toMatch(/free_from_requires_review/)
    })
  })

  it('records an approve action in the audit log, distinct from a plain update', async () => {
    await asSuperuser(async (client) => {
      await client.query('begin')
      await client.query('select set_config($1, $2, true)', [
        'request.jwt.claims',
        JSON.stringify({ sub: DEMO.users.manager, role: 'authenticated' }),
      ])
      await client.query(
        `update public.menu_items set approval_status = 'approved' where id = $1`,
        [DEMO.menuItems.pendingBistecca],
      )

      const { rows } = await client.query<{ action: string; actor_user_id: string | null }>(
        `select action, actor_user_id from public.audit_logs
          where entity_id = $1 order by occurred_at desc limit 1`,
        [DEMO.menuItems.pendingBistecca],
      )

      expect(rows[0]?.action).toBe('approve')
      expect(rows[0]?.actor_user_id).toBe(DEMO.users.manager)
      await client.query('rollback')
    })
  })

  it('records an unapprove action when content changes drop a row back to draft', async () => {
    await asSuperuser(async (client) => {
      await client.query('begin')
      await client.query('select set_config($1, $2, true)', [
        'request.jwt.claims',
        JSON.stringify({ sub: DEMO.users.manager, role: 'authenticated' }),
      ])
      await client.query(
        `update public.menu_item_allergens set notes_en = 'changed by the chef'
          where menu_item_id = $1 and approval_status = 'approved'`,
        [DEMO.menuItems.approvedInsalata],
      )

      const { rows } = await client.query<{ action: string }>(
        `select action from public.audit_logs
          where entity_type = 'menu_item_allergens' order by occurred_at desc limit 1`,
      )

      expect(rows[0]?.action).toBe('unapprove')
      await client.query('rollback')
    })
  })
})
