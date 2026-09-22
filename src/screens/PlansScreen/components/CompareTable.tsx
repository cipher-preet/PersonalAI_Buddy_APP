import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../theme';
import type { CompareIcon, CompareRow, UiPlan, UiPlanId } from '../planCatalog';

type Props = {
  plans: UiPlan[];
  rows: CompareRow[];
  selectedPlanId: UiPlanId;
};

const BenefitIcon = ({ type }: { type: CompareIcon }) => {
  const stroke = colors.primary;
  const size = ms(18);

  switch (type) {
    case 'spaces':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z"
            stroke={stroke}
            strokeWidth={1.7}
            strokeLinejoin="round"
          />
          <Path
            d="M12 12v9M4 7.5l8 4.5 8-4.5"
            stroke={stroke}
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'recording':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 3.5a3.2 3.2 0 0 1 3.2 3.2v5.1a3.2 3.2 0 1 1-6.4 0V6.7A3.2 3.2 0 0 1 12 3.5Z"
            stroke={stroke}
            strokeWidth={1.7}
          />
          <Path
            d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v3.5"
            stroke={stroke}
            strokeWidth={1.7}
            strokeLinecap="round"
          />
        </Svg>
      );
    case 'languages':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="8.2" stroke={stroke} strokeWidth={1.7} />
          <Path
            d="M4.5 12h15M12 3.8c2.2 2.2 3.3 4.8 3.3 8.2S14.2 18 12 20.2C9.8 18 8.7 15.4 8.7 12S9.8 6 12 3.8Z"
            stroke={stroke}
            strokeWidth={1.7}
            strokeLinecap="round"
          />
        </Svg>
      );
    case 'briefing':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M6.5 4.5h11A1.5 1.5 0 0 1 19 6v13.2l-3.2-1.8-3.8 2.1-3.8-2.1L5 19.2V6a1.5 1.5 0 0 1 1.5-1.5Z"
            stroke={stroke}
            strokeWidth={1.7}
            strokeLinejoin="round"
          />
          <Path
            d="M8.5 9h7M8.5 12.5h5"
            stroke={stroke}
            strokeWidth={1.7}
            strokeLinecap="round"
          />
        </Svg>
      );
    case 'goals':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="8.2" stroke={stroke} strokeWidth={1.7} />
          <Circle cx="12" cy="12" r="4.4" stroke={stroke} strokeWidth={1.7} />
          <Circle cx="12" cy="12" r="1.4" fill={stroke} />
        </Svg>
      );
    case 'team':
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M16.5 19.2v-1.4a3.2 3.2 0 0 0-3.2-3.2H7.2A3.2 3.2 0 0 0 4 17.8v1.4"
            stroke={stroke}
            strokeWidth={1.7}
            strokeLinecap="round"
          />
          <Circle cx="10.2" cy="8.2" r="2.8" stroke={stroke} strokeWidth={1.7} />
          <Path
            d="M20 19.2v-1.2a2.7 2.7 0 0 0-2-2.6M15.3 5.6a2.7 2.7 0 0 1 0 5.2"
            stroke={stroke}
            strokeWidth={1.7}
            strokeLinecap="round"
          />
        </Svg>
      );
  }
};

const CheckIcon = () => (
  <Svg width={ms(11)} height={ms(11)} viewBox="0 0 24 24" fill="none">
    <Path
      d="m6 12 4 4 8-8"
      stroke={colors.white}
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const renderValue = (value?: string, accent?: boolean) => {
  if (!value || value === '—') {
    return <Text style={styles.emptyMark}>—</Text>;
  }

  if (value === 'Yes' || value === 'Unlimited') {
    return (
      <View style={[styles.checkWrap, accent && styles.checkWrapAccent]}>
        <CheckIcon />
      </View>
    );
  }

  return (
    <Text style={[styles.valueText, accent && styles.valueAccent]} numberOfLines={1}>
      {value}
    </Text>
  );
};

const CompareTable = ({ plans, rows, selectedPlanId }: Props) => (
  <View style={styles.card}>
    <View style={styles.heading}>
      <Text style={styles.title}>Benefits</Text>
      <View style={styles.headerCols}>
        {plans.map(plan => {
          const selected = plan.id === selectedPlanId;
          return (
            <View key={plan.id} style={styles.headCell}>
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
    </View>

    {rows.map((row, index) => (
      <View
        key={row.id}
        style={[styles.row, index === rows.length - 1 && styles.rowLast]}
      >
        <View style={styles.benefitCopy}>
          <View style={styles.iconWrap}>
            <BenefitIcon type={row.icon} />
          </View>
          <View style={styles.benefitText}>
            <Text style={styles.label}>{row.label}</Text>
            <Text style={styles.description} numberOfLines={2}>
              {row.description}
            </Text>
          </View>
        </View>

        <View style={styles.valueCols}>
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
      </View>
    ))}
  </View>
);

export default CompareTable;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  heading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },

  title: {
    flex: 1.35,
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extrabold,
  },

  headerCols: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
  },

  headCell: {
    flex: 1,
    alignItems: 'center',
  },

  headText: {
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },

  headTextSelected: {
    color: colors.primary,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },

  rowLast: {
    borderBottomWidth: 0,
  },

  benefitCopy: {
    flex: 1.35,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minWidth: 0,
  },

  iconWrap: {
    width: ms(34),
    height: ms(34),
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  benefitText: {
    flex: 1,
    minWidth: 0,
  },

  label: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  description: {
    marginTop: spacing.xxs,
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: ms(14),
  },

  valueCols: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
  },

  valueCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: ms(28),
  },

  valueCellSelected: {
    backgroundColor: 'transparent',
  },

  valueText: {
    color: colors.text,
    fontSize: fontSize.xs,
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
    backgroundColor: colors.successBright,
  },
});
