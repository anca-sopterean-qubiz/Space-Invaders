# TEST_PLAN — WI #23 / TC-001: Difficulty selector shown before game start

## Repo findings (verified by reading the repo this run)
- Static vanilla-JS game: `index.html`, `app.js`, `grid.js`, `invader.js`, `player.js`, `projectiles.js`. `app.js` is loaded as `<script type="module">`, so the page must be served over HTTP (not `file://`).
- No `package.json`, Playwright config, tests, page objects, fixtures, or conventions doc exist. Nothing to inherit, so this plan bootstraps Playwright (TypeScript) and defines the layout.
- `index.html` currently has no `#modeEl` and no `<select>`. The TC-001 tests will fail until WI #23's markup change lands; that is expected.
- The game auto-starts on page load (`animate()` is called at module load). The tests never interact with the game, and the only `alert` fires after a player hit, so none is expected within the test's lifetime.
- The only `<canvas>` on the page is `document.querySelector('canvas')`. The score display is an absolutely positioned `<p>` inside the same wrapper `<div>` as the canvas.
- `/workspace/repos/LeaveFlowApp_changed` also exists but is an unrelated project and is not used as a convention source.

## 1. Spec file
- **Path:** `tests/difficulty-mode-selector.spec.ts` — **new file** (no existing spec to extend). It is named after the group (Difficulty & Modes selector), so later difficulty behaviours (default, persistence, applied settings) go in this file.
- **Top-level block:** `test.describe('Difficulty mode selector', ...)`, containing exactly the 2 tests below (meets the 2-test minimum).
- Imports `test`, `expect` from `./fixtures` (not directly from `@playwright/test`).

## 2. Per-test breakdown

No setup data is needed: the feature is static page markup, with no API, no backend, and no created entities. There are no factory calls and nothing to tear down. The only fixture is the page-object fixture `difficultySelectorPage` (section 3).

### Test 1 — `difficulty selector is displayed above the game canvas before the game starts`
Covers TC-001 steps 1–2.
- `await test.step('Given the game page is loaded', ...)` → `difficultySelectorPage.goto()`
- `await test.step('When I locate the difficulty selector relative to the game canvas', ...)` → `const { selector, canvas } = await difficultySelectorPage.boundingBoxes()`
- `await test.step('Then the selector is visible, enabled and sits above the canvas', ...)`
  - `await expect(difficultySelectorPage.modeSelect).toBeVisible()`
  - `await expect(difficultySelectorPage.modeSelect).toBeEnabled()`
  - `expect(selector.y + selector.height).toBeLessThanOrEqual(canvas.y)`
- **Page-object methods:** `goto()`, `boundingBoxes()`; locator fields `modeSelect`, `canvas`.
- **Final assertion (behaviour-specific):** the selector's bottom edge is at or above the canvas top edge, which proves it is "above the canvas".

### Test 2 — `difficulty dropdown offers exactly the Easy and Hard options`
Covers TC-001 step 3.
- `await test.step('Given the game page is loaded', ...)` → `difficultySelectorPage.goto()`
- `await test.step('When I open the difficulty dropdown', ...)` → `difficultySelectorPage.openDropdown()`
- `await test.step('Then it lists exactly Easy and Hard, in that order', ...)`
  - `await expect(difficultySelectorPage.modeOptions).toHaveText(['Easy', 'Hard'])`
- **Page-object methods:** `goto()`, `openDropdown()`; locator fields `modeSelect`, `modeOptions`.
- **Final assertion:** `toHaveText(['Easy', 'Hard'])` on the options locator. Array form asserts both the exact count (2) and the exact text and order, so a third option or a different label fails.
- Asserting option `value` attributes is out of scope (strategy covers labels only).

## 3. Additions to existing files
There are no existing test files. All files are new (section 4), apart from this, which changes no existing source file:
- **No change to `index.html`, `app.js`, `grid.js`.** The application change belongs to the WI #23 implementation, not to this test stage.

## 4. New files

### 4.1 `package.json` (repo root)
- `devDependencies`: `@playwright/test`, `http-server` (static server for the `webServer` entry). Stage 3 installs them with `npm install -D` so the lockfile pins the versions. Do not hand-write version numbers.
- `scripts`: `"test": "playwright test"`.
- Stage 3 must run `npx playwright install chromium` (or note it as a prerequisite) before running the specs.

