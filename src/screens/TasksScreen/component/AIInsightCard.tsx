import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { AiInsightIcon, BrainIcon } from '../../../../styles/icons';
import { COLORS } from './styles/color';
import {
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../theme';

const AIInsightCard = () => {
  return (
    <>
      <View style={styles.header}>
        <View style={styles.left}>
          <View style={styles.iconBox}>
            <AiInsightIcon width={ms(18)} height={ms(18)} />
          </View>

          <Text style={styles.heading}>AI Insights</Text>
        </View>

        <TouchableOpacity>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.top}>
          <View style={styles.aiCircle}>
            <BrainIcon width={ms(18)} height={ms(18)} />
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Focus Suggestion</Text>

            <Text style={styles.description}>
              You have 3 infrastructure tasks due tomorrow. Recommend focusing
              on Database Refactoring next.
            </Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>High Impact</Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.startButton}>
            <Text style={styles.startText}>Start Task</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default AIInsightCard;

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBox: {
    width: ms(24),
    height: ms(24),
    borderRadius: ms(12),
    backgroundColor: COLORS.purpleLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  heading: {
    color: COLORS.black,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extrabold,
  },

  viewAll: {
    color: COLORS.primary,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.sm,
  },

  card: {
    marginTop: ms(14),
    backgroundColor: COLORS.white,
    borderRadius: radii['3xl'],
    padding: spacing['2xl'],
  },

  top: {
    flexDirection: 'row',
  },

  aiCircle: {
    width: ms(38),
    height: ms(38),
    borderRadius: ms(19),
    backgroundColor: COLORS.purpleLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xl,
  },

  content: {
    flex: 1,
  },

  title: {
    color: COLORS.black,
    fontWeight: fontWeight.extrabold,
    fontSize: fontSize.lg,
  },

  description: {
    marginTop: spacing.xs,
    color: COLORS.gray,
    fontSize: fontSize.sm,
    lineHeight: ms(18),
  },

  badge: {
    backgroundColor: COLORS.purpleLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: ms(5),
    borderRadius: radii.xl,
    alignSelf: 'flex-start',
  },

  badgeText: {
    color: COLORS.primary,
    fontWeight: fontWeight.bold,
    fontSize: ms(10),
  },

  buttons: {
    marginTop: ms(18),
    flexDirection: 'row',
    alignItems: 'center',
  },

  startButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: ms(18),
    paddingVertical: spacing.lg,
    borderRadius: ms(14),
  },

  startText: {
    color: COLORS.white,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.sm,
  },

  dismissText: {
    marginLeft: spacing['2xl'],
    color: COLORS.gray,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.sm,
  },
});
