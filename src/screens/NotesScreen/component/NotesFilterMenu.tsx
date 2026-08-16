import React, { useEffect } from 'react';
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
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import type { NoteSortOrder } from '../types/sort';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  mvs,
  shadows,
  spacing
} from '../../../theme';

type Props = {
  visible: boolean;
  sortOrder: NoteSortOrder;
  onClose: () => void;
  onSelect: (order: NoteSortOrder) => void;
};

const CheckIcon = () => (
  <Svg width={ms(16)} height={ms(16)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6 9 17l-5-5"
      stroke={colors.primaryDark}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const OPTIONS: { id: NoteSortOrder; label: string; description: string }[] = [
  {
    id: 'newest',
    label: 'Newest first',
    description: 'Recently updated notes appear on top',
  },
  {
    id: 'oldest',
    label: 'Oldest first',
    description: 'Earliest notes appear on top',
  },
];

const NotesFilterMenu = ({ visible, sortOrder, onClose, onSelect }: Props) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = visible
      ? withSpring(1, { damping: 20, stiffness: 260, mass: 0.85 })
      : withTiming(0, { duration: 160, easing: Easing.out(Easing.cubic) });
  }, [visible, progress]);

  const menuStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: -8 + progress.value * 8 },
      { scale: 0.96 + progress.value * 0.04 },
    ],
  }));

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View style={[styles.menu, menuStyle]}>
          <Pressable onPress={event => event.stopPropagation()}>
            <Text style={styles.menuTitle}>Sort notes</Text>

            {OPTIONS.map(option => {
              const isActive = sortOrder === option.id;

              return (
                <TouchableOpacity
                  key={option.id}
                  activeOpacity={0.82}
                  style={[styles.option, isActive && styles.optionActive]}
                  onPress={() => {
                    onSelect(option.id);
                    onClose();
                  }}
                >
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

                  {isActive ? (
                    <View style={styles.checkWrap}>
                      <CheckIcon />
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default NotesFilterMenu;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.18)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: mvs(118),
    paddingRight: layout.screenPadding,
  },

  menu: {
    width: ms(248),
    borderRadius: ms(18),
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingTop: ms(14),
    paddingBottom: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadows.card,
  },

  menuTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.extrabold,
    color: colors.gray,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: ms(14),
    paddingHorizontal: spacing.lg,
    paddingVertical: ms(11),
    marginBottom: spacing.xs,
  },

  optionActive: {
    backgroundColor: colors.purpleLight,
  },

  optionTextWrap: {
    flex: 1,
    paddingRight: spacing.md,
  },

  optionLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.black,
  },

  optionLabelActive: {
    color: colors.primaryDark,
  },

  optionDescription: {
    marginTop: spacing.xxs,
    fontSize: fontSize.xs,
    lineHeight: ms(15),
    fontWeight: fontWeight.medium,
    color: colors.gray,
  },

  checkWrap: {
    width: ms(24),
    height: ms(24),
    borderRadius: ms(12),
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderFocus,
  },
});
