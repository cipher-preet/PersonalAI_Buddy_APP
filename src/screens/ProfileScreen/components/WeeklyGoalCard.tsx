import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { COLORS } from '../styles/colors';

const WeeklyGoalCard = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Weekly Goal</Text>
          <View style={styles.streakPill}>
            <Text style={styles.streakText}>15 day streak</Text>
          </View>
        </View>

        <Text style={styles.subTitle}>
          You are close to completing this week's target.
        </Text>

        <View style={styles.progressBar}>
          <View style={styles.progress} />
        </View>

        <Text style={styles.progressLabel}>88% completed</Text>
      </View>

      <View style={styles.circle}>
        <Text style={styles.percent}>88%</Text>
      </View>
    </View>
  );
};

export default WeeklyGoalCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#EEF2FF',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },

  content: {
    flex: 1,
    paddingRight: 12,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },

  streakPill: {
    backgroundColor: COLORS.lightPurple,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },

  streakText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },

  subTitle: {
    fontSize: 12,
    color: COLORS.subText,
    lineHeight: 18,
    marginBottom: 12,
  },

  progressBar: {
    width: '100%',
    height: 7,
    backgroundColor: '#EEF2FF',
    borderRadius: 999,
    overflow: 'hidden',
  },

  progress: {
    width: '88%',
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 999,
  },

  progressLabel: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.muted,
  },

  circle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 4,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightPurple,
  },

  percent: {
    fontWeight: '800',
    fontSize: 14,
    color: COLORS.primary,
  },
});
