import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';

import {
  HomeIcon,
  SchedulerIcon,
  SummaryIcon,
  TaskIcons,
} from '../../../../styles/icons';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../theme';

const QuickActions = () => {
  return (
    <View style={styles.container}>
      <View style={styles.chipsWrapper}>
        <Pressable style={styles.chip}>
          <SummaryIcon width={ms(14)} height={ms(14)} />

          <Text numberOfLines={1} style={styles.chipText}>
            Summarize
          </Text>
        </Pressable>

        <Pressable style={styles.chip}>
          <HomeIcon width={ms(14)} height={ms(14)} />

          <Text numberOfLines={1} style={styles.chipText}>
            Plan Day
          </Text>
        </Pressable>

        <Pressable style={styles.chip}>
          <TaskIcons width={ms(14)} height={ms(14)} />

          <Text numberOfLines={1} style={styles.chipText}>
            Plan a Task
          </Text>
        </Pressable>
      </View>

      <View style={styles.cardsWrapper}>
        <Pressable style={styles.card}>
          <View style={styles.iconBox}>
            <SchedulerIcon width={ms(20)} height={ms(20)} />
          </View>

          <Text style={styles.cardTitle}>
            Analyze my{'\n'}schedule
          </Text>
        </Pressable>

        <Pressable style={styles.card}>
          <View style={styles.iconBox}>
            <TaskIcons width={ms(20)} height={ms(20)} />
          </View>

          <Text style={styles.cardTitle}>
            Generate task{'\n'}list
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default QuickActions;

const styles = StyleSheet.create({
  container: {
    marginTop: ms(30),
    paddingHorizontal: spacing.xxs,
  },

  chipsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ms(26),
    gap: spacing.md,
  },

  chip: {
    flex: 1,
    height: ms(42),
    backgroundColor: colors.white,
    borderRadius: ms(24),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },

  chipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    flexShrink: 1,
  },

  cardsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xl,
  },

  card: {
    flex: 1,
    minHeight: ms(155),
    backgroundColor: colors.white,
    borderRadius: ms(28),
    padding: spacing['2xl'],
    justifyContent: 'space-between',
  },

  iconBox: {
    width: ms(48),
    height: ms(48),
    borderRadius: radii.lg,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    lineHeight: ms(26),
  },
});
