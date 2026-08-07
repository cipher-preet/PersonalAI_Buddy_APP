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
  subtitle: string;

  icon: React.ReactNode;
  rightIcon?: React.ReactNode;

  color: string;
  active?: boolean;
  activeColor?: string;
  onPress?: () => void;
};

const TopCard = ({
  title,
  subtitle,
  icon,
  rightIcon,
  color,
  active = false,
  activeColor = colors.accentCyan,
  onPress,
}: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[
        styles.card,
        active && {
          backgroundColor: colors.inputBg,
          borderColor: activeColor,
          shadowColor: activeColor,
          shadowOpacity: 0.14,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.topSection}>
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: active ? activeColor : color,
            },
          ]}
        >
          {icon}
        </View>

        {active ? (
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live</Text>
          </View>
        ) : null}

        {rightIcon && !active ? (
          <View style={styles.rightIconContainer}>{rightIcon}</View>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text
          numberOfLines={1}
          style={[styles.title, active && styles.titleActive]}
        >
          {title}
        </Text>

        <Text
          numberOfLines={2}
          style={[styles.subtitle, active && styles.subtitleActive]}
        >
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default TopCard;

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: ms(26),
    paddingHorizontal: ms(18),
    paddingTop: ms(18),
    paddingBottom: mvs(20),
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },

  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  iconWrapper: {
    width: ms(42),
    height: ms(42),
    borderRadius: ms(21),
    justifyContent: 'center',
    alignItems: 'center',
  },

  rightIconContainer: {
    marginTop: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },

  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.accentCyan,
  },

  liveDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: colors.successBright,
  },

  liveText: {
    fontSize: ms(9),
    fontWeight: fontWeight.extrabold,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },

  content: {
    marginTop: mvs(28),
  },

  title: {
    fontSize: fontSize.lg,
    color: colors.black,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
  },

  titleActive: {
    color: colors.textSecondary,
  },

  subtitle: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.subText,
    fontWeight: fontWeight.medium,
    lineHeight: ms(18),
    paddingRight: spacing.md,
  },

  subtitleActive: {
    color: colors.info,
  },
});
