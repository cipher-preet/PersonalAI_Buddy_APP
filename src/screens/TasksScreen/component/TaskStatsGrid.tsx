import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  CalenderIcon,
  DoubleTick,
  PriorityIcon,
} from '../../../../styles/icons';
import { COLORS } from './styles/color';

const stats = [
  { id: 'today', label: 'Today', value: '12', icon: 'calendar' },
  { id: 'priority', label: 'Priority', value: '5', icon: 'flash' },
  { id: 'done', label: 'Done', value: '123', icon: 'check' },
];

const renderIcon = (icon: string) => {
  const iconColor = COLORS.primary;

  switch (icon) {
    case 'calendar':
      return <CalenderIcon width={15} height={15} color={iconColor} />;
    case 'flash':
      return <PriorityIcon width={15} height={15} color={iconColor} />;
    case 'check':
      return <DoubleTick width={15} height={15} color={iconColor} />;
    default:
      return <CalenderIcon width={15} height={15} color={iconColor} />;
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
    marginTop: 16,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 16,
    paddingHorizontal: 4,
  },

  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  divider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },

  statContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  value: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.black,
    lineHeight: 24,
  },

  label: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray,
    textAlign: 'center',
  },
});
