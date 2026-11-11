# TEST_STRATEGY — WI #23: Difficulty mode selector (Easy / Hard)

## Repo observations (verified by reading the repo in this run)
- No test-architecture/conventions doc, no existing tests, no Playwright config or `package.json` exist. The repo is a static vanilla-JS game (`index.html`, `app.js` as an ES module, `grid.js`, etc.).
- The difficulty dropdown (`modeEl`) is **not yet implemented** in `index.html` (no `modeEl` found in the repo at the time of writing). The test below targets the feature as described in the work item and will only pass once the dropdown is implemented.
- No repo convention exists to follow, so placement below is a proposal; the next stage should set up Playwright scaffolding minimally.

## 1. Feature area
Difficulty & Modes — pre-game difficulty mode selector on the Space Invaders game page.

## 2. Behaviors to cover
1. Difficulty selector defaults to Easy on initial page load (covers TC-002).

## 3. Spec placement
- No existing spec to extend (the repo has no tests).
- Propose a new spec named after the behavior group: `tests/difficulty-mode.spec.ts` (TC-002 lives here; later difficulty behaviors such as Hard selection or reset-on-reload belong in the same file).
- Note: the per-file minimum of 2 tests cannot be met by TC-002 alone, since only this TC is in scope. Generation should keep the spec to this one test and not invent a second one outside the linked TC.

## 4. Out of scope
- Easy/Hard gameplay parameters (enemy speed, fire rate, spawn interval) and their effect in the game loop.
- Selecting Hard and having it take effect; mode persisting for the session; reload resetting a changed selection.
- Selector styling consistency (white text, dark background, Berlin Sans FB) and font fallback.
- Locking the selector after game start; start-gate/pre-game flow.
- Performance, accessibility and cross-browser audits.
