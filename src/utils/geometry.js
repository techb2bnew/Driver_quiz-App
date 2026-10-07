// Strict crossing: segments that merely touch at an end point don't count,
// which is what we want for lines that meet at the same box.
const orient = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

export const segmentsCross = (p1, p2, p3, p4) => {
  const d1 = orient(p3, p4, p1);
  const d2 = orient(p3, p4, p2);
  const d3 = orient(p1, p2, p3);
  const d4 = orient(p1, p2, p4);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
};

// rect: { left, top, right, bottom }
export const pointInRect = (p, r) =>
  p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom;

export const segmentHitsRect = (p1, p2, r) => {
  if (pointInRect(p1, r) || pointInRect(p2, r)) {
    return true;
  }
  const tl = { x: r.left, y: r.top };
  const tr = { x: r.right, y: r.top };
  const br = { x: r.right, y: r.bottom };
  const bl = { x: r.left, y: r.bottom };
  return (
    segmentsCross(p1, p2, tl, tr) ||
    segmentsCross(p1, p2, tr, br) ||
    segmentsCross(p1, p2, br, bl) ||
    segmentsCross(p1, p2, bl, tl)
  );
};

const onSegment = (a, p, b) =>
  p.x >= Math.min(a.x, b.x) && p.x <= Math.max(a.x, b.x) && p.y >= Math.min(a.y, b.y) && p.y <= Math.max(a.y, b.y);

// Like segmentsCross, but a line that only touches the other one (an end point lying on
// it, or running along it) counts too. Used for a hand-drawn line, which must not meet
// another line at all.
export const segmentsIntersect = (p1, p2, p3, p4) => {
  if (segmentsCross(p1, p2, p3, p4)) {
    return true;
  }
  return (
    (orient(p3, p4, p1) === 0 && onSegment(p3, p1, p4)) ||
    (orient(p3, p4, p2) === 0 && onSegment(p3, p2, p4)) ||
    (orient(p1, p2, p3) === 0 && onSegment(p1, p3, p2)) ||
    (orient(p1, p2, p4) === 0 && onSegment(p1, p4, p2))
  );
};
