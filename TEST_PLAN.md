# Test Plan — WI #23 / TC-004 "Hard mode — aggressive gameplay"

> **Converts:** `TEST_STRATEGY.md` (this branch) → concrete implementation plan for stage 3.
> **Scope:** automate **only** TC-004 (Hard-mode aggressive gameplay), decomposed by the strategy into three behaviors (enemy advance speed, fire cadence, wave spawn cadence). Everything in the strategy's §4 stays out of scope.
>
> **Generation decision (resolved before this plan — do not re-open).** The strategy left one choice to generation: real tests vs `test.skip()` for the three canvas-rendered behaviors. **Decision: skipped placeholders, tests-only, zero app changes.** All three tests are written as fully-structured `test.skip()` tests — real titles, `test.step()` Given/When/Then lines, page-object methods, and the intended observational assertions — each skipped with a documented reason. The spec is real, correctly named, and ≥2 tests; it becomes executable once **both** the difficulty feature **and** an observability seam land. **No edits to `app.js`, `grid.js`, or `index.html`.**
>
> **Why skipped (the one reason, applied to all three tests).** Verified on this branch: the difficulty feature is unimplemented (`index.html` has no `#modeEl`; the game auto-starts at `app.js:248 animate()`; `grid.js:12` hardcodes `velocity.x = 6`; fire is `app.js:164 frames % 100`; spawn is `app.js:33/241 random()*500+500`), and all gameplay is drawn to `<canvas>` with the **only** DOM hook being `#scoreEl`. A real, passing assertion that "Hard is more aggressive" needs (a) the feature and (b) a seam that makes enemy velocity / invader-projectile cadence / wave-spawn cadence observable. Neither exists, and designing the seam was explicitly declined (that was the rejected option A/C). So the three gameplay metrics are reached through stubbed page-object methods whose bodies are filled in — and the `test.skip` removed — in one place when the feature + seam arrive.

> **Harness is NOT designed here (per strategy §3).** `package.json` / `@playwright/test` install, `playwright.config.ts` (`testDir: 'tests'`, `baseURL`), and a static file server for the game are a **next-stage** prerequisite the strategy intentionally defers. This plan names them as dependencies only; `GamePage.goto()` assumes `baseURL → '/'`. Because every test is skipped, the absence of the harness does not make this plan's output wrong — it makes it not-yet-runnable, which is the intended state.

---

## 1. Spec file

- **Path:** `tests/difficulty-mode.spec.ts`
- **New file.** Not extending anything — the repo is greenfield for e2e (verified: no `tests/`, `package.json`, `playwright.config.ts`, page objects, or fixtures on this branch, on `main`, or on the cited precedent `feature/wi-4-tests`, which carries planning docs only).
- **Naming** follows the precedent set by `wi-4-tests` (`tests/<group>.spec.ts`, named after the behavior **group**). Here the group is **difficulty mode**, so `difficulty-mode.spec.ts` — not a single action. Future difficulty test cases (Easy-mode gameplay, default/reset-on-reload, dropdown styling) **extend this same file** when they come into scope (strategy §3).
- **Structure:** one `test.describe('Difficulty mode — Hard aggressive gameplay', { tag: '@TC-004' }, …)` block holding all three tests. The `@TC-004` tag on the describe is inherited by every test, realizing the strategy's "all three multi-tag TC-004."
- **Imports:** `import { test, expect } from './fixtures/game.fixture';` (the local fixture re-exports `expect` and injects the `gamePage` fixture). Do **not** import `test`/`expect` directly from `@playwright/test` in the spec.

---

## 2. Per-test breakdown

Shared shape (all three): each test's **first body line** is `test.skip(true, '<reason>')` so it is unconditionally skipped with a reason recorded in the report; the `test.step()` scaffold and assertion follow so the spec is structurally complete and un-skippable in one edit. Reason string (identical for all three):
`'Blocked: difficulty feature (dropdown + Hard config + start gate) unimplemented AND gameplay is canvas-rendered with no observability seam. Un-skip when both land.'`

**Setup / fixtures / factories (common to all three).** Setup is the `gamePage` fixture only — it constructs `GamePage` and navigates to the app. **There are no factory/provider calls: the game has no backend, API, database, or persisted data**, so there is nothing to create via an API and nothing to tear down server-side. The only "setup" that touches the UI is selecting the difficulty — which is legitimate because choosing the mode **is the behavior under test** (the UI-subject carve-out to the "no UI-driven setup" rule). Per-test isolation is Playwright's default (fresh browser context per test), so tests are parallel-safe with no shared/mutable data to uniquify.

