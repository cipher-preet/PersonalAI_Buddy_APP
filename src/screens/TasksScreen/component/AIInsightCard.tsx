import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { AiInsightIcon, BrainIcon, HomeIcon } from '../../../../styles/icons';
import { COLORS } from '../component/styles/color';

const AIInsightCard = () => {
  return (
    <>
      <View style={styles.header}>
        <View style={styles.left}>
          <View style={styles.iconBox}>
            <AiInsightIcon width={18} height={18}/>
          </View>

          <Text style={styles.heading}>AI Insights</Text>
        </View>

        <TouchableOpacity>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.top}>
          <View style={styles.aiCircle}>
            <BrainIcon width={18} height={18} />
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Focus Suggestion</Text>

            <Text style={styles.description}>
              You have 3 infrastructure tasks due tomorrow. Recommend focusing
              on Database Refactoring next.
            </Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>High Impact</Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.startButton}>
            <Text style={styles.startText}>Start Task</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default AIInsightCard;

const styles = StyleSheet.create({
  header: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.purpleLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  heading: {
    color: COLORS.black,
    fontSize: 18,
    fontWeight: '800',
  },

  viewAll: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },

  card: {
    marginTop: 14,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
  },

  top: {
    flexDirection: 'row',
  },

  aiCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.purpleLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  content: {
    flex: 1,
  },

  title: {
    color: COLORS.black,
    fontWeight: '800',
    fontSize: 15,
  },

  description: {
    marginTop: 4,
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 18,
  },

  badge: {
    backgroundColor: COLORS.purpleLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },

  badgeText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 10,
  },

  buttons: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  startButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
  },

  startText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 12,
  },

  dismissText: {
    marginLeft: 16,
    color: COLORS.gray,
    fontWeight: '600',
    fontSize: 12,
  },
});
