import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { COLORS } from '../styles';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../theme';

const DOT_SIZE = ms(7);
const BOUNCE_HEIGHT = -ms(5);

const Dot = ({ delay }: { delay: number }) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(BOUNCE_HEIGHT, {
            duration: 320,
            easing: Easing.out(Easing.quad),
          }),
          withTiming(0, {
            duration: 320,
            easing: Easing.in(Easing.quad),
          }),
          withTiming(0, { duration: 280 }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
};

const TypingIndicator = () => {
  return (
    <View style={styles.row}>
      <View style={styles.bubble}>
        <View style={styles.dotsRow}>
          <Dot delay={0} />
          <Dot delay={140} />
          <Dot delay={280} />
        </View>
        <Text style={styles.label}>Buddy is typing</Text>
      </View>
    </View>
  );
};

export default TypingIndicator;

const styles = StyleSheet.create({
  row: {
    marginTop: spacing.md,
    alignItems: 'flex-start',
  },

  bubble: {
    maxWidth: '72%',
    backgroundColor: COLORS.aiBubble,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radii.xl,
    borderBottomLeftRadius: radii.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primaryLight,
  },

  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    height: ms(18),
  },

  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: COLORS.primarySoft,
  },

  label: {
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: COLORS.muted,
    letterSpacing: 0.1,
  },
});
