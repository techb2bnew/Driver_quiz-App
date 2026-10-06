import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { BaseStyle } from '../constant/Style';
import { STRINGS } from '../constant/Constants';
import { spacings } from '../constant/Fonts';
import { fontSize, fontWeight } from '../utils/typography';
import {
  gameAccentColor,
  gameBadgeBgColor,
  gameMutedTextColor,
  gameProgressTrackColor,
  gameTextColor,
} from '../constant/Color';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../utils';

const QuizHeader = ({ current, total, score, onBack }) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: current / total,
      duration: 500,
      useNativeDriver: false, // animates width, which the native driver can't do
    }).start();
  }, [current, total, progress]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View>
      <View
        style={[BaseStyle.flexDirectionRow, BaseStyle.alignItemsCenter, BaseStyle.justifyContentSpaceBetween]}>
        <Pressable
          onPress={onBack}
          hitSlop={spacings.xxLarge}
          style={[styles.backButton, BaseStyle.alignJustifyCenter, BaseStyle.borderRadius50]}>
          <Text style={styles.backText}>✕</Text>
        </Pressable>
        <Text style={styles.counter}>{STRINGS.QUIZ.QUESTION_OF(current, total)}</Text>
        <View style={[styles.scoreBadge, BaseStyle.alignItemsCenter, BaseStyle.borderRadius50]}>
          <Text style={styles.scoreLabel}>{STRINGS.QUIZ.SCORE}</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
      </View>
      <View style={[styles.track, BaseStyle.overflowHidden, BaseStyle.borderRadius50]}>
        <Animated.View style={[styles.fill, BaseStyle.borderRadius50, { width }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    width: wp(10),
    height: wp(10),
    backgroundColor: gameBadgeBgColor,
  },
  backText: {
    color: gameTextColor,
    fontSize: fontSize('fontSizeNormal'),
    fontWeight: fontWeight('fontWeightMedium1x'),
  },
  counter: {
    color: gameTextColor,
    fontSize: fontSize('fontSizeNormal2x'),
    fontWeight: fontWeight('fontWeightMedium1x'),
  },
  scoreBadge: {
    minWidth: wp(16),
    paddingVertical: spacings.normal,
    paddingHorizontal: spacings.xxLarge,
    backgroundColor: gameBadgeBgColor,
  },
  scoreLabel: {
    color: gameMutedTextColor,
    fontSize: fontSize('fontSizeExtraSmall'),
  },
  scoreValue: {
    color: gameAccentColor,
    fontSize: fontSize('fontSizeNormal'),
    fontWeight: fontWeight('fontWeightBold'),
  },
  track: {
    height: hp(0.9),
    marginTop: spacings.xxLarge,
    backgroundColor: gameProgressTrackColor,
  },
  fill: {
    height: '100%',
    backgroundColor: gameAccentColor,
  },
});

export default QuizHeader;
