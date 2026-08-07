import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { COLORS } from '../styles/colors';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../theme';

const WeeklyGoalCard = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Weekly Goal</Text>
          <View style={styles.streakPill}>
            <Text style={styles.streakText}>15 day streak</Text>
          </View>
        </View>

        <Text style={styles.subTitle}>
          You are close to completing this week's target.
        </Text>

        <View style={styles.progressBar}>
          <View style={styles.progress} />
        </View>

        <Text style={styles.progressLabel}>88% completed</Text>
      </View>

      <View style={styles.circle}>
        <Text style={styles.percent}>88%</Text>
      </View>
    </View>
  );
};

export default WeeklyGoalCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: radii.xl,
    padding: spacing['2xl'],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.primaryLight,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: ms(6) },
    shadowOpacity: 0.05,
    shadowRadius: ms(14),
    elevation: 2,
  },

  content: {
    flex: 1,
    paddingRight: spacing.xl,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },

  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: COLORS.text,
  },

  streakPill: {
    backgroundColor: COLORS.lightPurple,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },

  streakText: {
    fontSize: ms(10),
    fontWeight: fontWeight.bold,
    color: COLORS.primary,
  },

  subTitle: {
    fontSize: fontSize.sm,
    color: COLORS.subText,
    lineHeight: ms(18),
    marginBottom: spacing.xl,
  },

  progressBar: {
    width: '100%',
    height: ms(7),
    backgroundColor: colors.primaryLight,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },

  progress: {
    width: '88%',
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: radii.pill,
  },

  progressLabel: {
    marginTop: spacing.md,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: COLORS.muted,
  },

  circle: {
    width: ms(62),
    height: ms(62),
    borderRadius: ms(31),
    borderWidth: 4,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightPurple,
  },

  percent: {
    fontWeight: fontWeight.extrabold,
    fontSize: fontSize.base,
    color: COLORS.primary,
  },
});
