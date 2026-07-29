import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { FilterIcon, SearchIcon } from '../../../../styles/icons';
import { COLORS } from './styles/color';

const Header = () => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Notes</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconButton}>
          <SearchIcon width={18} height={18} color={COLORS.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <FilterIcon width={18} height={18} color={COLORS.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.black,
  },

  actions: {
    flexDirection: 'row',
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});
