import { afterAll, describe, expect, it } from 'vitest'
import { DEMO, asServiceRole, asSuperuser, asUser, closePool, expectFailure } from './helpers'

afterAll(closePool)

const AGENT_VIEWS = [
  'approved_menu_categories',
  'approved_menu_items',
  'approved_menu_item_allergens',
  'approved_menu_item_dietary_attributes',
  'approved_faqs',
  'approved_knowledge_articles',
] as const

/**
 * PRD AC-10: unapproved rows must never be returned by anything the voice agent
 * can reach. The agent schema is the only surface it may query, so proving the
 * property here proves it for every tool endpoint built on top in Milestone 4.
 */
describe('agent read surface', () => {
  it('exposes only approved rows from every view', async () => {
    await asServiceRole(async (client) => {
      for (const view of AGENT_VIEWS) {
        const { rows } = await client.query<{ id: string }>(`select id from agent.${view}`)
        expect(rows.length, `${view} should not be empty in the seed`).toBeGreaterThan(0)
      }

      // Cross-check each view against the unapproved rows of its base table.
      const checks = [
        ['approved_menu_items', 'menu_items'],
        ['approved_menu_item_allergens', 'menu_item_allergens'],
        ['approved_faqs', 'frequently_asked_questions'],
        ['approved_knowledge_articles', 'knowledge_articles'],
        ['approved_menu_categories', 'menu_categories'],
        ['approved_menu_item_dietary_attributes', 'menu_item_dietary_attributes'],
      ] as const

      for (const [view, table] of checks) {
        const { rows } = await client.query<{ count: string }>(
          `select count(*)::text as count
             from agent.${view} v
             join public.${table} t on t.id = v.id
            where t.approval_status <> 'approved'`,
        )
        expect(Number(rows[0]!.count), `${view} leaked an unapproved row`).toBe(0)
      }
    })
  })

  it('hides the draft dish and the pending dish from search_menu', async () => {
    const names = await asServiceRole(async (client) => {
      const { rows } = await client.query<{ name_en: string }>(
        'select name_en from agent.search_menu($1, null, 50)',
        [DEMO.locationVindaro],
      )
      return rows.map((r) => r.name_en)
    })

    expect(names).toContain('Potato gnocchi with basil pesto')
    expect(names).not.toContain('Fried calamari') // draft
    expect(names).not.toContain('Grilled ribeye') // pending_review
  })

  it('hides an unapproved allergen declaration on an otherwise approved dish', async () => {
    // The seed leaves "insalata mista / sulphites" in draft on purpose.
    const info = await asServiceRole(async (client) => {
      const { rows } = await client.query<{ get_allergen_info: Record<string, unknown> }>(
        'select agent.get_allergen_info($1, $2)',
        [DEMO.locationVindaro, DEMO.menuItems.approvedInsalata],
      )
      return rows[0]!.get_allergen_info
    })

    const contains = info.contains as Array<{ code: string }>
    const undeclared = info.undeclared as Array<{ code: string }>

    expect(contains.map((c) => c.code)).toEqual(['mustard'])
    // Because the sulphites row is not approved, sulphites must appear as
    // undeclared — "we have not confirmed this" — never as absent.
    expect(undeclared.map((u) => u.code)).toContain('sulphites')
  })

  it('separates contains, may_contain and declared free-from', async () => {
    const info = await asServiceRole(async (client) => {
      const { rows } = await client.query<{ get_allergen_info: Record<string, unknown> }>(
        'select agent.get_allergen_info($1, $2)',
        [DEMO.locationVindaro, DEMO.menuItems.approvedGnocchi],
      )
      return rows[0]!.get_allergen_info
    })

    const contains = (info.contains as Array<{ code: string }>).map((c) => c.code)
    expect(contains).toEqual(['cereals_gluten', 'milk', 'nuts'])
    expect(info.safety_directive).toMatch(/Never state that a dish is safe/)
  })

  it('reports a shared-fryer risk as may_contain, not as free from', async () => {
    const potatoes = await asSuperuser(async (client) => {
      const { rows } = await client.query<{ id: string }>(
        `select id from public.menu_items where slug = 'patate-rosmarino'`,
      )
      return rows[0]!.id
    })

    const info = await asServiceRole(async (client) => {
      const { rows } = await client.query<{ get_allergen_info: Record<string, unknown> }>(
        'select agent.get_allergen_info($1, $2)',
        [DEMO.locationVindaro, potatoes],
      )
      return rows[0]!.get_allergen_info
    })

    const mayContain = info.may_contain as Array<{
      code: string
      cross_contamination_notes: string
    }>
    expect(mayContain.map((m) => m.code)).toContain('cereals_gluten')
    expect(mayContain[0]?.cross_contamination_notes).toMatch(/shared fryer/i)
    expect(info.contains).toEqual([])
  })

  it('requires an approved free-from claim to carry a cross-contamination note', async () => {
    const info = await asServiceRole(async (client) => {
      const { rows } = await client.query<{ get_allergen_info: Record<string, unknown> }>(
        'select agent.get_allergen_info($1, $2)',
        [DEMO.locationVindaro, DEMO.menuItems.approvedSorbetto],
      )
      return rows[0]!.get_allergen_info
    })

    const freeFrom = info.declared_free_from as Array<{
      code: string
      cross_contamination_notes: string | null
    }>
    expect(freeFrom.map((f) => f.code)).toEqual(['milk'])
    expect(freeFrom[0]?.cross_contamination_notes).toBeTruthy()
  })

  it('returns no allergen information for an unapproved dish at all', async () => {
    const info = await asServiceRole(async (client) => {
      const { rows } = await client.query<{ get_allergen_info: unknown }>(
        'select agent.get_allergen_info($1, $2)',
        [DEMO.locationVindaro, DEMO.menuItems.draftCalamari],
      )
      return rows[0]!.get_allergen_info
    })

    expect(info).toBeNull()
  })

  it('hides the draft FAQ from search_faqs', async () => {
    const questions = await asServiceRole(async (client) => {
      const { rows } = await client.query<{ question_en: string }>(
        'select question_en from agent.search_faqs($1, null, 50)',
        [DEMO.locationVindaro],
      )
      return rows.map((r) => r.question_en)
    })

    expect(questions).toContain('Do you have parking?')
    expect(questions).not.toContain('Do you offer a tasting menu?')
  })

  it('excludes the draft knowledge article from get_business_info', async () => {
    const info = await asServiceRole(async (client) => {
      const { rows } = await client.query<{ get_business_info: Record<string, unknown> }>(
        'select agent.get_business_info($1)',
        [DEMO.locationVindaro],
      )
      return rows[0]!.get_business_info
    })

    const titles = (info.articles as Array<{ title_en: string }>).map((a) => a.title_en)
    expect(titles).toContain('Parking')
    expect(titles).not.toContain('Corkage (draft)')
    expect((info.hours as unknown[]).length).toBeGreaterThan(0)
  })

  it('is unreachable from a dashboard user, however privileged', async () => {
    await asUser(DEMO.users.owner, async (client) => {
      const error = await expectFailure(client, 'select * from agent.approved_menu_items')
      expect(error.message).toMatch(/permission denied/i)
    })
  })
})
