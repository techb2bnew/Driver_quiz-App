import Sound from 'react-native-sound';

// The files live in android/app/src/main/res/raw and ios/DriveQuiz/sounds
// (names without the extension are the ones used in the app).
export const SOUNDS = {
  CORRECT: 'correct',
  WRONG: 'wrong',
  OVERLAP: 'overlap',
};

// Play even when the iPhone's silent switch is on — the right/wrong feedback matters.
Sound.setCategory('Playback');

const loading = {}; // name -> Promise<Sound | null>
const ready = {}; // name -> Sound, filled as each file finishes loading

const load = (name) => {
  if (!loading[name]) {
    loading[name] = new Promise((resolve) => {
      const sound = new Sound(`${name}.wav`, Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.warn('[sound] could not load', name, error);
          resolve(null);
        } else {
          ready[name] = sound;
          resolve(sound);
        }
      });
    });
  }
  return loading[name];
};

// Load once at start-up so the first popup doesn't wait on the file.
export const preloadSounds = () => Object.values(SOUNDS).forEach(load);

export const stopSounds = () => Object.values(ready).forEach((sound) => sound.stop());

export const playSound = async (name) => {
  const sound = await load(name);
  if (!sound) {
    return;
  }
  // Silence any other clip first. This must be synchronous: stopping later would
  // also cut off the clip we are about to start.
  Object.keys(ready).forEach((other) => {
    if (other !== name) {
      ready[other].stop();
    }
  });
  sound.stop(() => {
    sound.play((success) => {
      if (!success) {
        console.warn('[sound] playback failed for', name);
      }
    });
  });
};
