import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
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
  isDeleting?: boolean;
  onPress?: () => void;
  onDelete?: () => void;
};

const TrashIcon = ({ color = colors.errorDark }: { color?: string }) => (
  <Svg width={ms(15)} height={ms(15)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8 12h8"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SpaceCard = ({
  title,
  description,
  icon,
  badgeText,
  color,
  isDeleting = false,
  time,
  onPress,
  onDelete,
}: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={[styles.card, isDeleting && styles.cardDeleting]}
      onPress={onPress}
      disabled={isDeleting}
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

      <View style={styles.actions}>
        <TouchableOpacity
          activeOpacity={0.75}
          style={[styles.deleteButton, isDeleting && styles.deleteButtonBusy]}
          onPress={event => {
            event.stopPropagation();
            onDelete?.();
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={colors.errorDark} />
          ) : (
            <TrashIcon />
          )}
        </TouchableOpacity>

        <View style={styles.arrowButton}>
          <Text style={styles.arrow}>›</Text>
        </View>
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

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(7),
    marginLeft: spacing.lg,
  },

  cardDeleting: {
    opacity: 0.72,
  },

  deleteButton: {
    width: ms(30),
    height: ms(30),
    borderRadius: ms(15),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 1,
  },

  deleteButtonBusy: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },

  arrowButton: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
  },

  arrow: {
    fontSize: fontSize['3xl'],
    color: colors.subText,
    marginTop: -spacing.xxs,
  },
});
