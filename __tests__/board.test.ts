import { ALL_QUESTIONS, DECOY_POOL, LEVELS } from '../src/constant/Questions';
import { arrangeCircles, makeCircles } from '../src/utils/boardLayout';
import {
  completedLevels,
  firstUnfinished,
  isLevelComplete,
  isLevelUnlocked,
  levelScore,
} from '../src/utils/levels';

// A small seeded random generator, so a failure can be reproduced.
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// [screen width, screen height]; the board is (width - 2 * gutter) x (46% of height).
const SCREENS = [[320, 568], [360, 780], [412, 915], [768, 1024]];

describe('questions', () => {
  test('four levels of three questions, ids unique, paths start and end on different circles', () => {
    expect(LEVELS).toHaveLength(4);
    LEVELS.forEach((level) => expect(level.questions).toHaveLength(3));
    expect(new Set(ALL_QUESTIONS.map((q) => q.id)).size).toBe(12);
    ALL_QUESTIONS.forEach((q) => {
      expect(q.path.length).toBeGreaterThanOrEqual(3);
      expect(q.path.length).toBeLessThanOrEqual(6);
    });
  });

  test('levels get longer: every later level has paths at least as long as the one before', () => {
    const longest = LEVELS.map((l) => Math.max(...l.questions.map((q) => q.path.length)));
    expect(longest).toEqual([...longest].sort((a, b) => a - b));
  });

  test.each(SCREENS)('every question can always be drawn with straight lines that never cross (%ix%i)', (w, h) => {
    const size = { width: w - 40.6, height: h * 0.46 };
    const circles = makeCircles(size.width, size.height, w * 0.21);
    ALL_QUESTIONS.forEach((q) => {
      for (let seed = 1; seed <= 60; seed++) {
        const { nodes, solvable } = arrangeCircles({
          path: q.path,
          pool: DECOY_POOL,
          circles,
          rng: seeded(seed * 7919),
        });
        if (!solvable) {
          throw new Error(`${q.id} seed ${seed}: no way to draw it on ${w}x${h}`);
        }
        // one node per circle, labels as asked, all on the board
        expect(new Set(nodes.map((n: any) => n.cell)).size).toBe(nodes.length);
        expect(nodes.slice(0, q.path.length).map((n: any) => n.label)).toEqual(q.path);
        // decoys never reuse a path label, so a stroke can't be right by touching a twin
        nodes.slice(q.path.length).forEach((n: any) => expect(q.path).not.toContain(n.label));
      }
    });
  });

  test('circles fit inside the board with room between them', () => {
    SCREENS.forEach(([w, h]) => {
      const width = w - 40.6;
      const height = h * 0.46;
      const circles = makeCircles(width, height, w * 0.21);
      expect(circles).toHaveLength(12);
      circles.forEach((c: any) => {
        expect(c.cx - c.r).toBeGreaterThanOrEqual(7);
        expect(c.cx + c.r).toBeLessThanOrEqual(width - 7);
        expect(c.cy - c.r).toBeGreaterThanOrEqual(7);
        expect(c.cy + c.r).toBeLessThanOrEqual(height - 7);
      });
    });
  });
});

describe('levels', () => {
  const [l1, l2] = LEVELS;
  test('level 2 opens only after every question of level 1 is done', () => {
    expect(isLevelUnlocked(LEVELS, 0, {})).toBe(true);
    expect(isLevelUnlocked(LEVELS, 1, {})).toBe(false);
    const two = { l1q1: 10, l1q2: 8 };
    expect(isLevelUnlocked(LEVELS, 1, two)).toBe(false);
    const three = { ...two, l1q3: 7 };
    expect(isLevelComplete(l1, three)).toBe(true);
    expect(isLevelUnlocked(LEVELS, 1, three)).toBe(true);
    expect(isLevelUnlocked(LEVELS, 2, three)).toBe(false);
    expect(completedLevels(LEVELS, three)).toBe(1);
  });

  test('resume point and score', () => {
    expect(firstUnfinished(l1, {})).toBe(0);
    expect(firstUnfinished(l1, { l1q1: 10 })).toBe(1);
    expect(firstUnfinished(l1, { l1q1: 10, l1q2: 8 })).toBe(2);
    expect(firstUnfinished(l2, { l1q1: 10 })).toBe(0); // other levels don't count
    expect(levelScore(l1, { l1q1: 10, l1q2: 8, l2q1: 5 })).toBe(18);
  });
});
