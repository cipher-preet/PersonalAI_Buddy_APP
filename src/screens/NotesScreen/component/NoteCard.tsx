import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { LinkArrow } from '../../../../styles/icons';
import { COLORS } from './styles/color';
import { NoteItem } from '../types/note';
import {
  fontSize,
  fontWeight,
  ms,
  radii,
  shadows,
  spacing,
} from '../../../theme';

type Props = {
  item: NoteItem;
  onPress: () => void;
  onDelete?: () => void;
};

const TrashIcon = ({ color = COLORS.errorDark }: { color?: string }) => (
  <Svg width={ms(15)} height={ms(15)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8 12h8"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const NoteCard = ({ item, onPress, onDelete }: Props) => {
  const displayDate = item.updatedAt || item.createdAt;

  return (
    <View style={styles.shadowWrap}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.container}
        onPress={onPress}
      >
        <View style={styles.top}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.tag}</Text>
          </View>

          <View style={styles.datePill}>
            <Text style={styles.date}>{displayDate}</Text>
          </View>
        </View>

        <View style={styles.bodyRow}>
          <View style={styles.textContent}>
            <Text numberOfLines={1} style={styles.title}>
              {item.title}
            </Text>

            <Text numberOfLines={2} style={styles.desc}>
              {item.desc}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.deleteButton}
              onPress={event => {
                event.stopPropagation();
                onDelete?.();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <TrashIcon />
            </TouchableOpacity>
            <View style={styles.linkButton}>
              <LinkArrow width={ms(12)} height={ms(12)} color={COLORS.icon} />
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          {item.tags.slice(0, 2).map(tag => (
            <View key={tag} style={styles.pill}>
              <Text style={styles.pillText}>{tag}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default NoteCard;

const styles = StyleSheet.create({
  shadowWrap: {
    marginBottom: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: COLORS.white,
    ...shadows.soft,
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },

  container: {
    backgroundColor: COLORS.white,
    borderRadius: radii.xl,
    paddingHorizontal: ms(14),
    paddingVertical: spacing.xl,
    overflow: 'hidden',
  },

  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  tag: {
    backgroundColor: COLORS.purpleLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.xs,
  },

  tagText: {
    color: COLORS.primaryDark,
    fontSize: ms(10),
    fontWeight: fontWeight.bold,
    letterSpacing: 0.3,
  },

  datePill: {
    maxWidth: ms(124),
    paddingHorizontal: ms(9),
    paddingVertical: ms(5),
    borderRadius: radii.pill,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },

  date: {
    color: COLORS.gray,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },

  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
  },

  textContent: {
    flex: 1,
    paddingRight: spacing.xl,
  },

  actions: {
    width: ms(68),
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: ms(7),
  },

  deleteButton: {
    width: ms(30),
    height: ms(30),
    borderRadius: ms(15),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 1,
  },

  linkButton: {
    width: ms(30),
    height: ms(30),
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },

  title: {
    color: COLORS.black,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    lineHeight: ms(20),
    letterSpacing: -0.2,
  },

  desc: {
    marginTop: spacing.xs,
    color: COLORS.gray,
    fontSize: fontSize.sm,
    lineHeight: ms(18),
    fontWeight: fontWeight.medium,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },

  pill: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: ms(8),
  },

  pillText: {
    color: COLORS.gray,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
});
