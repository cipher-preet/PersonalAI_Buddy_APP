import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { SettingIcon } from '../../../../styles/icons';

import { COLORS } from '../styles/colors';

const ProfileHeader = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <TouchableOpacity style={styles.iconButton}>
        <SettingIcon
          color={COLORS.text}
        />
      </TouchableOpacity>
    </View>
  );
};

export default ProfileHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    marginBottom: 18,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },

  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,

    backgroundColor: COLORS.white,

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },
});