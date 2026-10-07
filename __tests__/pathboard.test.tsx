import React, { useState } from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import PathBoard, { CIRCLES } from '../src/components/PathBoard';

// Drive the board's real PanResponder with hand-made touch events.
const history = (x0: number, y0: number, x: number, y: number, px: number, py: number, t: number) => ({
  indexOfSingleActiveTouch: 0,
  mostRecentTimeStamp: t,
  numberActiveTouches: 1,
  touchBank: [
    {
      touchActive: true,
      startPageX: x0, startPageY: y0, startTimeStamp: 0,
      currentPageX: x, currentPageY: y, currentTimeStamp: t,
      previousPageX: px, previousPageY: py, previousTimeStamp: t - 1,
    },
  ],
});

// Swipe along any list of points (a freehand line).
const swipe = async (r: any, points: Array<[number, number]>) => {
  const layer = r.root.findAll((n: any) => n.props && n.props.onResponderGrant)[0];
  const from = points[0];
  let t = 1; // PanResponder only counts a move if its time-stamp is newer
  const ev = (x: number, y: number, px: number, py: number) => ({
    nativeEvent: { locationX: from[0], locationY: from[1], touches: [], changedTouches: [] },
    touchHistory: history(from[0], from[1], x, y, px, py, ++t),
  });
  const start = ev(from[0], from[1], from[0], from[1]);
  if (!layer.props.onStartShouldSetResponder(start)) return false;
  await act(async () => { layer.props.onResponderGrant(start); });
  let [px, py] = from;
  for (const [x, y] of points.slice(1)) {
    await act(async () => { layer.props.onResponderMove(ev(x, y, px, py)); });
    [px, py] = [x, y];
  }
  await act(async () => { layer.props.onResponderRelease(ev(px, py, px, py)); });
  return true;
};

// A straight finger path from one point to another, in small steps.
const line = (from: [number, number], to: [number, number], steps = 8): Array<[number, number]> =>
  Array.from({ length: steps + 1 }, (_, i) => [from[0] + ((to[0] - from[0]) * i) / steps, from[1] + ((to[1] - from[1]) * i) / steps] as [number, number]);

const drag = (r: any, from: [number, number], to: [number, number]) => swipe(r, line(from, to));

const c = (i: number): [number, number] => [CIRCLES[i].cx, CIRCLES[i].cy];

// A tiny parent that keeps the chain, like the quiz screen does.
const setup = async (nodes: Array<{ id: string; label: string; cell: number }>) => {
  const onViolation = jest.fn();
  const seen: string[][] = [];
  const Harness = () => {
    const [chain, setChain] = useState<string[]>([]);
    return (
      <PathBoard
        nodes={nodes}
        chain={chain}
        status={null}
        onChange={(next: string[]) => { seen.push(next); setChain(next); }}
        onViolation={onViolation}
      />
    );
  };
  let r: any;
  await act(async () => { r = ReactTestRenderer.create(<Harness />); });
  return { r, onViolation, seen };
};

// four circles on their own: a (top-left) b (middle-right) c (top-right) d (middle-left)
const four = [
  { id: 'a', label: 'A', cell: 0 },
  { id: 'b', label: 'B', cell: 5 },
  { id: 'c', label: 'C', cell: 2 },
  { id: 'd', label: 'D', cell: 3 },
];
// a whole row: 0 1 2, with a circle in the middle
const row = [
  { id: 'a', label: 'A', cell: 0 },
  { id: 'm', label: 'M', cell: 1 },
  { id: 'z', label: 'Z', cell: 2 },
];

test('dragging from one circle to another joins them; the next line carries on from there', async () => {
  const { r, seen, onViolation } = await setup(four);
  expect(await drag(r, c(0), c(5))).toBe(true);
  expect(seen).toEqual([['a', 'b']]);
  expect(await drag(r, c(5), c(2))).toBe(true);
  expect(seen[1]).toEqual(['a', 'b', 'c']);
  expect(onViolation).not.toHaveBeenCalled();
});

test('after the first line, a new one can only start from the last circle', async () => {
  const { r, seen } = await setup(four);
  await drag(r, c(0), c(5));
  expect(await drag(r, c(0), c(2))).toBe(false); // not the end of the chain
  expect(seen).toEqual([['a', 'b']]);
});

test('one stroke through several circles joins them all, in the order it meets them', async () => {
  const { r, seen, onViolation } = await setup(row);
  await drag(r, c(0), c(2)); // straight through the middle circle
  expect(seen).toEqual([['a', 'm', 'z']]);
  expect(onViolation).not.toHaveBeenCalled();
});

