import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import { HomeIcon, LinkArrow, MySpcaes } from '../../../../styles/icons';

const WorkspaceCard = () => {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.wrapper}>
      <LinearGradient
        colors={['#FFFFFF', '#F6F8FB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.top}>
          <View style={styles.iconContainer}>
            <MySpcaes width={18} height={18} color="#000000" />
          </View>

          <TouchableOpacity activeOpacity={0.7} style={styles.menuButton}>
            <LinkArrow width={18} height={18} color="#000000" />
          </TouchableOpacity>
        </View>

        <Text numberOfLines={1} style={styles.title}>
          AI Hiring Platform
        </Text>

        <Text numberOfLines={2} style={styles.description}>
          Smart workspace for resumes, interviews and AI automation notes.
        </Text>

        <View style={styles.footer}>
          <View style={styles.noteBadge}>
            <Text style={styles.noteText}>24 Notes</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default WorkspaceCard;

const styles = StyleSheet.create({
  wrapper: {
    marginRight: 14,
  },

  container: {
    width: 245,

    borderRadius: 26,

    padding: 18,

    borderWidth: 1,
    borderColor: '#EEF2F6',

    shadowColor: '#CBD5E1',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 4,
  },

  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  iconContainer: {
    width: 42,
    height: 42,

    borderRadius: 14,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#E8F3EF',
  },

  menuButton: {
    width: 32,
    height: 32,

    borderRadius: 12,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#F8FAFC',
  },

  title: {
    marginTop: 18,

    fontSize: 18,
    fontWeight: '700',

    color: '#1E293B',

    letterSpacing: -0.3,
  },

  description: {
    marginTop: 8,

    fontSize: 13,
    lineHeight: 21,

    color: '#7B8794',

    fontWeight: '500',
  },

  footer: {
    marginTop: 20,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  noteBadge: {
    backgroundColor: '#EEF7F3',

    paddingHorizontal: 12,
    paddingVertical: 7,

    borderRadius: 12,
  },

  noteText: {
    fontSize: 12,
    fontWeight: '700',

    color: '#5E8B7E',
  },

  members: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 26,
    height: 26,

    borderRadius: 20,

    backgroundColor: '#A7D7C5',

    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  avatarSecond: {
    marginLeft: -8,
    backgroundColor: '#C7B8EA',
  },

  avatarThird: {
    marginLeft: -8,
    backgroundColor: '#F5CBA7',
  },
});
