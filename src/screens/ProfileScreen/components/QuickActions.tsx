import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { HomeIcon } from '../../../../styles/icons';

import { COLORS } from '../styles/colors';
import {
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../theme';

const actions = [
  { title: 'Tasks', icon: 'create-outline' },
  { title: 'Projects', icon: 'folder-outline' },
  { title: 'Notes', icon: 'document-text-outline' },
  { title: 'Analytics', icon: 'pie-chart-outline' },
  { title: 'AI Assistant', icon: 'sparkles-outline' },
  { title: 'Team', icon: 'people-outline' },
];

const QuickActions = () => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.heading}>Quick Actions</Text>

      <View style={styles.grid}>
        {actions.map((item, index) => (
          <TouchableOpacity key={index} style={styles.card}>
            <View style={styles.iconBox}>
              <HomeIcon color={COLORS.primary} />
            </View>

            <Text style={styles.title}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default QuickActions;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing['4xl'],
  },

  heading: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: COLORS.text,
    marginBottom: spacing.xl,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  card: {
    width: '31%',
    backgroundColor: COLORS.white,
    borderRadius: radii.lg,
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  iconBox: {
    width: ms(42),
    height: ms(42),
    borderRadius: ms(14),
    backgroundColor: COLORS.lightPurple,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  title: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: COLORS.text,
  },
});
