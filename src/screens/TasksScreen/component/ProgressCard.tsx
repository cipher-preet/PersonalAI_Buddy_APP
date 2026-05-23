import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../component/styles/color';

const ProgressCard = () => {
  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryDark]}
      style={styles.container}
    >
      <View>
        <Text style={styles.label}>COMPLETION</Text>

        <Text style={styles.percent}>94%</Text>

        <Text style={styles.text}>Productivity is up!</Text>

        <Text style={styles.subText}>+12% from last week</Text>
      </View>

      <View style={styles.circle}>
        <View style={styles.innerCircle}>
          <Text style={styles.taskCount}>146</Text>

          <Text style={styles.taskLabel}>TASKS</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

export default ProgressCard;

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  label: {
    color: '#E9D5FF',
    fontSize: 10,
    fontWeight: '700',
  },

  percent: {
    color: COLORS.white,
    fontSize: 42,
    fontWeight: '900',
  },

  text: {
    color: COLORS.white,
    fontWeight: '700',
  },

  subText: {
    color: '#E9D5FF',
    fontSize: 11,
    marginTop: 4,
  },

  circle: {
    width: 95,
    height: 95,
    borderRadius: 50,
    borderWidth: 6,
    borderColor: '#E9D5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  innerCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  taskCount: {
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 26,
  },

  taskLabel: {
    color: '#E9D5FF',
    fontSize: 10,
    fontWeight: '700',
  },
});
