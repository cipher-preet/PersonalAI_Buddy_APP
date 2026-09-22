import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { CHAT } from '../styles';
import { ms, radii, spacing } from '../../../theme';

const DOT_SIZE = ms(6);
const BOUNCE_HEIGHT = -ms(3);

const Dot = ({ delay }: { delay: number }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(BOUNCE_HEIGHT, {
            duration: 280,
            easing: Easing.out(Easing.quad),
          }),
          withTiming(0, {
            duration: 280,
            easing: Easing.in(Easing.quad),
          }),
          withTiming(0, { duration: 280 }),
        ),
        -1,
        false,
      ),
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 280 }),
          withTiming(0.35, { duration: 280 }),
          withTiming(0.35, { duration: 280 }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
};

const TypingIndicator = () => {
  return (
    <View style={styles.row}>
      <View style={styles.bubble}>
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </View>
    </View>
  );
};

export default TypingIndicator;

const styles = StyleSheet.create({
  row: {
    alignItems: 'flex-start',
  },

  bubble: {
    minHeight: ms(36),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: CHAT.surfaceMuted,
  },

  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: CHAT.typingDot,
  },
});
