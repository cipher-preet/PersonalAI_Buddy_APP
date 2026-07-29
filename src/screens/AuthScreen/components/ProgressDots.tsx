import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AUTH_COLORS } from '../styles/colors';

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
    gap: 8,
    marginBottom: 28,
  },

  dot: {
    flex: 1,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
  },

  dotActive: {
    backgroundColor: AUTH_COLORS.primary,
  },
});
