import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Text,
} from 'react-native';

import { HomeIcon } from '../../../../styles/icons';

const QuickActions = () => {
  return (
    <View style={styles.container}>
      <View style={styles.chipsWrapper}>
        <Pressable style={styles.chip}>
          <HomeIcon width={14} height={14} />

          <Text
            numberOfLines={1}
            style={styles.chipText}>
            Summarize
          </Text>
        </Pressable>

        <Pressable style={styles.chip}>
          <HomeIcon width={14} height={14} />

          <Text
            numberOfLines={1}
            style={styles.chipText}>
            Plan Day
          </Text>
        </Pressable>

        <Pressable style={styles.chip}>
          <HomeIcon width={14} height={14} />

          <Text
            numberOfLines={1}
            style={styles.chipText}>
            Draft Email
          </Text>
        </Pressable>

      </View>

      <View style={styles.cardsWrapper}>

        <Pressable style={styles.card}>

          <View style={styles.iconBox}>
            <HomeIcon width={20} height={20} />
          </View>

          <Text style={styles.cardTitle}>
            Analyze my{'\n'}schedule
          </Text>

        </Pressable>

        <Pressable style={styles.card}>

          <View style={styles.iconBox}>
            <HomeIcon width={20} height={20} />
          </View>

          <Text style={styles.cardTitle}>
            Generate task{'\n'}list
          </Text>

        </Pressable>

      </View>

    </View>
  );
};

export default QuickActions;

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    paddingHorizontal: 2,
  },


  chipsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 26,
    gap: 8,
  },

  chip: {
    flex: 1,

    height: 42,

    backgroundColor: '#FFFFFF',

    borderRadius: 24,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 10,
    gap: 6,
  },

  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',

    flexShrink: 1,
  },



  cardsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',

    gap: 14,
  },

  card: {
    flex: 1,

    minHeight: 155,

    backgroundColor: '#FFFFFF',

    borderRadius: 28,

    padding: 18,

    justifyContent: 'space-between',
  },

  iconBox: {
    width: 48,
    height: 48,

    borderRadius: 16,

    backgroundColor: '#F3F4FF',

    justifyContent: 'center',
    alignItems: 'center',
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',

    lineHeight: 26,
  },
});