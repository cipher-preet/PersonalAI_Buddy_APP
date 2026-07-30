import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from './styles/color';

type Props = {
  totalNotes: number;
};

const NotesProgressCard = ({ totalNotes }: Props) => {
  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <View style={styles.cardHeader}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>My library</Text>
          </View>
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Active</Text>
          </View>
        </View>

        <View style={styles.mainRow}>
          <View style={styles.primaryStat}>
            <Text style={styles.totalValue}>{totalNotes}</Text>
            <Text style={styles.totalLabel}>Notes saved</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default NotesProgressCard;

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 18,
  },

  container: {
    borderRadius: 20,
    padding: 18,
    overflow: 'hidden',
  },

  glowTop: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },

  glowBottom: {
    position: 'absolute',
    bottom: -40,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },

  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },

  liveText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 10,
    fontWeight: '700',
  },

  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 76,
  },

  primaryStat: {
    flex: 1,
  },

  totalValue: {
    color: COLORS.white,
    fontSize: 40,
    fontWeight: '900',
    lineHeight: 44,
    letterSpacing: -1,
  },

  totalLabel: {
    marginTop: 2,
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 14,
    fontWeight: '600',
  },
});
