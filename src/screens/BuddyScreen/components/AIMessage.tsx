import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import BulletPoint from './BulletPoint';
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
  text?: string;
  bullets?: string[];
  time?: string;
};

const AIMessage = ({ text, bullets, time }: Props) => {
  return (
    <View style={styles.row}>
      <View style={styles.bubble}>
        {text ? <Text style={styles.text}>{text}</Text> : null}

        {bullets?.map((item, index) => (
          <BulletPoint key={index} text={item} />
        ))}

        {time ? <Text style={styles.time}>{time}</Text> : null}
      </View>
    </View>
  );
};

export default AIMessage;

const styles = StyleSheet.create({
  row: {
    marginTop: spacing.md,
    alignItems: 'flex-start',
  },

  bubble: {
    maxWidth: '88%',
    backgroundColor: COLORS.aiBubble,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: ms(13),
    borderRadius: radii.xl,
    borderBottomLeftRadius: radii.xs,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: ms(4) },
    shadowOpacity: 0.05,
    shadowRadius: ms(10),
    elevation: 2,
  },

  text: {
    fontSize: fontSize.lg,
    lineHeight: ms(22),
    color: COLORS.text,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xxs,
  },

  time: {
    marginTop: spacing.md,
    fontSize: ms(10),
    color: COLORS.muted,
    fontWeight: fontWeight.semibold,
  },
});
