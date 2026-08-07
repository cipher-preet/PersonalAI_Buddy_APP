import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from './styles/color';
import {
  fontSize,
  fontWeight,
  ms,
  mvs,
  radii,
  spacing,
} from '../../../theme';

type Props = {
  totalNotes: number;
};

const NotesProgressCard = ({ totalNotes }: Props) => {
  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark, '#312E81']}
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
    marginTop: ms(18),
  },

  container: {
    borderRadius: radii.xl,
    padding: ms(18),
    overflow: 'hidden',
  },

  glowTop: {
    position: 'absolute',
    top: ms(-30),
    right: ms(-20),
    width: ms(120),
    height: ms(120),
    borderRadius: ms(60),
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },

  glowBottom: {
    position: 'absolute',
    bottom: ms(-40),
    left: ms(-20),
    width: ms(100),
    height: ms(100),
    borderRadius: ms(50),
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing['2xl'],
  },

  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  badgeText: {
    color: COLORS.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },

  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(5),
    paddingHorizontal: spacing.md,
    paddingVertical: ms(5),
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },

  liveDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: COLORS.successBright,
  },

  liveText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: ms(10),
    fontWeight: fontWeight.bold,
  },

  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: mvs(76),
  },

  primaryStat: {
    flex: 1,
  },

  totalValue: {
    color: COLORS.white,
    fontSize: ms(40),
    fontWeight: fontWeight.extrabold,
    lineHeight: ms(44),
    letterSpacing: -1,
  },

  totalLabel: {
    marginTop: spacing.xxs,
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
});
