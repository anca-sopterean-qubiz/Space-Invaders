# TEST_STRATEGY — WI #23: Difficulty mode selector (Easy / Hard)

## Convention sources checked
- Space-Invaders contains no tests, no Playwright config, no `package.json`, and no test-conventions doc. I confirmed this by listing the tracked files (`app.js`, `grid.js`, `index.html`, `invader.js`, `player.js`, `projectiles.js`, `README.md`, images, `.idea`).
- No convention doc or existing tests exist to follow. The next stage must scaffold the Playwright setup (config, `tests/` folder) and keep it minimal.
- The sibling repo `LeaveFlowApp_changed` has its own `tests/` and `docs/`. I did not read them, and they belong to a different app, so they are not treated as authoritative here.
- `index.html` on this branch has no `modeEl` dropdown yet (it only has the score display and canvas). The feature is not implemented in the checked-out code. TC-002 will fail until the dropdown lands, and the next stage should expect this.

## 1. Feature area
Difficulty & Modes: the pre-game Easy/Hard difficulty selector on the Space Invaders page.

## 2. Behaviors to cover
1. **Difficulty defaults to Easy on a fresh page load** (covers TC-002). A newly opened game page shows the difficulty dropdown with Easy as the selected option, and Hard is not selected.

## 3. Spec placement
- No existing spec file covers this area, because the repo has no tests.
- Propose a new spec at `tests/difficulty-mode.spec.ts`, named after the group of behaviors (difficulty mode selection) rather than one action. Use the repo's language convention if one is established during scaffolding.
- Convention minimum is 2 tests per spec, and only one behavior is in scope. Generation should either:
  - put TC-002 in this spec and note that the spec stays at one test until further difficulty-selector TCs are linked, or
  - raise the conflict explicitly.
  Do not pad the spec with tests for behaviors that have no linked TC.

## 4. Out of scope
- Hard or Easy gameplay parameters (enemy speed, fire rate, spawn interval) and their in-game effect.
- Selecting Hard and the resulting behavior.
- Persistence of the selection within a game session, and the mid-game lock/disable behavior.
- Selection resetting after a reload (only the initial default is covered).
- Visual consistency of the dropdown with the score display (white text, dark background, Berlin Sans FB font and its fallback).
- Game-start gating and restart flows.
- Performance, accessibility and cross-browser font-availability checks.
