# TEST_PLAN — WI #4, TC-001 "Player ship moves left when 'A' key is held"

## Repo findings (verified by reading the repo in this run)
- Static, no-build app: `index.html`, `app.js`, `player.js`, `grid.js`, `invader.js`, `projectiles.js`. There is no `package.json`, no Playwright config, no `tests/` directory, no `.gitignore`, and no conventions doc. Stage 3 therefore creates the minimal Playwright scaffolding in section 4.
- `index.html` loads `app.js` as `<script type="module">`. Chromium blocks module scripts over `file://`, so the app must be served over HTTP. `python3` is not installed in this sandbox, so use the `http-server` npm package (not installed or run in this run, so unverified). Node v22.23.1 and npm 10.9.8 are present.
- The ship position cannot be read from the DOM or from globals. `player` is a module-scoped `const` in `app.js` (line 14), and `app.js` only exports `scoreEl`, `canvas` and `c`.
- `Player.draw()` (`player.js` line 50) calls `c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)`. The second argument is the raw `position.x`; the rotation and translation are applied to the context transform, not to this argument. `image.src` ends with `/images/spaceship.png`.
- Input: `keydown` with `key === 'a'` sets `keys.a.pressed`. `animate()` then sets `player.velocity.x = -8` while `player.position.x >= 0`, and `Player.update()` adds the velocity to `position.x` each frame (`app.js` 227-229, `player.js` 60-65).
- Start position is `canvas.width / 2 - width / 2` with `canvas.width = 1024`. It is only set after the ship image loads (`Player.loaded`).
- Hazard: invaders shoot every 100 frames and a hit on the ship triggers `alert()` plus `location.reload()` after 2 s. A hit within the roughly one second of the test is unlikely. The page object must still register a dialog handler so a stray alert cannot hang the test.

## 1. Spec file
- Path: `tests/player-movement.spec.ts`. This is a **new** file, because no spec exists. It is named after the group (player movement), not after one action.
- One top-level `test.describe('Player movement', ...)`.
- It contains one test, tagged `TC-001`. The "min 2 tests per spec" rule conflicts with the scope instruction to automate only TC-001. Follow the scope instruction and do not add a filler test.

## 2. Per-test breakdown

### Test: `'TC-001: player ship moves left on the canvas while the A key is held'`
Tag: `{ tag: ['@smoke', '@TC-001'] }`. Priority High, type Smoke.

**Setup data.** None. The game generates its own state. No API or factory calls are needed, and there is nothing to tear down. Parallel safety comes from each test getting a fresh page and a fresh page-scoped init script.

**Fixture used.** `gamePage` (a `GamePage` instance, see section 4). The fixture runs `gamePage.open()` before the test body, so the body starts at the "game loaded" state.

**Steps (`test.step()` lines):**
1. `await test.step('Given the game is loaded and the player ship is at the canvas bottom center', ...)`
   - Calls `gamePage.waitForShipRendered()`. This resolves once the ship's x has been recorded.
   - Reads `const startX = await gamePage.shipX()`.
   - `expect(startX).toBeGreaterThan(0)` and `expect(startX).toBeLessThan(1024)` are sanity checks that the value is a real on-canvas position. These bounds are not part of the TC-001 expectation, so keep them minimal.
2. `await test.step("When the 'A' key is held", ...)`
   - Calls `gamePage.holdMoveLeftKey()`. This does `page.keyboard.down('a')`.
3. `await test.step('And the ship has moved left from the start position', ...)`
   - Calls `gamePage.waitForShipToPassLeftOf(startX)`. This is an `expect.poll` that waits for the ship's x to drop below `startX`. It replaces a fixed 1 s sleep and uses no `waitForTimeout`.
4. `await test.step("And the 'A' key is released", ...)`
   - Calls `gamePage.releaseMoveLeftKey()`. This does `page.keyboard.up('a')`.
   - Putting the release in a `test.step` (not in teardown only) matches TC step 4. The page object also releases the key in the fixture teardown so a failed assertion cannot leave the key held.
5. `await test.step('Then the ship x-position is less than the starting x-position', ...)`
   - Reads `const endX = await gamePage.shipX()`.
   - **Final assertion:** `expect(endX).toBeLessThan(startX)`.
   - The ship stops once the key is released, so `endX` is less than or equal to its value at poll time. It stays below `startX` because the ship only moves left (velocity -8 or 0).

**Page-object methods called:** `open` (via fixture), `waitForShipRendered`, `shipX`, `holdMoveLeftKey`, `waitForShipToPassLeftOf`, `releaseMoveLeftKey`.

