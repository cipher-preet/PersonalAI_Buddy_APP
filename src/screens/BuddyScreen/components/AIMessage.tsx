import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import MarkdownContent from './MarkdownContent';
import { CHAT } from '../styles';
import {
  fontSize,
  fontWeight,
  spacing,
} from '../../../theme';

type Props = {
  text?: string;
  bullets?: string[];
  time?: string;
};

const AIMessage = ({ text, bullets, time }: Props) => {
  const markdown = useMemo(
    () =>
      [text?.trim() || '', ...(bullets || []).map(item => `- ${item}`)]
        .filter(Boolean)
        .join('\n\n'),
    [bullets, text],
  );

  return (
    <View style={styles.row}>
      <View style={styles.message}>
        {markdown ? <MarkdownContent content={markdown} /> : null}
        {time ? <Text style={styles.time}>{time}</Text> : null}
      </View>
    </View>
  );
};

export default memo(AIMessage);

const styles = StyleSheet.create({
  row: {
    alignItems: 'flex-start',
    paddingRight: spacing.sm,
  },

  message: {
    maxWidth: '100%',
  },

  time: {
    marginTop: spacing.sm,
    fontSize: fontSize.xs,
    color: CHAT.textMuted,
    fontWeight: fontWeight.medium,
  },
});
