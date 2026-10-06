import { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../constant/Constants';
import { getItem, setItem, subscribe } from '../utils/storage';

const useBestScore = () => {
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    getItem(STORAGE_KEYS.BEST_SCORE).then((value) => {
      setBestScore(Number(value) || 0);
    });
    // Follow later saves too (e.g. one made as the quiz screen closes).
    return subscribe((key, value) => {
      if (key === STORAGE_KEYS.BEST_SCORE) {
        setBestScore(Number(value) || 0);
      }
    });
  }, []);

  // Resolves true when `score` beat the saved best (and was saved).
  const saveIfBest = useCallback(async (score) => {
    const saved = Number(await getItem(STORAGE_KEYS.BEST_SCORE)) || 0;
    if (score > saved) {
      await setItem(STORAGE_KEYS.BEST_SCORE, score);
      setBestScore(score);
      return true;
    }
    setBestScore(saved);
    return false;
  }, []);

  return { bestScore, saveIfBest };
};

export default useBestScore;
