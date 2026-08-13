import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  spacing,
} from '../../../theme';

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
    minHeight: layout.iconButton,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.text,
    lineHeight: ms(26),
    letterSpacing: -0.3,
  },
});
