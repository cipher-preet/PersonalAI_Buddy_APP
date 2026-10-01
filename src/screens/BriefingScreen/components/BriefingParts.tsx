import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, fontSize, fontWeight, ms, radii, spacing } from '../../../theme';

export const SectionHeader = ({
  title,
  meta,
  actionLabel,
  onActionPress,
}: {
  title: string;
  meta?: string;
  actionLabel?: string;
  onActionPress?: () => void;
}) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {meta ? <Text style={styles.sectionMeta}>{meta}</Text> : null}
    </View>
    {actionLabel && onActionPress ? (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onActionPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.sectionAction}>{actionLabel}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

export const StatTile = ({
  icon,
  iconBg,
  value,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: number | string;
  label: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    activeOpacity={onPress ? 0.85 : 1}
    disabled={!onPress}
    onPress={onPress}
    style={styles.statTile}
  >
    <View style={[styles.statIcon, { backgroundColor: iconBg }]}>{icon}</View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel} numberOfLines={1}>
      {label}
    </Text>
  </TouchableOpacity>
);

export type SegmentOption<T extends string> = { key: T; label: string };

export const Segment = <T extends string>({
  options,
  value,
  onChange,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (key: T) => void;
}) => (
  <View style={styles.segment}>
    {options.map(option => {
      const selected = option.key === value;
      return (
        <TouchableOpacity
          key={option.key}
          activeOpacity={0.85}
          onPress={() => onChange(option.key)}
          style={[styles.segmentItem, selected && styles.segmentItemActive]}
          accessibilityRole="tab"
          accessibilityState={{ selected }}
        >
          <Text
            style={[styles.segmentText, selected && styles.segmentTextActive]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

export const Tag = ({
  label,
  color,
  bg,
}: {
  label: string;
  color: string;
  bg: string;
}) => (
  <View style={[styles.tag, { backgroundColor: bg }]}>
    <Text style={[styles.tagText, { color }]} numberOfLines={1}>
      {label}
    </Text>
  </View>
);

export const Avatars = ({ names, max = 3 }: { names: string[]; max?: number }) => {
  const visible = names.slice(0, max);
  const extra = names.length - visible.length;
  return (
    <View style={styles.avatars}>
      {visible.map((name, index) => (
        <View
          key={`${name}-${index}`}
          style={[styles.avatar, index > 0 && styles.avatarOverlap]}
        >
          <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
        </View>
      ))}
      {extra > 0 ? (
        <View style={[styles.avatar, styles.avatarOverlap, styles.avatarExtra]}>
          <Text style={styles.avatarExtraText}>+{extra}</Text>
        </View>
      ) : null}
    </View>
  );
};

export const cardStyle = {
  borderRadius: radii['2xl'],
  backgroundColor: colors.white,
  borderWidth: 1,
  borderColor: colors.border,
} as const;

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    flexShrink: 1,
  },
  sectionTitle: {
    color: colors.black,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.3,
  },
  sectionMeta: {
    color: colors.muted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  sectionAction: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  statTile: {
    flex: 1,
    ...cardStyle,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  statIcon: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(17),
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    marginTop: spacing.xl,
    color: colors.black,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.4,
  },
  statLabel: {
    marginTop: spacing.xxs,
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  segment: {
    flexDirection: 'row',
    padding: spacing.xs,
    borderRadius: radii.lg,
    backgroundColor: colors.lightGray,
  },
  segmentItem: {
    flex: 1,
    minHeight: ms(38),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
  },
  segmentItemActive: {
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  segmentText: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  segmentTextActive: {
    color: colors.black,
    fontWeight: fontWeight.bold,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
    borderRadius: radii.sm,
  },
  tagText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  avatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: ms(26),
    height: ms(26),
    borderRadius: ms(13),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarOverlap: {
    marginLeft: -ms(8),
  },
  avatarText: {
    color: colors.primaryDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  avatarExtra: {
    backgroundColor: colors.lightGray,
  },
  avatarExtraText: {
    color: colors.subText,
    fontSize: ms(9),
    fontWeight: fontWeight.bold,
  },
});
