import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import ChevronRightIcon from '../../../../../styles/icons/GreatorThan';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
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
  spaceName: string;
  actions: ActionItem[];
  onAskBuddy: () => void;
};

const SparkIcon = () => (
  <Svg width={ms(18)} height={ms(18)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3.2 13.5 8.8 19 10.2 13.5 11.6 12 17.2 10.5 11.6 5 10.2 10.5 8.8 12 3.2Z"
      fill={colors.primary}
    />
    <Path
      d="M18.2 14.4 18.9 16.8 21.4 17.5 18.9 18.2 18.2 20.6 17.5 18.2 15 17.5 17.5 16.8 18.2 14.4Z"
      fill={colors.accentIndigo}
    />
  </Svg>
);

const SpaceActionList = ({ spaceName, actions, onAskBuddy }: Props) => {
  return (
    <View>
      <Text style={styles.sectionTitle}>Ask Buddy</Text>
      <Text style={styles.sectionHint}>
        Get help with what is already saved in this workspace.
      </Text>

      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.buddyCard}
        onPress={onAskBuddy}
        accessibilityRole="button"
        accessibilityLabel={`Ask Buddy about ${spaceName}`}
      >
        <View style={styles.buddyIcon}>
          <SparkIcon />
        </View>
        <View style={styles.buddyCopy}>
          <Text style={styles.buddyTitle}>Chat about {spaceName}</Text>
          <Text style={styles.buddySubtitle} numberOfLines={2}>
            Buddy can summarize notes, review open tasks, and suggest next steps.
          </Text>
        </View>
        <View style={styles.buddyCta}>
          <Text style={styles.buddyCtaText}>Ask</Text>
        </View>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, styles.browseTitle]}>Browse</Text>
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

  browseTitle: {
    marginTop: spacing['2xl'],
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

  buddyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },

  buddyIcon: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(14),
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buddyCopy: {
    flex: 1,
    minWidth: 0,
  },

  buddyTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.primaryDark,
  },

  buddySubtitle: {
    marginTop: spacing.xxs,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.subText,
    lineHeight: ms(16),
  },

  buddyCta: {
    minHeight: layout.chipHeight,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buddyCtaText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
});
