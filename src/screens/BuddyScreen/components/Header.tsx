import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

import { HistoryIcon } from '../../../../styles/icons';

const Header = () => {
  return (
    <View style={styles.container}>
      <View style={styles.glowCircle} />
      <TouchableOpacity style={styles.iconButton}>
        <HistoryIcon width={18} height={18} />
      </TouchableOpacity>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  glowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7B4DFF',

    shadowColor: '#7B4DFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
});
