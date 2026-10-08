import React from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FadeView from '../components/FadeView';
import useProgress from '../hooks/useProgress';
import { BaseStyle } from '../constant/Style';
import { SCREENS, STRINGS } from '../constant/Constants';
import { LEVELS } from '../constant/Questions';
import { spacings } from '../constant/Fonts';
import { fontSize, fontWeight } from '../utils/typography';
import {
  gameAccentColor,
  gameAccentWash,
  gameArenaBorderColor,
  gameBadgeBgColor,
  gameBgColor,
  gameCardColor,
  gameMutedTextColor,
  gameTextColor,
  gameTileTextColor,
  gameWinColor,
} from '../constant/Color';
import { doneCount, isLevelComplete, isLevelUnlocked, levelMaxScore } from '../utils/levels';
import { resetLevel } from '../utils/progress';
import { widthPercentageToDP as wp } from '../utils';

const LevelCard = ({ level, index, done, best, unlocked, onPress }) => {
  const complete = isLevelComplete(level, done);
  const count = doneCount(level, done);
  const subtitle = !unlocked
    ? STRINGS.LEVELS.LOCKED(index)
    : complete
    ? STRINGS.LEVELS.COMPLETED(best || 0, levelMaxScore(level))
    : STRINGS.LEVELS.PROGRESS(count, level.questions.length);

  return (
    <Pressable
      disabled={!unlocked}
      onPress={onPress}
      style={[
        styles.card,
        BaseStyle.flexDirectionRow,
        BaseStyle.alignItemsCenter,
        !unlocked && styles.locked,
        complete && styles.completeCard,
      ]}>
      <View style={[styles.badge, BaseStyle.alignJustifyCenter, unlocked && styles.badgeOn]}>
        <Text style={[styles.badgeText, unlocked && styles.badgeTextOn]}>{level.id}</Text>
      </View>
      <View style={BaseStyle.flex}>
        <Text style={styles.name}>{level.name}</Text>
        <Text style={styles.sub}>{subtitle}</Text>
        <View style={[BaseStyle.flexDirectionRow, styles.dots]}>
          {level.questions.map((q) => (
            <View key={q.id} style={[styles.dot, q.id in done && styles.dotDone]} />
          ))}
        </View>
      </View>
      <Text style={styles.state}>{!unlocked ? '🔒' : complete ? '✓' : '▶'}</Text>
    </Pressable>
  );
};

const LevelsScreen = ({ navigate }) => {
  const { loaded, progress } = useProgress();
  const { done, best } = progress;

  const play = async (level) => {
    // A finished level is replayed from its first question; one in progress resumes.
    if (isLevelComplete(level, done)) {
      await resetLevel(level);
      navigate(SCREENS.QUIZ, { runId: Date.now(), levelId: level.id, done: {}, hintUsed: false });
    } else {
      navigate(SCREENS.QUIZ, {
        runId: Date.now(),
        levelId: level.id,
        done,
        hintUsed: !!progress.hints[level.id],
      });
    }
  };

  return (
    <SafeAreaView style={[BaseStyle.flex, styles.container]}>
      <StatusBar barStyle="light-content" backgroundColor={gameBgColor} />
      <View style={[BaseStyle.flexDirectionRow, BaseStyle.alignItemsCenter]}>
        <Pressable
          onPress={() => navigate(SCREENS.HOME)}
          hitSlop={spacings.xxLarge}
          style={[styles.back, BaseStyle.alignJustifyCenter, BaseStyle.borderRadius50]}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={[styles.title, BaseStyle.flex]}>{STRINGS.LEVELS.TITLE}</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}>
        {LEVELS.map((level, i) => (
          <FadeView key={level.id} delay={80 + i * 90}>
            <LevelCard
              level={level}
              index={i}
              done={done}
              best={best[level.id]}
              unlocked={loaded && isLevelUnlocked(LEVELS, i, done)}
              onPress={() => play(level)}
            />
          </FadeView>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: gameBgColor,
    paddingHorizontal: spacings.xxxxLarge,
    paddingTop: spacings.xxxxLarge,
  },
  back: {
    width: wp(10),
    height: wp(10),
    backgroundColor: gameBadgeBgColor,
  },
  // keeps the title centred opposite the back button
  spacer: {
    width: wp(10),
    height: wp(10),
  },
  backText: {
    color: gameTextColor,
    fontSize: fontSize('fontSizeLarge2x'),
    lineHeight: fontSize('fontSizeLarge2x') * 1.1,
  },
  title: {
    color: gameTextColor,
    fontSize: fontSize('fontSizeLargeX'),
    fontWeight: fontWeight('fontWeightBold'),
    textAlign: 'center',
  },
  list: {
    marginTop: spacings.ExtraLarge,
  },
  listContent: {
    paddingBottom: spacings.ExtraLarge,
  },
  card: {
    backgroundColor: gameCardColor,
    borderRadius: spacings.xxxxLarge,
    borderWidth: 1,
    borderColor: gameArenaBorderColor,
    padding: spacings.xxxxLarge,
    marginBottom: spacings.xxxxLarge,
  },
  completeCard: {
    borderColor: gameWinColor,
  },
  locked: {
    opacity: 0.5,
  },
  badge: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: gameBadgeBgColor,
    marginRight: spacings.xxxxLarge,
  },
  badgeOn: {
    backgroundColor: gameAccentColor,
  },
  badgeText: {
    color: gameMutedTextColor,
    fontSize: fontSize('fontSizeMedium1x'),
    fontWeight: fontWeight('fontWeightBold'),
  },
  badgeTextOn: {
    color: gameTileTextColor,
  },
  name: {
    color: gameTextColor,
    fontSize: fontSize('fontSizeNormal2x'),
    fontWeight: fontWeight('fontWeightMedium1x'),
  },
  sub: {
    color: gameMutedTextColor,
    fontSize: fontSize('fontSizeSmall1x'),
    marginTop: spacings.xsmall,
  },
  dots: {
    marginTop: spacings.large,
  },
  dot: {
    width: wp(6),
    height: 6,
    borderRadius: 3,
    backgroundColor: gameAccentWash,
    marginRight: spacings.normal,
  },
  dotDone: {
    backgroundColor: gameAccentColor,
  },
  state: {
    color: gameAccentColor,
    fontSize: fontSize('fontSizeLargeX'),
    marginLeft: spacings.large,
  },
});

export default LevelsScreen;
