import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  shadows,
  spacing,
} from '../../../theme';

type Props = {
  title: string;

  icon: React.ReactNode;

  color?: string;
};

const QuickActionCard = ({ title, icon, color }: Props) => {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.card}>
      <View style={styles.iconContainer}>
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: `${color}12`,
            },
          ]}
        >
          {icon}
        </View>
      </View>

      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default QuickActionCard;

const styles = StyleSheet.create({
  card: {
    width: ms(82),
    alignItems: 'center',
    marginRight: spacing.lg,
  },

  iconContainer: {
    width: ms(60),
    height: ms(60),
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },

  iconWrapper: {
    width: ms(34),
    height: ms(34),
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    marginTop: spacing.xl,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
});
