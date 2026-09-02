import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';

import { MicIcon } from '../../../../styles/icons';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  spacing,
} from '../../../theme';

type Props = {
  bottomInset: number;
  onPress: () => void;
  onAddPress: () => void;
};

const ACTION_SIZE = ms(68);
const ACTION_RADIUS = ACTION_SIZE / 2;
const ICON_SIZE = ms(26);

const PlusIcon = () => (
  <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5v14M5 12h14"
      stroke={colors.white}
      strokeWidth={2.4}
      strokeLinecap="round"
    />
  </Svg>
);

const ReminderMicButton = ({ bottomInset, onPress, onAddPress }: Props) => {
  return (
    <View style={[styles.wrapper, { paddingBottom: bottomInset + spacing['2xl'] }]}>
      <Text style={styles.hint}>Tap + to add, or speak a reminder</Text>

      <View style={styles.actions}>
        <Pressable
          onPress={onAddPress}
          accessibilityRole="button"
          accessibilityLabel="Add reminder"
          style={({ pressed }) => [
            styles.addPressable,
            pressed && styles.pressableActive,
          ]}
        >
          <LinearGradient
            colors={[
              colors.primary,
              colors.primaryMid,
              colors.accentCyan,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addButton}
          >
            <PlusIcon />
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel="Start voice reminder"
          style={({ pressed }) => [
            styles.micPressable,
            pressed && styles.pressableActive,
          ]}
        >
          <LinearGradient
            colors={[
              colors.accentIndigo,
              colors.primaryPurple,
              colors.primaryMid,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.micButton}
          >
            <MicIcon width={ICON_SIZE} height={ICON_SIZE} color={colors.white} />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
};

export default ReminderMicButton;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    paddingTop: spacing.md,
  },

  hint: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xl,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2xl'],
  },

  pressableActive: {
    transform: [{ scale: 0.96 }],
  },

  addPressable: {
    borderRadius: ACTION_RADIUS,
  },

  addButton: {
    width: ACTION_SIZE,
    height: ACTION_SIZE,
    borderRadius: ACTION_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primaryMid,
    shadowOffset: { width: 0, height: ms(4) },
    shadowOpacity: 0.28,
    shadowRadius: ms(8),
    elevation: 4,
  },

  micPressable: {
    borderRadius: ACTION_RADIUS,
  },

  micButton: {
    width: ACTION_SIZE,
    height: ACTION_SIZE,
    borderRadius: ACTION_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primaryMid,
    shadowOffset: { width: 0, height: ms(4) },
    shadowOpacity: 0.22,
    shadowRadius: ms(8),
    elevation: 4,
  },
});
