# TEST_STRATEGY — WI-23: Difficulty mode selector (Easy / Hard)

## 1. Feature area
Pre-game difficulty selector (`Difficulty & Modes`) on the Space Invaders game page.

## Repo findings (verified by reading the repo)
- No test-architecture doc, no existing tests, no `package.json`, and no Playwright config exist in `Space-Invaders`. There are no repo conventions to inherit, so the next stage must bootstrap Playwright (config, test dir) minimally.
- The game is a static page (`index.html` + ES modules) with a single `<canvas>` and a `score:` overlay. At the time of writing it has no `modeEl` dropdown, so the TC will fail until the WI-23 implementation lands.
- `/workspace/repos/LeaveFlowApp_changed` is an unrelated repo and was not used as a convention source.

## 2. Behaviors to cover
1. **Difficulty selector is shown before the game begins, positioned above the game canvas** (covers TC-001, steps 1–2).
2. **Opening the difficulty dropdown offers exactly two choices, Easy and Hard** (covers TC-001, step 3).

TC-001 is a single Smoke case. It is split into two single-outcome tests (presence and placement; available options), and both tests carry the TC-001 tag.

## 3. Spec placement
- No existing spec to extend, so propose a new spec: `tests/difficulty-mode.spec.ts`. It is named after the group of behaviors (difficulty mode), not after one action, and it holds the 2 tests above to meet the 2-test minimum.
- Any future difficulty behaviors (default selection, reload reset, Easy/Hard gameplay settings) belong in this same file.
- Playwright config and the web-server setup (serving the static files) are a bootstrap task for the next stage, since none exist yet.

## 4. Out of scope
- Default selection being Easy, and reset to Easy after reload.
- Mode persisting for the session, and the selector being locked or unlocked mid-game.
- Easy/Hard gameplay parameters: enemy speed, fire rate and spawn interval.
- Visual consistency of the dropdown with the score display (white text, dark background, Berlin Sans FB).
- Game start flow or start gate. The repo currently has no start trigger, so the game appears to auto-start on load, and "before the game begins" is not yet verifiable.
- Performance and accessibility audits.
