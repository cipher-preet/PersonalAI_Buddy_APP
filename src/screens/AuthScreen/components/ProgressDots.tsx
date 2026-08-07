import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AUTH_COLORS } from '../styles/colors';
import { ms, radii, spacing } from '../../../theme';

type Props = {
  step: number;
  total?: number;
};

const ProgressDots = ({ step, total = 3 }: Props) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[styles.dot, index + 1 <= step && styles.dotActive]}
        />
      ))}
    </View>
  );
};

export default ProgressDots;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing['4xl'],
  },

  dot: {
    flex: 1,
    height: ms(5),
    borderRadius: radii.pill,
    backgroundColor: AUTH_COLORS.border,
  },

  dotActive: {
    backgroundColor: AUTH_COLORS.primary,
  },
});
