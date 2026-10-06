import React, { useEffect, useRef } from 'react';
import { Animated, StatusBar, StyleSheet, Text } from 'react-native';
import { BaseStyle } from '../constant/Style';
import { SCREENS, STORAGE_KEYS, STRINGS, TIMING } from '../constant/Constants';
import { spacings } from '../constant/Fonts';
import { fontSize, fontWeight, iconSize } from '../utils/typography';
import {
  gameAccentColor,
  gameBgColor,
  gameMutedTextColor,
  gameTextColor,
} from '../constant/Color';
import { getItem } from '../utils/storage';
import { widthPercentageToDP as wp } from '../utils';

const SplashScreen = ({ navigate }) => {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const truckX = useRef(new Animated.Value(-wp(40))).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 5, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
    Animated.timing(truckX, { toValue: 0, duration: 1200, delay: 300, useNativeDriver: true }).start();

    let cancelled = false;
    const wait = new Promise((resolve) => setTimeout(resolve, TIMING.SPLASH_MS));
    Promise.all([wait, getItem(STORAGE_KEYS.ONBOARDING_DONE)]).then(([, done]) => {
      if (!cancelled) {
        navigate(done === 'true' ? SCREENS.HOME : SCREENS.ONBOARDING);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [logoScale, logoOpacity, textOpacity, truckX, navigate]);

  return (
    <Animated.View style={[BaseStyle.flex, BaseStyle.alignJustifyCenter, styles.container]}>
      <StatusBar barStyle="light-content" backgroundColor={gameBgColor} />
      <Animated.View
        style={[
          styles.logo,
          BaseStyle.alignJustifyCenter,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}>
        <Animated.Text style={[styles.logoIcon, { transform: [{ translateX: truckX }] }]}>
          🚛
        </Animated.Text>
      </Animated.View>
      <Animated.View style={[BaseStyle.alignItemsCenter, { opacity: textOpacity }]}>
        <Text style={styles.name}>{STRINGS.APP_NAME}</Text>
        <Text style={styles.tagline}>{STRINGS.TAGLINE}</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: gameBgColor,
    padding: spacings.xxxxLarge,
  },
  logo: {
    width: wp(36),
    height: wp(36),
    borderRadius: wp(18),
    borderWidth: 3,
    borderColor: gameAccentColor,
    marginBottom: spacings.xxxxLarge,
    overflow: 'hidden',
  },
  logoIcon: {
    fontSize: iconSize.medium,
  },
  name: {
    color: gameTextColor,
    fontSize: fontSize('fontSizeLarge2x'),
    fontWeight: fontWeight('fontWeightBold'),
    letterSpacing: 1,
  },
  tagline: {
    color: gameMutedTextColor,
    fontSize: fontSize('fontSizeNormal'),
    marginTop: spacings.small,
    textAlign: 'center',
  },
});

export default SplashScreen;
