import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import type { NoteSortOrder } from '../types/sort';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  radii,
  shadows,
  spacing,
} from '../../../theme';

type Props = {
  visible: boolean;
  sortOrder: NoteSortOrder;
  onClose: () => void;
  onSelect: (order: NoteSortOrder) => void;
};

const OPEN_SPRING = { damping: 24, stiffness: 320, mass: 0.72 };
const CLOSE_DURATION = 180;

const OPTIONS: { id: NoteSortOrder; label: string; description: string }[] = [
  {
    id: 'newest',
    label: 'Newest first',
    description: 'Recently updated notes on top',
  },
  {
    id: 'oldest',
    label: 'Oldest first',
    description: 'Earliest notes on top',
  },
];

const CheckIcon = () => (
  <Svg width={ms(12)} height={ms(12)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6 9 17l-5-5"
      stroke={colors.white}
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const NotesFilterMenu = ({ visible, sortOrder, onClose, onSelect }: Props) => {
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);
  const [rendered, setRendered] = useState(visible);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      progress.value = withSpring(1, OPEN_SPRING);
      return undefined;
    }

    progress.value = withTiming(0, {
      duration: CLOSE_DURATION,
      easing: Easing.in(Easing.cubic),
    });

    const timer = setTimeout(() => setRendered(false), CLOSE_DURATION);
    return () => clearTimeout(timer);
  }, [progress, visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const menuStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [-10, 0]) },
      { scale: interpolate(progress.value, [0, 1], [0.94, 1]) },
    ],
  }));

  if (!rendered) {
    return null;
  }

  return (
    <Modal
      visible={rendered}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay} pointerEvents="box-none">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </Pressable>

        <Animated.View
          style={[
            styles.menu,
            menuStyle,
            {
              top:
                insets.top +
                layout.screenTop +
                layout.iconButton +
                spacing.md +
                spacing.sm,
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.menuTitle}>Sort notes</Text>
            <Text style={styles.menuSubtitle}>Choose the order of your list</Text>
          </View>

          {OPTIONS.map((option, index) => {
            const isActive = sortOrder === option.id;

            return (
              <TouchableOpacity
                key={option.id}
                activeOpacity={0.82}
                style={[
                  styles.option,
                  isActive && styles.optionActive,
                  index === OPTIONS.length - 1 && styles.optionLast,
                ]}
                onPress={() => {
                  onSelect(option.id);
                  onClose();
                }}
              >
                <View
                  style={[styles.radio, isActive && styles.radioActive]}
                >
                  {isActive ? <CheckIcon /> : null}
                </View>

                <View style={styles.optionTextWrap}>
                  <Text
                    style={[
                      styles.optionLabel,
                      isActive && styles.optionLabelActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </View>
    </Modal>
  );
};

export default NotesFilterMenu;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.backdrop,
  },

  menu: {
    position: 'absolute',
    right: layout.screenPadding,
    width: ms(256),
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    transformOrigin: 'top right',
    ...shadows.elevated,
  },

  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    marginBottom: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },

  menuTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extrabold,
    color: colors.black,
    letterSpacing: -0.2,
  },

  menuSubtitle: {
    marginTop: spacing.xxs,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.subText,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },

  optionActive: {
    backgroundColor: colors.primarySoft,
  },

  optionLast: {
    marginBottom: 0,
  },

  radio: {
    width: ms(22),
    height: ms(22),
    borderRadius: ms(11),
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },

  radioActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  optionTextWrap: {
    flex: 1,
  },

  optionLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.black,
  },

  optionLabelActive: {
    color: colors.primaryDark,
    fontWeight: fontWeight.bold,
  },

  optionDescription: {
    marginTop: spacing.xxs,
    fontSize: fontSize.xs,
    lineHeight: ms(15),
    fontWeight: fontWeight.medium,
    color: colors.subText,
  },
});
