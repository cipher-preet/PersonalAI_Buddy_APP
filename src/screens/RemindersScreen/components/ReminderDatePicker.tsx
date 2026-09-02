import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

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
  embedded?: boolean;
};

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const CELL = ms(36);

const Chevron = ({
  direction,
  color = colors.text,
}: {
  direction: 'left' | 'right';
  color?: string;
}) => (
  <Svg width={ms(16)} height={ms(16)} viewBox="0 0 24 24" fill="none">
    <Path
      d={direction === 'left' ? 'M15 18 9 12l6-6' : 'm9 18 6-6-6-6'}
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number) => {
  const next = startOfDay(date);
  next.setDate(next.getDate() + days);
  return next;
};

const startOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const buildWeeks = (cursor: Date) => {
  const first = startOfMonth(cursor);
  const gridStart = addDays(first, -first.getDay());
  const weeks: Date[][] = [];
  const cursorDay = new Date(gridStart);

  for (let week = 0; week < 6; week += 1) {
    const row: Date[] = [];
    for (let day = 0; day < 7; day += 1) {
      row.push(new Date(cursorDay));
      cursorDay.setDate(cursorDay.getDate() + 1);
    }
    weeks.push(row);
  }

  return weeks;
};

const ReminderDatePicker = ({
  value,
  onChange,
  onComplete,
  embedded = false,
}: Props) => {
  const [cursor, setCursor] = useState(() => startOfMonth(value));
  const appear = useRef(new Animated.Value(embedded ? 1 : 0)).current;
  const monthFade = useRef(new Animated.Value(1)).current;
  const today = startOfDay(new Date());

  useEffect(() => {
    if (embedded) {
      return;
    }
    Animated.timing(appear, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [appear, embedded]);

  useEffect(() => {
    setCursor(prev => {
      const next = startOfMonth(value);
      return prev.getTime() === next.getTime() ? prev : next;
    });
  }, [value]);

  const weeks = useMemo(() => buildWeeks(cursor), [cursor]);
  const monthLabel = cursor.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const shiftMonth = (delta: number) => {
    monthFade.setValue(0);
    setCursor(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    Animated.timing(monthFade, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const selectDate = (day: Date) => {
    const next = new Date(value);
    next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    onChange(next);
    onComplete?.();
  };

  const shortcuts = [
    { label: 'Today', date: today },
    { label: 'Tomorrow', date: addDays(today, 1) },
    { label: 'Next week', date: addDays(today, 7) },
  ];

  const cardTranslate = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [ms(10), 0],
  });

  return (
    <Animated.View
      style={[
        !embedded && styles.card,
        !embedded && { opacity: appear, transform: [{ translateY: cardTranslate }] },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.navButton}
          onPress={() => shiftMonth(-1)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
        >
          <Chevron direction="left" />
        </TouchableOpacity>

        <Text style={styles.monthLabel}>{monthLabel}</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.navButton}
          onPress={() => shiftMonth(1)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Next month"
        >
          <Chevron direction="right" />
        </TouchableOpacity>
      </View>

      <View style={styles.shortcutRow}>
        {shortcuts.map(item => {
          const active = sameDay(item.date, value);
          return (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.85}
              style={[styles.shortcut, active && styles.shortcutActive]}
              onPress={() => selectDate(item.date)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text
                style={[styles.shortcutText, active && styles.shortcutTextActive]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((day, index) => (
          <View key={`${day}-${index}`} style={styles.cell}>
            <Text style={styles.weekday}>{day}</Text>
          </View>
        ))}
      </View>

      <Animated.View style={{ opacity: monthFade }}>
        {weeks.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} style={styles.weekRow}>
            {week.map(day => {
              const inMonth = day.getMonth() === cursor.getMonth();
              const selected = sameDay(day, value);
              const isToday = sameDay(day, today);

              return (
                <View key={day.toISOString()} style={styles.cell}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={[
                      styles.dayButton,
                      selected && styles.daySelected,
                      !selected && isToday && styles.dayToday,
                    ]}
                    onPress={() => selectDate(day)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        !inMonth && styles.dayMuted,
                        selected && styles.dayTextSelected,
                        !selected && isToday && styles.dayTextToday,
                      ]}
                    >
                      {day.getDate()}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ))}
      </Animated.View>
    </Animated.View>
  );
};

export default ReminderDatePicker;

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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.md,
  },

  navButton: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(12),
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  monthLabel: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.2,
  },

  shortcutRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  shortcut: {
    flex: 1,
    minHeight: ms(32),
    borderRadius: radii.pill,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  shortcutActive: {
    backgroundColor: colors.primaryLight,
  },

  shortcutText: {
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },

  shortcutTextActive: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },

  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  cell: {
    flex: 1,
    height: CELL,
    alignItems: 'center',
    justifyContent: 'center',
  },

  weekday: {
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },

  dayButton: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    alignItems: 'center',
    justifyContent: 'center',
  },

  daySelected: {
    backgroundColor: colors.primary,
  },

  dayToday: {
    backgroundColor: colors.primaryLight,
  },

  dayText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  dayMuted: {
    color: colors.muted,
  },

  dayTextSelected: {
    color: colors.white,
    fontWeight: fontWeight.bold,
  },

  dayTextToday: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
});
