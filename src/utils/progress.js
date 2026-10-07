import { STORAGE_KEYS } from '../constant/Constants';
import { getItem, setItem } from './storage';

// What is saved: { done: { [questionId]: pointsEarned }, best: { [levelId]: bestScore },
//                  hints: { [levelId]: true } }.
// `done` lets a level resume where it was left; `best` is the best score per level;
// `hints` marks the levels whose one hint is already spent.
export const emptyProgress = () => ({ done: {}, best: {}, hints: {} });

const plainObject = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {});

export const parseProgress = (raw) => {
  if (!raw) {
    return emptyProgress();
  }
  try {
    const saved = JSON.parse(raw);
    return { done: plainObject(saved.done), best: plainObject(saved.best), hints: plainObject(saved.hints) };
  } catch (e) {
    return emptyProgress();
  }
};

export const loadProgress = async () => parseProgress(await getItem(STORAGE_KEYS.PROGRESS));

const save = (progress) => setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));

// Always read-modify-write, so two quick saves never overwrite each other with stale data.
export const markQuestionDone = async (questionId, points) => {
  const progress = await loadProgress();
  progress.done[questionId] = points;
  await save(progress);
};

export const markHintUsed = async (levelId) => {
  const progress = await loadProgress();
  progress.hints[levelId] = true;
  await save(progress);
};

export const finishLevel = async (levelId, score) => {
  const progress = await loadProgress();
  const previous = progress.best[levelId] || 0;
  const isNewBest = score > previous;
  if (isNewBest) {
    progress.best[levelId] = score;
    await save(progress);
  }
  return { isNewBest, best: Math.max(previous, score) };
};

// Replaying a level starts it from its first question again (the best score stays).
export const resetLevel = async (level) => {
  const progress = await loadProgress();
  level.questions.forEach((question) => delete progress.done[question.id]);
  delete progress.hints[level.id]; // a replay gets its hint back
  await save(progress);
};
