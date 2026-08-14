import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../theme';

type Props = {
  value: Date;
  onChange: (date: Date) => void;
  onComplete?: () => void;
};

const HOURS = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTES = Array.from({ length: 12 }, (_, index) => index * 5);
const PERIODS = ['AM', 'PM'] as const;
const COLUMNS = 6;

const chunk = <T,>(items: T[], size: number) => {
  const rows: T[][] = [];

  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }

  return rows;
};

const HOUR_ROWS = chunk(HOURS, COLUMNS);
const MINUTE_ROWS = chunk(MINUTES, COLUMNS);

const ReminderTimePicker = ({ value, onChange, onComplete }: Props) => {
  const appear = useRef(new Animated.Value(0)).current;

  const hour24 = value.getHours();
  const minute = value.getMinutes();
  const period: 'AM' | 'PM' = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const roundedMinute = (Math.round(minute / 5) * 5) % 60;

  useEffect(() => {
    Animated.timing(appear, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [appear]);

  const applyTime = (
    nextHour12: number,
    nextMinute: number,
    nextPeriod: 'AM' | 'PM',
  ) => {
    const next = new Date(value);
    let hour = nextHour12 % 12;

    if (nextPeriod === 'PM') {
      hour += 12;
    }

    next.setHours(hour, nextMinute, 0, 0);
    onChange(next);
  };

  const translateY = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [ms(10), 0],
  });

  return (
    <Animated.View
      style={[styles.card, { opacity: appear, transform: [{ translateY }] }]}
    >
      <View style={styles.previewRow}>
        <Text style={styles.preview}>
          {`${hour12}:${String(roundedMinute).padStart(2, '0')}`}
        </Text>
        <Text style={styles.previewPeriod}>{period}</Text>
      </View>

      <Text style={styles.columnLabel}>Hour</Text>
      {HOUR_ROWS.map((row, rowIndex) => (
        <View key={`hour-row-${rowIndex}`} style={styles.row}>
          {row.map(hour => {
            const active = hour === hour12;

            return (
              <TouchableOpacity
                key={hour}
                activeOpacity={0.85}
                style={[styles.cell, active && styles.cellActive]}
                onPress={() => applyTime(hour, roundedMinute, period)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text
                  style={[styles.cellText, active && styles.cellTextActive]}
                >
                  {hour}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      <Text style={[styles.columnLabel, styles.columnLabelSpaced]}>Minute</Text>
      {MINUTE_ROWS.map((row, rowIndex) => (
        <View key={`minute-row-${rowIndex}`} style={styles.row}>
          {row.map(min => {
            const active = min === roundedMinute;

            return (
              <TouchableOpacity
                key={min}
                activeOpacity={0.85}
                style={[styles.cell, active && styles.cellActive]}
                onPress={() => {
                  applyTime(hour12, min, period);
                  onComplete?.();
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text
                  style={[styles.cellText, active && styles.cellTextActive]}
                >
                  {String(min).padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      <View style={styles.periodRow}>
        {PERIODS.map(item => {
          const active = item === period;

          return (
            <TouchableOpacity
              key={item}
              activeOpacity={0.85}
              style={[styles.periodOption, active && styles.periodOptionActive]}
              onPress={() => applyTime(hour12, roundedMinute, item)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.periodText, active && styles.periodTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
};

export default ReminderTimePicker;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    marginBottom: spacing.sm,
  },

  previewRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  preview: {
    color: colors.text,
    fontSize: ms(30),
    lineHeight: ms(34),
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.8,
  },

  previewPeriod: {
    color: colors.primary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    marginBottom: ms(4),
  },

  columnLabel: {
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.3,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },

  columnLabelSpaced: {
    marginTop: spacing.md,
  },

  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },

  cell: {
    flex: 1,
    height: ms(40),
    borderRadius: radii.md,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },

  cellActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  cellText: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  cellTextActive: {
    color: colors.white,
    fontWeight: fontWeight.bold,
  },

  periodRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  periodOption: {
    flex: 1,
    minHeight: ms(40),
    borderRadius: radii.lg,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },

  periodOptionActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.brandBorder,
  },

  periodText: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  periodTextActive: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
});
