import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end and accessibility configuration.
 *
 * Two suites, kept apart on purpose:
 *
 *   public/    pages that render with no credentials at all. These run in CI
 *              today and cover the marketing page and the auth screens.
 *
 *   dashboard/ pages behind authentication. These need a Supabase project and
 *              a seeded demo account, so they are SKIPPED, loudly, until
 *              ASTRA_E2E_EMAIL and ASTRA_E2E_PASSWORD are present. A skipped
 *              test reports as skipped; it never reports as passed.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.ASTRA_E2E_BASE_URL ?? 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    launchOptions: {
      // Chromium is pre-installed in this environment rather than downloaded.
      executablePath: process.env.ASTRA_CHROMIUM_PATH ?? undefined,
    },
  },
  projects: [
    {
      name: 'desktop-1440',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'tablet-768',
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'mobile-375',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 } },
    },
  ],
  webServer: process.env.ASTRA_E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run start',
        url: 'http://127.0.0.1:3000',
        reuseExistingServer: true,
        timeout: 120_000,
      },
})
