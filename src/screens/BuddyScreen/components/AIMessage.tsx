import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import MarkdownContent from './MarkdownContent';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../theme';

type Props = {
  text?: string;
  bullets?: string[];
  time?: string;
};

const BuddyMark = () => (
  <View style={styles.avatar}>
    <Svg width={ms(16)} height={ms(16)} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={colors.primaryLight} />
      <Path
        d="M8.5 10.2c.7-1 1.7-1.5 2.7-1.3"
        stroke={colors.primary}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      <Path
        d="M15.5 10.2c-.7-1-1.7-1.5-2.7-1.3"
        stroke={colors.primary}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      <Path
        d="M9 14.2c1.1 1.4 2.4 2 3 2s1.9-.6 3-2"
        stroke={colors.primary}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  </View>
);

const AIMessage = ({ text, bullets, time }: Props) => {
  const markdown = [
    text?.trim() || '',
    ...(bullets || []).map(item => `- ${item}`),
  ]
    .filter(Boolean)
    .join('\n\n');

  return (
    <View style={styles.row}>
      <BuddyMark />

      <View style={styles.card}>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Buddy</Text>
          <View style={styles.metaPill}>
            <Text style={styles.metaPillText}>AI</Text>
          </View>
        </View>

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
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingRight: spacing.md,
  },

  avatar: {
    width: ms(28),
    height: ms(28),
    borderRadius: ms(14),
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxs,
  },

  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderTopLeftRadius: radii.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },

  metaLabel: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  metaPill: {
    backgroundColor: colors.primaryLight,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
  },

  metaPillText: {
    color: colors.primaryDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.3,
  },

  time: {
    marginTop: spacing.md,
    fontSize: fontSize.xs,
    color: colors.muted,
    fontWeight: fontWeight.semibold,
  },
});
