import React, { useEffect, useRef, useState } from 'react';
import { Animated, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import FadeView from '../components/FadeView';
import useBestScore from '../hooks/useBestScore';
import { BaseStyle } from '../constant/Style';
import { SCORE, SCREENS, STRINGS } from '../constant/Constants';
import { QUESTIONS } from '../constant/Questions';
import { spacings } from '../constant/Fonts';
import { fontSize, fontWeight, iconSize } from '../utils/typography';
import {
  gameAccentColor,
  gameBgColor,
  gameCardColor,
  gameMutedTextColor,
  gameTextColor,
  authBorderColor,
} from '../constant/Color';
import { widthPercentageToDP as wp } from '../utils';

const MAX_SCORE = QUESTIONS.length * SCORE.POINTS_PER_QUESTION;

const ResultScreen = ({ navigate, score }) => {
  const { bestScore, saveIfBest } = useBestScore();
  const [isNewBest, setIsNewBest] = useState(false);
  const pop = useRef(new Animated.Value(0)).current;
  const badge = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    saveIfBest(score).then((beat) => {
      setIsNewBest(beat);
      if (beat) {
        Animated.spring(badge, { toValue: 1, friction: 4, useNativeDriver: true }).start();
      }
    });
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start();
  }, [score, saveIfBest, pop, badge]);

  const ratio = score / MAX_SCORE;
  const message =
    ratio >= 0.8
      ? STRINGS.RESULT.MESSAGES.GREAT
      : ratio >= 0.5
      ? STRINGS.RESULT.MESSAGES.GOOD
      : STRINGS.RESULT.MESSAGES.LOW;

  return (
    <SafeAreaView style={[BaseStyle.flex, styles.container]}>
      <StatusBar barStyle="light-content" backgroundColor={gameBgColor} />
      <View style={[BaseStyle.flex, BaseStyle.alignJustifyCenter]}>
        <Text style={styles.title}>{STRINGS.RESULT.TITLE}</Text>

        <Animated.View
          style={[
            styles.scoreCircle,
            BaseStyle.alignJustifyCenter,
            { opacity: pop, transform: [{ scale: pop }] },
          ]}>
          <Text style={styles.scoreLabel}>{STRINGS.RESULT.YOUR_SCORE}</Text>
          <Text style={styles.score}>{score}</Text>
          <Text style={styles.scoreMax}>/ {MAX_SCORE}</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.newBest,
            BaseStyle.borderRadius50,
            { opacity: badge, transform: [{ scale: badge }] },
          ]}>
          <Text style={styles.newBestText}>{STRINGS.RESULT.NEW_BEST}</Text>
        </Animated.View>

        <FadeView delay={400} style={BaseStyle.alignItemsCenter}>
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.best}>
            {STRINGS.RESULT.BEST_SCORE}: <Text style={styles.bestValue}>{isNewBest ? score : bestScore}</Text>
          </Text>
        </FadeView>
      </View>

      <FadeView delay={600}>
        <AppButton
          title={STRINGS.RESULT.PLAY_AGAIN}
          onPress={() => navigate(SCREENS.QUIZ, { runId: Date.now() })}
        />
        <AppButton
          title={STRINGS.RESULT.HOME}
          variant="secondary"
          onPress={() => navigate(SCREENS.HOME)}
          style={styles.homeButton}
        />
      </FadeView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: gameBgColor,
    padding: spacings.xxxxLarge,
  },
  title: {
    color: gameTextColor,
    fontSize: fontSize('fontSizeLargeX'),
    fontWeight: fontWeight('fontWeightBold'),
    marginBottom: spacings.xxxxLarge,
  },
  scoreCircle: {
    width: wp(48),
    height: wp(48),
    borderRadius: wp(24),
    backgroundColor: gameCardColor,
    borderWidth: 4,
    borderColor: gameAccentColor,
  },
  scoreLabel: {
    color: gameMutedTextColor,
    fontSize: fontSize('fontSizeNormal'),
  },
  score: {
    color: gameAccentColor,
    fontSize: iconSize.medium,
    fontWeight: fontWeight('fontWeightBold'),
  },
  scoreMax: {
    color: gameMutedTextColor,
    fontSize: fontSize('fontSizeNormal'),
  },
  newBest: {
    marginTop: spacings.xxxxLarge,
    paddingVertical: spacings.large,
    paddingHorizontal: spacings.xxxxLarge,
    backgroundColor: gameCardColor,
    borderWidth: 1,
    borderColor: gameAccentColor,
  },
  newBestText: {
    color: gameAccentColor,
    fontSize: fontSize('fontSizeNormal'),
    fontWeight: fontWeight('fontWeightMedium1x'),
  },
  message: {
    color: gameTextColor,
    fontSize: fontSize('fontSizeMedium1x'),
    fontWeight: fontWeight('fontWeightMedium'),
    marginTop: spacings.xxxxLarge,
  },
  best: {
    color: gameMutedTextColor,
    fontSize: fontSize('fontSizeNormal2x'),
    marginTop: spacings.small,
    borderColor: authBorderColor,
  },
  bestValue: {
    color: gameTextColor,
    fontWeight: fontWeight('fontWeightMedium1x'),
  },
  homeButton: {
    marginTop: spacings.small,
  },
});

export default ResultScreen;
