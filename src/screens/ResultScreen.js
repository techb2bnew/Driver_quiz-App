import React, { useEffect, useRef } from 'react';
import { Animated, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import FadeView from '../components/FadeView';
import useProgress from '../hooks/useProgress';
import { BaseStyle } from '../constant/Style';
import { SCREENS, STRINGS } from '../constant/Constants';
import { LEVELS } from '../constant/Questions';
import { isLevelUnlocked, levelMaxScore } from '../utils/levels';
import { resetLevel } from '../utils/progress';
import { spacings } from '../constant/Fonts';
import { fontSize, fontWeight, iconSize } from '../utils/typography';
import {
  gameAccentColor,
  gameBgColor,
  gameCardColor,
  gameMutedTextColor,
  gameTextColor,
  gameTileTextColor,
  gameArenaBorderColor,
} from '../constant/Color';
import { widthPercentageToDP as wp } from '../utils';

const ResultScreen = ({ navigate, levelId, score, isNewBest }) => {
  const { progress } = useProgress();
  const levelIndex = LEVELS.findIndex((l) => l.id === levelId);
  const level = LEVELS[levelIndex];
  const nextLevel = LEVELS[levelIndex + 1];
  const maxScore = levelMaxScore(level);
  const best = progress.best[levelId] || score;
  const pop = useRef(new Animated.Value(0)).current;
  const badge = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start();
    if (isNewBest) {
      Animated.spring(badge, { toValue: 1, friction: 4, useNativeDriver: true }).start();
    }
  }, [isNewBest, pop, badge]);

  const play = (target, done, hintUsed) =>
    navigate(SCREENS.QUIZ, { runId: Date.now(), levelId: target.id, done, hintUsed });
  const canPlayNext = !!nextLevel && isLevelUnlocked(LEVELS, levelIndex + 1, progress.done);

  const ratio = score / maxScore;
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
        <Text style={styles.title}>{STRINGS.RESULT.TITLE(levelId)}</Text>

        <Animated.View
          style={[
            styles.scoreCircle,
            BaseStyle.alignJustifyCenter,
            { opacity: pop, transform: [{ scale: pop }] },
          ]}>
          <Text style={styles.scoreLabel}>{STRINGS.RESULT.YOUR_SCORE}</Text>
          <Text style={styles.score}>{score}</Text>
          <Text style={styles.scoreMax}>/ {maxScore}</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.newBest,
            BaseStyle.borderRadius50,
            { opacity: badge, transform: [{ scale: badge }] },
          ]}>
          <Text style={styles.newBestText}>{STRINGS.RESULT.NEW_BEST}</Text>
        </Animated.View>

        <FadeView delay={400} style={[styles.messageCard, BaseStyle.alignItemsCenter]}>
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.best}>
            {STRINGS.RESULT.BEST_SCORE}: <Text style={styles.bestValue}>{best}</Text>
          </Text>
        </FadeView>
      </View>

      <FadeView delay={600}>
        {canPlayNext && (
          <AppButton
            title={STRINGS.RESULT.NEXT_LEVEL}
            pulse
            onPress={() => play(nextLevel, progress.done, !!progress.hints[nextLevel.id])}
          />
        )}
        <AppButton
          title={STRINGS.RESULT.REPLAY}
          variant="secondary"
          onPress={async () => {
            await resetLevel(level);
            play(level, {}, false);
          }}
          style={canPlayNext ? styles.homeButton : undefined}
        />
        <AppButton
          title={STRINGS.RESULT.ALL_LEVELS}
          variant="secondary"
          onPress={() => navigate(SCREENS.LEVELS)}
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
    backgroundColor: gameAccentColor,
  },
  newBestText: {
    color: gameTileTextColor,
    fontSize: fontSize('fontSizeNormal'),
    fontWeight: fontWeight('fontWeightMedium1x'),
  },
  messageCard: {
    marginTop: spacings.xxxxLarge,
    width: '100%',
    backgroundColor: gameCardColor,
    borderRadius: spacings.xxxxLarge,
    borderWidth: 1,
    borderColor: gameArenaBorderColor,
    paddingVertical: spacings.xxLarge,
    paddingHorizontal: spacings.xxxxLarge,
  },
  message: {
    color: gameTextColor,
    fontSize: fontSize('fontSizeMedium1x'),
    fontWeight: fontWeight('fontWeightMedium'),
    textAlign: 'center',
  },
  best: {
    color: gameMutedTextColor,
    fontSize: fontSize('fontSizeNormal2x'),
    marginTop: spacings.small,
  },
  bestValue: {
    color: gameAccentColor,
    fontWeight: fontWeight('fontWeightMedium1x'),
  },
  homeButton: {
    marginTop: spacings.large,
  },
});

export default ResultScreen;
