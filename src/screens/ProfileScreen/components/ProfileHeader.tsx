import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { SettingIcon } from '../../../../styles/icons';
import { COLORS } from '../styles/colors';

const ProfileHeader = () => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account</Text>
      </View>

      <TouchableOpacity style={styles.iconButton} activeOpacity={0.75}>
        <SettingIcon color={COLORS.text} />
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
    marginBottom: 20,
    marginTop: 4,
  },

  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.subText,
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
