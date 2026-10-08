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
import Confetti from '../src/components/Confetti';
import { LEVELS } from '../src/constant/Questions';
import { loadProgress } from '../src/utils/progress';
import { setItem } from '../src/utils/storage';
import { STORAGE_KEYS } from '../src/constant/Constants';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);

const [L1, L2] = LEVELS;
const idsOf = (level: any) => level.questions.map((q: any) => q.id);
const n = (level: any) => level.questions.length;

const texts = (r: any) => r.root.findAllByType(Text).map((t: any) => [].concat(t.props.children).join(''));
const flush = () => act(async () => { await new Promise(res => setTimeout(res, 30)); });
const reset = () => setItem(STORAGE_KEYS.PROGRESS, '');
const saveProgress = (progress: object) => setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
const ids = (count: number) => Array.from({ length: count }, (_, i) => `p${i}`);

// Answer the question on screen: join circles p0..pN in order (right), or just the
// first and last (wrong), then press Check.
const answer = async (r: any, right: boolean, pathLength = 3) => {
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
  expect(texts(r)).toContain(`0/${LEVELS.length}`);
  r.unmount();

  await act(async () => { r = ReactTestRenderer.create(<LevelsScreen navigate={() => {}} />); });
  await flush();
  const t = texts(r);
  expect(t).toContain(`0/${n(L1)} done`);           // level 1 is open
  expect(t).toContain('Finish Level 1 to unlock');  // level 2 is not
  expect(t).toContain(`Finish Level ${LEVELS.length - 1} to unlock`); // nor is the last
});

test('play level 1: a wrong try costs a retry, right ones finish the level and unlock level 2', async () => {
  await reset();
  const onFinish = jest.fn();
  let r: any;
  await act(async () => { r = ReactTestRenderer.create(<QuizScreen levelId={1} done={{}} onFinish={onFinish} onExit={() => {}} />); });
  expect(texts(r)).toContain(`Question 1/${n(L1)}`);

  // Q1: wrong first (retry), then right -> 10 - 2 = 8 points
  await answer(r, false);
  expect(r.root.findByType(ResultModal).props.type).toBe('wrong');
  await pressModal(r);
  expect(texts(r)).toContain(`Question 1/${n(L1)}`);
  await answer(r, true);
  expect(r.root.findByType(ResultModal).props.type).toBe('correct');
  expect(r.root.findByType(ResultModal).props.points).toBe(8);
  expect((await loadProgress()).done).toEqual({ [idsOf(L1)[0]]: 8 });   // saved straight away
  await pressModal(r);

  // the rest right first time -> 10 each
  for (let i = 2; i <= n(L1); i++) {
    expect(texts(r)).toContain(`Question ${i}/${n(L1)}`);
    await answer(r, true);
    if (i === n(L1)) {
      expect(r.root.findByType(ResultModal).props.isLast).toBe(true);
    }
    await pressModal(r);
  }
  const expected = 8 + 10 * (n(L1) - 1);
  expect(onFinish).toHaveBeenCalledWith({ levelId: 1, score: expected, isNewBest: true });
  const saved = await loadProgress();
  expect(saved.best).toEqual({ 1: expected });
  expect(Object.keys(saved.done)).toHaveLength(n(L1));
  r.unmount();

  // Levels screen now: level 1 completed, level 2 open, level 3 still locked
  await act(async () => { r = ReactTestRenderer.create(<LevelsScreen navigate={() => {}} />); });
  await flush();
  const t = texts(r);
  expect(t).toContain(`Completed · Best ${expected}/${n(L1) * 10}`);
  expect(t).toContain(`0/${n(L2)} done`);
  expect(t).not.toContain('Finish Level 1 to unlock');
  expect(t).toContain('Finish Level 2 to unlock');
});

