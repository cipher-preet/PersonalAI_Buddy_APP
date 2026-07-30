import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { LinkArrow } from '../../../../styles/icons';
import { COLORS } from './styles/color';
import { NoteItem } from '../types/note';

type Props = {
  item: NoteItem;
  onPress: () => void;
  onDelete?: () => void;
};

const TrashIcon = ({ color = '#EF4444' }: { color?: string }) => (
  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
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
              <LinkArrow width={12} height={12} color={COLORS.icon} />
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
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },

  container: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    overflow: 'hidden',
  },

  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  tag: {
    backgroundColor: COLORS.purpleLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  tagText: {
    color: COLORS.primaryDark,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  rightTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  datePill: {
    maxWidth: 124,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },

  date: {
    color: COLORS.gray,
    fontSize: 11,
    fontWeight: '700',
  },

  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  textContent: {
    flex: 1,
    paddingRight: 12,
  },

  actions: {
    width: 68,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 7,
  },

  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 1,
  },

  linkButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },

  title: {
    color: COLORS.black,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    letterSpacing: -0.2,
  },

  desc: {
    marginTop: 4,
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },

  pill: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  pillText: {
    color: COLORS.gray,
    fontSize: 11,
    fontWeight: '600',
  },
});
