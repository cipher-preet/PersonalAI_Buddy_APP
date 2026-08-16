import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import MarkdownContent from './MarkdownContent';
import {
  colors,
  fontSize,
  fontWeight,
  radii,
  spacing,
} from '../../../theme';

type Props = {
  text?: string;
  bullets?: string[];
  time?: string;
};

const AIMessage = ({ text, bullets, time }: Props) => {
  const markdown = [
    text?.trim() || '',
    ...(bullets || []).map(item => `- ${item}`),
  ]
    .filter(Boolean)
    .join('\n\n');

  return (
    <View style={styles.row}>
      <View style={styles.card}>
        <Text style={styles.metaLabel}>Buddy</Text>

        {markdown ? <MarkdownContent content={markdown} /> : null}

        {time ? <Text style={styles.time}>{time}</Text> : null}
      </View>
    </View>
  );
};

export default AIMessage;

const styles = StyleSheet.create({
  row: {
    marginTop: spacing.md,
    paddingRight: spacing.md,
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderTopLeftRadius: radii.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  metaLabel: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },

  time: {
    marginTop: spacing.md,
    fontSize: fontSize.xs,
    color: colors.muted,
    fontWeight: fontWeight.semibold,
  },
});
