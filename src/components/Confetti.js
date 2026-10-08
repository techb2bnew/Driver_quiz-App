import React, { useEffect, useMemo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import {
  circleBlueColor,
  circleOutlineColor,
  circleRedColor,
  circleYellowColor,
  gameAccentColor,
  gameWinColor,
} from '../constant/Color';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../utils';

const COLORS = [
  circleRedColor,
  circleBlueColor,
  circleYellowColor,
  gameAccentColor,
  gameWinColor,
  circleOutlineColor,
];
const PIECES = 70;

const rand = (min, max) => min + Math.random() * (max - min);

// Pieces of paper that fall from the top of the screen, spinning and swaying, then
// are gone. Plays once when it appears and never blocks a touch.
const Confetti = ({ count = PIECES }) => {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, () => {
        const width = rand(7, 12);
        return {
          progress: new Animated.Value(0),
          left: rand(0, wp(100)),
          width,
          height: rand(10, 18),
          radius: Math.random() < 0.25 ? width / 2 : 2, // some round dots, mostly little strips
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          delay: rand(0, 1600),
          duration: rand(3200, 5400),
          sway: rand(14, 42) * (Math.random() < 0.5 ? -1 : 1),
          turns: rand(1, 3) * (Math.random() < 0.5 ? -1 : 1),
        };
      }),
    [count],
  );
  // Starts the fall; the cleanup stops it. If React runs this effect twice (it does in
  // development), the second run must start everything again from the top.
  useEffect(() => {
    pieces.forEach(piece => piece.progress.setValue(0));
    const animation = Animated.parallel(
      pieces.map(piece =>
        Animated.timing(piece.progress, {
          toValue: 1,
          duration: piece.duration,
          delay: piece.delay,
          useNativeDriver: true,
        }),
      ),
    );
    animation.start();
    return () => animation.stop();
  }, [pieces]);

  const fall = hp(100) + 60;

  return (
    <View pointerEvents="none" style={styles.layer}>
      {pieces.map((piece, i) => {
        const { progress } = piece;
        return (
          <Animated.View
            key={i}
            style={[
              styles.piece,
              {
                left: piece.left,
                width: piece.width,
                height: piece.height,
                borderRadius: piece.radius,
                backgroundColor: piece.color,
                opacity: progress.interpolate({
                  inputRange: [0, 0.02, 0.85, 1],
                  outputRange: [0, 1, 1, 0],
                }),
                transform: [
                  {
                    translateY: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-40, fall],
                    }),
                  },
                  {
                    translateX: progress.interpolate({
                      inputRange: [0, 0.25, 0.5, 0.75, 1],
                      outputRange: [0, piece.sway, 0, -piece.sway, 0],
                    }),
                  },
                  {
                    rotate: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', `${piece.turns * 360}deg`],
                    }),
                  },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  // An explicit full-screen size, not absoluteFill + overflow hidden: that combination
  // collapsed to nothing inside the Result screen and the pieces were never drawn.
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: wp(100),
    height: hp(100),
  },
  piece: {
    position: 'absolute',
    top: 0,
  },
});

export default Confetti;
