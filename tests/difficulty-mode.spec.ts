import { test, expect } from './fixtures/game.fixture';

// Reference observation window for the gameplay-metric sampling; tune when the seam lands.
const SAMPLE_WINDOW_FRAMES = 600;

// One reason, applied to all three tests: the difficulty feature is unimplemented AND the
// gameplay metrics are canvas-rendered with no observability seam. Each test is a fully
// structured placeholder that becomes executable — delete the single `test.skip(...)` line —
// once both the feature and a seam land. See TEST_PLAN §"Why skipped".
const SKIP_REASON =
  'Blocked: difficulty feature (dropdown + Hard config + start gate) unimplemented AND gameplay is canvas-rendered with no observability seam. Un-skip when both land.';

test.describe('Difficulty mode — Hard aggressive gameplay', { tag: '@TC-004' }, () => {
  test('Hard-mode enemies advance faster than Easy-mode', async ({ gamePage }) => {
    test.skip(true, SKIP_REASON);

    let easySpeed = 0;
    let hardSpeed = 0;

    await test.step('Given the game page is loaded', async () => {
      await gamePage.selectMode('easy');
    });

    await test.step('When enemy advance speed is sampled in Easy, then in Hard', async () => {
      easySpeed = await gamePage.enemyAdvanceSpeed();
      await gamePage.reset();
      await gamePage.selectMode('hard');
      await gamePage.startGame();
      hardSpeed = await gamePage.enemyAdvanceSpeed();
    });

    await test.step('Then Hard advances faster than Easy', async () => {
      expect(hardSpeed).toBeGreaterThan(easySpeed);
    });
  });

  test('Hard-mode enemies fire more frequently than Easy-mode', async ({ gamePage }) => {
    test.skip(true, SKIP_REASON);

    let easyShots = 0;
    let hardShots = 0;

    await test.step('Given the game page is loaded', async () => {
      await gamePage.selectMode('easy');
      await gamePage.startGame();
    });

    await test.step('When invader fire is counted over a fixed window in Easy, then in Hard', async () => {
      easyShots = await gamePage.invaderFireCount(SAMPLE_WINDOW_FRAMES);
      await gamePage.reset();
      await gamePage.selectMode('hard');
      await gamePage.startGame();
      hardShots = await gamePage.invaderFireCount(SAMPLE_WINDOW_FRAMES);
    });

    await test.step('Then Hard fires more often than Easy', async () => {
      expect(hardShots).toBeGreaterThan(easyShots);
    });
  });

  test('Hard-mode enemy waves spawn more frequently than Easy-mode', async ({ gamePage }) => {
    test.skip(true, SKIP_REASON);

    let easyWaves = 0;
    let hardWaves = 0;

    await test.step('Given the game page is loaded', async () => {
      await gamePage.selectMode('easy');
      await gamePage.startGame();
    });

    await test.step('When new waves are counted over a fixed window in Easy, then in Hard', async () => {
      easyWaves = await gamePage.waveSpawnCount(SAMPLE_WINDOW_FRAMES);
      await gamePage.reset();
      await gamePage.selectMode('hard');
      await gamePage.startGame();
      hardWaves = await gamePage.waveSpawnCount(SAMPLE_WINDOW_FRAMES);
    });

    await test.step('Then Hard spawns waves more often than Easy', async () => {
      expect(hardWaves).toBeGreaterThan(easyWaves);
    });
  });
});
