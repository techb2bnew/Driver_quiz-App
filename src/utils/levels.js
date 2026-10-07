import { SCORE } from '../constant/Constants';

// Progress is { done: { [questionId]: pointsEarned }, best: { [levelId]: bestLevelScore } }.

export const levelMaxScore = (level) => level.questions.length * SCORE.POINTS_PER_QUESTION;

export const doneCount = (level, done) => level.questions.filter((q) => q.id in done).length;

export const isLevelComplete = (level, done) => doneCount(level, done) === level.questions.length;

export const levelScore = (level, done) =>
  level.questions.reduce((sum, q) => sum + (done[q.id] || 0), 0);

// Level 1 is always open; every other level opens when the one before it is complete.
export const isLevelUnlocked = (levels, index, done) =>
  index === 0 || isLevelComplete(levels[index - 1], done);

export const firstUnfinished = (level, done) => {
  const index = level.questions.findIndex((q) => !(q.id in done));
  return index === -1 ? 0 : index;
};

export const totalBest = (best) => Object.values(best).reduce((sum, value) => sum + value, 0);

export const completedLevels = (levels, done) =>
  levels.filter((level) => isLevelComplete(level, done)).length;
