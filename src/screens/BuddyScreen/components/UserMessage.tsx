import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
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
        colors={[colors.primary, colors.primaryDark]}
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
    maxWidth: '82%',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radii.xl,
    borderBottomRightRadius: radii.sm,
  },

  text: {
    fontSize: fontSize.base,
    lineHeight: ms(22),
    color: colors.white,
    fontWeight: fontWeight.medium,
  },

  time: {
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
    color: 'rgba(255, 255, 255, 0.72)',
    fontWeight: fontWeight.semibold,
    alignSelf: 'flex-end',
  },
});
