import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'tests/unit/**/*.test.ts',
      'tests/integration/**/*.test.ts',
      'tests/database/**/*.test.ts',
    ],
    exclude: ['tests/e2e/**'],
    // The database suite shares one PostgreSQL server. Running the files in a
    // single process keeps the connection pool small and the ordering
    // predictable; every test still rolls back its own transaction.
    globalSetup: ['tests/database/globalSetup.ts'],
    fileParallelism: false,
    testTimeout: 30_000,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // See tests/stubs/server-only.ts for why this alias exists.
      'server-only': fileURLToPath(new URL('./tests/stubs/server-only.ts', import.meta.url)),
    },
  },
})
