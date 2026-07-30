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

type Props = {
  visible: boolean;
  taskFilter: TaskFilter;
  onClose: () => void;
  onSelect: (filter: TaskFilter) => void;
};

const CheckIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
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
    paddingTop: 118,
    paddingRight: 20,
  },

  menu: {
    width: 248,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },

  menuTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.gray,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 4,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 11,
    marginBottom: 4,
  },

  optionActive: {
    backgroundColor: COLORS.purpleLight,
  },

  optionTextWrap: {
    flex: 1,
    paddingRight: 8,
  },

  optionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },

  optionLabelActive: {
    color: COLORS.primaryDark,
  },

  optionDescription: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    color: COLORS.gray,
  },

  checkWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
});
