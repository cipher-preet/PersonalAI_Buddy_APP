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
    <View>
      <Text style={styles.sectionTitle}>Browse</Text>
      <Text style={styles.sectionHint}>
        Open the notes and tasks stored in this space.
      </Text>

      <View style={styles.group}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.row, index < actions.length - 1 && styles.rowBorder]}
            onPress={action.onPress}
            activeOpacity={0.78}
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
              width={ms(16)}
              height={ms(16)}
              color={colors.muted}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default SpaceActionList;

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },

  sectionHint: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.muted,
    lineHeight: ms(18),
  },

  group: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },

  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },

  iconBox: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(12),
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rowCopy: {
    flex: 1,
    minWidth: 0,
  },

  rowLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },

  rowSubtitle: {
    marginTop: spacing.xxs,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.muted,
  },
});
