# TEST_STRATEGY — WI #23: Difficulty mode selector dropdown (Easy / Hard)

## Repo findings
- No test-architecture/conventions doc, no existing tests, no `package.json`, no Playwright config. Static vanilla-JS game (`index.html`, `app.js`, `grid.js`, ...). Nothing here defines a convention to follow, so the next stage must set up Playwright and choose the layout.
- The selector (`modeEl`) does not exist in `index.html` yet; I read the current file and found only the score display and the canvas. The tests will fail until the feature is implemented.

## 1. Feature area
Difficulty & Modes — the pre-game difficulty selector (Easy / Hard) on the Space Invaders game page.

## 2. Behaviors to cover
1. **Difficulty selector is present before gameplay and offers exactly Easy and Hard** (covers TC-001). This covers: on page load, before any game interaction, the selector is visible and positioned above the game canvas; opening it lists exactly the two options, Easy and Hard.

## 3. Spec placement
- No existing spec to extend (the repo has no tests).
- Propose a new spec named after the behavior group, `tests/difficulty-selector.spec.ts`, following a `tests/` convention for Playwright. The next stage should confirm the layout once the Playwright config exists.
- Minimum 2 tests per spec: only one behavior is linked, so the stage that generates the tests should split TC-001 into two single-outcome tests, both tagged TC-001:
  - selector is shown above the canvas before the game starts
  - selector exposes exactly the Easy and Hard options

## 4. Out of scope
- Enemy speed, fire rate, and spawn interval values for Easy and Hard.
- Default selection being Easy, and reset to Easy on reload.
- Mode persisting through the game session / being locked after start.
- Visual consistency with the score display (colors, Berlin Sans FB font and fallback).
- Whether a start gate exists (see the WI's D7 open question).
- Performance and accessibility audits.
