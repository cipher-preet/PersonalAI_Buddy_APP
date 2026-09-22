import React, { useState } from 'react';
import { LayoutAnimation, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../theme';

type FaqItem = {
  q: string;
  a: string;
};

type Props = {
  items: FaqItem[];
};

const ChevronIcon = ({ open }: { open: boolean }) => (
  <Svg width={ms(16)} height={ms(16)} viewBox="0 0 24 24" fill="none">
    <Path
      d={open ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'}
      stroke={colors.primary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const FaqList = ({ items }: Props) => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (index: number) => {
    LayoutAnimation.configureNext({
      duration: 220,
      update: { type: LayoutAnimation.Types.easeInEaseOut },
    });
    setOpenIndex(current => (current === index ? -1 : index));
  };

  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <Text style={styles.title}>Frequently asked</Text>
        <Text style={styles.subtitle}>
          Billing, languages, and switching plans — covered.
        </Text>
      </View>

      {items.map((item, index) => {
        const open = openIndex === index;

        return (
          <View
            key={item.q}
            style={[styles.item, index === items.length - 1 && styles.itemLast]}
          >
            <TouchableOpacity
              activeOpacity={0.82}
              style={styles.questionRow}
              onPress={() => toggle(index)}
              accessibilityRole="button"
              accessibilityState={{ expanded: open }}
            >
              <Text style={styles.question}>{item.q}</Text>
              <View style={[styles.chevron, open && styles.chevronOpen]}>
                <ChevronIcon open={open} />
              </View>
            </TouchableOpacity>
            {open ? <Text style={styles.answer}>{item.a}</Text> : null}
          </View>
        );
      })}
    </View>
  );
};

export default FaqList;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    padding: spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
  },

  heading: {
    marginBottom: spacing.md,
  },

  title: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extrabold,
  },

  subtitle: {
    marginTop: spacing.xs,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(18),
  },

  item: {
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },

  itemLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },

  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  question: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    lineHeight: ms(20),
  },

  chevron: {
    width: ms(28),
    height: ms(28),
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  chevronOpen: {
    backgroundColor: colors.primaryLight,
  },

  answer: {
    marginTop: spacing.md,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(20),
    paddingRight: spacing['4xl'],
  },
});
