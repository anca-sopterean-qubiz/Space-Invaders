import { defineConfig, devices } from '@playwright/test';

// The game has no build step; serve the repo root statically over HTTP
// (app.js is an ES module and cannot be loaded from file://).
const baseURL = 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [['list'], ['json', { outputFile: 'results.json' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npx http-server . -p 4173 -a 127.0.0.1 -c-1 --silent',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
