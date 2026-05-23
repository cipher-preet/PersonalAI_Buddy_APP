import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { HomeIcon } from '../../../../styles/icons';
import { COLORS } from '../component/styles/color';

const Header = () => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Tasks</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconButton}>
          <HomeIcon />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <HomeIcon />
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

  greeting: {
    fontSize: 11,
    color: COLORS.gray,
    fontWeight: '500',
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