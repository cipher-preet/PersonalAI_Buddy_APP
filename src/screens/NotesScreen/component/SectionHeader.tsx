import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { COLORS } from './styles/color';
import { fontSize, fontWeight, spacing } from '../../../theme';

const SectionHeader = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Notes</Text>
    </View>
  );
};

export default SectionHeader;

const styles = StyleSheet.create({
  container: {
    marginTop: spacing['3xl'],
    marginBottom: spacing.xl,
  },

  title: {
    color: COLORS.black,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extrabold,
  },
});
