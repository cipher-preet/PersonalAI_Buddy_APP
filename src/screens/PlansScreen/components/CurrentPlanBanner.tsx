import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';

import type { PlanStatus } from '../../../store/api/payments';
import {
  getRecordingUsedMs,
  formatRecordingQuota,
} from '../../../utils/planUsage';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../theme';

type Props = {
  planStatus?: PlanStatus;
};

const ShieldIcon = () => (
  <Svg width={ms(14)} height={ms(14)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3.5 19.5 6.5v5.4c0 4.5-3.1 7.8-7.5 9.1-4.4-1.3-7.5-4.6-7.5-9.1V6.5L12 3.5Z"
      stroke={colors.primary}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
    <Path
      d="m9 12 2 2 4-4"
      stroke={colors.primary}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const formatUsage = (used?: number, limit?: number) => {
  const safeUsed = used ?? 0;
  if (limit == null) {
    return String(safeUsed);
  }
  if (limit < 0) {
    return 'Unlimited';
  }
  return `${safeUsed} of ${limit}`;
};

const formatRenewal = (value?: string) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const CurrentPlanBanner = ({ planStatus }: Props) => {
  if (!planStatus?.plan) {
    return null;
  }

  const planName = planStatus.plan.name || 'Free';
  const renewal = formatRenewal(planStatus.subscription?.currentPeriodEnd);
  const stats = [
    {
      label: 'Spaces',
      value: formatUsage(planStatus.usage?.spaces, planStatus.plan.limits?.spaces),
    },
    {
      label: 'Notes',
      value: formatUsage(planStatus.usage?.notes, planStatus.plan.limits?.notes),
    },
    {
      label: 'Hours',
      value: formatRecordingQuota(
        getRecordingUsedMs(planStatus),
        planStatus.plan.limits?.recordingHours,
      ),
    },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>CURRENT PLAN</Text>
          <Text style={styles.title}>{planName}</Text>
          <Text style={styles.subtitle}>
            {renewal
              ? `Renews ${renewal}`
              : 'Switch anytime. Your work stays with you.'}
          </Text>
        </View>
        <LinearGradient
          colors={[colors.primarySoft, colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statusPill}
        >
          <ShieldIcon />
          <Text style={styles.statusText}>Active</Text>
        </LinearGradient>
      </View>

      <View style={styles.statRow}>
        {stats.map(stat => (
          <View key={stat.label} style={styles.statChip}>
            <Text style={styles.statValue} numberOfLines={1}>
              {stat.value}
            </Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default CurrentPlanBanner;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    padding: spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  copy: {
    flex: 1,
    minWidth: 0,
  },

  eyebrow: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 1.1,
  },

  title: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.4,
  },

  subtitle: {
    marginTop: spacing.xs,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
  },

  statusText: {
    color: colors.primaryDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },

  statRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  statChip: {
    flex: 1,
    minHeight: ms(56),
    borderRadius: radii.lg,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },

  statValue: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold,
  },

  statLabel: {
    marginTop: spacing.xxs,
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
});
