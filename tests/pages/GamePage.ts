import { type Locator, type Page } from '@playwright/test';

export class GamePage {
  readonly page: Page;
  readonly modeSelect: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modeSelect = page.getByRole('combobox');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.modeSelect.waitFor({ state: 'visible' });
  }

  selectedOption(label: string): Locator {
    return this.modeSelect.getByRole('option', { name: label, selected: true });
  }
}
