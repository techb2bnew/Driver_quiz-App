import { useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../constant/Constants';
import { emptyProgress, loadProgress, parseProgress } from '../utils/progress';
import { subscribe } from '../utils/storage';

// The saved progress, kept up to date if it is saved while a screen is open.
const useProgress = () => {
  const [state, setState] = useState({ loaded: false, progress: emptyProgress() });

  useEffect(() => {
    let alive = true;
    loadProgress().then((progress) => alive && setState({ loaded: true, progress }));
    const unsubscribe = subscribe((key, value) => {
      if (alive && key === STORAGE_KEYS.PROGRESS) {
        setState({ loaded: true, progress: parseProgress(value) });
      }
    });
    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  return state;
};

export default useProgress;
