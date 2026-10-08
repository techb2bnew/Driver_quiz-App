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
  test('five levels of four questions, unique ids, three-circle paths', () => {
    expect(LEVELS).toHaveLength(5);
    LEVELS.forEach((level) => expect(level.questions).toHaveLength(4));
    expect(new Set(ALL_QUESTIONS.map((q) => q.id)).size).toBe(20);
    ALL_QUESTIONS.forEach((q) => {
      expect(q.path.length).toBeGreaterThanOrEqual(3);
      expect(q.path.length).toBeLessThanOrEqual(6);
      expect(new Set(q.path).size).toBe(q.path.length); // no label twice in one path
    });
  });

  test('every question in the notebook is there, and the dropped ones are not', () => {
    const ids = ALL_QUESTIONS.map((q) => q.id).sort();
    const wanted = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21].map((n) => `nb${n}`);
    expect(ids).toEqual([...wanted].sort());
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
  const all = (level: any, points = 10) => Object.fromEntries(level.questions.map((q: any) => [q.id, points]));

  test('level 2 opens only after every question of level 1 is done', () => {
    expect(isLevelUnlocked(LEVELS, 0, {})).toBe(true);
    expect(isLevelUnlocked(LEVELS, 1, {})).toBe(false);
    const [a, b, c] = l1.questions;
    const partly = { [a.id]: 10, [b.id]: 8, [c.id]: 7 };
    expect(isLevelUnlocked(LEVELS, 1, partly)).toBe(false);   // one still to go
    const done = all(l1);
    expect(isLevelComplete(l1, done)).toBe(true);
    expect(isLevelUnlocked(LEVELS, 1, done)).toBe(true);
    expect(isLevelUnlocked(LEVELS, 2, done)).toBe(false);
    expect(completedLevels(LEVELS, done)).toBe(1);
  });

  test('resume point and score', () => {
    const [a, b] = l1.questions;
    expect(firstUnfinished(l1, {})).toBe(0);
    expect(firstUnfinished(l1, { [a.id]: 10 })).toBe(1);
    expect(firstUnfinished(l1, { [a.id]: 10, [b.id]: 8 })).toBe(2);
    expect(firstUnfinished(l2, { [a.id]: 10 })).toBe(0); // other levels don't count
    expect(levelScore(l1, { [a.id]: 10, [b.id]: 8, [l2.questions[0].id]: 5 })).toBe(18);
    expect(levelScore(l1, all(l1), true)).toBe(37);       // 4 x 10, less the hint
  });
});
