# TEST_PLAN — WI #23 / TC-002: Difficulty selector defaults to Easy on initial page load

## Repo findings (verified by reading the repo in this run)
- Tracked files: `index.html`, `app.js` (ES module), `grid.js`, `invader.js`, `player.js`, `projectiles.js`, `images/`, `README.md`, `TEST_STRATEGY.md`, `.idea/`.
- **There is no Playwright infrastructure**: no `package.json`, no `playwright.config.*`, no `tests/` dir, no page objects, fixtures, factories, or conventions doc. There is nothing existing to match, so section 4 lists the minimal scaffolding stage 3 must create.
- `index.html` currently has **no `#modeEl` / `<select>`**. The feature is not implemented on this branch, so the test is expected to fail until the dropdown exists. Stage 3 must NOT modify application code (`index.html`, `app.js`, `grid.js`) to make it pass.
- `index.html` loads `app.js` via `<script type="module">`. This does not work from `file://` (CORS), so the page must be served over HTTP, which is why `webServer` is part of the config.
- The game auto-starts on page load (`game.active: true` in `app.js`). TC-002 only reads the dropdown value and does not interact with the game.

## 1. Spec file
- Path: `tests/difficulty-mode.spec.ts` (**new file**; no existing spec to extend).
- Group-named, per TEST_STRATEGY §3: later difficulty behaviours (Hard selection, reset on reload) belong in this file.
- `describe` block: `test.describe('Difficulty mode selector', ...)`.
- Contains **one** test. The "min 2 tests per spec" rule is deliberately not met: scope is limited to TC-002, and TEST_STRATEGY §3 says not to invent a second test.

## 2. Per-test breakdown

### Test: `defaults to Easy when the game page is first loaded`
- Tag in the title or annotation: `TC-002` (e.g. `test('TC-002: defaults to Easy when the game page is first loaded', ...)`).
- Fixtures: `gamePage` (from `fixtures/index.ts`). The fixture only constructs the page object. No setup data, factory or API calls are needed, because this is a pure initial-state read. There is nothing to tear down. Playwright's default per-test fresh browser context provides the "fresh browser, no prior selection" prerequisite (no storage carry-over between tests).
- Steps:
  - `await test.step('Given the game page is opened in a fresh browser context', async () => { await gamePage.goto(); });`
  - `await test.step('When the difficulty dropdown is read', async () => { /* no action: reading is the assertion */ });`
    - Stage 3 may fold this step into the Then step if an empty step looks odd. Do not add any interaction with the dropdown.
  - `await test.step('Then the selected difficulty is Easy', async () => { await expect(gamePage.difficultySelect).toHaveValue(/^easy$/i); });`
- Page-object methods called: `GamePage.goto()` (waits internally for the dropdown to be visible).
- Final assertion: `await expect(gamePage.difficultySelect).toHaveValue(/^easy$/i)`.
  - Rationale: the technical approach (D2) specifies `<option value="easy">Easy</option>`. The case-insensitive regex tolerates `Easy` vs `easy` as the option value, and it is an exact, anchored match, not a partial `toContain`.
  - If the `value` attributes do not match, do not weaken the assertion. Report it.

## 3. Additions to existing files
None. No test infrastructure exists to extend. All files are new (see section 4).

## 4. New files (minimal scaffolding; signatures only)

### `package.json`
- `devDependencies`: `@playwright/test`, `http-server`.
- `scripts`: `"test": "playwright test"`.
- Pin versions to whatever `npm install` resolves. Commit the lockfile.

### `playwright.config.ts`
- `export default defineConfig({ ... })` with:
  - `testDir: './tests'`
  - `fullyParallel: true`
  - `use: { baseURL: 'http://127.0.0.1:4173', trace: 'on-first-retry' }`
  - `projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]`
  - `webServer: { command: 'npx http-server . -p 4173 -a 127.0.0.1 -c-1 --silent', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI }`
- Serves the repo root statically (the game has no build step). Do not use `file://`.

### `.gitignore` (append or create)
- `node_modules/`, `test-results/`, `playwright-report/`

### `pages/GamePage.ts`
```ts
import { type Locator, type Page } from '@playwright/test';

export class GamePage {
  readonly page: Page;
  readonly difficultySelect: Locator;   // page.getByRole('combobox')

  constructor(page: Page);
  async goto(): Promise<void>;          // page.goto('/'); then await expect(this.difficultySelect).toBeVisible() (sync lives in the page object)
}
```
- Locator strategy: `getByRole('combobox')`.
  - A native `<select>` has the ARIA role `combobox` (or `listbox` if it has `multiple`/`size>1`; the planned element has neither).
  - It is the only `<select>` on the page, so the locator is unique without `.first()` or a name filter.
  - The planned markup has no `<label>`, so `getByLabel` and a name filter are unavailable. If the implementation later adds a label or `aria-label`, tighten to `getByRole('combobox', { name: ... })`.
  - Do NOT fall back to `#modeEl` (CSS) unless `getByRole('combobox')` demonstrably fails to resolve. If it is needed, note why in a comment.
- `goto()` should import `expect` from `@playwright/test` for the visibility wait. No `waitForTimeout` or `networkidle`.

### `fixtures/index.ts`
```ts
import { test as base } from '@playwright/test';
import { GamePage } from '../pages/GamePage';

export const test = base.extend<{ gamePage: GamePage }>({
  gamePage: async ({ page }, use) => { await use(new GamePage(page)); },
});
export { expect } from '@playwright/test';
```

### `tests/difficulty-mode.spec.ts`
```ts
import { test, expect } from '../fixtures';

test.describe('Difficulty mode selector', () => {
  test('TC-002: defaults to Easy when the game page is first loaded', async ({ gamePage }) => { /* section 2 */ });
});
```

### Factories / providers
None needed: the test uses no setup data.

## 5. Conventions to follow
- No repo conventions exist, so use the universal ones. Locator priority is role > label > text > test id > CSS. One page object per page, with `readonly` typed locators initialised in the constructor. Action methods are async with no `get` prefix, and synchronisation waits live in the page object.
- Specs import `test`/`expect` from `../fixtures` (not directly from `@playwright/test`) and receive page objects via fixtures.
- No `waitForTimeout`, no `networkidle`, no `.first()` on broad locators, no partial-text `toContain` assertions. Use anchored `toHaveValue`/`toHaveText`.
- Scope is TC-002 only. Do not add tests for Hard selection, game parameters, styling, or reload behaviour, and do not edit application source files.
- The test is expected to fail until the `#modeEl` dropdown is implemented. Do not skip or `fixme` it. Report the failure honestly.