Each test samples the **same** metric in Easy and in Hard over equal observation windows and asserts Hard > Easy. This is a **relative/observational** assertion (strategy §2: Hard targets 8 / 60 / 300–700 are reference-only, not frame-exact), so it does not hardcode the documented numbers.

Spec-level constant to declare once: `const SAMPLE_WINDOW_FRAMES = 600; // reference observation window; tune when the seam lands`.

### Test 1 — `Hard-mode enemies advance faster than Easy-mode`
Title states what the assertion proves (relative advance speed).
- `test.step('Given the game page is loaded', …)` → fixture already navigated; `await gamePage.selectMode('easy')`.
- `test.step('When enemy advance speed is sampled in Easy, then in Hard', …)` →
  - `const easySpeed = await gamePage.enemyAdvanceSpeed();`
  - `await gamePage.reset();` (reload → back to default Easy, resets game state)
  - `await gamePage.selectMode('hard'); await gamePage.startGame();`
  - `const hardSpeed = await gamePage.enemyAdvanceSpeed();`
- `test.step('Then Hard advances faster than Easy', …)` →
  - **Assertion:** `expect(hardSpeed).toBeGreaterThan(easySpeed);`
- **Page-object methods:** `selectMode`, `startGame`, `enemyAdvanceSpeed`, `reset`.

### Test 2 — `Hard-mode enemies fire more frequently than Easy-mode`
- `test.step('Given the game page is loaded', …)` → `await gamePage.selectMode('easy'); await gamePage.startGame();`
- `test.step('When invader fire is counted over a fixed window in Easy, then in Hard', …)` →
  - `const easyShots = await gamePage.invaderFireCount(SAMPLE_WINDOW_FRAMES);`
  - `await gamePage.reset();`
  - `await gamePage.selectMode('hard'); await gamePage.startGame();`
  - `const hardShots = await gamePage.invaderFireCount(SAMPLE_WINDOW_FRAMES);`
- `test.step('Then Hard fires more often than Easy', …)` →
  - **Assertion:** `expect(hardShots).toBeGreaterThan(easyShots);`
- **Page-object methods:** `selectMode`, `startGame`, `invaderFireCount`, `reset`.

### Test 3 — `Hard-mode enemy waves spawn more frequently than Easy-mode`
- `test.step('Given the game page is loaded', …)` → `await gamePage.selectMode('easy'); await gamePage.startGame();`
- `test.step('When new waves are counted over a fixed window in Easy, then in Hard', …)` →
  - `const easyWaves = await gamePage.waveSpawnCount(SAMPLE_WINDOW_FRAMES);`
  - `await gamePage.reset();`
  - `await gamePage.selectMode('hard'); await gamePage.startGame();`
  - `const hardWaves = await gamePage.waveSpawnCount(SAMPLE_WINDOW_FRAMES);`
- `test.step('Then Hard spawns waves more often than Easy', …)` →
  - **Assertion:** `expect(hardWaves).toBeGreaterThan(easyWaves);`
- **Page-object methods:** `selectMode`, `startGame`, `waveSpawnCount`, `reset`.

> **Why `toBeGreaterThan` (not `toHaveText`/exact).** The subject is a numeric gameplay metric obtained through the seam, and the strategy mandates relative/observational assertions. Exact-value and partial-numeric-text assertions are deliberately avoided (the latter is an anti-pattern; the former is out of scope per strategy §4).

---

## 3. Additions to existing files

**None.** No existing test files, page objects, or fixtures exist (greenfield — verified). There is nothing to extend and no existing `describe` block to add to. Every locator, method, and fixture is introduced in new files — see §4. **No changes to application files** (`app.js`, `grid.js`, `index.html`) — this is the resolved tests-only decision.

---

## 4. New files

Three new files. Signatures only — stage 3 writes the bodies described.

### 4.1 `tests/pages/game.page.ts` — page object for the one game page (`index.html`)
`GamePage` (one page object for the single game page; reused by future difficulty specs and any later smoke spec). Locators are `readonly`, typed, initialized in the constructor; action methods are `async`, no `get` prefix; synchronization waits live inside the methods.

