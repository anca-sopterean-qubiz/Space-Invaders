# Test Strategy — WI #4 "Test work item"

> **Scope note.** WI #4 is placeholder (no symptom, no acceptance criteria, no attachments) and has **no linked test cases**. Per direction taken with the requester, this strategy defines a **minimal smoke suite** — the first Playwright e2e coverage for the game — verifying the app boots and its initial UI is present. Gameplay coverage is explicitly deferred (see *Out of scope*).

## 1. Feature area

Application bootstrap / initial page load of the Space Invaders game — the HTML entry point (`index.html`) rendering the game canvas and the initial score display.

## 2. Behaviors to cover

Derived from the smoke scope (no linked TCs to map):

1. **Game page loads successfully** — navigating to the app serves the page, the `app.js` ES module executes, and the document reaches a ready state with no fatal load/script error.
2. **Game canvas renders** — the game `<canvas>` element is present and visible in the page layout.
3. **Score display initializes to 0** — the on-screen score readout (`#scoreEl`) is present and shows `0` at game start.

*(3 behaviors → 3 tests in one spec, satisfying the ≥2-tests-per-spec constraint.)*

## 3. Spec placement

The repo is greenfield for testing — **no** existing Playwright config, spec files, or tests to extend — so a new spec is justified. Following the **standard/official Playwright convention** (the requester elected to follow an external/standard convention and did not supply a repo-specific doc):

- **Location:** `tests/` (Playwright's default `testDir`) at the repository root.
- **File:** `tests/smoke.spec.ts` — named after the *group* of behaviors (smoke / bootstrap), not after any single action; all three behaviors above live here as one test each.

> Config/harness (a `playwright.config.ts` at the root and a static server for `baseURL`, since the app is plain static files) are **next-stage** setup concerns and are intentionally not designed here.

## 4. Out of scope

Not represented by any linked TC and excluded from this smoke suite:

- **All gameplay behaviors** (deferred to a later suite): ship left/right movement and canvas-bound clamping, shooting / projectile spawn, invader spawn and advance, invader-hit score increment (+100), and game-over alert + page reload.
- **Canvas drawn-content correctness** — the smoke suite verifies the canvas element renders, not the pixels/sprites painted on it (visual-regression territory).
- **Performance / frame-rate benchmarks** and load-time thresholds.
- **Accessibility audit.**
- **Cross-browser / device matrix** beyond a single default project.
- **Audio / image asset-loading** verification.
