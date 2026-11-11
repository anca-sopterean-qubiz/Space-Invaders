import { type Locator, type Page } from '@playwright/test';

export class GamePage {
  readonly page: Page;
  readonly difficultySelect: Locator;
  readonly difficultyOptions: Locator;
  // <canvas> has no role, text or test id in the markup; it is the only canvas on the page.
  readonly canvas: Locator;

  constructor(page: Page) {
    this.page = page;
    this.difficultySelect = page.getByRole('combobox');
    this.difficultyOptions = this.difficultySelect.getByRole('option');
    this.canvas = page.locator('canvas');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.canvas.waitFor({ state: 'visible' });
  }

  async openDifficultyDropdown(): Promise<void> {
    await this.difficultySelect.click();
  }

  async verticalPositions(): Promise<{ selectorBottom: number; canvasTop: number }> {
    const selectBox = await this.difficultySelect.boundingBox();
    const canvasBox = await this.canvas.boundingBox();
    if (!selectBox) {
      throw new Error('Difficulty selector has no bounding box (not rendered).');
    }
    if (!canvasBox) {
      throw new Error('Game canvas has no bounding box (not rendered).');
    }
    return { selectorBottom: selectBox.y + selectBox.height, canvasTop: canvasBox.y };
  }
}
