# TEST_PLAN — WI #23 / TC-002: Difficulty defaults to Easy on initial page load

Facts below were checked by reading the repo in this run. Nothing was executed, so no claim here says a test passes.

- **Space-Invaders** has no `package.json`, no Playwright config, no `tests/` folder, no page objects, no fixtures and no conventions doc. Tracked files are `app.js`, `grid.js`, `invader.js`, `player.js`, `projectiles.js`, `index.html`, `README.md`, `images/` and `.idea/`.
- The sibling repo `LeaveFlowApp_changed` has only Jest unit tests (`tests/unit/...`) and no Playwright setup. It is a different app, so it is not used as a convention source.
- `index.html` has no `#modeEl` dropdown yet. It only has the `#scoreEl` score span and a `<canvas>`.
  - TC-002 is expected to fail until WI #23 lands the dropdown.
  - Stage 3 must not edit app code to make it pass.
- `app.js` is loaded with `<script type="module">`, so the page must be served over HTTP. `file://` will not work for ES modules. The Playwright config must start a static server.
- There is no backend or API, so there are no factories and no API-driven setup. The test needs no setup data.

## 1. Spec file

- **Path:** `tests/difficulty-mode.spec.ts` (new file).
- **Describe block:** `test.describe('Difficulty mode selector', ...)`. The file is named after the group (difficulty mode selection), not the single action.
- **Min-2-tests rule:** only one behavior (TC-002) is in scope. Stage 3 must not pad the file with tests for other behaviors, since those are out of scope and have no linked TC.
  - The spec therefore holds exactly **one** test for now.
  - This knowingly departs from the "min 2 tests per spec" rule. The file is meant to grow as further Difficulty & Modes TCs are linked.
- **Language:** TypeScript, because `.spec.ts` is the strategy's proposal and no other convention exists.
- Playwright scaffolding is required because none exists. See sections 3 and 4.

## 2. Per-test breakdown

### Test: `defaults to Easy when the page is freshly loaded`

- **Fixtures / factories:** none beyond Playwright's built-in `page`.
  - Each Playwright test gets a fresh browser context with empty storage, which satisfies "fresh tab, no prior selection".
  - No setup data is needed and nothing needs teardown.
  - No custom fixture file is added. The page object is constructed inline in the test as `new GamePage(page)`.
- **Page-object methods:** `GamePage.goto()`. The locator is `GamePage.modeSelect`.

Steps (as `test.step()` calls):

1. `test.step('Given a fresh browser tab with no prior in-session selection', ...)`
   - Construct `const game = new GamePage(page)`. No action is needed because the context is already fresh.
2. `test.step('When the game page is opened', ...)`
   - `await game.goto()`.
   - `goto()` navigates to `/` and waits inside the page object for `modeSelect` to be visible.
3. `test.step('Then the difficulty dropdown has Easy selected and Hard is not selected', ...)`
   - `await expect(game.modeSelect).toHaveValue('easy')`

**Final assertion (behavior-specific, locator-based):** `await expect(game.modeSelect).toHaveValue('easy')`.

- This is the primary assertion.
- It depends on the work item's prescribed markup `<option value="easy" selected>`. The strategy says `value="easy"` / `value="hard"` with capitalized labels.

Secondary assertions, in the same step 3, confirm the visible selected option:

- `await expect(game.selectedOption('Easy')).toHaveCount(1)`
- `await expect(game.selectedOption('Hard')).toHaveCount(0)`

These use `getByRole('option', { name, selected: true })` scoped to `modeSelect`. Stage 3 should confirm this works under Playwright against the real markup once the dropdown exists. If it does not behave, drop the secondary assertions and keep `toHaveValue('easy')`. Do not fall back to `toContain`-style partial checks.

Not covered, as the strategy lists these as out of scope: selecting Hard, gameplay parameters, persistence across reload, styling and font, start gating, and the disabled state.

## 3. Additions to existing files

None. There are no existing test files, page objects or fixtures in this repo to extend. All test infrastructure is new and listed in section 4.

## 4. New files

### `package.json` (repo root)

- Minimal: `name`, `private: true`, and a `"test": "playwright test"` script.
- devDependencies: `@playwright/test` and `http-server`. Stage 3 picks the current versions. No versions are specified here because they were not verified.
- No runtime dependencies. Do not touch the game's source files.

### `playwright.config.ts` (repo root)

- `testDir: './tests'`
- `fullyParallel: true`
- `use: { baseURL: 'http://localhost:4173', trace: 'on-first-retry' }`
- One project: `chromium` (`devices['Desktop Chrome']`). No cross-browser setup, as the strategy puts cross-browser checks out of scope.
- `webServer`:
  - `command: 'npx http-server . -p 4173 -c-1 --silent'` (serves the repo root with caching disabled)
  - `url: 'http://localhost:4173'`
  - `reuseExistingServer: !process.env.CI`
- This is required because `app.js` is an ES module and will not load from `file://`.

### `.gitignore` (repo root)

- Ignore `node_modules/`, `test-results/` and `playwright-report/`.
- Check first whether a `.gitignore` already exists. None is tracked in this run.

### `tests/pages/GamePage.ts`

Page object for the single game page, covering the difficulty selector and the page as a whole. Signatures only:

```ts
import { type Locator, type Page } from '@playwright/test';

export class GamePage {
  readonly page: Page;
  readonly modeSelect: Locator;

  constructor(page: Page);

  goto(): Promise<void>;
  selectedOption(label: string): Locator; // parameterised locator: method, no `get` prefix
}
```

Locators:

- `modeSelect`: `page.getByRole('combobox')`.
  - It is the only `<select>` on the page.
  - The work item's markup has no `<label>`, so `getByLabel` is unavailable, and the dropdown's accessible name is unknown.
  - If the implementation adds an accessible name (for example `aria-label="Difficulty"` or a `<label>`), tighten this to `getByRole('combobox', { name: /difficulty/i })`.
  - Do not use `#modeEl` unless the role locator is unusable. Per the priority rules, a CSS id is the last resort.
- `selectedOption(label)`: `this.modeSelect.getByRole('option', { name: label, selected: true })`.

Method behavior:

- `goto()`: `await this.page.goto('/')`, then `await this.modeSelect.waitFor({ state: 'visible' })`. The wait lives inside the page object.
  - No `waitForTimeout` and no `networkidle`.
  - The game canvas animates continuously, so do not wait for load-state quiescence.

### `tests/difficulty-mode.spec.ts`

Imports `test` and `expect` from `@playwright/test`, and `GamePage` from `./pages/GamePage`. It contains one `test.describe` with the test from section 2.

## 5. Conventions to follow

- **Locators:** use role-first locators (`getByRole`). Use CSS or id selectors only as a last resort. Avoid `.first()`, `waitForTimeout` and `networkidle`. Use `toHaveValue` for the exact value, not partial matches.
- **Page object:** `readonly` typed locators initialised in the constructor. Async action methods with no `get` prefix. Parameterised locators are plain methods. Waits live in the page object, not in the spec.
- **Fixtures/data:** no API or setup data exists for this static game. Rely on Playwright's per-test fresh context for the "fresh tab" precondition. Do not set `localStorage` or cookies, and do not interact with the dropdown.
- **Scope:** write only the TC-002 test and the minimal scaffolding it needs. Do not modify `index.html`, `app.js` or `grid.js`. The test is expected to fail until WI #23's dropdown is implemented.
- **Test title:** states the user-visible behavior proved: `defaults to Easy when the page is freshly loaded`.
