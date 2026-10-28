# TEST_PLAN — WI-8: Validate month inputs in YYYY-MM format

## 1. Spec file

**Path:** `tests/e2e/month-validation.spec.ts`

**Status:** New file. No Playwright infrastructure or test files of any kind exist in this repository. All test-related files listed in sections 3–4 must be created from scratch.

**Group:** `month-validation` — all 11 behaviors from the strategy (YYYY-MM format enforcement on the Bill form and the Water Reading form) are co-located in this single file. File is named after the feature group, not after a single action.

---

## 2. Per-test breakdown

### Test 1 — valid YYYY-MM value is accepted on the bill form

**Title:** `"valid YYYY-MM value is accepted on the bill form"`

**Steps:**
```
test.step('given the user is on the bill form', ...)
test.step('when "2025-03" is entered in the Month field and all other required fields are filled with valid values', ...)
test.step('and the form is submitted', ...)
test.step('then no validation error is shown and the record is saved', ...)
```

**Fixtures / factories:** `billFormPage` fixture (backed by `authenticatedPage`). No pre-existing data required.

**Page-object methods called:**
- `billFormPage.navigate()`
- `billFormPage.fillRequiredFields({ month: '2025-03' })`
- `billFormPage.submit()`

**Final assertion:**
```ts
await expect(billFormPage.validationError).not.toBeVisible();
await expect(billFormPage.successConfirmation).toBeVisible();
```
`successConfirmation` locator strategy: attempt `getByRole('status')` first; fall back to `getByText(/<success pattern>/i)` discovered by inspecting the app's post-submit UI during stage 3.

---

### Test 2 — valid YYYY-MM value is accepted on the water reading form

**Title:** `"valid YYYY-MM value is accepted on the water reading form"`

**Steps:**
```
test.step('given the user is on the water reading form', ...)
test.step('when "2025-03" is entered in the Month field and all other required fields are filled with valid values', ...)
test.step('and the form is submitted', ...)
test.step('then no validation error is shown and the record is saved', ...)
```

**Fixtures / factories:** `waterReadingFormPage` fixture. No pre-existing data required.

**Page-object methods called:**
- `waterReadingFormPage.navigate()`
- `waterReadingFormPage.fillRequiredFields({ month: '2025-03' })`
- `waterReadingFormPage.submit()`

**Final assertion:**
```ts
await expect(waterReadingFormPage.validationError).not.toBeVisible();
await expect(waterReadingFormPage.successConfirmation).toBeVisible();
```

---

### Tests 3–6 — invalid month values rejected on the bill form (parameterised)

Use `test.each` so each case produces a separately reportable test. This maps to behaviors 3, 5, 7, 9 from the strategy.

**Parameterised matrix:**

| `label` | `month` |
|---|---|
| `'single-digit month (YYYY-M)'` | `'2025-3'` |
| `'reversed format (MM-YYYY)'` | `'03-2025'` |
| `'out-of-range month (YYYY-13)'` | `'2025-13'` |
| `'empty month value'` | `''` |

**Title template:** `"${label} is rejected on the bill form"`

**Steps (per case):**
```
test.step(`given the user is on the bill form`, ...)
test.step(`when "${month}" is entered in the Month field and other required fields are filled`, ...)
test.step('and the form is submitted', ...)
test.step('then the validation error is shown and the record is not saved', ...)
```

**Fixtures / factories:** `billFormPage` fixture. No pre-existing data required.

**Page-object methods called:**
- `billFormPage.navigate()`
- `billFormPage.fillRequiredFields({ month })` — when `month` is `''`, `fillMonth` must call `.clear()` without typing anything
- `billFormPage.submit()`

**Final assertion:**
```ts
await expect(billFormPage.validationError).toBeVisible();
await expect(billFormPage.validationError).toHaveText(
  'Enter the month as YYYY-MM, such as 2025-03'
);
await expect(billFormPage.successConfirmation).not.toBeVisible();
```

---

