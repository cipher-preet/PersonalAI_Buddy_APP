import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../styles/colors';

const WeeklyGoalCard = () => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>
          Weekly Goal
        </Text>

        <Text style={styles.subTitle}>
          15 days streak 🔥
        </Text>

        <View style={styles.progressBar}>
          <View style={styles.progress} />
        </View>
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

    borderRadius: 22,

    padding: 18,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    marginBottom: 22,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },

  subTitle: {
    marginTop: 4,
    marginBottom: 12,

    color: COLORS.subText,
    fontSize: 13,
  },

  progressBar: {
    width: 120,
    height: 6,

    backgroundColor: '#EAE3FF',

    borderRadius: 999,
  },

  progress: {
    width: '88%',
    height: '100%',

    backgroundColor: COLORS.primary,

    borderRadius: 999,
  },

  circle: {
    width: 64,
    height: 64,

    borderRadius: 32,

    borderWidth: 5,
    borderColor: COLORS.primary,

    justifyContent: 'center',
    alignItems: 'center',
  },

  percent: {
    fontWeight: '700',
    color: COLORS.text,
  },
});