**Observation design decision (resolves the strategy's open question).** The test is real, not `test.skip()`, and the ship x is observed with **no change to application code**:
- `GamePage.open()` calls `page.addInitScript` **before** `page.goto('/')`. The init script wraps `CanvasRenderingContext2D.prototype.drawImage`.
- The wrapper calls the original, then checks `image instanceof HTMLImageElement && image.src.endsWith('/images/spaceship.png')`. If true, it stores the `dx` argument (the second `drawImage` argument, which is `player.position.x`) in `window.__ship = { x: dx }`.
- `shipX()` returns `page.evaluate(() => window.__ship?.x)`. The value is the raw model x-coordinate, not pixel-sampled, so stars, invaders and rotation do not affect it.
- Rejected alternatives: pixel scanning of the canvas (stars and invader projectiles add noise, and rotation shifts pixels) and rewriting `player.js` through `page.route` (fragile string substitution).
- This relies on the game loop calling `drawImage` for the ship every animation frame, which `Player.update()` does when `loaded` is true.

## 3. Additions to existing files
None. No Playwright test infrastructure exists in this repo. The only existing files are application sources, and none of them should be modified.

## 4. New files

### `package.json`
- `"private": true`, `"type": "commonjs"` (default) and no runtime dependencies.
- devDependencies: `@playwright/test`, `http-server`, `typescript` (optional; Playwright compiles TS itself, so omit if not needed).
- scripts: `"test": "playwright test"`.
- Stage 3 runs `npm install` and `npx playwright install chromium` to generate the lockfile and browsers. It must report honestly if network access blocks this.

### `.gitignore`
```
node_modules/
test-results/
playwright-report/
```

### `playwright.config.ts`
- `testDir: './tests'`
- `fullyParallel: true`
- `use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' }`
- `projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]`
- `webServer: { command: 'npx http-server . -p 4173 -a 127.0.0.1 -c-1 --silent', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI }`

### `tests/pages/game.page.ts`
```ts
import { expect, type Page } from '@playwright/test';

export class GamePage {
  readonly canvas: Locator;                 // page.locator('canvas')  (CSS: the only <canvas> on the page and it has no role, label, text or test id)
  readonly score: Locator;                  // page.locator('#scoreEl')  (declared for later specs; not used by TC-001. Omit if stage 3 prefers strictly-needed members only.)

  constructor(private readonly page: Page);

  open(): Promise<void>;                    // addInitScript(drawImage hook), page.on('dialog', d => d.dismiss()), page.goto('/'), expect(this.canvas).toBeVisible()
  waitForShipRendered(): Promise<void>;     // expect.poll(() => this.shipX()).toBeDefined() — resolves once the hook has recorded the ship
  shipX(): Promise<number>;                 // page.evaluate(() => window.__ship?.x) — throws if undefined, so use only after waitForShipRendered
  holdMoveLeftKey(): Promise<void>;         // page.keyboard.down('a')
  releaseMoveLeftKey(): Promise<void>;      // page.keyboard.up('a')
  waitForShipToPassLeftOf(x: number): Promise<void>; // expect.poll(() => this.shipX(), { timeout: 5_000 }).toBeLessThan(x)
}
```
- `Locator` is imported from `@playwright/test`.
- `window.__ship` needs a `declare global { interface Window { __ship?: { x: number } } }` block in this file.
- `shipX()` should coerce the undefined case into an explicit error message (`'Ship has not been drawn yet'`), not return `undefined`.
- The `canvas` locator is a CSS selector, justified as the last resort. A role or text locator cannot match a bare `<canvas>`. Do not add application markup (such as a test id) to `index.html` for this.

### `tests/fixtures.ts`
```ts
import { test as base } from '@playwright/test';
import { GamePage } from './pages/game.page';

export const test = base.extend<{ gamePage: GamePage }>({
  gamePage: async ({ page }, use) => {
    const gamePage = new GamePage(page);
    await gamePage.open();
    await use(gamePage);
    await gamePage.releaseMoveLeftKey();   // teardown: never leave 'A' held after a failed assertion
  },
});
export { expect } from '@playwright/test';
```

### `tests/player-movement.spec.ts`
- Imports `{ test, expect }` from `./fixtures`.
- Contains the single test from section 2, inside `test.describe('Player movement', ...)`.

## 5. Conventions to follow
- No conventions exist in this repo, so apply the universal rules. Locators are `readonly` typed fields initialised in the constructor. Action methods are async with no `get` prefix. Synchronisation lives inside page-object methods.
- The only locator is the CSS `canvas` selector (documented last resort). Do not add `getByTestId` or change application files.
- No `waitForTimeout` and no `networkidle`. "Hold for about a second" is realised by polling for the concrete state "ship x < start x", with the key held.
- Use `toBeLessThan` for the final assertion, because the TC expects a strictly lower x and exact pixel values depend on frame timing.
- Serve the game over HTTP (`http-server` via the Playwright `webServer`), because ES modules do not load from `file://`.
- Unverified in this run: that `npm install`, `npx playwright install` and the `http-server` start work in the sandbox, and that the test passes. Stage 3 must run the spec and report the actual result.