### Tests 7–10 — invalid month values rejected on the water reading form (parameterised)

Same `test.each` matrix as tests 3–6. Maps to behaviors 4, 6, 8, 10 from the strategy.

**Title template:** `"${label} is rejected on the water reading form"`

**Steps, fixtures, and page-object methods:** identical to tests 3–6 with `waterReadingFormPage` substituted for `billFormPage`.

**Final assertion:**
```ts
await expect(waterReadingFormPage.validationError).toBeVisible();
await expect(waterReadingFormPage.validationError).toHaveText(
  'Enter the month as YYYY-MM, such as 2025-03'
);
await expect(waterReadingFormPage.successConfirmation).not.toBeVisible();
```

---

### Test 11 — existing records are not affected by the validation change

**Title:** `"existing bill and water reading records remain visible and unchanged after month validation is enforced"`

**Steps:**
```
test.step('given a bill record with month "2025-03" was created via API before this test', ...)
test.step('and a water reading record with month "2025-03" was created via API before this test', ...)
test.step('when the user navigates to the bills list', ...)
test.step('then the pre-created bill record is visible in the list', ...)
test.step('when the user navigates to the water readings list', ...)
test.step('then the pre-created water reading record is visible in the list', ...)
```

**Fixtures / factories:**
- `billRecord` fixture — uses `APIRequestContext.post()` to create a bill with `{ month: '2025-03' }` plus a `ref: crypto.randomUUID()` injected into a name/reference field. Yields `{ id: string, ref: string }`. Tears down via `APIRequestContext.delete()` keyed on `id`. Actual endpoint path (`/api/bills` or similar) must be discovered from the application's API routes during stage 3.
- `waterReadingRecord` fixture — same pattern for water readings. Endpoint to be discovered from app during stage 3.
- Both fixtures use a unique `ref` string for parallel-safe row lookup in the list.

**Page-object methods called:**
- `billsListPage.navigate()`
- `billsListPage.rowByRef(billRecord.ref)` → `Locator`
- `waterReadingsListPage.navigate()`
- `waterReadingsListPage.rowByRef(waterReadingRecord.ref)` → `Locator`

**Final assertion:**
```ts
await expect(billsListPage.rowByRef(billRecord.ref)).toBeVisible();
await expect(waterReadingsListPage.rowByRef(waterReadingRecord.ref)).toBeVisible();
```

---

## 3. Additions to existing files

None — no existing test files exist in this repository.

---

## 4. New files

### `playwright.config.ts` (repository root)

```
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: [['html'], ['list']],
  use: {
    baseURL: process.env.BASE_URL,   // required; throw if absent
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
```

---

### `tests/e2e/auth.setup.ts`

Login-once setup project. Reads `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` from `process.env`; navigates to the login page, submits credentials, waits for the authenticated state, saves `storageState` to `.auth/user.json`. Referenced by the `chromium` project via `dependencies: ['setup']`.

Signatures:
```ts
setup('authenticate', async ({ page }): Promise<void>)
```

---

### `tests/e2e/fixtures/index.ts`

Exports a custom `test` (re-exports `expect` unchanged) that extends Playwright's base `test` with the following fixtures:

| Fixture name | Type | Scope | Description |
|---|---|---|---|
| `authenticatedPage` | `Page` | `'test'` | `page` with `storageState` already applied by the setup project |
| `billFormPage` | `BillFormPage` | `'test'` | `BillFormPage` instance bound to `authenticatedPage` |
| `waterReadingFormPage` | `WaterReadingFormPage` | `'test'` | `WaterReadingFormPage` instance |
| `billsListPage` | `BillsListPage` | `'test'` | `BillsListPage` instance |
| `waterReadingsListPage` | `WaterReadingsListPage` | `'test'` | `WaterReadingsListPage` instance |
| `billRecord` | `{ id: string; ref: string }` | `'test'` | Creates bill via API; tears down after test |
| `waterReadingRecord` | `{ id: string; ref: string }` | `'test'` | Creates water reading via API; tears down after test |

