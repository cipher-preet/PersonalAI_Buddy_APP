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

import { COLORS } from './styles/color';
import type { TaskFilter } from '../types/filter';
import {
  fontSize,
  fontWeight,
  layout,
  ms,
  mvs,
  spacing,
} from '../../../theme';

type Props = {
  visible: boolean;
  taskFilter: TaskFilter;
  onClose: () => void;
  onSelect: (filter: TaskFilter) => void;
};

const CheckIcon = () => (
  <Svg width={ms(16)} height={ms(16)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6 9 17l-5-5"
      stroke={COLORS.primaryDark}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const OPTIONS: { id: TaskFilter; label: string; description: string }[] = [
  {
    id: 'newest',
    label: 'Newest first',
    description: 'Recently updated tasks appear on top',
  },
  {
    id: 'oldest',
    label: 'Oldest first',
    description: 'Earliest tasks appear on top',
  },
  {
    id: 'done',
    label: 'Done',
    description: 'Show only completed tasks',
  },
  {
    id: 'pending',
    label: 'Pending',
    description: 'Show only incomplete tasks',
  },
];

const TasksFilterMenu = ({ visible, taskFilter, onClose, onSelect }: Props) => {
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
            <Text style={styles.menuTitle}>Filter tasks</Text>

            {OPTIONS.map(option => {
              const isActive = taskFilter === option.id;

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

export default TasksFilterMenu;

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
    backgroundColor: COLORS.white,
    paddingHorizontal: spacing.xl,
    paddingTop: ms(14),
    paddingBottom: spacing.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },

  menuTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.extrabold,
    color: COLORS.gray,
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
    backgroundColor: COLORS.purpleLight,
  },

  optionTextWrap: {
    flex: 1,
    paddingRight: spacing.md,
  },

  optionLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: COLORS.black,
  },

  optionLabelActive: {
    color: COLORS.primaryDark,
  },

  optionDescription: {
    marginTop: spacing.xxs,
    fontSize: fontSize.xs,
    lineHeight: ms(15),
    fontWeight: fontWeight.medium,
    color: COLORS.gray,
  },

  checkWrap: {
    width: ms(24),
    height: ms(24),
    borderRadius: ms(12),
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderFocus,
  },
});
