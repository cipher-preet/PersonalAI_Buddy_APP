import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors, fontSize, fontWeight, ms, radii, spacing } from '../../../theme';

type Props = {
  step: number;
  total?: number;
};

const ProgressDots = ({ step, total = 3 }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.trackRow}>
        {Array.from({ length: total }).map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index + 1 <= step && styles.dotActive]}
          />
        ))}
      </View>
      <Text style={styles.stepLabel}>
        Step {step} of {total}
      </Text>
    </View>
  );
};

export default ProgressDots;

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing['3xl'],
  },

  trackRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  dot: {
    flex: 1,
    height: ms(4),
    borderRadius: radii.pill,
    backgroundColor: colors.border,
  },

  dotActive: {
    backgroundColor: colors.primary,
  },

  stepLabel: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.subText,
  },
});
