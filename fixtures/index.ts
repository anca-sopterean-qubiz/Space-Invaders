import { test as base } from '@playwright/test';
import { GamePage } from '../pages/GamePage';

export const test = base.extend<{ gamePage: GamePage }>({
  gamePage: async ({ page }, use) => {
    await use(new GamePage(page));
  },
});

export { expect } from '@playwright/test';