test('a long stroke can go on from where the last line ended', async () => {
  const { r, seen } = await setup([...four, { id: 'e', label: 'E', cell: 1 }]);
  await swipe(r, [...line(c(0), c(5)), ...line(c(5), c(2)).slice(1)]); // a -> b -> c in one go
  expect(seen).toEqual([['a', 'b', 'c']]);
  await drag(r, c(2), c(1)); // and one more from c
  expect(seen[1]).toEqual(['a', 'b', 'c', 'e']);
});

test('lifting the finger in empty space keeps the circles already joined', async () => {
  const { r, seen, onViolation } = await setup(four);
  const empty: [number, number] = [(c(1)[0] + c(2)[0]) / 2, (CIRCLES[1].cy + CIRCLES[4].cy) / 2];
  await swipe(r, [...line(c(0), c(5)), ...line(c(5), empty).slice(1)]);
  expect(seen).toEqual([['a', 'b']]);
  expect(onViolation).not.toHaveBeenCalled();
});

test('looping back through a circle already in the stroke is refused', async () => {
  const { r, seen, onViolation } = await setup(four);
  // a -> b -> c, then round again to a
  await swipe(r, [...line(c(0), c(5)), ...line(c(5), c(2)).slice(1), ...line(c(2), c(0)).slice(1)]);
  expect(onViolation).toHaveBeenCalledTimes(1);
  expect(seen).toEqual([]);
});

test('a line that crosses an earlier one is refused', async () => {
  const { r, seen, onViolation } = await setup(four);
  await drag(r, c(0), c(5)); // a -> b   (top-left to middle-right)
  await drag(r, c(5), c(2)); // b -> c
  await drag(r, c(2), c(3)); // c -> d crosses a -> b
  expect(onViolation).toHaveBeenCalledTimes(1);
  expect(seen).toHaveLength(2);
});

test('letting go on empty space cancels the line', async () => {
  const { r, seen, onViolation } = await setup(four);
  const empty: [number, number] = [(c(1)[0] + c(2)[0]) / 2, (CIRCLES[1].cy + CIRCLES[4].cy) / 2];
  await drag(r, c(0), empty);
  expect(seen).toEqual([]);
  expect(onViolation).not.toHaveBeenCalled();
});

test('drawing back over an existing line is overlap, and is refused', async () => {
  const { r, seen, onViolation } = await setup(four);
  await drag(r, c(0), c(5));
  await drag(r, c(5), c(0)); // the same route in reverse
  expect(seen).toEqual([['a', 'b']]);
  expect(onViolation).toHaveBeenCalledTimes(1);
});

test('touches that start away from every circle do nothing', async () => {
  const { r } = await setup(four);
  expect(await drag(r, [2, 2], c(5))).toBe(false);
});

test('a wobbly freehand line is kept, and can go round a circle that is in the way', async () => {
  const { r, seen, onViolation } = await setup(row);
  const gapY = (CIRCLES[0].cy + CIRCLES[3].cy) / 2; // the lane between row 0 and row 1
  const line: Array<[number, number]> = [];
  const add = (x: number, y: number) => line.push([x, y]);
  add(...c(0));
  add(c(0)[0] + 5, gapY - 20);
  add(c(0)[0] + 20, gapY);        // down into the lane under the first circle
  add(c(1)[0] - 20, gapY + 1);
  add(c(1)[0] + 20, gapY - 1);    // along it, under the middle one
  add(c(2)[0] - 20, gapY);
  add(c(2)[0] - 5, gapY - 20);    // and up into the last circle
  add(...c(2));
  await swipe(r, line);
  expect(onViolation).not.toHaveBeenCalled();
  expect(seen).toEqual([['a', 'z']]);
});

test('a freehand line that crosses an earlier one is refused too', async () => {
  const { r, seen, onViolation } = await setup(four);
  await drag(r, c(0), c(5)); // a -> b
  await drag(r, c(5), c(2)); // b -> c
  // c -> d, bending a little, still has to get across a -> b
  const mid: [number, number] = [(c(2)[0] + c(3)[0]) / 2, (c(2)[1] + c(3)[1]) / 2 - 12];
  await swipe(r, [c(2), [mid[0] + 40, mid[1]], mid, [mid[0] - 40, mid[1] + 5], c(3)]);
  expect(onViolation).toHaveBeenCalledTimes(1);
  expect(seen).toHaveLength(2);
});
