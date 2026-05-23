import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';

import {stats} from '../TaskScreen';
import StatCard from './StatCard';

const TaskStatsGrid = () => {
  return (
    <View style={styles.container}>
      {stats.map((item, index) => (
        <StatCard
          key={index}
          item={item}
        />
      ))}
    </View>
  );
};

export default TaskStatsGrid;

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});