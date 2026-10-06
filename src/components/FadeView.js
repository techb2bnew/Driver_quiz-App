import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

// Fades children in while sliding them up a little. Remount (change `key`) to replay.
const FadeView = ({ children, style, duration = 450, delay = 0, offset = 24 }) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, [progress, duration, delay]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [offset, 0],
  });

  return (
    <Animated.View style={[{ opacity: progress, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
};

export default FadeView;
