import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * Calls dashboard accessibility and responsive proof.
 *
 * These need a Supabase project and the seeded demo account. Until those exist
 * the tests SKIP with a stated reason — they are never reported as passing.
 * Once the founder has run SUPABASE_SETUP.md, set:
 *
 *   ASTRA_E2E_EMAIL=owner.demo@example.com
 *   ASTRA_E2E_PASSWORD=<the demo password>
 *
 * and this file becomes the responsive/accessibility evidence for the slice.
 */

const EMAIL = process.env.ASTRA_E2E_EMAIL
const PASSWORD = process.env.ASTRA_E2E_PASSWORD

test.describe('Calls dashboard', () => {
  test.skip(
    !EMAIL || !PASSWORD,
    'Requires a Supabase project and seeded demo account: set ASTRA_E2E_EMAIL and ASTRA_E2E_PASSWORD.',
  )

  test.beforeEach(async ({ page }) => {
    await page.goto('/sign-in')
    await page.getByLabel('Email address').fill(EMAIL as string)
    await page.getByLabel('Password').fill(PASSWORD as string)
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL('**/dashboard')
  })

  test('lists calls with masked caller numbers', async ({ page }) => {
    await page.goto('/dashboard/calls')
    await expect(page.getByRole('heading', { name: 'Calls', level: 1 })).toBeVisible()

    const body = await page.locator('table tbody').innerText()
    // A masked number is present; a full one never is.
    expect(body).toMatch(/\+\d{2,4}\*{4}\d{4}/)
    expect(body).not.toMatch(/\+\d{10,}/)
  })

  test('shows the recording-off and evaluation badges', async ({ page }) => {
    await page.goto('/dashboard/calls')
    await expect(page.getByText('Audio recording off')).toBeVisible()
    await expect(page.getByText('Internal evaluation')).toBeVisible()
  })

  test('shows the disclosure currently deployed, with its version', async ({ page }) => {
    // compliance/12: the restaurant must be able to see the exact wording its
    // callers hear, without asking an engineer.
    await page.goto('/dashboard/calls')
    await expect(page.getByText('What callers hear first')).toBeVisible()
    await expect(page.getByText('Version v1')).toBeVisible()
    await expect(page.getByText(/Astra/).first()).toBeVisible()
  })

  test('filters by language', async ({ page }) => {
    await page.goto('/dashboard/calls')
    await page.getByLabel('Language').selectOption('it')
    await page.getByRole('button', { name: /apply filters/i }).click()
    await expect(page).toHaveURL(/language=it/)
  })

  test('opens a call and shows transcript, summary and timeline', async ({ page }) => {
    await page.goto('/dashboard/calls')
    await page.locator('table tbody tr a').first().click()
    await expect(page.getByRole('heading', { name: /^Call on/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Transcript' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'What the agent did' })).toBeVisible()
  })

  test('has no detectable WCAG A/AA violations', async ({ page }) => {
    await page.goto('/dashboard/calls')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
  })

  test('never scrolls the page sideways, even with a wide table', async ({ page }) => {
    await page.goto('/dashboard/calls')
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    )
    expect(overflow).toBe(false)
  })
})
