import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../theme';

type Props = {
  emoji: string;
  title: string;
};

const ActionCard = ({ emoji, title }: Props) => {
  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{emoji}</Text>
      </View>

      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
};

export default ActionCard;

const styles = StyleSheet.create({
  container: {
    width: '48%',
    minHeight: ms(150),
    backgroundColor: colors.white,
    borderRadius: radii['3xl'],
    padding: spacing['2xl'],
    justifyContent: 'space-between',
  },

  iconBox: {
    width: ms(42),
    height: ms(42),
    borderRadius: ms(14),
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },

  icon: {
    fontSize: fontSize['3xl'],
  },

  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    lineHeight: ms(24),
  },
});
