import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for the Space Invaders e2e suite.
 *
 * The game is a static, client-only site (no backend/auth), so the harness serves the
 * repository's own files via a tiny test-only static server (tests/support/static-server.mjs)
 * and points `baseURL` at it. The injected APP_BASE_URL / TEST_USER_* credentials are not
 * used: this game has no login and is served locally for deterministic runs.
 *
 * JSON output is emitted to `results.json` for AIDP ingestion (alongside the `list` reporter).
 */
const PORT = Number(process.env.PW_PORT) || 4318;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [
    ['list'],
    ['json', { outputFile: process.env.PLAYWRIGHT_JSON_OUTPUT_NAME || 'results.json' }],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'node tests/support/static-server.mjs',
    url: baseURL,
    env: { PORT: String(PORT) },
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
