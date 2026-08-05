import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { COLORS } from '../styles/colors';

const ProfileHeader = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
    </View>
  );
};

export default ProfileHeader;

const styles = StyleSheet.create({
  container: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 22,
  },
});
