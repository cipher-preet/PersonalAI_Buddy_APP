import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  shadows,
  spacing,
} from '../../../theme';
import type { UiPlan, UiPlanId } from '../planCatalog';

type CompareRow = {
  id: string;
  label: string;
  values: Partial<Record<UiPlanId, string>>;
};

type Props = {
  plans: UiPlan[];
  rows: CompareRow[];
  selectedPlanId: UiPlanId;
};

const CheckIcon = () => (
  <Svg width={ms(12)} height={ms(12)} viewBox="0 0 24 24" fill="none">
    <Path
      d="m6 12 4 4 8-8"
      stroke={colors.white}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const renderValue = (value?: string, accent?: boolean) => {
  if (!value || value === '—') {
    return <Text style={styles.emptyMark}>—</Text>;
  }

  if (value === 'Yes') {
    return (
      <View style={[styles.checkWrap, accent && styles.checkWrapAccent]}>
        <CheckIcon />
      </View>
    );
  }

  return (
    <Text style={[styles.valueText, accent && styles.valueAccent]}>{value}</Text>
  );
};

const CompareTable = ({ plans, rows, selectedPlanId }: Props) => (
  <View style={styles.card}>
    <View style={styles.heading}>
      <Text style={styles.title}>Compare at a glance</Text>
      <Text style={styles.subtitle}>
        See what changes as you move from Free to Business.
      </Text>
    </View>

    <View style={styles.table}>
      <View style={styles.headerRow}>
        <Text style={styles.cornerLabel}>Feature</Text>
        {plans.map(plan => {
          const selected = plan.id === selectedPlanId;
          return (
            <View
              key={plan.id}
              style={[styles.headCell, selected && styles.headCellSelected]}
            >
              <Text
                style={[styles.headText, selected && styles.headTextSelected]}
                numberOfLines={1}
              >
                {plan.name}
              </Text>
            </View>
          );
        })}
      </View>

      {rows.map((row, index) => (
        <View
          key={row.id}
          style={[
            styles.row,
            index % 2 === 1 && styles.rowAlt,
            index === rows.length - 1 && styles.rowLast,
          ]}
        >
          <Text style={styles.label}>{row.label}</Text>
          {plans.map(plan => {
            const selected = plan.id === selectedPlanId;
            return (
              <View
                key={`${row.id}-${plan.id}`}
                style={[styles.valueCell, selected && styles.valueCellSelected]}
              >
                {renderValue(row.values[plan.id], plan.id !== 'free')}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  </View>
);

export default CompareTable;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    padding: spacing['2xl'],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadows.card,
  },

  heading: {
    marginBottom: spacing.lg,
  },

  title: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extrabold,
  },

  subtitle: {
    marginTop: spacing.xs,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(18),
  },

  table: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },

  cornerLabel: {
    flex: 1.15,
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    paddingLeft: spacing.sm,
  },

  headCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },

  headCellSelected: {
    backgroundColor: colors.primary,
  },

  headText: {
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },

  headTextSelected: {
    color: colors.white,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: ms(48),
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.white,
  },

  rowAlt: {
    backgroundColor: colors.inputBg,
  },

  rowLast: {
    borderBottomLeftRadius: radii.lg,
    borderBottomRightRadius: radii.lg,
  },

  label: {
    flex: 1.15,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    paddingLeft: spacing.sm,
  },

  valueCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  valueCellSelected: {
    backgroundColor: 'transparent',
  },

  valueText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  valueAccent: {
    color: colors.primaryDark,
  },

  emptyMark: {
    color: colors.muted,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },

  checkWrap: {
    width: ms(20),
    height: ms(20),
    borderRadius: ms(10),
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkWrapAccent: {
    backgroundColor: colors.primary,
  },
});
