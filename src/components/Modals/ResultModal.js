import React, { useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, Text, View } from 'react-native';
import AppButton from '../AppButton';
import { BaseStyle } from '../../constant/Style';
import { STRINGS } from '../../constant/Constants';
import { spacings } from '../../constant/Fonts';
import { fontSize, fontWeight, iconSize } from '../../utils/typography';
import {
  gameCardColor,
  gameTextColor,
  gameMutedTextColor,
  gameScrimColor,
  gameWinColor,
  gameLoseColor,
  authBorderColor,
} from '../../constant/Color';
import { playSound, SOUNDS } from '../../utils/sound';
import { widthPercentageToDP as wp } from '../../utils';

const SOUND_FOR = {
  correct: SOUNDS.CORRECT,
  wrong: SOUNDS.WRONG,
  overlap: SOUNDS.OVERLAP,
};

// type: 'correct' | 'wrong' | 'overlap'. For 'correct', `isLast` swaps Next for See Result.
const ResultModal = ({ visible, type, points, isLast, onPress }) => {
  const backdrop = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(0)).current;
  const icon = useRef(new Animated.Value(0)).current;
  const isCorrect = type === 'correct';

  useEffect(() => {
    if (!visible) {
      return;
    }
    playSound(SOUND_FOR[type]);
    backdrop.setValue(0);
    pop.setValue(0);
    icon.setValue(0);
    Animated.parallel([
      Animated.timing(backdrop, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(pop, { toValue: 1, friction: 6, tension: 90, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(150),
        // Correct bounces up, wrong shakes sideways.
        isCorrect
          ? Animated.spring(icon, { toValue: 1, friction: 3, useNativeDriver: true })
          : Animated.timing(icon, { toValue: 1, duration: 450, useNativeDriver: true }),
      ]),
    ]).start();
  }, [visible, type, isCorrect, backdrop, pop, icon]);

  const iconStyle = isCorrect
    ? { transform: [{ scale: icon.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }] }
    : {
        transform: [
          {
            translateX: icon.interpolate({
              inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
              outputRange: [0, -12, 12, -8, 8, 0],
            }),
          },
        ],
      };

  const accent = isCorrect ? gameWinColor : gameLoseColor;
  const content = {
    correct: {
      icon: '✅',
      title: STRINGS.MODAL.CORRECT_TITLE,
      message: STRINGS.MODAL.CORRECT_MESSAGE(points),
      button: isLast ? STRINGS.MODAL.FINISH : STRINGS.MODAL.NEXT,
    },
    wrong: {
      icon: '🔁',
      title: STRINGS.MODAL.WRONG_TITLE,
      message: STRINGS.MODAL.WRONG_MESSAGE,
      button: STRINGS.MODAL.RETRY,
    },
    overlap: {
      icon: '⚠️',
      title: STRINGS.MODAL.OVERLAP_TITLE,
      message: STRINGS.MODAL.OVERLAP_MESSAGE,
      button: STRINGS.MODAL.RESET_FLOW,
    },
  }[type] || {};

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View
        style={[BaseStyle.flex, BaseStyle.alignJustifyCenter, styles.backdrop, { opacity: backdrop }]}>
        <Animated.View
          style={[
            styles.card,
            BaseStyle.alignItemsCenter,
            BaseStyle.borderWidth2,
            { borderColor: accent, transform: [{ scale: pop }] },
          ]}>
          <Animated.View style={[styles.iconCircle, BaseStyle.alignJustifyCenter, iconStyle]}>
            <Text style={styles.icon}>{content.icon}</Text>
          </Animated.View>
          <Text style={[styles.title, { color: accent }]}>{content.title}</Text>
          <Text style={styles.message}>{content.message}</Text>
          <View style={BaseStyle.width100Percent}>
            <AppButton
              title={content.button}
              variant={isCorrect ? 'success' : 'danger'}
              onPress={onPress}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: gameScrimColor,
    paddingHorizontal: spacings.xxxxLarge,
  },
  card: {
    width: wp(85),
    backgroundColor: gameCardColor,
    borderRadius: spacings.Large2x,
    padding: spacings.xxxxLarge,
    borderColor: authBorderColor,
  },
  iconCircle: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(9),
    marginBottom: spacings.xxLarge,
  },
  icon: {
    fontSize: iconSize.medium,
  },
  title: {
    fontSize: fontSize('fontSizeLargeX'),
    fontWeight: fontWeight('fontWeightBold'),
    marginBottom: spacings.small,
  },
  message: {
    color: gameMutedTextColor,
    fontSize: fontSize('fontSizeNormal2x'),
    textAlign: 'center',
    marginBottom: spacings.xxxxLarge,
  },
});

export default ResultModal;
