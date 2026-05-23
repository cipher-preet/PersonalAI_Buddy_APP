import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../styles/colors';

const stats = [
  {
    value: '124',
    label: 'Tasks',
  },
  {
    value: '42h',
    label: 'Focus',
  },
  {
    value: '12',
    label: 'Projects',
  },
];

const StatsRow = () => {
  return (
    <View style={styles.container}>
      {stats.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.value}>
            {item.value}
          </Text>

          <Text style={styles.label}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default StatsRow;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',

    marginBottom: 18,
  },

  card: {
    width: '31%',

    backgroundColor: COLORS.white,

    borderRadius: 18,

    paddingVertical: 18,

    alignItems: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  value: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },

  label: {
    marginTop: 4,

    color: COLORS.subText,
    fontSize: 13,
  },
});