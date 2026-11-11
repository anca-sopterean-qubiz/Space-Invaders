# TEST_STRATEGY — WI #23: Difficulty mode selector (Easy / Hard)

## Repo findings
- No test-architecture/conventions doc, no existing tests, and no Playwright config or `package.json` exist in the repo. The repo is a static vanilla-JS game (`index.html`, `app.js`, `grid.js`, ES module script). No conventions can be inherited, so the next stage must bootstrap Playwright and pick a layout (proposed below).
- `index.html` on this branch has no `#modeEl` yet. The selector is implemented by this work item, so tests for it will fail until that change lands.
- Scope per the task: only TC-001 is automated.

## 1. Feature area
Difficulty & Modes: the pre-game difficulty selector on the Space Invaders game page.

## 2. Behaviors to cover
1. Difficulty selector is shown on the game page before gameplay begins, positioned above the game canvas (covers TC-001).
2. Opening the difficulty dropdown offers exactly two choices, Easy and Hard (covers TC-001).

## 3. Spec placement
- No existing spec to extend. Create a new spec named after the group of behaviors: `tests/difficulty-mode-selector.spec.ts`. The extension follows whatever language the bootstrap uses.
- The spec holds the 2 tests above, which meets the 2-test minimum. Later difficulty behaviors (defaults, persistence, applied settings) belong in this same file.
- Playwright config and a static-server `webServer` entry for the repo root do not exist yet. The generation stage must add them, since there is nothing to match.

## 4. Out of scope
- Easy as the default selection, and reset to Easy on reload.
- Enemy speed, fire rate and spawn interval values for each mode.
- Selected mode persisting across the game session, and locking the selector after start.
- Visual styling consistency with the score display (white text, dark background, Berlin Sans FB).
- Performance and accessibility audits.
