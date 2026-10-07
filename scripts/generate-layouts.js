/* eslint-env node */
// Builds src/constant/Questions.js from scripts/questions.source.js.
//
// For every question it adds decoy boxes that look like they belong, then
// scatters every box, keeping only layouts that are
//   - hard: joined boxes sit far apart, a straight link would run over a box,
//           and at least two straight links would cross, so the player has to
//           choose a path that goes around;
//   - fair: the natural order can still be drawn without a cross. Other orders
//           often cannot, so drawing the wrong link first blocks the rest.
// The checks run for a small and a large phone, since box sizes scale with the screen.
const fs = require('fs');
const path = require('path');
const questions = require('./questions.source');

const LAYOUTS_PER_QUESTION = 3;
const SCREENS = [
  { w: 320, h: 640 },
  { w: 360, h: 780 },
  { w: 412, h: 915 },
];
// These mirror FlowBoard.js: the board is wp(100) - 2 * gutter wide and hp(46)
// tall, a box is wp(28) wide and hp(6.5) tall.
const GUTTER = 20.3;
const GAP_X = 22;
const GAP_Y = 20;
const CELL = 6;
const MIN_LINK_DISTANCE = 0.36; // fraction of the board diagonal
const RANDOM_ORDERS = 25;
// Natural order must work. Most other orders should fail, so the player has to
// leave room instead of drawing the first line that looks free.
const MIN_ORDER_SUCCESS = 0.36;

const dims = (s) => ({
  bw: s.w - GUTTER * 2,
  bh: s.h * 0.46,
  cw: s.w * 0.28,
  ch: s.h * 0.065,
});

const mulberry = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const hash = (text) => [...text].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);
const shuffle = (list, rng) => {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

// ---- geometry (same rules as src/utils/geometry.js) ----
const orient = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
const cross = (p1, p2, p3, p4) => {
  const d1 = orient(p3, p4, p1);
  const d2 = orient(p3, p4, p2);
  const d3 = orient(p1, p2, p3);
  const d4 = orient(p1, p2, p4);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
};
const inRect = (p, r) => p.x >= r.l && p.x <= r.r && p.y >= r.t && p.y <= r.b;
const hitsRect = (p1, p2, r) =>
  inRect(p1, r) ||
  inRect(p2, r) ||
  [
    [{ x: r.l, y: r.t }, { x: r.r, y: r.t }],
    [{ x: r.r, y: r.t }, { x: r.r, y: r.b }],
    [{ x: r.r, y: r.b }, { x: r.l, y: r.b }],
    [{ x: r.l, y: r.b }, { x: r.l, y: r.t }],
  ].some(([a, b]) => cross(p1, p2, a, b));

const rectsFor = (layout, s) => {
  const { bw, bh, cw, ch } = dims(s);
  const rects = {};
  Object.keys(layout).forEach((id) => {
    const cx = layout[id][0] * bw;
    const cy = layout[id][1] * bh;
    rects[id] = { cx, cy, l: cx - cw / 2, r: cx + cw / 2, t: cy - ch / 2, b: cy + ch / 2 };
  });
  return rects;
};

// ---- simulated player: draws each link as a shortest path around obstacles ----
const route = (rects, links, s) => {
  const { bw, bh } = dims(s);
  const gw = Math.ceil(bw / CELL);
  const gh = Math.ceil(bh / CELL);
  const owner = new Int16Array(gw * gh).fill(-1);
  const ids = Object.keys(rects);
  const MARGIN = 5;
  ids.forEach((id, k) => {
    const r = rects[id];
    for (let gy = 0; gy < gh; gy++) {
      for (let gx = 0; gx < gw; gx++) {
        const x = gx * CELL + CELL / 2;
        const y = gy * CELL + CELL / 2;
        if (x >= r.l - MARGIN && x <= r.r + MARGIN && y >= r.t - MARGIN && y <= r.b + MARGIN) {
          owner[gy * gw + gx] = k;
        }
      }
    }
  });
  const used = new Uint8Array(gw * gh);
  for (const [a, b] of links) {
    const ka = ids.indexOf(a);
    const kb = ids.indexOf(b);
    const start = Math.floor(rects[a].cy / CELL) * gw + Math.floor(rects[a].cx / CELL);
    const prev = new Int32Array(gw * gh).fill(-2);
    const queue = [start];
    prev[start] = -1;
    let found = -1;
    for (let q = 0; q < queue.length && found < 0; q++) {
      const cur = queue[q];
      const cx = cur % gw;
      const cy = (cur - cx) / gw;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) continue;
        const n = ny * gw + nx;
        if (prev[n] !== -2) continue;
        const o = owner[n];
        if (o !== -1 && o !== ka && o !== kb) continue;
        if (used[n] && o === -1) continue;
        prev[n] = cur;
        if (o === kb) {
          found = n;
          break;
        }
        queue.push(n);
      }
    }
    if (found < 0) return false;
    for (let n = found; n !== -1; n = prev[n]) {
      const x = n % gw;
      const y = (n - x) / gw;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < gw && ny < gh && owner[ny * gw + nx] === -1) {
            used[ny * gw + nx] = 1;
          }
        }
      }
    }
  }
  return true;
};