### 4.2 `playwright.config.ts` (repo root)
```ts
// defineConfig({...}) with:
testDir: './tests'
fullyParallel: true
forbidOnly: !!process.env.CI
retries: process.env.CI ? 2 : 0
reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list'
use: { baseURL: 'http://127.0.0.1:4173', trace: 'on-first-retry' }
projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
webServer: {
  command: 'npx http-server . -p 4173 -a 127.0.0.1 -c-1',
  url: 'http://127.0.0.1:4173',
  reuseExistingServer: !process.env.CI,
}
```

### 4.3 `.gitignore` (repo root; none exists)
Entries: `node_modules/`, `test-results/`, `playwright-report/`.

### 4.4 `tests/pages/DifficultySelectorPage.ts`
One page object for the game page's difficulty-selector area.
```ts
import { expect, type Locator, type Page } from '@playwright/test';

export type Box = { x: number; y: number; width: number; height: number };

export class DifficultySelectorPage {
  readonly page: Page;
  readonly modeSelect: Locator;   // page.getByRole('combobox')
  readonly modeOptions: Locator;  // this.modeSelect.getByRole('option')
  readonly canvas: Locator;       // page.locator('canvas')

  constructor(page: Page);

  async goto(): Promise<void>;
  async openDropdown(): Promise<void>;
  async boundingBoxes(): Promise<{ selector: Box; canvas: Box }>;
}
```
Locator strategy and method behaviour:
- `modeSelect`: `getByRole('combobox')` (priority 1). A native `<select>` has role `combobox`. It is the only form control on the page, so no accessible name is required, and the plan does not assume a label or `aria-label` exists. If the implementation adds an accessible name, do not add it to the locator.
- `modeOptions`: `modeSelect.getByRole('option')` (priority 1, scoped to the select).
- `canvas`: `page.locator('canvas')`. This is the CSS last resort. `<canvas>` has no ARIA role, no text and no label, and adding a `data-testid` would require changing application code outside this stage's scope. It is the only canvas on the page, so no `.first()` is needed.
- `goto()`: `await this.page.goto('/')`, then synchronise on concrete state: `await expect(this.canvas).toHaveJSProperty('width', 1024)`. `app.js` sets `canvas.width = 1024`, so this confirms the module script ran and layout is final before measuring. Do not use `waitForTimeout` or `networkidle`.
- `openDropdown()`: `await this.modeSelect.click()`. The native popup is not part of the DOM, and the `<option>` elements stay readable in the DOM, so the assertion reads options from the locator.
- `boundingBoxes()`: read `boundingBox()` of `modeSelect` and `canvas`. Throw a clear `Error` if either is `null`, then return `{ selector, canvas }`. Assertions stay in the spec, not here.

### 4.5 `tests/fixtures.ts`
```ts
import { test as base, expect } from '@playwright/test';
import { DifficultySelectorPage } from './pages/DifficultySelectorPage';

export const test = base.extend<{ difficultySelectorPage: DifficultySelectorPage }>({
  difficultySelectorPage: async ({ page }, use) => { await use(new DifficultySelectorPage(page)); },
});
export { expect };
```
Fixture owns no external resources, so it needs no teardown.

### 4.6 `tests/difficulty-mode-selector.spec.ts`
The two tests from section 2, using the `difficultySelectorPage` fixture.

## 5. Conventions to follow
- Locator priority: `getByRole` first (`combobox`, `option`). The single CSS locator, `canvas`, is justified above. No `.first()`, no `waitForTimeout`, no `networkidle`.
- Page object: `readonly` typed locator fields set in the constructor, async action methods without a `get` prefix, synchronisation inside `goto()`. Specs contain only `test.step` blocks and assertions, with no raw selectors.
- Use `toHaveText([...])` for exact option text. Do not use `toContain` for the labels.
- Spec file named after the group (`difficulty-mode-selector.spec.ts`), imports from `./fixtures`. The tests need no API or UI-created data, so there are no factories and nothing to clean up.
- Serve the repo root over HTTP via the `webServer` entry (ES-module script), and test only Chromium. Both specs fail until the `#modeEl` `<select>` (Easy/Hard, above the canvas) from WI #23 exists in `index.html`. Stage 3 must not edit app files to make them pass.

## Risks / unverified
- Not run. No Playwright, Node or `http-server` setup was installed or executed in this run, so the config and the `canvas.width === 1024` sync are unverified.
- Test 1 assumes the selector is laid out in normal flow above the canvas. If the implementation overlays it on the canvas the way the score `<p>` is (absolute positioning), the bottom-edge assertion would fail and should be revisited with the implementer.
- Test 2 assumes the `<select>` is the only `combobox` on the page, as it is in the WI notes. A second combobox would make `modeSelect` ambiguous (strict-mode error).
