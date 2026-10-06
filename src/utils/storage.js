import AsyncStorage from '@react-native-async-storage/async-storage';

// If the native store ever fails (it logs a warning), values still live in
// memory so the app keeps working until it is closed.
const memory = {};
const listeners = new Set();

// Called with (key, value) after every setItem, so a screen that is already
// open can show a value that was saved a moment later.
export const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getItem = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return value;
    }
  } catch (e) {
    console.warn('[storage] getItem failed for', key, e);
  }
  return key in memory ? memory[key] : null;
};

export const setItem = async (key, value) => {
  const text = String(value);
  memory[key] = text;
  try {
    await AsyncStorage.setItem(key, text);
  } catch (e) {
    console.warn('[storage] setItem failed for', key, e);
  }
  listeners.forEach((listener) => listener(key, text));
};
