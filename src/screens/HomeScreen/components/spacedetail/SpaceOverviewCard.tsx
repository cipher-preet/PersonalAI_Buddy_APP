import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  mvs,
  radii,
  shadows,
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

type MetricProps = {
  label: string;
  value: number;
  showDivider?: boolean;
};

const Metric = ({ label, value, showDivider }: MetricProps) => (
  <View style={styles.metric}>
    {showDivider ? <View style={styles.divider} /> : null}
    <View style={styles.metricInner}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
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

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Overview</Text>

      {isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.stateText}>Loading overview...</Text>
        </View>
      ) : isError ? (
        <View style={styles.stateBox}>
          <Text style={styles.errorText}>Unable to load overview.</Text>
          {onRetry ? (
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.retryButton}
              onPress={onRetry}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        <>
          <View style={styles.metricsRow}>
            <Metric label="Notes" value={notesCount} />
            <Metric label="Tasks" value={tasksCount} showDivider />
            <Metric label="Completed" value={tasksCompleted} showDivider />
          </View>

          <View style={styles.separator} />

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Tasks completed</Text>
              <View style={styles.percentBadge}>
                <Text style={styles.percentText}>{safeCompletionRate}%</Text>
              </View>
            </View>

            <View style={styles.track}>
              <LinearGradient
                colors={[colors.primaryPurple, colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.fill, { width: `${safeCompletionRate}%` }]}
              />
            </View>

            <Text style={styles.progressSubtext}>
              {tasksCompleted} of {tasksCount} tasks finished in this space
            </Text>
          </View>
        </>
      )}
    </View>
  );
};

export default SpaceOverviewCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: ms(18),
    padding: layout.cardPadding,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    ...shadows.soft,
  },

  cardTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: ms(14),
  },

  stateBox: {
    minHeight: mvs(138),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ms(14),
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
  },

  stateText: {
    marginTop: spacing.lg,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  errorText: {
    color: colors.errorDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: ms(14),
    paddingVertical: ms(7),
    borderRadius: radii.pill,
    backgroundColor: colors.primaryLight,
  },

  retryText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold,
  },

  metricsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.inputBg,
    borderRadius: ms(14),
    paddingVertical: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },

  metric: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  metricInner: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },

  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },

  metricValue: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.extrabold,
    color: colors.black,
    letterSpacing: -0.5,
    lineHeight: ms(24),
  },

  metricLabel: {
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.subText,
    textAlign: 'center',
  },

  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: ms(14),
  },

  progressSection: {},

  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },

  progressTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.subText,
  },

  percentBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: ms(3),
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
  },

  percentText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.extrabold,
    color: colors.primary,
  },

  track: {
    height: ms(5),
    borderRadius: radii.pill,
    backgroundColor: colors.primaryLight,
    overflow: 'hidden',
  },

  fill: {
    height: '100%',
    borderRadius: radii.pill,
  },

  progressSubtext: {
    marginTop: spacing.md,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.muted,
  },
});
