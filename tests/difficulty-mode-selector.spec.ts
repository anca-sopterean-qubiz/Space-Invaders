import { test, expect } from './fixtures';

test.describe('Difficulty mode selector', () => {
  test(
    'difficulty selector is displayed above the game canvas before the game starts',
    { tag: '@TC-001' },
    async ({ difficultySelectorPage }) => {
      await test.step('Given the game page is loaded', async () => {
        await difficultySelectorPage.goto();
      });

      const boxes = await test.step('When I locate the difficulty selector relative to the game canvas', async () => {
        return difficultySelectorPage.boundingBoxes();
      });

      await test.step('Then the selector is visible, enabled and sits above the canvas', async () => {
        await expect(difficultySelectorPage.modeSelect).toBeVisible();
        await expect(difficultySelectorPage.modeSelect).toBeEnabled();
        expect(boxes.selector.y + boxes.selector.height).toBeLessThanOrEqual(boxes.canvas.y);
      });
    },
  );

  test(
    'difficulty dropdown offers exactly the Easy and Hard options',
    { tag: '@TC-001' },
    async ({ difficultySelectorPage }) => {
      await test.step('Given the game page is loaded', async () => {
        await difficultySelectorPage.goto();
      });

      await test.step('When I open the difficulty dropdown', async () => {
        await difficultySelectorPage.openDropdown();
      });

      await test.step('Then it lists exactly Easy and Hard, in that order', async () => {
        await expect(difficultySelectorPage.modeOptions).toHaveText(['Easy', 'Hard']);
      });
    },
  );
});
