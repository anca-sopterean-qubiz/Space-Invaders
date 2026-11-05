import { test as base } from '@playwright/test';
import { GamePage } from '../pages/game.page';

type GameFixtures = { gamePage: GamePage };

/**
 * `gamePage` fixture: constructs the page object and navigates to the game.
 *
 * Teardown is an intentional no-op — this client-only game creates no server-side or
 * persisted data, and Playwright auto-closes the page/context after each test. There is
 * no factory/provider/API layer for this app, so there is nothing to build or tear down.
 */
export const test = base.extend<GameFixtures>({
  gamePage: async ({ page }, use) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();
    await use(gamePage);
  },
});

export { expect } from '@playwright/test';
