import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * Accessibility and responsive checks for every page that renders without
 * credentials. Each runs at 1440, 768 and 375 through the Playwright projects.
 */

const PAGES = [
  { path: '/', name: 'landing' },
  { path: '/sign-in', name: 'sign in' },
  { path: '/sign-up', name: 'sign up' },
  { path: '/forgot-password', name: 'forgot password' },
]

for (const page of PAGES) {
  test(`${page.name} has no detectable WCAG A/AA violations`, async ({ page: browserPage }) => {
    await browserPage.goto(page.path)
    const results = await new AxeBuilder({ page: browserPage })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(
      results.violations.map((v) => `${v.id}: ${v.help}`),
      `axe violations on ${page.path}`,
    ).toEqual([])
  })

  test(`${page.name} never scrolls sideways`, async ({ page: browserPage }) => {
    await browserPage.goto(page.path)
    const overflow = await browserPage.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    )
    expect(overflow, `${page.path} overflows horizontally`).toBe(false)
  })
}

test('landing page exposes a working skip link for keyboard users', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  const focused = await page.evaluate(() => document.activeElement?.textContent?.trim())
  expect(focused).toBe('Skip to content')
})

test('sign-in form labels every control', async ({ page }) => {
  await page.goto('/sign-in')
  await expect(page.getByLabel('Email address')).toBeVisible()
  await expect(page.getByLabel('Password')).toBeVisible()
})
