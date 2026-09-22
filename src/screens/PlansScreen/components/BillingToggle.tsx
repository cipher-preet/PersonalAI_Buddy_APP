import React, { useEffect, useState } from 'react';
import {
  PixelRatio,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  colors,
  fontSize,
  fontWeight,
  isSmallDevice,
  ms,
  radii,
  spacing,
} from '../../../theme';
import type { BillingCycle } from '../planCatalog';
import { BILLING_OPTIONS } from '../planCatalog';

type Props = {
  value: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
};

const TRACK_PADDING = spacing.xs;
const SLIDE_CONFIG = {
  duration: 260,
  easing: Easing.out(Easing.cubic),
};

const roundPx = (value: number) => PixelRatio.roundToNearestPixel(value);

const BillingToggle = ({ value, onChange }: Props) => {
  const [thumbWidth, setThumbWidth] = useState(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withTiming(
      value === 'quarterly' ? thumbWidth : 0,
      SLIDE_CONFIG,
    );
  }, [thumbWidth, translateX, value]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: Math.round(translateX.value) }],
  }));

  return (
    <View
      style={styles.wrap}
      onLayout={event => {
        const nextWidth = roundPx(
          (event.nativeEvent.layout.width - TRACK_PADDING * 2) / 2,
        );

        if (nextWidth > 0 && nextWidth !== thumbWidth) {
          setThumbWidth(nextWidth);
          translateX.value = value === 'quarterly' ? nextWidth : 0;
        }
      }}
      accessibilityRole="tablist"
    >
      {thumbWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          renderToHardwareTextureAndroid={false}
          shouldRasterizeIOS={false}
          style={[styles.thumb, { width: thumbWidth }, thumbStyle]}
        />
      ) : null}

      {BILLING_OPTIONS.map(option => {
        const active = value === option.id;

        return (
          <Pressable
            key={option.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
            android_ripple={{ color: 'transparent' }}
            style={styles.chip}
            onPress={() => {
              if (option.id !== value) {
                onChange(option.id);
              }
            }}
          >
            <Text
              numberOfLines={1}
              style={[styles.label, active && styles.labelActive]}
            >
              {option.label}
            </Text>
            {option.id === 'quarterly' ? (
              <View style={[styles.savePill, active && styles.savePillActive]}>
                <Text
                  numberOfLines={1}
                  style={[styles.saveText, active && styles.saveTextActive]}
                >
                  {isSmallDevice ? 'Save' : 'Save more'}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
};

export default BillingToggle;

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: radii.pill,
    padding: TRACK_PADDING,
    borderWidth: 1,
    borderColor: colors.border,
  },

  thumb: {
    position: 'absolute',
    top: TRACK_PADDING,
    bottom: TRACK_PADDING,
    left: TRACK_PADDING,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },

  chip: {
    flex: 1,
    zIndex: 1,
    minHeight: ms(46),
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },

  label: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  labelActive: {
    color: colors.white,
  },

  savePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: ms(3),
    borderRadius: radii.pill,
    backgroundColor: colors.successSoft,
  },

  savePillActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  saveText: {
    color: colors.successText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    includeFontPadding: false,
  },

  saveTextActive: {
    color: colors.white,
  },
});
