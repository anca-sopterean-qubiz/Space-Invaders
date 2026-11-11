# TEST_PLAN — WI-23 / TC-001: Difficulty selector shown before game start

Verified by reading the repo in this run: `Space-Invaders` has no `package.json`, no Playwright config, no `tests/` directory, no existing page objects or fixtures, and no conventions doc (only `README.md`, which is a game description). `LeaveFlowApp_changed` is an unrelated repo and was not used as a convention source (as noted in `TEST_STRATEGY.md`). Everything below is therefore a minimal bootstrap, not an extension.

Verified current page state (`index.html`): one `<canvas>` inside `<div style="position: relative">`, a `score:` overlay (`<p>` positioned absolutely, with `#scoreEl`), and **no `<select>` / `#modeEl` yet**. The game auto-starts on load (`animate()` is called at module load in `app.js`). The TC-001 tests will fail until the WI-23 implementation adds the dropdown. That is expected and is not a reason to weaken the assertions.

## 1. Spec file
- **Path:** `tests/difficulty-mode.spec.ts` (new file; there is nothing to extend).
- **Top-level group:** `test.describe('Difficulty mode selector', ...)`. The file is named after the group so later difficulty behaviours (default Easy, reload reset, gameplay settings) go in the same file.
- Two tests, which meets the 2-test minimum. Both are tagged `@TC-001` through the test-level option `{ tag: '@TC-001' }`.

## 2. Per-test breakdown

Setup data: none. The page is static and has no API, so no factory or provider is needed. The only fixture is `gamePage` (see §4), which builds the page object. There is nothing to tear down.

### Test 1 — `'difficulty selector is visible and enabled above the game canvas before the game starts'`
Covers TC-001 steps 1–2.
- `test.step('Given the game page is loaded', ...)` → `gamePage.goto()`
- `test.step('When I locate the difficulty selector relative to the game canvas', ...)` → `const { selectorBottom, canvasTop } = await gamePage.verticalPositions()`
- `test.step('Then the selector is shown and available, and sits above the canvas', ...)`
  - `await expect(gamePage.difficultySelect).toBeVisible()`
  - `await expect(gamePage.difficultySelect).toBeEnabled()`
  - **Final assertion:** `expect(selectorBottom).toBeLessThanOrEqual(canvasTop)`
- Page-object methods: `goto()`, `verticalPositions()`.
- Note: the game auto-starts, so "before game start" can only be asserted as "present and enabled on first load". Do not invent a start gate.

### Test 2 — `'opening the difficulty dropdown offers exactly the Easy and Hard options'`
Covers TC-001 step 3.
- `test.step('Given the game page is loaded', ...)` → `gamePage.goto()`
- `test.step('When I open the difficulty dropdown', ...)` → `gamePage.openDifficultyDropdown()`
- `test.step('Then exactly the Easy and Hard options are offered', ...)`
  - **Final assertion:** `await expect(gamePage.difficultyOptions).toHaveText(['Easy', 'Hard'])`. This exact array form fails if an option is missing, extra or mislabelled.
- Page-object methods: `goto()`, `openDifficultyDropdown()`.
- A native `<select>` popup is not part of the DOM, so the assertion reads the `<option>` elements. Do not `selectOption` or change the value, because that is another test case.

## 3. Additions to existing files
None. No test files exist yet. The bootstrap files are listed in §4.

## 4. New files

### `package.json`
- Root `package.json` with `"private": true` and scripts `"test": "playwright test"`.
- devDependencies: `@playwright/test`, `http-server`. The page loads ES modules, so it must be served over http and cannot use `file://`.
- Stage 3 should run `npm install` and `npx playwright install chromium`.
- Do not add `"type": "module"` unless the toolchain needs it; the game's browser modules are unaffected either way.

### `playwright.config.ts`
- `testDir: './tests'`, `fullyParallel: true`, `reporter: 'list'`.
- `use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' }`.
- `projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]`.
- `webServer: { command: 'npx http-server . -p 4173 -a 127.0.0.1 -c-1 --silent', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI }`.

### `.gitignore`
Add `node_modules/`, `test-results/`, `playwright-report/`. A `.gitignore` does not exist at the root today (only `.idea/.gitignore`).

### `tests/pages/game.page.ts`
```ts
import { type Locator, type Page } from '@playwright/test';

export class GamePage {
  readonly page: Page;
  readonly difficultySelect: Locator;
  readonly difficultyOptions: Locator;
  readonly canvas: Locator;

  constructor(page: Page);
  async goto(): Promise<void>;
  async openDifficultyDropdown(): Promise<void>;
  async verticalPositions(): Promise<{ selectorBottom: number; canvasTop: number }>;
}
```
- **Locators**
  - `difficultySelect = page.getByRole('combobox')`. This is priority 1, and it is unique because `<select id="modeEl">` is the only combobox on the page. If the implementation adds an accessible name (e.g. `aria-label="Difficulty"`), tighten it to `getByRole('combobox', { name: /difficulty/i })`. Do not require that name, because the work item does not specify one.
  - `difficultyOptions = this.difficultySelect.getByRole('option')`. This is also role-based.
  - `canvas = page.locator('canvas')`. This is a CSS selector, used as a last resort because `<canvas>` has no role, text or test id in the current markup. There is a single canvas, so no `.first()`.
- **`goto()`**: `page.goto('/')`, then `await this.canvas.waitFor({ state: 'visible' })` so the page has rendered. The sync wait lives here and not in the spec. No `waitForTimeout` and no `networkidle`; the game's `requestAnimationFrame` loop would never be "idle" anyway.
- **`openDifficultyDropdown()`**: `await this.difficultySelect.click()`. Playwright's auto-wait and actionability checks make the click wait for the control.
- **`verticalPositions()`**: read `boundingBox()` of the select and the canvas. Throw a descriptive `Error` if either is `null`. Return `{ selectorBottom: selectBox.y + selectBox.height, canvasTop: canvasBox.y }`. Do both reads after `goto()`, so the layout is settled.

### `tests/fixtures/game.fixture.ts`
```ts
import { test as base } from '@playwright/test';
import { GamePage } from '../pages/game.page';

export const test = base.extend<{ gamePage: GamePage }>({
  gamePage: async ({ page }, use) => { await use(new GamePage(page)); },
});
export { expect } from '@playwright/test';
```
The spec imports `test` and `expect` from `./fixtures/game.fixture`.

### `tests/difficulty-mode.spec.ts`
Contains the two tests from §2 inside the single `describe`, and nothing else.

### `tsconfig.json`
Optional. Add only if the toolchain needs one; Playwright runs TS without it.

## 5. Conventions to follow
- There is no repo convention doc, so use the universal rules. Locator priority is `getByRole` first. `locator('canvas')` is the only CSS locator and needs a one-line comment saying why.
- The page object has `readonly` typed locators set in the constructor, async action methods with no `get` prefix, and sync waits inside the page object. Specs only call `test.step` and `expect`.
- Use only web-first assertions. Use `toHaveText([...])` for exact option text and never `toContain` on partial text. Use no `waitForTimeout`, no `networkidle` and no `.first()`.
- Do not write application code. Do not touch `index.html`, `app.js` or `grid.js`. Out-of-scope behaviours listed in `TEST_STRATEGY.md` §4 (default Easy, reload reset, gameplay values, styling, start gate) must not be tested.
- Stage 3 has not yet run these tests; I have not run them in this stage, and they are expected to fail until `#modeEl` exists on the page.
