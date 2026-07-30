import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  CalenderIcon,
  DoubleTick,
  MySpcaes,
  NotesIcon,
} from '../../../../styles/icons';
import { COLORS } from './styles/color';

const stats = [
  { id: 'total', label: 'Notes', value: '86', icon: 'notes' },
  { id: 'recent', label: 'Recent', value: '12', icon: 'calendar' },
  { id: 'saved', label: 'Saved', value: '8', icon: 'saved' },
  { id: 'shared', label: 'Shared', value: '5', icon: 'shared' },
];

const renderIcon = (icon: string) => {
  const iconColor = COLORS.icon;

  switch (icon) {
    case 'notes':
      return <NotesIcon width={15} height={15} color={iconColor} />;
    case 'calendar':
      return <CalenderIcon width={15} height={15} color={iconColor} />;
    case 'saved':
      return <DoubleTick width={15} height={15} color={iconColor} />;
    case 'shared':
      return <MySpcaes width={15} height={15} color={iconColor} />;
    default:
      return <NotesIcon width={15} height={15} color={iconColor} />;
  }
};

const NoteStatsGrid = () => {
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

export default NoteStatsGrid;

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
    backgroundColor: COLORS.lightGray,
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