const fair = (layout, links, rng) => {
  for (const s of SCREENS) {
    const rects = rectsFor(layout, s);
    if (!route(rects, links, s)) return false;
    let ok = 0;
    for (let i = 0; i < RANDOM_ORDERS; i++) {
      if (route(rects, shuffle(links, rng), s)) ok++;
    }
    if (ok / RANDOM_ORDERS < MIN_ORDER_SUCCESS) return false;
  }
  return true;
};

// Hard: joined boxes are far apart, a straight link runs over another box, and
// two required links would cross if both were drawn straight.
const hard = (layout, links) => {
  const s = SCREENS[1];
  const { bw, bh } = dims(s);
  const rects = rectsFor(layout, s);
  const diag = Math.hypot(bw, bh);
  const centre = (id) => ({ x: rects[id].cx, y: rects[id].cy });
  if (links.some(([a, b]) => Math.hypot(rects[a].cx - rects[b].cx, rects[a].cy - rects[b].cy) < diag * MIN_LINK_DISTANCE)) {
    return false;
  }
  let blocked = 0;
  let crossings = 0;
  links.forEach(([a, b], i) => {
    Object.keys(rects).forEach((id) => {
      if (id !== a && id !== b && hitsRect(centre(a), centre(b), rects[id])) blocked++;
    });
    links.slice(i + 1).forEach(([c, d]) => {
      if (![a, b].includes(c) && ![a, b].includes(d) && cross(centre(a), centre(b), centre(c), centre(d))) {
        crossings++;
      }
    });
  });
  // A chain of two links always meets at a box, so it cannot cross itself.
  const canCross = links.some(([a, b], i) =>
    links.slice(i + 1).some(([c, d]) => ![a, b].includes(c) && ![a, b].includes(d)),
  );
  return blocked >= 1 && (!canCross || crossings >= 1);
};

const sampleLayout = (ids, rng) => {
  // Use the tightest screen for spacing, so the layout is fair everywhere.
  const tight = SCREENS.reduce((best, s) => {
    const d = dims(s);
    return d.cw / d.bw > best.cw / best.bw ? d : best;
  }, dims(SCREENS[0]));
  const minX = tight.cw / 2 / tight.bw + 0.01;
  const minY = tight.ch / 2 / tight.bh + 0.01;
  const placed = [];
  for (const id of ids) {
    let spot = null;
    for (let tries = 0; tries < 300 && !spot; tries++) {
      const x = Math.round((minX + rng() * (1 - 2 * minX)) * 100) / 100;
      const y = Math.round((minY + rng() * (1 - 2 * minY)) * 100) / 100;
      const clear = placed.every(
        (p) =>
          Math.abs(p.x - x) * tight.bw >= tight.cw + GAP_X || Math.abs(p.y - y) * tight.bh >= tight.ch + GAP_Y,
      );
      if (clear) spot = { id, x, y };
    }
    if (!spot) return null;
    placed.push(spot);
  }
  return Object.fromEntries(placed.map((p) => [p.id, [p.x, p.y]]));
};

// ---- build ----
const actionPool = [];
questions.forEach((q) =>
  Object.values(q.chips).forEach((c) => {
    if (c.kind === 'action' && !actionPool.includes(c.label)) actionPool.push(c.label);
  }),
);

const out = questions.map((q) => {
  const rng = mulberry(hash(q.id));
  const own = Object.values(q.chips).map((c) => c.label);
  const chipCount = Object.keys(q.chips).length;
  const decoyCount = chipCount <= 4 ? 4 : chipCount <= 5 ? 3 : 2;
  const words = (label) => label.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const bag = new Set(own.flatMap(words));
  const likeness = (label) => words(label).filter((w) => bag.has(w)).length;
  const decoys = shuffle(actionPool.filter((label) => !own.includes(label)), rng)
    .sort((a, b) => likeness(b) - likeness(a))
    .slice(0, decoyCount);
  const chips = shuffle(
    [
      ...Object.entries(q.chips).map(([id, c]) => ({ id, label: c.label })),
      ...decoys.map((label, i) => ({ id: `decoy${i + 1}`, label })),
    ],
    rng,
  );
  const layouts = [];
  for (let attempts = 0; attempts < 60000 && layouts.length < LAYOUTS_PER_QUESTION; attempts++) {
    const layout = sampleLayout(chips.map((c) => c.id), rng);
    if (layout && hard(layout, q.links) && fair(layout, q.links, rng)) layouts.push(layout);
  }
  if (layouts.length < LAYOUTS_PER_QUESTION) {
    throw new Error(`${q.id}: only found ${layouts.length} good layouts — try fewer decoys`);
  }
  console.log(`${q.id}: ${chips.length} boxes (${decoyCount} decoys), ${layouts.length} layouts`);
  return { id: q.id, title: q.title, chips, links: q.links, layouts };
});

const header = `// GENERATED by scripts/generate-layouts.js — edit scripts/questions.source.js and
// run \`node scripts/generate-layouts.js\` instead of changing this file by hand.
//
// Each question is a flow puzzle:
//   chips:   every box on the board. Some are decoys that belong to other flows.
//   links:   the pairs that must be joined (order doesn't matter).
//   layouts: ready-made box positions (centre as a 0–1 fraction of the board);
//            one is picked at random each time the question is shown.
`;
fs.writeFileSync(
  path.join(__dirname, '..', 'src', 'constant', 'Questions.js'),
  `${header}export const QUESTIONS = ${JSON.stringify(out, null, 2)};\n`,
);
console.log('wrote src/constant/Questions.js');
