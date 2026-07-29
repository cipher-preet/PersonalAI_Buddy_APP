import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

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
          <ActivityIndicator size="small" color="#4338CA" />
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
                colors={['#8B5CF6', '#4338CA']}
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
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF2FF',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E2432',
    marginBottom: 14,
  },

  stateBox: {
    minHeight: 138,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  stateText: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },

  errorText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '700',
  },

  retryButton: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
  },

  retryText: {
    color: '#4338CA',
    fontSize: 12,
    fontWeight: '800',
  },

  metricsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  metric: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  metricInner: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  divider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },

  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
    lineHeight: 24,
  },

  metricLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },

  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },

  progressSection: {},

  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  progressTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  percentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#F5F3FF',
  },

  percentText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4338CA',
  },

  track: {
    height: 5,
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
    overflow: 'hidden',
  },

  fill: {
    height: '100%',
    borderRadius: 999,
  },

  progressSubtext: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
  },
});
