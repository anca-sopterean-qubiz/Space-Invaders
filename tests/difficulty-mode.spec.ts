import { test, expect } from '@playwright/test';
import { GamePage } from './pages/GamePage';

test.describe('Difficulty mode selector', () => {
  test(
    'defaults to Easy when the page is freshly loaded',
    { tag: '@TC-002' },
    async ({ page }) => {
      let game: GamePage;

      await test.step('Given a fresh browser tab with no prior in-session selection', async () => {
        game = new GamePage(page);
      });

      await test.step('When the game page is opened', async () => {
        await game.goto();
      });

      await test.step('Then the difficulty dropdown has Easy selected and Hard is not selected', async () => {
        await expect(game.modeSelect).toHaveValue('easy');
        await expect(game.selectedOption('Easy')).toHaveCount(1);
        await expect(game.selectedOption('Hard')).toHaveCount(0);
      });
    },
  );
});
