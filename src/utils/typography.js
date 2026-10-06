import { StyleSheet } from 'react-native';
import { style } from '../constant/Fonts';
import normalizeText from '../constant/normalizetext';

// Read a number out of the registered font styles in constant/Fonts.js, so
// the sizes and weights stay defined in one place.
export const fontSize = (key) => StyleSheet.flatten(style[key]).fontSize;
export const fontWeight = (key) => StyleSheet.flatten(style[key]).fontWeight;

// Emoji used as icons (splash logo, onboarding, popups). Not text, so Fonts.js has no step for them.
export const iconSize = {
  medium: normalizeText(52),
  large: normalizeText(78),
};
