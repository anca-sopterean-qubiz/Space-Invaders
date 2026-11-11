import { test as base, expect } from '@playwright/test';
import { DifficultySelectorPage } from './pages/DifficultySelectorPage';

export const test = base.extend<{ difficultySelectorPage: DifficultySelectorPage }>({
  difficultySelectorPage: async ({ page }, use) => {
    await use(new DifficultySelectorPage(page));
  },
});

export { expect };
