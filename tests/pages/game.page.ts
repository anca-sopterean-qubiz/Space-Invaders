import { type Page, type Locator } from '@playwright/test';

/**
 * Page object for the single game page (`index.html`).
 *
 * Reused by future difficulty specs and any later smoke spec. Locators are `readonly`,
 * typed and initialized in the constructor; action methods are `async` with no `get`
 * prefix; synchronization waits live inside the methods (never in the spec).
 *
 * Current-build reality (verified on this branch): the difficulty feature is NOT
 * implemented — there is no `#modeEl` dropdown and no pre-game start control, the game
 * auto-starts on load, and all gameplay is drawn to `<canvas>` with the only DOM hook
 * being `#scoreEl`. The three gameplay-metric methods below are therefore stubs that
 * throw until the feature AND an observability seam land; the spec keeps every test
 * `test.skip(true, …)` for exactly that reason (see TEST_PLAN §"Why skipped").
 */
export class GamePage {
  readonly page: Page;

  // The future `<select id="modeEl">`. Exactly one <select> is planned for the page, so
  // getByRole('combobox') is the stable, behavior-meaningful locator (preferred over a
  // `#modeEl` CSS anchor). Does NOT exist on the current build — a reason tests are skipped.
  readonly modeSelect: Locator;

  // Feature-dependent: the work item implies a pre-game start gate must be added (the game
  // currently auto-starts). Best-guess accessible locator; confirm when the feature lands.
  // Also a reason the tests are skipped.
  readonly startControl: Locator;

  // No role/id and exactly one <canvas> → CSS is the justified last resort. Used as the
  // page-ready signal (the canvas is present on the current build, unlike `#modeEl`).
  readonly canvas: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modeSelect = page.getByRole('combobox');
    this.startControl = page.getByRole('button', { name: /start/i });
    this.canvas = page.locator('canvas');
  }

  // --- Real now (no observability seam needed) ---

  /**
   * Navigate to the game. Waits on the stable `<canvas>` as the page-ready signal: the
   * planned `#modeEl` combobox does not exist on the current build, so waiting for it here
   * would hang the fixture instead of letting the (skipped) tests report cleanly. Switch
   * this wait to `modeSelect` once the difficulty feature lands.
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.canvas.waitFor({ state: 'visible' });
  }

  /**
   * Reload the page → resets to the default (Easy) and clears game state. Waits on the
   * canvas for the same reason as {@link goto}.
   */
  async reset(): Promise<void> {
    await this.page.reload();
    await this.canvas.waitFor({ state: 'visible' });
  }

  /** Choose the difficulty mode via the dropdown (feature-dependent — see class note). */
  async selectMode(mode: 'easy' | 'hard'): Promise<void> {
    await this.modeSelect.selectOption(mode);
  }

  /** Start the game via the pre-game start control; wait for the canvas to be ready. */
  async startGame(): Promise<void> {
    await this.startControl.click();
    await this.canvas.waitFor({ state: 'visible' });
  }

  // --- Seam-dependent stubs (bodies throw until the feature + observability seam exist) ---
  // Signatures and return types are fixed now so the spec is structurally complete and the
  // skips can be removed in one place when the seam arrives. The sampling implementations
  // must, when written, avoid waitForTimeout/networkidle (e.g. expect.poll on a
  // frame-stamped counter the seam exposes). A concrete seam contract is deliberately NOT
  // invented here — designing the seam was out of scope for this plan.
  private static readonly NOT_IMPLEMENTED =
    'Not implemented: requires difficulty feature + observability seam (see TEST_PLAN §"Why skipped"); test is skipped until both land.';

  /** Enemy formation horizontal speed, px/frame (seam-dependent). */
  async enemyAdvanceSpeed(): Promise<number> {
    throw new Error(GamePage.NOT_IMPLEMENTED);
  }

  /** Invader projectiles fired within the observation window (seam-dependent). */
  async invaderFireCount(windowFrames: number): Promise<number> {
    throw new Error(GamePage.NOT_IMPLEMENTED);
  }

  /** New enemy waves spawned within the observation window (seam-dependent). */
  async waveSpawnCount(windowFrames: number): Promise<number> {
    throw new Error(GamePage.NOT_IMPLEMENTED);
  }
}
