# TEST_PLAN — WI #23: Difficulty mode selector (TC-001 only)

Repo facts verified in this run: no `package.json`, no Playwright config, no existing tests/page objects/fixtures, no conventions doc, no `.gitignore`. Static vanilla-JS game served as ES modules (`<script type="module" src="app.js">`), so it **must be served over HTTP** (not `file://`). `index.html` currently has only `#scoreEl` and a single `<canvas>` (no `<select>`); the tests are expected to fail until WI #23 is implemented. Node v22 is available; a Playwright CLI (1.61.1) was found via `npx` but I did not verify browsers are installed.

Stage 3 must therefore also create the minimal Playwright scaffolding (section 4). The layout below follows `TEST_STRATEGY.md`.

## 1. Spec file
- Path: `tests/difficulty-selector.spec.ts` — **new file** (no existing spec to extend).
- Single `test.describe('Difficulty selector', ...)` block. Named after the group (difficulty selector), not one action.
- Two tests (minimum per spec), both with `TC-001` in the title/tag, as the strategy prescribes splitting TC-001 into two single-outcome tests.
- Imports `test`/`expect` from `@playwright/test` (no custom fixtures needed — see below).

## 2. Per-test breakdown

Setup data: none. The page is static, with no API, no data creation and no teardown. No factory/fixture is required. Each test gets a fresh `page` from Playwright's built-in fixture (parallel-safe). Both tests instantiate `new GamePage(page)` in a `test.beforeEach`.

### Test 1 — `TC-001: difficulty selector is shown above the game canvas before gameplay starts`
Tag: `{ tag: '@smoke' }` (TC type Smoke).
- `test.step('Given the game page is loaded and no game input has been sent')` → `gamePage.goto()`
- `test.step('When the difficulty selector is located relative to the canvas')` → `gamePage.isSelectorAboveCanvas()` used via `expect.poll`
- `test.step('Then the selector is visible and sits above the canvas')`
- Page-object methods: `goto()`, `isSelectorAboveCanvas()`
- Final assertions (locator-based):
  - `await expect(gamePage.difficultySelect).toBeVisible();`
  - `await expect(gamePage.canvas).toBeVisible();`
  - `await expect.poll(() => gamePage.isSelectorAboveCanvas()).toBe(true);`

### Test 2 — `TC-001: difficulty dropdown offers exactly the Easy and Hard options`
- `test.step('Given the game page is loaded and no game input has been sent')` → `gamePage.goto()`
- `test.step('When the difficulty dropdown is opened')` → `gamePage.openDifficultyDropdown()`
- `test.step('Then exactly the Easy and Hard options are listed')`
- Page-object methods: `goto()`, `openDifficultyDropdown()`
- Final assertions:
  - `await expect(gamePage.difficultyOptions).toHaveCount(2);`
  - `await expect(gamePage.difficultyOptions).toHaveText(['Easy', 'Hard']);` (exact text, ordered)
- Notes: a native `<select>` popup is not part of the DOM/page screenshot, so "open" = click on the combobox (must not throw / must not alter the selection); the options are asserted through their `option` role in the DOM. Do not assert which option is selected (out of scope: default-Easy).

## 3. Additions to existing files
None — no existing test files exist in the repo. Application code (`index.html`, `app.js`, `grid.js`) is **not** touched by this plan.

## 4. New files

### `pages/game.page.ts` — page object (one per page; follows the universal pattern)
```ts
import { type Locator, type Page } from '@playwright/test';

export class GamePage {
  readonly page: Page;
  readonly difficultySelect: Locator;   // page.getByRole('combobox')
  readonly difficultyOptions: Locator;  // this.difficultySelect.getByRole('option')
  readonly canvas: Locator;             // page.locator('canvas')

  constructor(page: Page);
  async goto(): Promise<void>;                      // page.goto('/'); then await canvas visible (sync inside the PO)
  async openDifficultyDropdown(): Promise<void>;    // difficultySelect.click()
  async isSelectorAboveCanvas(): Promise<boolean>;  // compares boundingBox() of select vs canvas: select.y + select.height <= canvas.y
}
```
Locator strategy:
- `difficultySelect`: `getByRole('combobox')` (priority 1). The page will contain exactly one combobox (`#modeEl`), so it is unambiguous; the select has no label in the WI spec, so `getByRole` with `name` is not used. Do NOT use `#modeEl` CSS.
- `difficultyOptions`: `difficultySelect.getByRole('option')` (priority 1), no `.first()`.
- `canvas`: `page.locator('canvas')` — CSS, last resort, justified: `<canvas>` has no role, text, label or test id, and it is the only canvas on the page. (Adding a `data-testid` would mean editing app code, which is out of scope.)
- `isSelectorAboveCanvas()`: return `false` if either `boundingBox()` is `null`.
- No `waitForTimeout`, no `networkidle`. `goto()` waits for `canvas` to be visible (`app.js` sets canvas size on load).

### `tests/difficulty-selector.spec.ts` — as in sections 1–2.

### `playwright.config.ts`
```ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  webServer: {
    command: 'npx http-server . -p 4173 -a 127.0.0.1 -c-1 --silent',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
```
(Static server required because the game uses ES modules. `-c-1` disables caching.)

### `package.json`
- `devDependencies`: `@playwright/test`, `http-server`, `typescript`.
- `scripts`: `"test": "playwright test"`.
- Stage 3 must run `npm install` and `npx playwright install chromium`, and add `.gitignore` with `node_modules/`, `test-results/`, `playwright-report/`.

### `tsconfig.json` (minimal, optional) — `target ES2022`, `module ESNext`, `moduleResolution Bundler`, `strict true`, `include: ["tests", "pages", "playwright.config.ts"]`.

## 5. Conventions to follow
- No repo conventions doc/tests exist; these rules come from the universal constraints and `TEST_STRATEGY.md`. Layout: `tests/*.spec.ts`, `pages/*.page.ts`.
- Locator priority: `getByRole` first; the `canvas` CSS locator is the only exception (documented above). No `.first()`, no `waitForTimeout`, no `networkidle`; use `toHaveText`/`toHaveCount` for exact values.
- Page object: `readonly` typed locators initialised in the constructor; async actions with no `get` prefix; synchronisation inside the page object, not in specs.
- Specs: specs use `test.step()` for Given/When/Then, titles state the user-visible behaviour and carry `TC-001`. Only TC-001 is automated; do not add tests for default selection, speeds, persistence, styling or a start gate.
- Expected state: tests fail until `<select id="modeEl">` (options Easy/Hard, placed above the canvas) is added by WI #23's implementation; do not add the selector to `index.html` from the test stage.
