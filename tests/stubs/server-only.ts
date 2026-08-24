/**
 * Test stub for the `server-only` package.
 *
 * `server-only` deliberately throws when resolved under a browser/client
 * condition, which is exactly what makes it useful in the application. Vitest
 * runs in Node but resolves through Vite, which picks that condition, so
 * importing any server module in a test would fail on the guard rather than on
 * the code under test.
 *
 * Aliasing it to this empty module in vitest.config.mts keeps the guard fully
 * active in the real build (Next resolves the real package) while letting the
 * tests exercise server code directly.
 */
export {}
