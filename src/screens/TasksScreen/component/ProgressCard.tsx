import React from 'react';
import { View, Text, StyleSheet, DimensionValue } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from './styles/color';

type Props = {
  totalTasks: number;
  doneTasks: number;
};

const ProgressCard = ({ totalTasks, doneTasks }: Props) => {
  const completionPercent =
    totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);
  const progressWidth = `${completionPercent}%` as DimensionValue;

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <View style={styles.cardHeader}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>My progress</Text>
          </View>
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>On track</Text>
          </View>
        </View>

        <View style={styles.mainRow}>
          <View style={styles.primaryStat}>
            <Text style={styles.totalValue}>{completionPercent}%</Text>
            <Text style={styles.totalLabel}>Completion rate</Text>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: progressWidth }]} />
            </View>

            <View style={styles.countRow}>
              <Text style={styles.countText}>
                {doneTasks} of {totalTasks} tasks done
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default ProgressCard;

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 18,
  },

  container: {
    borderRadius: 20,
    padding: 18,
    overflow: 'hidden',
  },

  glowTop: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },

  glowBottom: {
    position: 'absolute',
    bottom: -40,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },

  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },

  liveText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 10,
    fontWeight: '700',
  },

  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 96,
  },

  primaryStat: {
    flex: 1,
  },

  totalValue: {
    color: COLORS.white,
    fontSize: 40,
    fontWeight: '900',
    lineHeight: 44,
    letterSpacing: -1,
  },

  totalLabel: {
    marginTop: 2,
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 14,
    fontWeight: '600',
  },

  progressTrack: {
    height: 8,
    marginTop: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },

  countRow: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },

  countText: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 11,
    fontWeight: '700',
  },
});
