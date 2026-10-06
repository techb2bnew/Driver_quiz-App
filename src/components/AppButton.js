import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { BaseStyle } from '../constant/Style';
import { spacings } from '../constant/Fonts';
import { fontSize, fontWeight } from '../utils/typography';
import {
  gameAccentColor,
  gameTileTextColor,
  gameSlotBgColor,
  gameMutedTextColor,
  gameLoseColor,
  gameWinColor,
  gameTextColor,
  authBorderColor,
} from '../constant/Color';
import { heightPercentageToDP as hp } from '../utils';

const VARIANTS = {
  primary: { bg: gameAccentColor, text: gameTileTextColor },
  success: { bg: gameWinColor, text: gameTextColor },
  danger: { bg: gameLoseColor, text: gameTextColor },
  secondary: { bg: gameSlotBgColor, text: gameTextColor, border: authBorderColor },
};

const AppButton = ({ title, onPress, variant = 'primary', disabled, style }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const colors = disabled
    ? { bg: gameSlotBgColor, text: gameMutedTextColor }
    : VARIANTS[variant];

  const animateTo = (toValue) =>
    Animated.spring(scale, { toValue, useNativeDriver: true, speed: 40 }).start();

  return (
    <Animated.View style={[BaseStyle.width100Percent, { transform: [{ scale }] }, style]}>
      <Pressable
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => animateTo(0.95)}
        onPressOut={() => animateTo(1)}
        style={[
          styles.button,
          BaseStyle.alignJustifyCenter,
          BaseStyle.borderRadius10,
          { backgroundColor: colors.bg },
          colors.border && [BaseStyle.borderWidth1, { borderColor: colors.border }],
        ]}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    height: hp(5),
    paddingHorizontal: spacings.Large2x,
  },
  title: {
    fontSize: fontSize('fontSizeNormal'),
    fontWeight: fontWeight('fontWeightMedium1x'),
  },
});

export default AppButton;
