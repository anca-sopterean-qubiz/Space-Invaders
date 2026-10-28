# Test Strategy — WI-8: Validate month inputs in YYYY-MM format

## 1. Feature Area

Month input validation on the **Bill form** and the **Water Reading form**.

---

## 2. Behaviors to Cover

1. **Valid YYYY-MM value is accepted on the bill form** — entering `2025-03` allows the record to be saved successfully.
2. **Valid YYYY-MM value is accepted on the water reading form** — entering `2025-03` allows the record to be saved successfully.
3. **Single-digit month (YYYY-M) is rejected on the bill form** — entering `2025-3` shows the error "Enter the month as YYYY-MM, such as 2025-03" and the record cannot be saved.
4. **Single-digit month (YYYY-M) is rejected on the water reading form** — same validation error and save is blocked.
5. **Reversed format (MM-YYYY) is rejected on the bill form** — entering `03-2025` shows the validation error and the record cannot be saved.
6. **Reversed format (MM-YYYY) is rejected on the water reading form** — same validation error and save is blocked.
7. **Out-of-range month (YYYY-13) is rejected on the bill form** — entering `2025-13` shows the validation error and the record cannot be saved.
8. **Out-of-range month (YYYY-13) is rejected on the water reading form** — same validation error and save is blocked.
9. **Empty month value is rejected on the bill form** — submitting with the month field blank shows the validation error and the record cannot be saved.
10. **Empty month value is rejected on the water reading form** — same validation error and save is blocked.
11. **Existing records are not affected by the validation change** — records created before this change remain visible and unchanged after the validation is in place.

---

## 3. Spec Placement

No existing test files were found in this repository. A new spec file should be created:

```
tests/e2e/month-validation.spec.ts
```

All eleven behaviors above belong to the same validation group (month field format enforcement across two related forms) and should be co-located in this single file.

Credentials for authentication should be sourced from the **Test User Credentials** group (to be injected via fixture/environment in the generation stage).

---

## 4. Out of Scope

- Performance or load testing of the save endpoints.
- Accessibility audits of the form fields.
- Validation of other (non-month) fields on the bill or water reading forms.
- Browser compatibility testing beyond the project's standard matrix.
