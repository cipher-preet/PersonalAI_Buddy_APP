import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import ChevronRightIcon from '../../../../../styles/icons/GreatorThan';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../../theme';

type ActionItem = {
  id: string;
  label: string;
  subtitle?: string;
  icon: React.ReactNode;
  onPress: () => void;
};

type Props = {
  actions: ActionItem[];
};

const SpaceActionList = ({ actions }: Props) => {
  return (
    <View style={styles.group}>
      {actions.map((action, index) => (
        <TouchableOpacity
          key={action.id}
          style={[styles.row, index < actions.length - 1 && styles.rowBorder]}
          onPress={action.onPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={action.label}
        >
          <View style={styles.iconBox}>{action.icon}</View>
          <View style={styles.rowCopy}>
            <Text style={styles.rowLabel}>{action.label}</Text>
            {action.subtitle ? (
              <Text style={styles.rowSubtitle} numberOfLines={1}>
                {action.subtitle}
              </Text>
            ) : null}
          </View>
          <ChevronRightIcon
            width={ms(14)}
            height={ms(14)}
            color={colors.muted}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default SpaceActionList;

const styles = StyleSheet.create({
  group: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.xl,
    gap: spacing.xl,
  },

  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },

  iconBox: {
    width: ms(40),
    height: ms(40),
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rowCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },

  rowLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },

  rowSubtitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.muted,
  },
});
