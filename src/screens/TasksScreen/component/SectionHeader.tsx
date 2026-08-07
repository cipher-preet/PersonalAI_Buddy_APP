import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { CalenderIcon } from '../../../../styles/icons';
import { COLORS } from './styles/color';
import { fontSize, fontWeight, ms, radii, spacing } from '../../../theme';

const SectionHeader = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tasks</Text>

      <TouchableOpacity style={styles.button}>
        <CalenderIcon width={ms(18)} height={ms(18)} />

        <Text style={styles.month}>December</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SectionHeader;

const styles = StyleSheet.create({
  container: {
    marginTop: spacing['3xl'],
    marginBottom: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    color: COLORS.black,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extrabold,
  },

  button: {
    backgroundColor: COLORS.white,
    paddingHorizontal: ms(14),
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
    flexDirection: 'row',
    alignItems: 'center',
  },

  month: {
    marginLeft: spacing.md,
    color: COLORS.gray,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
