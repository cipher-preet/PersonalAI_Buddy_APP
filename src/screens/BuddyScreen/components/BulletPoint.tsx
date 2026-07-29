import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../styles';

type Props = {
  text: string;
};

const BulletPoint = ({ text }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

export default BulletPoint;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 10,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primarySoft,
    marginTop: 8,
    marginRight: 10,
  },

  text: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.text,
    fontWeight: '500',
  },
});
