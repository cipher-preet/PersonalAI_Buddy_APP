import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../styles/colors';

const activities = [
  'Completed UI Design',
  'New Workspace created',
  'Invited Sarah to team',
];

const ActivityCard = () => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.heading}>
        Recent Activity
      </Text>

      <View style={styles.card}>
        {activities.map((item, index) => (
          <View key={index} style={styles.row}>
            <View style={styles.dot} />

            <View>
              <Text style={styles.text}>
                {item}
              </Text>

              <Text style={styles.time}>
                2 hours ago
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ActivityCard;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
  },

  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,

    marginBottom: 14,
  },

  card: {
    backgroundColor: COLORS.white,

    borderRadius: 22,

    padding: 18,
  },

  row: {
    flexDirection: 'row',

    marginBottom: 18,
  },

  dot: {
    width: 10,
    height: 10,

    borderRadius: 5,

    backgroundColor: COLORS.primary,

    marginTop: 6,
    marginRight: 12,
  },

  text: {
    fontWeight: '600',
    color: COLORS.text,
  },

  time: {
    marginTop: 4,

    color: COLORS.subText,
    fontSize: 12,
  },
});