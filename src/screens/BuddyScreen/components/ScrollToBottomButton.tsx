import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { COLORS } from '../styles';
import { colors, ms, radii } from '../../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  visible: boolean;
  bottom: number;
  onPress: () => void;
};

const DownArrowIcon = ({ color = COLORS.primary }: { color?: string }) => (
  <Svg width={ms(18)} height={ms(18)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5v14m0 0-6-6m6 6 6-6"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ScrollToBottomButton = ({ visible, bottom, onPress }: Props) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = visible
      ? withSpring(1, {
          damping: 18,
          stiffness: 220,
          mass: 0.8,
        })
      : withTiming(0, {
          duration: 180,
          easing: Easing.out(Easing.cubic),
        });
  }, [visible, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * 14 },
      { scale: 0.88 + progress.value * 0.12 },
    ],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={!visible}
      style={[styles.button, { bottom }, animatedStyle]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityRole="button"
      accessibilityLabel="Scroll to latest messages"
    >
      <DownArrowIcon />
    </AnimatedPressable>
  );
};

export default ScrollToBottomButton;

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    alignSelf: 'center',
    width: ms(42),
    height: ms(42),
    borderRadius: ms(14),
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderFocus,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: ms(8) },
    shadowOpacity: 0.14,
    shadowRadius: ms(16),
    elevation: 6,
  },
});
