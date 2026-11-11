import { test, expect } from './fixtures/game.fixture';

test.describe('Difficulty mode selector', () => {
  test(
    'difficulty selector is visible and enabled above the game canvas before the game starts',
    { tag: '@TC-001' },
    async ({ gamePage }) => {
      await test.step('Given the game page is loaded', async () => {
        await gamePage.goto();
      });

      await test.step('When I locate the difficulty selector relative to the game canvas', async () => {
        await expect(gamePage.difficultySelect).toBeVisible();
      });

      await test.step('Then the selector is shown and available, and sits above the canvas', async () => {
        await expect(gamePage.difficultySelect).toBeEnabled();
        const { selectorBottom, canvasTop } = await gamePage.verticalPositions();
        expect(selectorBottom).toBeLessThanOrEqual(canvasTop);
      });
    },
  );

  test(
    'opening the difficulty dropdown offers exactly the Easy and Hard options',
    { tag: '@TC-001' },
    async ({ gamePage }) => {
      await test.step('Given the game page is loaded', async () => {
        await gamePage.goto();
      });

      await test.step('When I open the difficulty dropdown', async () => {
        await gamePage.openDifficultyDropdown();
      });

      await test.step('Then exactly the Easy and Hard options are offered', async () => {
        await expect(gamePage.difficultyOptions).toHaveText(['Easy', 'Hard']);
      });
    },
  );
});
