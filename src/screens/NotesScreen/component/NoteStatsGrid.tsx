import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  CalenderIcon,
  DoubleTick,
  MySpcaes,
  NotesIcon,
} from '../../../../styles/icons';
import { COLORS } from './styles/color';
import {
  fontSize,
  fontWeight,
  ms,
  spacing,
} from '../../../theme';

const stats = [
  { id: 'total', label: 'Notes', value: '86', icon: 'notes' },
  { id: 'recent', label: 'Recent', value: '12', icon: 'calendar' },
  { id: 'saved', label: 'Saved', value: '8', icon: 'saved' },
  { id: 'shared', label: 'Shared', value: '5', icon: 'shared' },
];

const renderIcon = (icon: string) => {
  const iconColor = COLORS.icon;
  const size = ms(15);

  switch (icon) {
    case 'notes':
      return <NotesIcon width={size} height={size} color={iconColor} />;
    case 'calendar':
      return <CalenderIcon width={size} height={size} color={iconColor} />;
    case 'saved':
      return <DoubleTick width={size} height={size} color={iconColor} />;
    case 'shared':
      return <MySpcaes width={size} height={size} color={iconColor} />;
    default:
      return <NotesIcon width={size} height={size} color={iconColor} />;
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
    backgroundColor: COLORS.lightGray,
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
