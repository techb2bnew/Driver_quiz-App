import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import FadeView from '../components/FadeView';
import useBestScore from '../hooks/useBestScore';
import { BaseStyle } from '../constant/Style';
import { SCREENS, STRINGS } from '../constant/Constants';
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

const StatCard = ({ label, value }) => (
  <View style={[styles.stat, BaseStyle.flex, BaseStyle.alignItemsCenter]}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const HomeScreen = ({ navigate }) => {
  const { bestScore } = useBestScore();

  return (
    <SafeAreaView style={[BaseStyle.flex, styles.container]}>
      <StatusBar barStyle="light-content" backgroundColor={gameBgColor} />
      <View style={BaseStyle.flex}>
        <FadeView>
          <Text style={styles.logo}>🚛</Text>
          <Text style={styles.greeting}>{STRINGS.HOME.GREETING}</Text>
          <Text style={styles.subtitle}>{STRINGS.HOME.SUBTITLE}</Text>
        </FadeView>

        <FadeView delay={150} style={[BaseStyle.flexDirectionRow, styles.stats]}>
          <StatCard label={STRINGS.HOME.BEST_SCORE} value={bestScore} />
          <View style={{ width: spacings.large }} />
          <StatCard label={STRINGS.HOME.QUESTIONS} value={QUESTIONS.length} />
        </FadeView>

        <FadeView delay={300} style={[styles.rules, BaseStyle.borderRadius10]}>
          <Text style={styles.rulesTitle}>{STRINGS.HOME.HOW_TO_PLAY}</Text>
          {STRINGS.HOME.RULES.map((rule, i) => (
            <View key={rule} style={[BaseStyle.flexDirectionRow, styles.ruleRow]}>
              <Text style={styles.ruleNumber}>{i + 1}</Text>
              <Text style={[styles.ruleText, BaseStyle.flex]}>{rule}</Text>
            </View>
          ))}
        </FadeView>
      </View>

      <FadeView delay={450}>
        <AppButton title={STRINGS.HOME.START_QUIZ} onPress={() => navigate(SCREENS.QUIZ, { runId: Date.now() })} />
      </FadeView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: gameBgColor,
    padding: spacings.xxxxLarge,
  },
  logo: {
    fontSize: iconSize.medium,
    marginTop: spacings.xxLarge,
  },
  greeting: {
    color: gameTextColor,
    fontSize: fontSize('fontSizeLarge2x'),
    fontWeight: fontWeight('fontWeightBold'),
    marginTop: spacings.large,
  },
  subtitle: {
    color: gameMutedTextColor,
    fontSize: fontSize('fontSizeNormal2x'),
    marginTop: spacings.normal,
  },
  stats: {
    marginTop: spacings.ExtraLarge,
  },
  stat: {
    backgroundColor: gameCardColor,
    borderRadius: spacings.xxxxLarge,
    borderWidth: 1,
    borderColor: authBorderColor,
    paddingVertical: spacings.xxxxLarge,
  },
  statValue: {
    color: gameAccentColor,
    fontSize: fontSize('fontSizeLarge2x'),
    fontWeight: fontWeight('fontWeightBold'),
  },
  statLabel: {
    color: gameMutedTextColor,
    fontSize: fontSize('fontSizeNormal'),
    marginTop: spacings.normal,
  },
  rules: {
    marginTop: spacings.xxxxLarge,
    backgroundColor: gameCardColor,
    padding: spacings.xxLarge,
    borderWidth: 1,
    borderColor: authBorderColor,
  },
  rulesTitle: {
    color: gameTextColor,
    fontSize: fontSize('fontSizeNormal2x'),
    fontWeight: fontWeight('fontWeightMedium1x'),
    marginBottom: spacings.large,
  },
  ruleRow: {
    marginBottom: spacings.small,
  },
  ruleNumber: {
    width: wp(6),
    color: gameAccentColor,
    fontSize: fontSize('fontSizeNormal'),
    fontWeight: fontWeight('fontWeightMedium1x'),
  },
  ruleText: {
    color: gameMutedTextColor,
    fontSize: fontSize('fontSizeNormal'),
  },
});

export default HomeScreen;
