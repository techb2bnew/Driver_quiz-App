import React, { useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, Text, View } from 'react-native';
import AppButton from '../AppButton';
import { BaseStyle } from '../../constant/Style';
import { STRINGS } from '../../constant/Constants';
import { spacings } from '../../constant/Fonts';
import { fontSize, fontWeight, iconSize } from '../../utils/typography';
import {
  gameAccentColor,
  gameCardColor,
  gameMutedTextColor,
  gameScrimColor,
  gameSlotBgColor,
  gameTextColor,
} from '../../constant/Color';
import { widthPercentageToDP as wp } from '../../utils';

// A small picture of the path: each circle in order, joined by dots — then why.
const Pill = ({ label }) => (
  <View style={[styles.pill, BaseStyle.alignJustifyCenter]}>
    <Text style={styles.pillText}>{label}</Text>
  </View>
);

const HintModal = ({ visible, steps, note, cost, onClose }) => {
  const backdrop = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      return;
    }
    backdrop.setValue(0);
    pop.setValue(0);
    Animated.parallel([
      Animated.timing(backdrop, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(pop, { toValue: 1, friction: 7, tension: 90, useNativeDriver: true }),
    ]).start();
  }, [visible, backdrop, pop]);

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <Animated.View
        style={[BaseStyle.flex, BaseStyle.alignJustifyCenter, styles.backdrop, { opacity: backdrop }]}>
        <Animated.View
          style={[styles.card, BaseStyle.alignItemsCenter, { transform: [{ scale: pop }] }]}>
          <Text style={styles.icon}>💡</Text>
          <Text style={styles.title}>{STRINGS.MODAL.HINT_TITLE}</Text>
          <Text style={styles.body}>{STRINGS.MODAL.HINT_BODY}</Text>

          <View style={[BaseStyle.alignItemsCenter, styles.diagram]}>
            {steps.map((label, i) => (
              <React.Fragment key={`${label}-${i}`}>
                {i > 0 && (
                  <View style={styles.dots}>
                    {[0, 1].map((n) => (
                      <View key={n} style={styles.dot} />
                    ))}
                  </View>
                )}
                <Pill label={label} />
              </React.Fragment>
            ))}
          </View>

          {!!note && <Text style={styles.note}>{note}</Text>}
          <Text style={styles.cost}>{STRINGS.MODAL.HINT_COST(cost)}</Text>

          <View style={BaseStyle.width100Percent}>
            <AppButton title={STRINGS.MODAL.HINT_OK} onPress={onClose} />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: gameScrimColor,
    paddingHorizontal: spacings.ExtraLarge,
  },
  card: {
    width: wp(86),
    backgroundColor: gameCardColor,
    borderRadius: spacings.Large2x,
    borderWidth: 2,
    borderColor: gameAccentColor,
    padding: spacings.ExtraLarge,
  },
  icon: {
    fontSize: iconSize.medium,
  },
  title: {
    color: gameAccentColor,
    fontSize: fontSize('fontSizeLargeX'),
    fontWeight: fontWeight('fontWeightBold'),
    marginTop: spacings.small,
  },
  body: {
    color: gameMutedTextColor,
    fontSize: fontSize('fontSizeNormal'),
    textAlign: 'center',
    marginTop: spacings.small,
  },
  diagram: {
    marginVertical: spacings.xxLarge,
  },
  pill: {
    minWidth: wp(46),
    paddingVertical: spacings.large,
    paddingHorizontal: spacings.xxxxLarge,
    borderRadius: spacings.xxxxLarge,
    borderWidth: 2,
    borderColor: gameAccentColor,
    backgroundColor: gameSlotBgColor,
  },
  pillText: {
    color: gameTextColor,
    fontSize: fontSize('fontSizeNormal2x'),
    fontWeight: fontWeight('fontWeightMedium1x'),
    textAlign: 'center',
  },
  dots: {
    paddingVertical: spacings.small,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: gameAccentColor,
    marginVertical: 3,
  },
  note: {
    color: gameTextColor,
    fontSize: fontSize('fontSizeNormal'),
    textAlign: 'center',
    marginBottom: spacings.large,
  },
  cost: {
    color: gameMutedTextColor,
    fontSize: fontSize('fontSizeSmall1x'),
    marginBottom: spacings.xxxxLarge,
  },
});

export default HintModal;
