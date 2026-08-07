import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { COLORS } from '../styles/colors';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../theme';

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
    marginBottom: spacing['2xl'],
  },

  heading: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: COLORS.text,
    marginBottom: spacing.xl,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: radii.xl,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.xl,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },

  dot: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: COLORS.primaryPurple,
    marginTop: spacing.sm,
    marginRight: spacing.xl,
  },

  rowContent: {
    flex: 1,
  },

  text: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: COLORS.text,
  },

  time: {
    marginTop: spacing.xxs,
    color: COLORS.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
});
