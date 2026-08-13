import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  mvs,
  radii,
  spacing,
} from '../theme';

export type ToastType = 'success' | 'error' | 'info';

export interface CustomToastProps {
  visible: boolean;
  message: string;
  description?: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
}

const TAB_BAR_BOTTOM = Platform.OS === 'ios' ? mvs(24) : mvs(16);
const TAB_BAR_HEIGHT = ms(80);
const TOAST_GAP = mvs(14);
const TOAST_BOTTOM = TAB_BAR_BOTTOM + TAB_BAR_HEIGHT + TOAST_GAP;

const ICON_BG: Record<ToastType, string> = {
  success: colors.successBright,
  error: colors.error,
  info: colors.infoBright,
};

const TYPE_LABEL: Record<ToastType, string> = {
  success: 'Completed successfully',
  error: 'Something went wrong',
  info: 'Please take a look',
};

const CheckIcon = () => (
  <Svg width={ms(16)} height={ms(16)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12.5l5 5L19 7"
      stroke={colors.white}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ErrorIcon = () => (
  <Svg width={ms(16)} height={ms(16)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 7.5v5.5M12 16.5h.01"
      stroke={colors.white}
      strokeWidth={2.4}
      strokeLinecap="round"
    />
  </Svg>
);

const InfoIcon = () => (
  <Svg width={ms(16)} height={ms(16)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 11v5.5M12 7.5h.01"
      stroke={colors.white}
      strokeWidth={2.4}
      strokeLinecap="round"
    />
  </Svg>
);

const CustomToast = ({
  visible,
  message,
  description,
  type = 'info',
  duration = 3000,
  onHide,
}: CustomToastProps) => {
  const animation = useRef(new Animated.Value(0)).current;
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const subtitle = useMemo(() => {
    if (description?.trim()) {
      return description.trim();
    }
    return TYPE_LABEL[type];
  }, [description, type]);

  useEffect(() => {
    if (visible) {
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
        speed: 18,
        bounciness: 6,
      }).start();

      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }

      hideTimeout.current = setTimeout(() => {
        Animated.timing(animation, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) {
            onHide?.();
          }
        });
      }, duration);
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
    };
  }, [animation, duration, onHide, visible]);

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [28, 0],
  });

  const opacity = animation;

  if (!visible && !message) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toastContainer,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: ICON_BG[type] }]}>
        {type === 'success' ? (
          <CheckIcon />
        ) : type === 'error' ? (
          <ErrorIcon />
        ) : (
          <InfoIcon />
        )}
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={2}>
          {message}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </Animated.View>
  );
};

export default CustomToast;

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: TOAST_BOTTOM,
    left: spacing['2xl'],
    right: spacing['2xl'],
    minHeight: ms(68),
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radii['3xl'],
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    zIndex: 9999,
    elevation: 16,
    shadowColor: colors.shadowInk,
    shadowOffset: { width: 0, height: ms(10) },
    shadowOpacity: 0.1,
    shadowRadius: ms(20),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(226, 232, 240, 0.9)',
  },

  iconCircle: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(20),
    alignItems: 'center',
    justifyContent: 'center',
  },

  textBlock: {
    flex: 1,
    paddingRight: spacing.xs,
  },

  title: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    lineHeight: ms(20),
    letterSpacing: -0.2,
  },

  subtitle: {
    marginTop: spacing.xxs,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.subText,
    lineHeight: ms(16),
  },
});
