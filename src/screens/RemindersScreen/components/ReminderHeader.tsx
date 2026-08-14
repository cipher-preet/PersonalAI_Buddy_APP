import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';

import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../theme';

const BackIcon = ({ color = colors.text }: { color?: string }) => (
  <Svg width={ms(18)} height={ms(18)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18 9 12l6-6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ReminderHeader = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.78}
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <BackIcon />
      </TouchableOpacity>

      <Text style={styles.title}>Reminders</Text>

      <View style={styles.spacer} />
    </View>
  );
};

export default ReminderHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing['2xl'],
  },

  backButton: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },

  title: {
    color: colors.text,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
  },

  spacer: {
    width: ms(36),
  },
});
