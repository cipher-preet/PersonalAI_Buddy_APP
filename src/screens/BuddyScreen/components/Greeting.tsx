import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight, ms, spacing } from '../../../theme';

const Greeting = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        How can I help you today,{'\n'}Preet?
      </Text>
    </View>
  );
};

export default Greeting;

const styles = StyleSheet.create({
  container: {
    marginTop: ms(34),
    alignItems: 'center',
  },

  title: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    lineHeight: ms(38),
  },
});
