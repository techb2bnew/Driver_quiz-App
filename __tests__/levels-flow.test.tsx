import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import HomeScreen from '../src/screens/HomeScreen';
import LevelsScreen from '../src/screens/LevelsScreen';
import QuizScreen from '../src/screens/QuizScreen';
import ResultScreen from '../src/screens/ResultScreen';
import PathBoard from '../src/components/PathBoard';
import ResultModal from '../src/components/Modals/ResultModal';
import AppButton from '../src/components/AppButton';
import { LEVELS } from '../src/constant/Questions';
import { loadProgress } from '../src/utils/progress';
import { setItem } from '../src/utils/storage';
import { STORAGE_KEYS } from '../src/constant/Constants';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);

const texts = (r: any) => r.root.findAllByType(Text).map((t: any) => [].concat(t.props.children).join(''));
const flush = () => act(async () => { await new Promise(res => setTimeout(res, 30)); });
const reset = () => setItem(STORAGE_KEYS.PROGRESS, '');
const saveProgress = (progress: object) => setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
const ids = (n: number) => Array.from({ length: n }, (_, i) => `p${i}`);

// Answer the question on screen: join circles p0..pN in order (right), or just the
// first and last (wrong), then press Check.
const answer = async (r: any, right: boolean, pathLength: number) => {
  jest.useFakeTimers();
  const board = r.root.findByType(PathBoard);
  await act(async () => { board.props.onChange(right ? ids(pathLength) : ['p0', `p${pathLength - 1}`]); });
  const check = r.root.findAllByType(AppButton).find((b: any) => b.props.title === 'Check Answer');
  await act(async () => { check.props.onPress(); });
  await act(async () => { jest.advanceTimersByTime(1000); });
  jest.useRealTimers();
  await flush();
};
const pressModal = async (r: any) => {
  await act(async () => { await r.root.findByType(ResultModal).props.onPress(); });
  await flush();
};

test('home shows the level count and a Play button; levels lock in order', async () => {
  await reset();
  let r: any;
  await act(async () => { r = ReactTestRenderer.create(<HomeScreen navigate={() => {}} />); });
  await flush();
  expect(texts(r)).toContain('Play');
  expect(texts(r)).toContain('0/4');
  r.unmount();

  await act(async () => { r = ReactTestRenderer.create(<LevelsScreen navigate={() => {}} />); });
  await flush();
  const t = texts(r);
  console.log('LEVELS', JSON.stringify(t.filter((x: string) => /done|unlock|Completed/.test(x))));
  expect(t).toContain('0/3 done');                 // level 1 is open
  expect(t).toContain('Finish Level 1 to unlock'); // level 2 is not
  expect(t).toContain('Finish Level 3 to unlock'); // nor is level 4
});

test('play level 1: a wrong swipe costs a retry, right ones finish the level and unlock level 2', async () => {
  await reset();
  const onFinish = jest.fn();
  let r: any;
  await act(async () => { r = ReactTestRenderer.create(<QuizScreen levelId={1} done={{}} onFinish={onFinish} onExit={() => {}} />); });
  expect(texts(r)).toContain('Question 1/3');

  // Q1: wrong first (retry), then right -> 10 - 2 = 8 points
  await answer(r, false, 3);
  expect(r.root.findByType(ResultModal).props.type).toBe('wrong');
  await pressModal(r);
  expect(texts(r)).toContain('Question 1/3');
  await answer(r, true, 3);
  expect(r.root.findByType(ResultModal).props.type).toBe('correct');
  expect(r.root.findByType(ResultModal).props.points).toBe(8);
  expect((await loadProgress()).done).toEqual({ l1q1: 8 });   // saved straight away
  await pressModal(r);
  expect(texts(r)).toContain('Question 2/3');

  // Q2 and Q3 right first time -> 10 each
  await answer(r, true, 3); await pressModal(r);
  expect(texts(r)).toContain('Question 3/3');
  await answer(r, true, 3);
  expect(r.root.findByType(ResultModal).props.isLast).toBe(true);
  await pressModal(r);
  expect(onFinish).toHaveBeenCalledWith({ levelId: 1, score: 28, isNewBest: true });
  const saved = await loadProgress();
  expect(saved.best).toEqual({ 1: 28 });
  expect(Object.keys(saved.done)).toHaveLength(3);
  r.unmount();

  // Levels screen now: level 1 completed, level 2 open, level 3 still locked
  await act(async () => { r = ReactTestRenderer.create(<LevelsScreen navigate={() => {}} />); });
  await flush();
  const t = texts(r);
  expect(t).toContain('Completed · Best 28/30');
  expect(t).toContain('0/3 done');
  expect(t).not.toContain('Finish Level 1 to unlock');
  expect(t).toContain('Finish Level 2 to unlock');
});

