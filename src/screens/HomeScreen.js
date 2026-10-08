import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import FadeView from '../components/FadeView';
import PrivacyLink from '../components/PrivacyLink';
import useProgress from '../hooks/useProgress';
import { BaseStyle } from '../constant/Style';
import { SCREENS, STRINGS } from '../constant/Constants';
import { LEVELS } from '../constant/Questions';
import { completedLevels, totalBest } from '../utils/levels';
import { spacings } from '../constant/Fonts';
import { fontSize, fontWeight, iconSize } from '../utils/typography';
import {
  gameAccentColor,
  gameAccentWash,
  gameArenaBorderColor,
  gameBgColor,
  gameCardColor,
  gameMutedTextColor,
  gameTextColor,
} from '../constant/Color';
import { widthPercentageToDP as wp } from '../utils';

const StatCard = ({ label, value }) => (
  <View style={[styles.stat, BaseStyle.flex, BaseStyle.alignItemsCenter]}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const HomeScreen = ({ navigate }) => {
  const { progress } = useProgress();

  return (
    <SafeAreaView style={[BaseStyle.flex, styles.container]}>
      <StatusBar barStyle="light-content" backgroundColor={gameBgColor} />
      <View style={BaseStyle.flex}>
        <FadeView delay={80} style={[BaseStyle.flexDirectionRow, styles.stats]}>
          <StatCard label={STRINGS.HOME.BEST_SCORE} value={totalBest(progress.best)} />
          <View style={{ width: spacings.large }} />
          <StatCard
            label={STRINGS.HOME.LEVELS}
            value={`${completedLevels(LEVELS, progress.done)}/${LEVELS.length}`}
          />
        </FadeView>

        <FadeView delay={180} style={BaseStyle.alignItemsCenter}>
          <View style={[styles.logoRing, BaseStyle.alignJustifyCenter]}>
            <Text style={styles.logo}>🚛</Text>
          </View>
          <Text style={styles.kicker}>{STRINGS.APP_NAME.toUpperCase()}</Text>
          <Text style={styles.greeting}>{STRINGS.HOME.GREETING}</Text>
          <Text style={styles.subtitle}>{STRINGS.HOME.SUBTITLE}</Text>
        </FadeView>

        <FadeView delay={300} style={[styles.rules, BaseStyle.borderRadius10]}>
          <Text style={styles.rulesTitle}>{STRINGS.HOME.HOW_TO_PLAY}</Text>
          {STRINGS.HOME.RULES.map((rule, i) => (
            <View key={rule} style={[BaseStyle.flexDirectionRow, styles.ruleRow]}>
              <View style={[styles.ruleBadge, BaseStyle.alignJustifyCenter]}>
                <Text style={styles.ruleNumber}>{i + 1}</Text>
              </View>
              <Text style={[styles.ruleText, BaseStyle.flex]}>{rule}</Text>
            </View>
          ))}
        </FadeView>
      </View>

      <FadeView delay={450}>
        <AppButton title={STRINGS.HOME.PLAY} pulse onPress={() => navigate(SCREENS.LEVELS)} />
        <PrivacyLink />
      </FadeView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: gameBgColor,
    padding: spacings.xxxxLarge,
    overflow: 'hidden',
  },
  logoRing: {
    width: wp(28),
    height: wp(28),
    borderRadius: wp(14),
    marginTop: spacings.xxLarge,
    backgroundColor: gameCardColor,
    borderWidth: 2,
    borderColor: gameAccentColor,
  },
  logo: {
    fontSize: iconSize.medium,
  },
  kicker: {
    color: gameAccentColor,
    fontSize: fontSize('fontSizeSmall1x'),
    fontWeight: fontWeight('fontWeightBold'),
    letterSpacing: 3,
    marginTop: spacings.xxLarge,
  },
  greeting: {
    color: gameTextColor,
    fontSize: fontSize('fontSizeLarge2x'),
    fontWeight: fontWeight('fontWeightBold'),
    marginTop: spacings.small,
    textAlign: 'center',
  },
  subtitle: {
    color: gameMutedTextColor,
    fontSize: fontSize('fontSizeNormal2x'),
    marginTop: spacings.normal,
    textAlign: 'center',
  },
  stats: {
    marginTop: spacings.large,
  },
  stat: {
    backgroundColor: gameCardColor,
    borderRadius: spacings.Large2x,
    paddingVertical: spacings.xxLarge,
  },
  statValue: {
    color: gameAccentColor,
    fontSize: fontSize('fontSizeLarge2x'),
    fontWeight: fontWeight('fontWeightBold'),
  },
  statLabel: {
    color: gameMutedTextColor,
    fontSize: fontSize('fontSizeSmall1x'),
    fontWeight: fontWeight('fontWeightBold'),
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: spacings.small,
  },
  rules: {
    marginTop: spacings.xxxxLarge,
    backgroundColor: gameCardColor,
    padding: spacings.xxLarge,
    borderRadius: spacings.xxxxLarge,
    borderWidth: 1,
    borderColor: gameArenaBorderColor,
  },
  rulesTitle: {
    color: gameTextColor,
    fontSize: fontSize('fontSizeNormal2x'),
    fontWeight: fontWeight('fontWeightMedium1x'),
    marginBottom: spacings.large,
  },
  ruleRow: {
    marginBottom: spacings.large,
    alignItems: 'center',
  },
  ruleBadge: {
    width: wp(7),
    height: wp(7),
    borderRadius: wp(3.5),
    marginRight: spacings.large,
    backgroundColor: gameAccentWash,
    borderWidth: 1,
    borderColor: gameAccentColor,
  },
  ruleNumber: {
    color: gameAccentColor,
    fontSize: fontSize('fontSizeSmall1x'),
    fontWeight: fontWeight('fontWeightBold'),
  },
  ruleText: {
    color: gameMutedTextColor,
    fontSize: fontSize('fontSizeNormal'),
  },
});

export default HomeScreen;
