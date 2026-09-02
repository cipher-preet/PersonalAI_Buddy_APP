import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  colors,
  fontSize,
  fontWeight,
  ms,
  mvs,
  radii,
  spacing,
} from '../../../../theme';

type Props = {
  notesCount: number;
  tasksCount: number;
  tasksCompleted: number;
  completionRate: number;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
};

const Metric = ({
  value,
  label,
}: {
  value: number;
  label: string;
}) => (
  <View style={styles.metric}>
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

const SpaceOverviewCard = ({
  notesCount,
  tasksCount,
  tasksCompleted,
  completionRate,
  isLoading = false,
  isError = false,
  onRetry,
}: Props) => {
  const safeCompletionRate = Math.min(Math.max(completionRate, 0), 100);
  const remaining = Math.max(tasksCount - tasksCompleted, 0);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>In this space</Text>
      <Text style={styles.cardHint}>
        A snapshot of what Buddy has saved here.
      </Text>

      {isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.stateText}>Loading activity...</Text>
        </View>
      ) : isError ? (
        <View style={styles.stateBox}>
          <Text style={styles.errorText}>Could not load space activity.</Text>
          {onRetry ? (
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.retryButton}
              onPress={onRetry}
            >
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        <>
          <View style={styles.metricsRow}>
            <Metric value={notesCount} label="Notes" />
            <View style={styles.divider} />
            <Metric value={tasksCount} label="Tasks" />
            <View style={styles.divider} />
            <Metric value={tasksCompleted} label="Done" />
          </View>

          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Task progress</Text>
            <Text style={styles.percentText}>{safeCompletionRate}%</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${safeCompletionRate}%` }]} />
          </View>
          <Text style={styles.progressSubtext}>
            {tasksCount === 0
              ? 'No tasks yet. Open Tasks to add one.'
              : remaining === 0
                ? 'All tasks in this space are complete.'
                : `${remaining} task${remaining === 1 ? '' : 's'} still open.`}
          </Text>
        </>
      )}
    </View>
  );
};

export default SpaceOverviewCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing['2xl'],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },

  cardHint: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.muted,
    lineHeight: ms(18),
  },

  stateBox: {
    minHeight: mvs(92),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.inputBg,
  },

  stateText: {
    marginTop: spacing.md,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  errorText: {
    color: colors.errorDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryLight,
  },

  retryText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },

  metric: {
    flex: 1,
    alignItems: 'center',
  },

  divider: {
    width: StyleSheet.hairlineWidth,
    height: ms(28),
    backgroundColor: colors.border,
  },

  metricValue: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.extrabold,
    color: colors.text,
    letterSpacing: -0.4,
  },

  metricLabel: {
    marginTop: spacing.xxs,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.subText,
  },

  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },

  progressTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },

  percentText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },

  track: {
    height: ms(6),
    borderRadius: radii.pill,
    backgroundColor: colors.primaryLight,
    overflow: 'hidden',
  },

  fill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },

  progressSubtext: {
    marginTop: spacing.sm,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.muted,
    lineHeight: ms(16),
  },
});
