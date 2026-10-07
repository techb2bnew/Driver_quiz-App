// Pure board maths (no React Native), so it can be tested on its own.
//
// The board is a grid of circles. For each question the labels are dropped onto
// random circles; `arrangeCircles` keeps only arrangements where the answer can
// really be drawn: straight lines from circle to circle, none over another circle,
// none crossing another.
import { segmentsCross } from './geometry';

export const GRID = { cols: 3, rows: 4 };

export const makeCircles = (width, height, preferredDiameter, minGap = 8) => {
  const diameter = Math.min(
    preferredDiameter,
    (height - (GRID.rows + 1) * minGap) / GRID.rows,
    (width - (GRID.cols + 1) * minGap) / GRID.cols,
  );
  const gapX = (width - GRID.cols * diameter) / (GRID.cols + 1);
  const gapY = (height - GRID.rows * diameter) / (GRID.rows + 1);
  const circles = [];
  for (let row = 0; row < GRID.rows; row++) {
    for (let col = 0; col < GRID.cols; col++) {
      circles.push({
        index: row * GRID.cols + col,
        col,
        row,
        r: diameter / 2,
        cx: gapX + diameter / 2 + col * (diameter + gapX),
        cy: gapY + diameter / 2 + row * (diameter + gapY),
      });
    }
  }
  return circles;
};

export const shuffle = (list, rng = Math.random) => {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

// A straight line from circle `a` to circle `b` is allowed when it keeps clear of every
// other circle. (If it ran over one, the player would be marking that circle too.)
const PASS_MARGIN = 6;

const distanceToSegment = (p, a, b) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(p.x - (a.x + dx * t), p.y - (a.y + dy * t));
};

export const lineIsClear = (circles, occupied, aCell, bCell) => {
  const a = { x: circles[aCell].cx, y: circles[aCell].cy };
  const b = { x: circles[bCell].cx, y: circles[bCell].cy };
  return occupied.every(
    (cell) =>
      cell === aCell ||
      cell === bCell ||
      distanceToSegment({ x: circles[cell].cx, y: circles[cell].cy }, a, b) >=
        circles[cell].r + PASS_MARGIN,
  );
};

// Do the straight lines a→b and c→d cross? (Lines that merely meet at a circle don't.)
export const linesCross = (circles, aCell, bCell, cCell, dCell) =>
  segmentsCross(
    { x: circles[aCell].cx, y: circles[aCell].cy },
    { x: circles[bCell].cx, y: circles[bCell].cy },
    { x: circles[cCell].cx, y: circles[cCell].cy },
    { x: circles[dCell].cx, y: circles[dCell].cy },
  );

// Can the circles `order` (circle indices) be joined, one straight line after the
// next, with no line over another circle and no two lines crossing?
export const pathIsDrawable = (circles, occupied, order) => {
  for (let i = 0; i < order.length - 1; i++) {
    if (!lineIsClear(circles, occupied, order[i], order[i + 1])) {
      return false;
    }
    for (let j = i + 2; j < order.length - 1; j++) {
      if (linesCross(circles, order[i], order[i + 1], order[j], order[j + 1])) {
        return false;
      }
    }
  }
  return true;
};

// Pairs of circles a straight line can join without touching a third circle, with the
// board full (every circle in use). Worked out once per board.
const clearPairsCache = new WeakMap();
const clearPairs = (circles) => {
  if (!clearPairsCache.has(circles)) {
    const all = circles.map((c) => c.index);
    clearPairsCache.set(
      circles,
      circles.map((a) => circles.map((b) => a.index !== b.index && lineIsClear(circles, all, a.index, b.index))),
    );
  }
  return clearPairsCache.get(circles);
};

// A random route of `length` different circles where every step is a clear straight
// line and no two lines cross. Depth-first with a random order, so it finds one
// whenever one exists, and different ones each time. Returns circle indices or null.
export const randomRoute = (circles, length, rng = Math.random) => {
  const clear = clearPairs(circles);
  const walk = (route) => {
    if (route.length === length) {
      return route;
    }
    const last = route[route.length - 1];
    const options = shuffle(
      circles
        .map((c) => c.index)
        .filter(
          (next) =>
            !route.includes(next) &&
            clear[last][next] &&
            // the new line may not cross any earlier one (the last one only shares a circle with it)
            route
              .slice(0, Math.max(0, route.length - 2))
              .every((from, i) => !linesCross(circles, from, route[i + 1], last, next)),
        ),
      rng,
    );
    for (const next of options) {
      const found = walk([...route, next]);
      if (found) {
        return found;
      }
    }
    return null;
  };
  for (const start of shuffle(circles.map((c) => c.index), rng)) {
    const found = walk([start]);
    if (found) {
      return found;
    }
  }
  return null;
};

/**
 * Put a question's path and some decoys onto the circles.
 * Returns { nodes, solvable }: nodes are { id, label, cell } — `p0, p1, ...` are the
 * path in order, `d0, d1, ...` are decoys; `cell` is a circle index.
 * The path circles sit on a route from `randomRoute`, so the answer can always be
 * drawn with straight lines that neither cross nor run over another circle.
 */
export const arrangeCircles = ({ path, pool, circles, rng = Math.random }) => {
  const spare = pool.filter((label) => !path.includes(label));
  const decoys = shuffle(spare, rng).slice(0, Math.max(0, circles.length - path.length));
  const route = randomRoute(circles, path.length, rng);
  const pathCells = route || shuffle(circles.map((c) => c.index), rng).slice(0, path.length);
  const freeCells = shuffle(
    circles.map((c) => c.index).filter((cell) => !pathCells.includes(cell)),
    rng,
  );
  const nodes = [
    ...path.map((label, i) => ({ id: `p${i}`, label, cell: pathCells[i] })),
    ...decoys.map((label, i) => ({ id: `d${i}`, label, cell: freeCells[i] })),
  ];
  const occupied = nodes.map((n) => n.cell);
  return { nodes, solvable: !!route && pathIsDrawable(circles, occupied, pathCells) };
};
