import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { COLORS } from './styles/color';

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
    marginTop: 20,
    marginBottom: 12,
  },

  title: {
    color: COLORS.black,
    fontSize: 18,
    fontWeight: '800',
  },
});
