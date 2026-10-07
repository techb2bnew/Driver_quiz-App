import React, { useRef, useState } from 'react';
import { Animated, FlatList, StatusBar, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import { BaseStyle } from '../constant/Style';
import { SCREENS, STORAGE_KEYS, STRINGS } from '../constant/Constants';
import { spacings } from '../constant/Fonts';
import { fontSize, fontWeight, iconSize } from '../utils/typography';
import {
  gameAccentColor,
  gameBgColor,
  gameDotInactiveColor,
  gameMutedTextColor,
  gameCardColor,
  gameTextColor,
} from '../constant/Color';
import { setItem } from '../utils/storage';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../utils';

const SLIDES = STRINGS.ONBOARDING.SLIDES;
const SLIDE_WIDTH = wp(100);

const Dot = ({ index, scrollX }) => {
  const input = [(index - 1) * SLIDE_WIDTH, index * SLIDE_WIDTH, (index + 1) * SLIDE_WIDTH];
  // scaleX, not width: the scroll position drives this natively, and a native
  // animation can't change a layout property like width.
  const scaleX = scrollX.interpolate({
    inputRange: input,
    outputRange: [1, 2.8, 1],
    extrapolate: 'clamp',
  });
  const opacity = scrollX.interpolate({
    inputRange: input,
    outputRange: [0.4, 1, 0.4],
    extrapolate: 'clamp',
  });
  return <Animated.View style={[styles.dot, { opacity, transform: [{ scaleX }] }]} />;
};

const Slide = ({ item, index, scrollX }) => {
  const input = [(index - 1) * SLIDE_WIDTH, index * SLIDE_WIDTH, (index + 1) * SLIDE_WIDTH];
  const scale = scrollX.interpolate({
    inputRange: input,
    outputRange: [0.6, 1, 0.6],
    extrapolate: 'clamp',
  });
  const opacity = scrollX.interpolate({
    inputRange: input,
    outputRange: [0, 1, 0],
    extrapolate: 'clamp',
  });
  return (
    <View style={[styles.slide, BaseStyle.alignJustifyCenter]}>
      <Animated.View
        style={[styles.iconCircle, BaseStyle.alignJustifyCenter, { opacity, transform: [{ scale }] }]}>
        <Text style={styles.icon}>{item.icon}</Text>
      </Animated.View>
      <Animated.View style={[BaseStyle.alignItemsCenter, { opacity }]}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </Animated.View>
    </View>
  );
};

const OnboardingScreen = ({ navigate }) => {
  const listRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [page, setPage] = useState(0);
  const isLast = page === SLIDES.length - 1;

  const finish = async () => {
    await setItem(STORAGE_KEYS.ONBOARDING_DONE, true);
    navigate(SCREENS.HOME);
  };

  const onNext = () => {
    if (isLast) {
      finish();
    } else {
      listRef.current?.scrollToOffset({ offset: (page + 1) * SLIDE_WIDTH, animated: true });
    }
  };

  return (
    <SafeAreaView style={[BaseStyle.flex, styles.container]}>
      <StatusBar barStyle="light-content" backgroundColor={gameBgColor} />
      <View style={[BaseStyle.alignItemsFlexEnd, styles.skipRow]}>
        {!isLast && (
          <Pressable onPress={finish} hitSlop={spacings.xxLarge}>
            <Text style={styles.skip}>{STRINGS.ONBOARDING.SKIP}</Text>
          </Pressable>
        )}
      </View>

      <Animated.FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: true,
        })}
        onMomentumScrollEnd={(e) =>
          setPage(Math.round(e.nativeEvent.contentOffset.x / SLIDE_WIDTH))
        }
        renderItem={({ item, index }) => <Slide item={item} index={index} scrollX={scrollX} />}
      />

      <View style={[styles.footer, BaseStyle.alignItemsCenter]}>
        <View style={[BaseStyle.flexDirectionRow, styles.dots]}>
          {SLIDES.map((slide, index) => (
            <Dot key={slide.id} index={index} scrollX={scrollX} />
          ))}
        </View>
        <AppButton
          title={isLast ? STRINGS.ONBOARDING.GET_STARTED : STRINGS.ONBOARDING.NEXT}
          onPress={onNext}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: gameBgColor,
  },
  skipRow: {
    height: hp(6),
    paddingHorizontal: spacings.xxxxLarge,
    justifyContent: 'center',
  },
  skip: {
    color: gameMutedTextColor,
    fontSize: fontSize('fontSizeNormal'),
    fontWeight: fontWeight('fontWeightMedium'),
  },
  slide: {
    width: SLIDE_WIDTH,
    paddingHorizontal: spacings.ExtraLarge,
  },
  iconCircle: {
    width: wp(44),
    height: wp(44),
    borderRadius: wp(22),
    backgroundColor: gameCardColor,
    borderWidth: 3,
    borderColor: gameAccentColor,
    marginBottom: spacings.ExtraLarge,
  },
  icon: {
    fontSize: iconSize.large,
  },
  title: {
    color: gameTextColor,
    fontSize: fontSize('fontSizeLargeX'),
    fontWeight: fontWeight('fontWeightBold'),
    textAlign: 'center',
    marginBottom: spacings.large,
  },
  description: {
    color: gameMutedTextColor,
    fontSize: fontSize('fontSizeNormal2x'),
    textAlign: 'center',
    lineHeight: fontSize('fontSizeNormal2x') * 1.5,
  },
  footer: {
    paddingHorizontal: spacings.xxxxLarge,
    paddingBottom: spacings.xxxxLarge,
  },
  dots: {
    marginBottom: spacings.xxxxLarge,
  },
  dot: {
    height: wp(2.5),
    borderRadius: wp(1.25),
    marginHorizontal: spacings.normal,
    backgroundColor: gameAccentColor,
  },
});

export default OnboardingScreen;
