import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StatusBar, StyleSheet, Text, View } from 'react-native';
import { BaseStyle } from '../constant/Style';
import { SCREENS, STORAGE_KEYS, STRINGS, TIMING } from '../constant/Constants';
import { spacings } from '../constant/Fonts';
import { fontSize, fontWeight } from '../utils/typography';
import { gameAccentColor, gameBgColor } from '../constant/Color';
import { getItem } from '../utils/storage';
import { widthPercentageToDP as wp } from '../utils';

const SplashScreen = ({ navigate }) => {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textShift = useRef(new Animated.Value(18)).current;
  const lineScale = useRef(new Animated.Value(0)).current;
  const truckX = useRef(new Animated.Value(-wp(40))).current;
  const bob = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const entrance = Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 5, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(truckX, {
          toValue: 0,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(textShift, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(lineScale, { toValue: 1, duration: 450, useNativeDriver: true }),
      ]),
    ]);
    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    const ringLoop = Animated.loop(
      Animated.timing(ring, { toValue: 1, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    );

    entrance.start(({ finished }) => {
      if (finished) {
        bobLoop.start();
      }
    });
    ringLoop.start();

    let cancelled = false;
    const wait = new Promise((resolve) => setTimeout(resolve, TIMING.SPLASH_MS));
    Promise.all([wait, getItem(STORAGE_KEYS.ONBOARDING_DONE)]).then(([, done]) => {
      if (!cancelled) {
        navigate(done === 'true' ? SCREENS.HOME : SCREENS.ONBOARDING);
      }
    });
    return () => {
      cancelled = true;
      entrance.stop();
      bobLoop.stop();
      ringLoop.stop();
    };
  }, [logoScale, logoOpacity, textOpacity, textShift, lineScale, truckX, bob, ring, navigate]);

  const bobY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const ringScale = ring.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] });
  const ringOpacity = ring.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });

  return (
    <View style={[BaseStyle.flex, BaseStyle.alignJustifyCenter, styles.container]}>
      <StatusBar barStyle="light-content" backgroundColor={gameBgColor} />
      <Animated.View
        style={[
          styles.stage,
          BaseStyle.alignJustifyCenter,
          { opacity: logoOpacity, transform: [{ scale: logoScale }, { translateY: bobY }] },
        ]}>
        <Animated.View
          pointerEvents="none"
          style={[styles.ring, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]}
        />
        <View style={[styles.logo, BaseStyle.alignJustifyCenter]}>
          <Animated.Text style={[styles.logoIcon, { transform: [{ translateX: truckX }] }]}>
            🚛
          </Animated.Text>
        </View>
      </Animated.View>
      <Animated.View
        style={[
          BaseStyle.alignItemsCenter,
          { opacity: textOpacity, transform: [{ translateY: textShift }] },
        ]}>
        <Text style={styles.name}>{STRINGS.APP_NAME}</Text>
        <Animated.View style={[styles.rule, { transform: [{ scaleX: lineScale }] }]} />
        <Text style={styles.tagline}>{STRINGS.TAGLINE}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: gameBgColor,
    padding: spacings.xxxxLarge,
  },
  stage: {
    width: wp(52),
    height: wp(52),
    marginBottom: spacings.ExtraLarge,
  },
  logo: {
    width: wp(34),
    height: wp(34),
    borderRadius: wp(17),
    borderWidth: 3,
    borderColor: '#F6D56A',
    backgroundColor: '#F6D56A',
    overflow: 'hidden',
  },
  ring: {
    position: 'absolute',
    width: wp(52),
    height: wp(52),
    borderRadius: wp(26),
    borderWidth: 2,
    borderColor: gameAccentColor,
  },
  logoIcon: {
    fontSize: wp(18),
  },
  rule: {
    width: wp(16),
    height: 2,
    borderRadius: 2,
    marginTop: spacings.large,
    backgroundColor: gameAccentColor,
  },
  name: {
    color: '#F7F4EC',
    fontSize: fontSize('fontSizeLarge2x'),
    fontWeight: fontWeight('fontWeightBold'),
    letterSpacing: 1,
  },
  tagline: {
    color: '#C5CDD8',
    fontSize: fontSize('fontSizeNormal'),
    marginTop: spacings.small,
    textAlign: 'center',
  },
});

export default SplashScreen;