test('a level left half-way resumes at its first unfinished question with its score', async () => {
  await reset();
  const [a, b, c] = idsOf(L2);
  await saveProgress({ done: { [a]: 10, [b]: 6 }, best: {}, hints: {} });
  const { done } = await loadProgress();
  let r: any;
  await act(async () => { r = ReactTestRenderer.create(<QuizScreen levelId={2} done={done} onFinish={() => {}} onExit={() => {}} />); });
  const t = texts(r);
  expect(t).toContain(`Question 3/${n(L2)}`);
  expect(t).toContain('16');                          // 10 + 6 carried over
  expect(t).toContain(L2.questions[2].title);
  expect(c).toBeDefined();
});

test('a level has one hint: it takes 3 points off the score at once, stays spent, and is remembered', async () => {
  await reset();
  let r: any;
  await act(async () => { r = ReactTestRenderer.create(<QuizScreen levelId={1} done={{}} onFinish={() => {}} onExit={() => {}} />); });
  const hintBtn = () => r.root.findAllByType(AppButton).find((b: any) => /^Hint/.test(b.props.title));
  expect(hintBtn().props.title).toBe('Hint −3');
  expect(texts(r)).toContain('0');                                // score before the hint
  await act(async () => { hintBtn().props.onPress(); });
  expect(texts(r)).toContain('-3');                               // 3 off straight away
  expect(hintBtn().props.title).toBe('Hint used');
  expect(hintBtn().props.disabled).toBe(true);
  const labels = texts(r);
  L1.questions[0].path.forEach((w: string) => expect(labels).toContain(w)); // the whole route is shown
  await answer(r, true);
  expect(r.root.findByType(ResultModal).props.points).toBe(10);  // the question itself still pays in full
  expect(texts(r)).toContain('7');                                // 10 earned, 3 already taken
  await pressModal(r);
  // next question of the same level: no second hint, and no further cost
  expect(texts(r)).toContain(`Question 2/${n(L1)}`);
  expect(hintBtn().props.title).toBe('Hint used');
  expect(hintBtn().props.disabled).toBe(true);
  await answer(r, true);
  expect(r.root.findByType(ResultModal).props.points).toBe(10);
  expect((await loadProgress()).hints).toEqual({ 1: true });     // saved
  r.unmount();

  // leave and come back: still spent. A replay (reset) gives it back.
  await act(async () => { r = ReactTestRenderer.create(<QuizScreen levelId={1} done={{ [idsOf(L1)[0]]: 7 }} hintUsed onFinish={() => {}} onExit={() => {}} />); });
  expect(hintBtn().props.disabled).toBe(true);
  r.unmount();
  await act(async () => { r = ReactTestRenderer.create(<QuizScreen levelId={1} done={{}} hintUsed={false} onFinish={() => {}} onExit={() => {}} />); });
  expect(hintBtn().props.disabled).toBe(false);
});

test('result screen offers Next Level only when it is unlocked', async () => {
  await reset();
  const full = Object.fromEntries(idsOf(L1).map((id: string) => [id, 10]));
  await saveProgress({ done: full, best: { 1: n(L1) * 10 }, hints: {} });
  let r: any;
  await act(async () => { r = ReactTestRenderer.create(<ResultScreen navigate={() => {}} levelId={1} score={n(L1) * 10} isNewBest />); });
  await flush();
  const t = texts(r);
  expect(t).toContain('Level 1 Complete');
  expect(t).toContain(`/ ${n(L1) * 10}`);
  expect(t).toContain('🏆 New Best Score!');
  expect(r.root.findAllByType(Confetti)).toHaveLength(1);       // the celebration
  const titles = r.root.findAllByType(AppButton).map((b: any) => b.props.title);
  expect(titles).toEqual(['Next Level', 'Replay Level', 'All Levels']);
  r.unmount();

  // the last level has no next one
  await saveProgress({ done: {}, best: {}, hints: {} });
  await act(async () => { r = ReactTestRenderer.create(<ResultScreen navigate={() => {}} levelId={LEVELS.length} score={20} isNewBest={false} />); });
  await flush();
  expect(r.root.findAllByType(AppButton).map((b: any) => b.props.title)).toEqual(['Replay Level', 'All Levels']);
});
