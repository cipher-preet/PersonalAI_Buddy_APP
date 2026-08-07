import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../styles';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../theme';

type Props = {
  text: string;
  time?: string;
};

const UserMessage = ({ text, time }: Props) => {
  return (
    <View style={styles.row}>
      <LinearGradient
        colors={[COLORS.primarySoft, COLORS.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bubble}
      >
        <Text style={styles.text}>{text}</Text>
        {time ? <Text style={styles.time}>{time}</Text> : null}
      </LinearGradient>
    </View>
  );
};

export default UserMessage;

const styles = StyleSheet.create({
  row: {
    marginTop: spacing.md,
    alignItems: 'flex-end',
  },

  bubble: {
    maxWidth: '84%',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.xl,
    borderRadius: radii.xl,
    borderBottomRightRadius: radii.xs,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: ms(6) },
    shadowOpacity: 0.16,
    shadowRadius: ms(12),
    elevation: 3,
  },

  text: {
    fontSize: fontSize.lg,
    lineHeight: ms(22),
    color: COLORS.white,
    fontWeight: fontWeight.medium,
  },

  time: {
    marginTop: spacing.sm,
    fontSize: ms(10),
    color: 'rgba(255, 255, 255, 0.78)',
    fontWeight: fontWeight.semibold,
    alignSelf: 'flex-end',
  },
});
