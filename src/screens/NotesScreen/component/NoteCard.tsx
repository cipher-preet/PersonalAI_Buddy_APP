import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { LinkArrow } from '../../../../styles/icons';
import { COLORS } from './styles/color';
import { NoteItem } from '../types/note';

type Props = {
  item: NoteItem;
  onPress: () => void;
};

const NoteCard = ({ item, onPress }: Props) => {
  return (
    <View style={styles.shadowWrap}>
      <TouchableOpacity activeOpacity={0.9} style={styles.container} onPress={onPress}>
        <View style={styles.top}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.tag}</Text>
          </View>

          <View style={styles.rightTop}>
            <Text style={styles.time}>{item.time}</Text>
            <View style={styles.linkButton}>
              <LinkArrow width={12} height={12} color={COLORS.icon} />
            </View>
          </View>
        </View>

        <Text numberOfLines={1} style={styles.title}>
          {item.title}
        </Text>

        <Text numberOfLines={1} style={styles.desc}>
          {item.desc}
        </Text>

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

  time: {
    color: COLORS.gray,
    fontSize: 11,
    fontWeight: '500',
    marginRight: 8,
  },

  linkButton: {
    width: 24,
    height: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },

  title: {
    marginTop: 10,
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
    lineHeight: 17,
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
