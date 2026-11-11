import { defineConfig, devices } from '@playwright/test';

// The game is a static site loaded as ES modules, so it is served locally over HTTP
// (file:// would not work). Set GAME_BASE_URL to target an already-deployed instance instead.
const baseURL = process.env.GAME_BASE_URL ?? 'http://localhost:4173';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [['list'], ['json', { outputFile: 'results.json' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.GAME_BASE_URL
    ? undefined
    : {
        command: 'npx http-server . -p 4173 -c-1 --silent',
        url: 'http://localhost:4173',
        reuseExistingServer: !process.env.CI,
      },
});
