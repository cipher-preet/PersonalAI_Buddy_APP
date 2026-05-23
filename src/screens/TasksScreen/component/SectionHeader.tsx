import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { CalenderIcon, HomeIcon } from '../../../../styles/icons';

import { COLORS } from '../component/styles/color';

const SectionHeader = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tasks</Text>

      <TouchableOpacity style={styles.button}>
        <CalenderIcon width={18} height={18} />

        <Text style={styles.month}>December</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SectionHeader;

const styles = StyleSheet.create({
  container: {
    marginTop: 28,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    color: COLORS.black,
    fontSize: 22,
    fontWeight: '800',
  },

  button: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  month: {
    marginLeft: 8,
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '600',
  },
});
