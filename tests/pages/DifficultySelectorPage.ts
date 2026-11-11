import { expect, type Locator, type Page } from '@playwright/test';

export type Box = { x: number; y: number; width: number; height: number };

export class DifficultySelectorPage {
  readonly page: Page;
  readonly modeSelect: Locator;
  readonly modeOptions: Locator;
  readonly canvas: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modeSelect = page.getByRole('combobox');
    this.modeOptions = this.modeSelect.getByRole('option');
    // <canvas> has no ARIA role, text or label; it is the only canvas on the page.
    this.canvas = page.locator('canvas');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    // app.js sets canvas.width = 1024 once the module script has run.
    await expect(this.canvas).toHaveJSProperty('width', 1024);
  }

  async openDropdown(): Promise<void> {
    await this.modeSelect.click();
  }

  async boundingBoxes(): Promise<{ selector: Box; canvas: Box }> {
    const selector = await this.modeSelect.boundingBox();
    const canvas = await this.canvas.boundingBox();
    if (!selector) throw new Error('Difficulty selector has no bounding box (not rendered)');
    if (!canvas) throw new Error('Canvas has no bounding box (not rendered)');
    return { selector, canvas };
  }
}
