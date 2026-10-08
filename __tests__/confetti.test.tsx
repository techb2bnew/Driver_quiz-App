import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Animated } from 'react-native';
import Confetti from '../src/components/Confetti';

// Native animations don't advance under jest, so watch what the component does to each
// falling piece: at the end, every piece's animation must be running (its last event is
// a start, not a stop).
const watch = async (element: React.ReactElement) => {
  const last: Record<number, string> = {};
  let nextId = 0;
  const spy = jest.spyOn(Animated, 'timing').mockImplementation(() => {
    const id = nextId++;
    return {
      start: () => { last[id] = 'start'; },
      stop: () => { last[id] = 'stop'; },
      reset: () => {},
    } as any;
  });
  let r: any;
  await act(async () => { r = ReactTestRenderer.create(element); });
  const running = () => Object.values(last).filter((event) => event === 'start').length;
  return { r, running, restore: () => spy.mockRestore() };
};

test('every piece starts falling when the confetti appears', async () => {
  const { running, restore } = await watch(<Confetti count={10} />);
  expect(running()).toBe(10);
  restore();
});

test('every piece is still falling when React runs the effect twice (development)', async () => {
  const { running, restore } = await watch(
    <React.StrictMode>
      <Confetti count={10} />
    </React.StrictMode>,
  );
  expect(running()).toBe(10);
  restore();
});

test('everything stops cleanly when the screen goes away', async () => {
  const { r, running, restore } = await watch(<Confetti count={10} />);
  await act(async () => { r.unmount(); });
  expect(running()).toBe(0);
  restore();
});

test('the layer has a real size, so the pieces can actually be seen', async () => {
  // This is the bug that hid the confetti: absoluteFill + overflow hidden collapsed to
  // nothing on the Result screen. An explicit size always has an area to draw in.
  const { r, restore } = await watch(<Confetti count={5} />);
  const layer = r.root.findAll((n: any) => n.props && n.props.pointerEvents === 'none')[0];
  const style = Object.assign({}, ...[].concat(layer.props.style).filter(Boolean));
  expect(style.width).toBeGreaterThan(0);
  expect(style.height).toBeGreaterThan(0);
  expect(style.overflow).toBeUndefined();
  restore();
});
