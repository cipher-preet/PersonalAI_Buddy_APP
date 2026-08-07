import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

import { COLORS } from './styles/color';
import { fontSize, fontWeight, ms, radii, spacing } from '../../../theme';

type Props = {
  item: string;
  active?: boolean;
  onPress?: () => void;
};

const CategoryPill = ({ item, active, onPress }: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.container, active && styles.activeContainer]}
    >
      <Text style={[styles.text, active && styles.activeText]}>{item}</Text>
    </TouchableOpacity>
  );
};

export default CategoryPill;

const styles = StyleSheet.create({
  container: {
    height: ms(34),
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  activeContainer: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },

  text: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: COLORS.muted,
    letterSpacing: -0.1,
  },

  activeText: {
    color: COLORS.white,
  },
});
