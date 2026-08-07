import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import {
  colors,
  fontSize,
  fontWeight,
  radii,
  spacing,
} from '../../../theme';

type Props = {
  title: string;
};

const ActionButton = ({ title }: Props) => {
  return (
    <TouchableOpacity style={styles.container}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

export default ActionButton;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.xl,
    borderRadius: radii.pill,
  },

  text: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
});
