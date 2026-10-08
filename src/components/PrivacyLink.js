import React from 'react';
import { Linking, Pressable, StyleSheet, Text } from 'react-native';
import { BaseStyle } from '../constant/Style';
import { PRIVACY_URL, STRINGS } from '../constant/Constants';
import { spacings } from '../constant/Fonts';
import { fontSize, fontWeight } from '../utils/typography';
import { gameAccentColor, gameMutedTextColor } from '../constant/Color';

// "Privacy Policy" as a small link that opens the policy page in the phone's browser.
// `prefix` is optional lead-in text (e.g. "By continuing you agree to our").
// `pointerEvents` lets a screen switch the link off while it is hidden.
const PrivacyLink = ({ prefix, style, pointerEvents }) => {
  const open = () =>
    Linking.openURL(PRIVACY_URL).catch((error) =>
      console.warn('[privacy] could not open the policy page', error),
    );

  return (
    <Pressable
      onPress={open}
      hitSlop={spacings.xxLarge}
      accessibilityRole="link"
      pointerEvents={pointerEvents}
      style={[BaseStyle.alignItemsCenter, styles.wrap, style]}>
      <Text style={styles.text}>
        {prefix ? `${prefix} ` : ''}
        <Text style={styles.link}>{STRINGS.PRIVACY.LINK}</Text>
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: spacings.large,
  },
  text: {
    color: gameMutedTextColor,
    fontSize: fontSize('fontSizeSmall1x'),
    textAlign: 'center',
  },
  link: {
    color: gameAccentColor,
    fontWeight: fontWeight('fontWeightMedium1x'),
    textDecorationLine: 'underline',
  },
});

export default PrivacyLink;
