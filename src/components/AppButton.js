import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { BaseStyle } from '../constant/Style';
import { spacings } from '../constant/Fonts';
import { fontSize, fontWeight } from '../utils/typography';
import {
  gameAccentColor,
  gameTileTextColor,
  gameCardColor,
  gameMutedTextColor,
  gameLoseColor,
  gameWinColor,
  gameTextColor,
  gameAccentLine,
  whiteColor,
} from '../constant/Color';
import { heightPercentageToDP as hp } from '../utils';

const VARIANTS = {
  primary: { bg: gameAccentColor, text: gameTileTextColor },
  success: { bg: gameWinColor, text: whiteColor },
  danger: { bg: gameLoseColor, text: whiteColor },
  secondary: { bg: gameCardColor, text: gameTextColor, border: '#C5CED8' },
};

const AppButton = ({ title, onPress, variant = 'primary', disabled, pulse, style }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const colors = disabled
    ? { bg: gameCardColor, text: gameMutedTextColor, border: gameAccentLine }
    : VARIANTS[variant];

  useEffect(() => {
    if (!pulse || disabled) {
      scale.setValue(1);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.04, duration: 700, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, disabled, scale]);

  const animateTo = (toValue) =>
    Animated.spring(scale, { toValue, useNativeDriver: true, speed: 40 }).start();

  return (
    <Animated.View
      style={[
        BaseStyle.width100Percent,
        !disabled && variant === 'primary' && styles.glow,
        { transform: [{ scale }] },
        style,
      ]}>
      <Pressable
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => animateTo(0.96)}
        onPressOut={() => animateTo(1)}
        style={[
          styles.button,
          BaseStyle.alignJustifyCenter,
          { backgroundColor: colors.bg },
          (colors.border || disabled) && [BaseStyle.borderWidth1, { borderColor: colors.border || '#C5CED8' }],
        ]}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          style={[styles.title, { color: colors.text }]}>
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  glow: {
    shadowColor: '#F0B429',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  button: {
    height: hp(5.2),
    paddingHorizontal: spacings.Large2x,
    borderRadius: spacings.xxLarge,
  },
  title: {
    fontSize: fontSize('fontSizeNormal'),
    fontWeight: fontWeight('fontWeightBold'),
    letterSpacing: 0.4,
  },
});

export default AppButton;
