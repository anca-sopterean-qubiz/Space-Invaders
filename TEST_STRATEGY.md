# TEST_STRATEGY — WI #4 (linked test case: TC-001)

## Repo findings (verified by reading the repo)
- No test-architecture doc, no `tests/` directory, no Playwright config and no existing specs. The repo is a static, no-build app: `index.html`, `app.js`, `player.js`, `grid.js`, `invader.js`, `projectiles.js`.
- No conventions exist to follow, so the next stage sets them up, keeping them minimal.
- The work item text describes a CSV export `Number` formatting defect in a different codebase (`AIDeliveryPipeline.Cloud.Server`). It does not match this repo. Per the scope instruction, only the linked TC is automated.

## 1. Feature area
Space Invaders game, player ship movement. Keyboard control of the ship on the canvas.

## 2. Behaviors to cover
1. Holding the `A` key moves the player ship left from its starting position (covers TC-001).
   - Start: a freshly loaded game with the ship at the horizontal center of the canvas bottom.
   - Action: hold `A` for about one second, then release.
   - Expected: the ship's x-position is less than its starting x-position.

Note for generation: `player.js` reads the ship position from a `Player` instance. The ship is drawn on a `<canvas>`, and the position is not exposed in the DOM. How to observe the x-position (for example via canvas pixels, or a test hook if one exists) is a design decision for the next stage. If it cannot be observed reliably, decide between a real test and `test.skip()` there.

## 3. Spec placement
- No existing spec to extend.
- New spec: `tests/player-movement.spec.ts`. It is named after the group (player movement), so later movement behaviors can be added to it.
- It contains the TC-001 test, tagged with `TC-001`.
- The "minimum 2 tests per spec" rule conflicts with the instruction to automate only the linked TC. This strategy follows the scope instruction, so the file starts with one test. Do not add a filler test.

## 4. Out of scope
- Moving right (`D`) and arrow-key controls.
- Shooting and projectiles.
- Invader behavior and collisions.
- Score and high-score persistence.
- Canvas boundary clamping.
- Performance and accessibility audits.
- Everything in the work item description (CSV export `Number` formatting, Backlog/Drafts tables). That belongs to a different application and is not linked to a test case here.
