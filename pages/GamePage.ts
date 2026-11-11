import { expect, type Locator, type Page } from '@playwright/test';

export class GamePage {
  readonly page: Page;
  readonly difficultySelect: Locator;

  constructor(page: Page) {
    this.page = page;
    // A native <select> exposes the ARIA role "combobox"; it is the only one on the page.
    this.difficultySelect = page.getByRole('combobox');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await expect(this.difficultySelect).toBeVisible();
  }
}