```ts
import { type Page, type Locator } from '@playwright/test';

export class GamePage {
  readonly page: Page;
  // The future <select id="modeEl">. Exactly one <select> on the page →
  // getByRole('combobox') is stable & behavior-meaningful (preferred over the
  // #modeEl CSS anchor). Does not exist yet → a reason the tests are skipped.
  readonly modeSelect: Locator;      // page.getByRole('combobox')
  // Feature-dependent: the strategy/work-item imply a pre-game start gate must be
  // added (game currently auto-starts). Best-guess accessible locator; confirm
  // when the feature lands. Also a reason the tests are skipped.
  readonly startControl: Locator;    // page.getByRole('button', { name: /start/i })
  // No role/id; exactly one canvas → CSS is the justified last resort. Used only
  // for a readiness wait inside startGame().
  readonly canvas: Locator;          // page.locator('canvas')

  constructor(page: Page);

  // --- Real now (no seam needed) ---
  async goto(): Promise<void>;                 // page.goto('/'); wait for modeSelect visible
  async reset(): Promise<void>;                // page.reload() → default Easy; wait for modeSelect visible
  async selectMode(mode: 'easy' | 'hard'): Promise<void>; // modeSelect.selectOption(mode)
  async startGame(): Promise<void>;            // click startControl; wait for canvas visible (no waitForTimeout)

  // --- Seam-dependent STUBS (bodies throw until the feature + observability seam exist) ---
  // Signatures & return types are fixed now so the spec is structurally complete.
  // Each body: `throw new Error('Not implemented: requires difficulty feature + observability seam (see TEST_PLAN §"Why skipped"); test is skipped until both land.');`
  // Do NOT invent a window.__invadersTest-style seam contract here — designing the
  // seam was explicitly out of scope (rejected option A/C). The sampling must,
  // when implemented, avoid waitForTimeout/networkidle (e.g. expect.poll on a
  // frame-stamped counter the seam exposes).
  async enemyAdvanceSpeed(): Promise<number>;                 // enemy formation horizontal speed, px/frame
  async invaderFireCount(windowFrames: number): Promise<number>; // invader projectiles fired within the window
  async waveSpawnCount(windowFrames: number): Promise<number>;   // new enemy waves spawned within the window
}
```

### 4.2 `tests/fixtures/game.fixture.ts` — provides a navigated page object
```ts
import { test as base } from '@playwright/test';
import { GamePage } from '../pages/game.page';

type GameFixtures = { gamePage: GamePage };

export const test = base.extend<GameFixtures>({
  // Setup: construct + navigate. Teardown: no-op by design — this client-only
  // game creates no server-side/persisted data; Playwright auto-closes the page
  // context. (No factory/provider layer exists for this app.)
  gamePage: async ({ page }, use) => { /* new GamePage(page); await .goto(); await use(...) */ },
});

export { expect } from '@playwright/test';
```

### 4.3 `tests/difficulty-mode.spec.ts` — the spec (§1 + §2)
```ts
import { test, expect } from './fixtures/game.fixture';

const SAMPLE_WINDOW_FRAMES = 600; // reference observation window; tune when the seam lands

test.describe('Difficulty mode — Hard aggressive gameplay', { tag: '@TC-004' }, () => {
  // Test 1 / Test 2 / Test 3 exactly as specified in §2:
  //   first body line: test.skip(true, '<reason from §2>')
  //   then Given/When/Then test.step(...) lines and the toBeGreaterThan assertion.
});
```

> **No factory/provider file** is created: the application has no API, database, or persisted state, so there is no data layer to build factories against. (Section 3's "factory/provider methods" requirement is N/A for this app and is recorded as such here rather than omitted.)

---

## 5. Conventions to follow

1. **Layout & naming (from the `wi-4-tests` precedent + standard Playwright):** TypeScript specs under `tests/` at the repo root, named after the behavior **group** (`difficulty-mode.spec.ts`). This plan additionally establishes `tests/pages/` (page objects) and `tests/fixtures/` (fixtures) as the home for the POM/fixture pattern — reuse them for future specs; don't invent parallel layouts.
2. **Locator priority:** `getByRole`/`getByLabel` first (`modeSelect` = `getByRole('combobox')`, `startControl` = `getByRole('button', { name: /start/i })`); CSS only as a justified last resort (`canvas`, and the pre-existing `#scoreEl` hook) with a one-line reason. No `.first()` on broad locators.
3. **Page-object pattern:** one page object per page (`GamePage` for `index.html`); `readonly` typed locators initialized in the constructor; `async` methods with no `get` prefix; **synchronization waits live inside page-object methods**, never in the spec; no `waitForTimeout`, no `networkidle`.
4. **Fixtures & data:** setup flows through the `gamePage` fixture, which owns lifecycle; teardown is an intentional no-op because this client-only game persists nothing server-side (no API/DB/factory layer exists). Default per-test context isolation keeps runs parallel-safe; there is no test data to uniquify.
5. **Assertions & scope:** relative/observational only (`toBeGreaterThan` on seam-sourced metrics), never exact difficulty numbers or partial numeric text. Every test is `test.skip(true, …)` with a documented reason and stays that way until the difficulty feature **and** an observability seam land — and this branch makes **zero** changes to `app.js`, `grid.js`, or `index.html`.
