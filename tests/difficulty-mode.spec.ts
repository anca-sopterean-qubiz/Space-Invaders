import { test, expect } from '../fixtures';

test.describe('Difficulty mode selector', () => {
  test('defaults to Easy when the game page is first loaded', { tag: '@TC-002' }, async ({ gamePage }) => {
    await test.step('Given the game page is opened in a fresh browser context', async () => {
      await gamePage.goto();
    });

    await test.step('When the difficulty dropdown is read', async () => {
      // Reading the selected value is the assertion in the next step; no interaction.
    });

    await test.step('Then the selected difficulty is Easy', async () => {
      await expect(gamePage.difficultySelect).toHaveValue(/^easy$/i);
    });
  });
});
