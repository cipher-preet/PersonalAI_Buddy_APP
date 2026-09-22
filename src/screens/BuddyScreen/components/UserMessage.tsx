import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { CHAT } from '../styles';
import {
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
      <View style={styles.bubble}>
        <Text style={styles.text}>{text}</Text>
        {time ? <Text style={styles.time}>{time}</Text> : null}
      </View>
    </View>
  );
};

export default memo(UserMessage);

const styles = StyleSheet.create({
  row: {
    alignItems: 'flex-end',
  },

  bubble: {
    maxWidth: '82%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii['2xl'],
    borderBottomRightRadius: radii.sm,
    backgroundColor: CHAT.surfaceMuted,
    borderWidth: 1,
    borderColor: CHAT.border,
  },

  text: {
    fontSize: fontSize.base,
    lineHeight: ms(22),
    color: CHAT.black,
    fontWeight: fontWeight.regular,
  },

  time: {
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
    color: CHAT.textMuted,
    fontWeight: fontWeight.medium,
    alignSelf: 'flex-end',
  },
});