`billRecord` and `waterReadingRecord` use `request` (Playwright's `APIRequestContext`) — not a browser page — for API calls.

---

### `tests/e2e/pages/bill-form.page.ts`

```ts
import { Page, Locator } from '@playwright/test';

type BillFormData = {
  month: string;
  // other required fields — types and names to be discovered from the app during stage 3
};

export class BillFormPage {
  readonly monthInput: Locator;         // page.getByLabel('Month')
  readonly submitButton: Locator;       // page.getByRole('button', { name: /Save|Submit/i })
  readonly validationError: Locator;    // page.getByText('Enter the month as YYYY-MM, such as 2025-03')
  readonly successConfirmation: Locator; // locator strategy to be confirmed from app in stage 3

  constructor(private readonly page: Page) {}

  navigate(): Promise<void>;
  fillRequiredFields(overrides?: Partial<BillFormData>): Promise<void>;
  // fills all required fields using defaults, then applies overrides;
  // when overrides.month === '' calls monthInput.clear() without typing
  submit(): Promise<void>;
}
```

---

### `tests/e2e/pages/water-reading-form.page.ts`

```ts
import { Page, Locator } from '@playwright/test';

type WaterReadingFormData = {
  month: string;
  // other required fields — to be discovered from the app during stage 3
};

export class WaterReadingFormPage {
  readonly monthInput: Locator;         // page.getByLabel('Month')
  readonly submitButton: Locator;       // page.getByRole('button', { name: /Save|Submit/i })
  readonly validationError: Locator;    // page.getByText('Enter the month as YYYY-MM, such as 2025-03')
  readonly successConfirmation: Locator; // to be confirmed from app in stage 3

  constructor(private readonly page: Page) {}

  navigate(): Promise<void>;
  fillRequiredFields(overrides?: Partial<WaterReadingFormData>): Promise<void>;
  submit(): Promise<void>;
}
```

---

### `tests/e2e/pages/bills-list.page.ts`

```ts
import { Page, Locator } from '@playwright/test';

export class BillsListPage {
  constructor(private readonly page: Page) {}

  navigate(): Promise<void>;
  // navigates to the bills list URL — path to be discovered from app during stage 3

  rowByRef(ref: string): Locator;
  // getByRole('row').filter({ hasText: ref })
}
```

---

### `tests/e2e/pages/water-readings-list.page.ts`

```ts
import { Page, Locator } from '@playwright/test';

export class WaterReadingsListPage {
  constructor(private readonly page: Page) {}

  navigate(): Promise<void>;
  // navigates to the water readings list URL — path to be discovered from app during stage 3

  rowByRef(ref: string): Locator;
  // getByRole('row').filter({ hasText: ref })
}
```

---

## 5. Conventions to follow

1. **Locator priority:** `getByLabel()` for the Month input (and other labelled fields); `getByRole('button', { name: … })` for the submit button; `getByText('Enter the month as YYYY-MM, such as 2025-03')` (exact string) for the validation error; `getByRole('row').filter({ hasText: ref })` for list rows; CSS selectors only as a last resort.
2. **Page objects:** One class per page/feature area; locators as `readonly` fields initialised in the constructor; all action methods are `async` with no `get` prefix; synchronisation waits (e.g. `waitForURL`, `waitForSelector`) live inside page-object methods, never in the spec.
3. **Data setup:** API calls only via `APIRequestContext` in fixtures — never via UI clicks. Each API fixture injects a `crypto.randomUUID()` string into a name/reference field for parallel-safe record identification. Fixtures own teardown for everything they create.
4. **Auth:** Single login per Playwright worker via `storageState` saved by `auth.setup.ts`. Credentials sourced exclusively from `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` environment variables — never hardcoded.
5. **Anti-patterns to avoid:** No `waitForTimeout`; no `networkidle`; no `toContain` on numeric or partial text — use `toHaveText` with the complete error string; no `.first()` on broad locators.
