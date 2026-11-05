# Test Strategy — WI #23 "Add difficulty mode selector dropdown (Easy / Hard)"

> **Scope:** automate **only** linked test case **TC-004** — *[Difficulty Selector] Hard mode — aggressive gameplay behavior*. Other acceptance criteria and other test cases of this work item are **out of scope** (Section 4).
>
> **Preconditions (verified against this branch).** The difficulty feature is **not yet implemented**: `index.html` has no `#modeEl` dropdown; `app.js` calls `animate()` immediately so the game **auto-starts on page load** (there is no pre-game "start" control today); enemy speed/fire/spawn are hardcoded (`grid.js` `velocity.x = 6`, `frames % 100`, `random()*500+500`). All gameplay is drawn on `<canvas>` with **no DOM hooks** for enemy position, fire, or spawns. These are downstream-generation concerns (a test seam and/or a start trigger may be needed), noted here for honesty — they do not change *what* TC-004 verifies.

## 1. Feature area

Game Features → **Difficulty & Modes** — the pre-game difficulty selector (Easy / Hard) for the Space Invaders game. This strategy is scoped to **Hard-mode gameplay behavior**.

## 2. Behaviors to cover

One linked test case (TC-004) whose assertion is observational and bundles three distinct user-visible outcomes (its steps 3–5). Each is tested as a single behavior; **all three multi-tag TC-004**. This decomposition satisfies the ≥2-tests-per-spec rule while keeping one user-visible outcome per test and staying strictly within the "only TC-004" scope.

1. **Hard mode makes enemies advance faster** — after choosing Hard and starting, the enemy formation moves horizontally noticeably faster than the baseline. *(covers TC-004)*
2. **Hard mode makes enemies fire more frequently** — enemy projectiles appear at a visibly higher cadence. *(covers TC-004)*
3. **Hard mode makes enemy waves spawn more frequently** — new enemy formations appear at a visibly higher cadence. *(covers TC-004)*

> **Observational, not exact-measurement.** Per TC-004, the documented Hard targets (speed 8 px/frame, fire every 60 frames, spawn 300–700 frames) are **reference only**. Assertions should be relative/observational (Hard is clearly more aggressive), not frame-exact numeric measurements. Because gameplay is canvas-rendered, these behaviors are Playwright-hard; the generation stage decides per behavior whether to write a real test or a `test.skip()`.

## 3. Spec placement

No existing Playwright config or spec files exist on this branch or on `main` (verified) — the repo is greenfield for e2e tests, so a **new spec is justified**. Follow the only repo-relevant precedent, sibling branch `feature/wi-4-tests`, which adopted the standard Playwright layout (`tests/` at the root, TypeScript specs named after a *group* of behaviors):

- **New file:** `tests/difficulty-mode.spec.ts` — named after the behavior **group** (difficulty mode), not a single action. All three behaviors above live here as one test each (≥2 tests per file). Future difficulty test cases (Easy-mode gameplay, persistence/reset-on-reload, dropdown styling) would **extend this same file** when they come into scope.

> Harness setup — `playwright.config.ts`, a static file server for `baseURL`, and any test seam/start hook implied by the Preconditions — is a **next-stage** concern and is intentionally not designed here.

## 4. Out of scope

Behaviors of this work item not represented by TC-004:

- **Easy-mode relaxed-gameplay behavior** (slower movement, less frequent fire/spawns).
- **The dropdown as a control** — its presence, Easy/Hard options, and visual consistency with the score display (white text, dark background, Berlin Sans FB).
- **Default-to-Easy and reset-to-default on reload**, and session-persistence semantics (selection fixed for the session, mid-game changes having no effect).
- **Exact numeric difficulty values** as hard assertions (8 px/frame, fire every 60 frames, spawn 300–700 frames) — reference/observational only.
- **Canvas pixel/sprite rendering correctness** (visual-regression territory).
- **Performance / frame-rate benchmarks.**
- **Accessibility audit.**
- **Cross-browser / device matrix** beyond a single default project.
