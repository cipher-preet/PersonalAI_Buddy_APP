import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { HomeIcon, LinkArrow } from '../../../../styles/icons';

type Props = {
  item: {
    tag: string;
    title: string;
    desc: string;
    time: string;
  };
};

const NoteCard = ({ item }: Props) => {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.container}>
      <View style={styles.top}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.tag}</Text>
        </View>

        <View style={styles.rightTop}>
          <Text style={styles.time}>{item.time}</Text>
          <TouchableOpacity activeOpacity={0.8} style={styles.linkButton}>
            <LinkArrow width={13} height={13} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>

      <Text numberOfLines={2} style={styles.title}>
        {item.title}
      </Text>

      <Text numberOfLines={2} style={styles.desc}>
        {item.desc}
      </Text>

      <View style={styles.footer}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>#AI</Text>
        </View>

        <View style={styles.pill}>
          <Text style={styles.pillText}>#Interview</Text>
        </View>

        <View style={styles.spacer} />

        {/* <View style={styles.bottomIcon}>
          <HomeIcon width={14} height={14} color="#7B8794" />
        </View> */}
      </View>
    </TouchableOpacity>
  );
};

export default NoteCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',

    borderRadius: 24,

    padding: 18,

    marginBottom: 16,

    borderWidth: 1,
    borderColor: '#EEF2F6',

    shadowColor: '#CBD5E1',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  tag: {
    backgroundColor: '#EEF7F3',

    paddingHorizontal: 12,
    paddingVertical: 6,

    borderRadius: 10,
  },

  tagText: {
    color: '#5E8B7E',

    fontSize: 11,

    fontWeight: '700',

    letterSpacing: 0.3,
  },

  rightTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  time: {
    color: '#94A3B8',

    fontSize: 12,

    fontWeight: '500',

    marginRight: 10,
  },

  linkButton: {
    width: 28,
    height: 28,

    borderRadius: 10,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#F8FAFC',

    borderWidth: 1,
    borderColor: '#EEF2F6',
  },

  title: {
    marginTop: 16,

    color: '#1E293B',

    fontSize: 17,

    fontWeight: '700',

    lineHeight: 24,

    letterSpacing: -0.2,
  },

  desc: {
    marginTop: 10,

    color: '#7B8794',

    fontSize: 13.5,

    lineHeight: 22,

    fontWeight: '500',
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',

    marginTop: 18,
  },

  pill: {
    backgroundColor: '#F7F9FB',

    paddingHorizontal: 12,
    paddingVertical: 7,

    borderRadius: 12,

    marginRight: 10,
  },

  pillText: {
    color: '#6B7280',

    fontSize: 12,

    fontWeight: '600',
  },

  spacer: {
    flex: 1,
  },

  bottomIcon: {
    width: 30,
    height: 30,

    borderRadius: 10,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#F8FAFC',
  },
});
