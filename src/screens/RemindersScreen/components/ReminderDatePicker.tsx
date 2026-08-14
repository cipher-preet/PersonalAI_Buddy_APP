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
};

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const CELL_HEIGHT = ms(40);

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

const startOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const buildWeeks = (cursor: Date) => {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const leadingBlanks = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<Date | null> = [];

  for (let i = 0; i < leadingBlanks; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks: Array<Array<Date | null>> = [];

  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return weeks;
};

const ReminderDatePicker = ({ value, onChange, onComplete }: Props) => {
  const [cursor, setCursor] = useState(() => startOfMonth(value));
  const appear = useRef(new Animated.Value(0)).current;
  const monthFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(appear, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [appear]);

  // Follow the selected date only when it lands in a different month.
  useEffect(() => {
    setCursor(prev => {
      const next = startOfMonth(value);
      return prev.getTime() === next.getTime() ? prev : next;
    });
  }, [value]);

  const weeks = useMemo(() => buildWeeks(cursor), [cursor]);
  const today = new Date();

  const monthLabel = cursor.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const shiftMonth = (delta: number) => {
    monthFade.setValue(0);
    setCursor(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    Animated.timing(monthFade, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const cardTranslate = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [ms(10), 0],
  });

  const gridTranslate = monthFade.interpolate({
    inputRange: [0, 1],
    outputRange: [ms(6), 0],
  });

  return (
    <Animated.View
      style={[
        styles.card,
        { opacity: appear, transform: [{ translateY: cardTranslate }] },
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

        <Animated.Text style={[styles.monthLabel, { opacity: monthFade }]}>
          {monthLabel}
        </Animated.Text>

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

      <View style={styles.weekRow}>
        {WEEKDAYS.map(day => (
          <View key={day} style={styles.cell}>
            <Text style={styles.weekday}>{day}</Text>
          </View>
        ))}
      </View>

      <Animated.View
        style={{ opacity: monthFade, transform: [{ translateY: gridTranslate }] }}
      >
        {weeks.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} style={styles.weekRow}>
            {week.map((day, dayIndex) => {
              if (!day) {
                return (
                  <View
                    key={`blank-${weekIndex}-${dayIndex}`}
                    style={styles.cell}
                  />
                );
              }

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
                    onPress={() => {
                      onChange(day);
                      onComplete?.();
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Text
                      style={[
                        styles.dayText,
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
    paddingHorizontal: spacing.sm,
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
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.2,
  },

  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  cell: {
    flex: 1,
    height: CELL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  weekday: {
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },

  dayButton: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(17),
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

  dayTextSelected: {
    color: colors.white,
    fontWeight: fontWeight.bold,
  },

  dayTextToday: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
});
