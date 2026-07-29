import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { COLORS } from '../styles/colors';

const activities = [
  { title: 'Completed UI Design', time: '2 hours ago' },
  { title: 'New workspace created', time: '5 hours ago' },
  { title: 'Invited Sarah to team', time: 'Yesterday' },
];

const ActivityCard = () => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.heading}>Recent Activity</Text>

      <View style={styles.card}>
        {activities.map((item, index) => (
          <View
            key={index}
            style={[
              styles.row,
              index < activities.length - 1 && styles.rowBorder,
            ]}
          >
            <View style={styles.dot} />
            <View style={styles.rowContent}>
              <Text style={styles.text}>{item.title}</Text>
              <Text style={styles.time}>{item.time}</Text>
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
    marginBottom: 18,
  },

  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primaryPurple,
    marginTop: 6,
    marginRight: 12,
  },

  rowContent: {
    flex: 1,
  },

  text: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },

  time: {
    marginTop: 3,
    color: COLORS.subText,
    fontSize: 12,
    fontWeight: '500',
  },
});
