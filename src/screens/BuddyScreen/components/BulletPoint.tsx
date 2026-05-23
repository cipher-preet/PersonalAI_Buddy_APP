import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

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
    marginBottom: 16,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#111827',
    marginTop: 9,
    marginRight: 10,
  },

  text: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    color: '#111827',
    fontWeight: '500',
  },
});