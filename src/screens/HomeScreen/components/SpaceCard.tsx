import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  mvs,
  radii,
  shadows,
  spacing,
} from '../../../theme';

type Props = {
  title: string;

  description: string;

  icon: React.ReactNode;

  badgeText?: string;
  time?: string;
  conversations?: string;
  tags?: string[];

  color?: string;
  onPress?: () => void;
};

const SpaceCard = ({
  title,
  description,
  icon,
  badgeText,
  color,
  time,
  onPress,
}: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.leftSection}>
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: color,
            },
          ]}
        >
          {icon}
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <Text numberOfLines={1} style={styles.title}>
              {title}
            </Text>

            {badgeText && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badgeText}</Text>
              </View>
            )}
          </View>

          <Text numberOfLines={1} style={styles.description}>
            {description}
          </Text>

          {time ? (
            <Text numberOfLines={1} style={styles.time}>
              {time}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.arrowButton}>
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

export default SpaceCard;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: mvs(84),
    backgroundColor: colors.white,
    borderRadius: ms(26),
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['2xl'],
    marginTop: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },

  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconWrapper: {
    width: ms(52),
    height: ms(52),
    borderRadius: radii.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ms(14),
    backgroundColor: colors.primaryLight,
  },

  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: spacing.md,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    flexShrink: 1,
    fontSize: fontSize.base,
    color: colors.black,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
  },

  badge: {
    height: ms(22),
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.lg,
    backgroundColor: colors.primaryLight,
  },

  badgeText: {
    fontSize: ms(8),
    fontWeight: fontWeight.bold,
    letterSpacing: 0.4,
    color: colors.primary,
  },

  description: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.subText,
    fontWeight: fontWeight.medium,
    lineHeight: ms(18),
  },

  time: {
    marginTop: spacing.xxs,
    fontSize: fontSize.xs,
    color: colors.muted,
    fontWeight: fontWeight.semibold,
  },

  arrowButton: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    marginLeft: spacing.lg,
  },

  arrow: {
    fontSize: fontSize['3xl'],
    color: colors.subText,
    marginTop: -spacing.xxs,
  },
});
