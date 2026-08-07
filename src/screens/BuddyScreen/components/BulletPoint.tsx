import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../styles';
import {
  fontSize,
  fontWeight,
  ms,
  spacing,
} from '../../../theme';

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
    marginTop: spacing.lg,
  },

  dot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: COLORS.primarySoft,
    marginTop: spacing.md,
    marginRight: spacing.lg,
  },

  text: {
    flex: 1,
    fontSize: fontSize.base,
    lineHeight: ms(22),
    color: COLORS.text,
    fontWeight: fontWeight.medium,
  },
});