test('a level left half-way resumes at its first unfinished question with its score', async () => {
  await reset();
  await saveProgress({ done: { l2q1: 10, l2q2: 6 }, best: {} });
  const { done } = await loadProgress();
  let r: any;
  await act(async () => { r = ReactTestRenderer.create(<QuizScreen levelId={2} done={done} onFinish={() => {}} onExit={() => {}} />); });
  const t = texts(r);
  expect(t).toContain('Question 3/3');
  expect(t).toContain('16');                          // 10 + 6 carried over
  expect(t).toContain(LEVELS[1].questions[2].title);
});

test('a level has one hint: it costs 3 points, stays spent on the next question, and is remembered', async () => {
  await reset();
  let r: any;
  await act(async () => { r = ReactTestRenderer.create(<QuizScreen levelId={4} done={{}} onFinish={() => {}} onExit={() => {}} />); });
  const hintBtn = () => r.root.findAllByType(AppButton).find((b: any) => /^Hint/.test(b.props.title));
  expect(hintBtn().props.title).toBe('Hint −3');
  await act(async () => { hintBtn().props.onPress(); });
  expect(hintBtn().props.title).toBe('Hint used');
  expect(hintBtn().props.disabled).toBe(true);
  const labels = texts(r);
  ['Broker', 'RC', 'Dispatcher', 'Driver'].forEach((w) => expect(labels).toContain(w));
  await answer(r, true, 5);
  expect(r.root.findByType(ResultModal).props.points).toBe(7);   // 10 - 3 for the hint
  await pressModal(r);
  // next question of the same level: no second hint, and no further cost
  expect(texts(r)).toContain('Question 2/3');
  expect(hintBtn().props.title).toBe('Hint used');
  expect(hintBtn().props.disabled).toBe(true);
  await answer(r, true, 5);
  expect(r.root.findByType(ResultModal).props.points).toBe(10);
  expect((await loadProgress()).hints).toEqual({ 4: true });     // saved
  r.unmount();

  // leave and come back: still spent. A replay (reset) gives it back.
  await act(async () => { r = ReactTestRenderer.create(<QuizScreen levelId={4} done={{ l4q1: 7 }} hintUsed onFinish={() => {}} onExit={() => {}} />); });
  expect(hintBtn().props.disabled).toBe(true);
  r.unmount();
  await act(async () => { r = ReactTestRenderer.create(<QuizScreen levelId={4} done={{}} hintUsed={false} onFinish={() => {}} onExit={() => {}} />); });
  expect(hintBtn().props.disabled).toBe(false);
});

test('result screen offers Next Level only when it is unlocked', async () => {
  await reset();
  await saveProgress({ done: { l1q1: 10, l1q2: 10, l1q3: 10 }, best: { 1: 30 } });
  let r: any;
  await act(async () => { r = ReactTestRenderer.create(<ResultScreen navigate={() => {}} levelId={1} score={30} isNewBest />); });
  await flush();
  const t = texts(r);
  expect(t).toContain('Level 1 Complete');
  expect(t).toContain('/ 30');
  expect(t).toContain('🏆 New Best Score!');
  const titles = r.root.findAllByType(AppButton).map((b: any) => b.props.title);
  expect(titles).toEqual(['Next Level', 'Replay Level', 'All Levels']);
  r.unmount();

  // the last level has no next one
  await saveProgress({ done: {}, best: {} });
  await act(async () => { r = ReactTestRenderer.create(<ResultScreen navigate={() => {}} levelId={4} score={20} isNewBest={false} />); });
  await flush();
  expect(r.root.findAllByType(AppButton).map((b: any) => b.props.title)).toEqual(['Replay Level', 'All Levels']);
});
