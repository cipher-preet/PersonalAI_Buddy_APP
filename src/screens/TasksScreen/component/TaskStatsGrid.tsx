import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  CalenderIcon,
  DoubleTick,
  PriorityIcon,
} from '../../../../styles/icons';
import { COLORS } from './styles/color';
import {
  fontSize,
  fontWeight,
  ms,
  spacing,
} from '../../../theme';

const stats = [
  { id: 'today', label: 'Today', value: '12', icon: 'calendar' },
  { id: 'priority', label: 'Priority', value: '5', icon: 'flash' },
  { id: 'done', label: 'Done', value: '123', icon: 'check' },
];

const renderIcon = (icon: string) => {
  const iconColor = COLORS.primary;
  const size = ms(15);

  switch (icon) {
    case 'calendar':
      return <CalenderIcon width={size} height={size} color={iconColor} />;
    case 'flash':
      return <PriorityIcon width={size} height={size} color={iconColor} />;
    case 'check':
      return <DoubleTick width={size} height={size} color={iconColor} />;
    default:
      return <CalenderIcon width={size} height={size} color={iconColor} />;
  }
};

const TaskStatsGrid = () => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        {stats.map((item, index) => (
          <View key={item.id} style={styles.statItem}>
            {index > 0 ? <View style={styles.divider} /> : null}

            <View style={styles.statContent}>
              <View style={styles.iconWrap}>{renderIcon(item.icon)}</View>
              <Text style={styles.value}>{item.value}</Text>
              <Text style={styles.label}>{item.label}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default TaskStatsGrid;

const styles = StyleSheet.create({
  wrapper: {
    marginTop: spacing['2xl'],
  },

  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: ms(18),
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xs,
  },

  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  divider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: spacing.xs,
  },

  statContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },

  iconWrap: {
    width: ms(28),
    height: ms(28),
    borderRadius: ms(8),
    backgroundColor: COLORS.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },

  value: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.extrabold,
    color: COLORS.black,
    lineHeight: ms(24),
  },

  label: {
    marginTop: spacing.xxs,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: COLORS.gray,
    textAlign: 'center',
  },
});
