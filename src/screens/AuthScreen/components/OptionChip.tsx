import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { AUTH_COLORS } from '../styles/colors';
import {
  fontSize,
  fontWeight,
  radii,
  spacing,
} from '../../../theme';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

const OptionChip = ({ label, selected, onPress }: Props) => {
  return (
    <Pressable
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </Pressable>
  );
};

export default OptionChip;

const styles = StyleSheet.create({
  chip: {
    backgroundColor: AUTH_COLORS.white,
    borderRadius: radii.sm,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.xl,
    borderWidth: 1,
    borderColor: AUTH_COLORS.border,
    marginBottom: spacing.lg,
  },

  chipSelected: {
    borderColor: AUTH_COLORS.primary,
    backgroundColor: AUTH_COLORS.primaryLight,
  },

  text: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: AUTH_COLORS.text,
  },

  textSelected: {
    color: AUTH_COLORS.primary,
  },
});
