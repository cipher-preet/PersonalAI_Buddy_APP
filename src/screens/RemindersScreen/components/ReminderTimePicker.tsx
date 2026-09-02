import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  screenWidth,
  spacing,
} from '../../../theme';

type Props = {
  value: Date;
  onChange: (date: Date) => void;
  onComplete?: () => void;
  embedded?: boolean;
};

type ClockMode = 'hour' | 'minute';
type Period = 'AM' | 'PM';

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const CLOCK_SIZE = Math.min(ms(228), screenWidth - ms(96));
const CENTER = CLOCK_SIZE / 2;
const NUMBER_RADIUS = CLOCK_SIZE / 2 - ms(26);
const HAND_RADIUS = CLOCK_SIZE / 2 - ms(26);
const KNOB = ms(36);

const toHour12 = (hour24: number) => (hour24 % 12 === 0 ? 12 : hour24 % 12);
const toPeriod = (hour24: number): Period => (hour24 >= 12 ? 'PM' : 'AM');
const snapMinute = (minute: number) => (Math.round(minute / 5) * 5) % 60;

const angleForIndex = (index: number) => (index / 12) * 360 - 90;

const pointOnCircle = (index: number, radius: number) => {
  const radians = (angleForIndex(index) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(radians),
    y: CENTER + radius * Math.sin(radians),
  };
};

const indexFromPoint = (x: number, y: number) => {
  let degrees = (Math.atan2(y - CENTER, x - CENTER) * 180) / Math.PI + 90;
  if (degrees < 0) {
    degrees += 360;
  }
  return Math.round(degrees / 30) % 12;
};

const ReminderTimePicker = ({
  value,
  onChange,
  onComplete,
  embedded = false,
}: Props) => {
  const appear = useRef(new Animated.Value(embedded ? 1 : 0)).current;
  const [mode, setMode] = useState<ClockMode>('hour');
  const modeRef = useRef<ClockMode>('hour');
  const valueRef = useRef(value);

  const hour24 = value.getHours();
  const minute = snapMinute(value.getMinutes());
  const period = toPeriod(hour24);
  const hour12 = toHour12(hour24);
  const selectedIndex = mode === 'hour' ? hour12 % 12 : minute / 5;
  const ticks = mode === 'hour' ? HOURS : MINUTES;

  modeRef.current = mode;
  valueRef.current = value;

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

  const applyTime = (
    nextHour12: number,
    nextMinute: number,
    nextPeriod: Period,
    base = valueRef.current,
  ) => {
    const next = new Date(base);
    let hour = nextHour12 % 12;
    if (nextPeriod === 'PM') {
      hour += 12;
    }
    next.setHours(hour, nextMinute, 0, 0);
    onChange(next);
  };

  const readClock = (base: Date) => {
    const hours = base.getHours();
    return {
      hour12: toHour12(hours),
      minute: snapMinute(base.getMinutes()),
      period: toPeriod(hours),
    };
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: event => {
          const clock = readClock(valueRef.current);
          const index = indexFromPoint(
            event.nativeEvent.locationX,
            event.nativeEvent.locationY,
          );
          if (modeRef.current === 'hour') {
            applyTime(index === 0 ? 12 : index, clock.minute, clock.period);
            return;
          }
          applyTime(clock.hour12, index * 5, clock.period);
        },
        onPanResponderMove: event => {
          const clock = readClock(valueRef.current);
          const index = indexFromPoint(
            event.nativeEvent.locationX,
            event.nativeEvent.locationY,
          );
          if (modeRef.current === 'hour') {
            applyTime(index === 0 ? 12 : index, clock.minute, clock.period);
            return;
          }
          applyTime(clock.hour12, index * 5, clock.period);
        },
        onPanResponderRelease: event => {
          const clock = readClock(valueRef.current);
          const index = indexFromPoint(
            event.nativeEvent.locationX,
            event.nativeEvent.locationY,
          );
          if (modeRef.current === 'hour') {
            applyTime(index === 0 ? 12 : index, clock.minute, clock.period);
            setMode('minute');
            return;
          }
          applyTime(clock.hour12, index * 5, clock.period);
          onComplete?.();
        },
      }),
    [onChange, onComplete],
  );

  const hand = pointOnCircle(selectedIndex, HAND_RADIUS);
  const translateY = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [ms(10), 0],
  });

  return (
    <Animated.View
      style={[
        styles.root,
        !embedded && styles.card,
        !embedded && { opacity: appear, transform: [{ translateY }] },
      ]}
    >
      <View style={styles.digitalRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.digitalBlock, mode === 'hour' && styles.digitalActive]}
          onPress={() => setMode('hour')}
          accessibilityRole="button"
          accessibilityLabel="Select hour"
        >
          <Text
            style={[
              styles.digitalText,
              mode === 'hour' && styles.digitalTextActive,
            ]}
          >
            {String(hour12).padStart(2, '0')}
          </Text>
        </TouchableOpacity>
        <Text style={styles.colon}>:</Text>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.digitalBlock,
            mode === 'minute' && styles.digitalActive,
          ]}
          onPress={() => setMode('minute')}
          accessibilityRole="button"
          accessibilityLabel="Select minutes"
        >
          <Text
            style={[
              styles.digitalText,
              mode === 'minute' && styles.digitalTextActive,
            ]}
          >
            {String(minute).padStart(2, '0')}
          </Text>
        </TouchableOpacity>
        <View style={styles.periodColumn}>
          {(['AM', 'PM'] as const).map(item => {
            const active = item === period;
            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.85}
                style={[styles.periodChip, active && styles.periodChipActive]}
                onPress={() => applyTime(hour12, minute, item)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text
                  style={[styles.periodText, active && styles.periodTextActive]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View
        style={styles.clock}
        {...panResponder.panHandlers}
        accessibilityRole="adjustable"
        accessibilityLabel={mode === 'hour' ? 'Hour clock' : 'Minute clock'}
      >
        <Svg width={CLOCK_SIZE} height={CLOCK_SIZE}>
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={CLOCK_SIZE / 2}
            fill={colors.primaryLight}
          />
          <Line
            x1={CENTER}
            y1={CENTER}
            x2={hand.x}
            y2={hand.y}
            stroke={colors.primary}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
          <Circle cx={hand.x} cy={hand.y} r={KNOB / 2} fill={colors.primary} />
          <Circle cx={CENTER} cy={CENTER} r={ms(5)} fill={colors.primary} />
        </Svg>

        {ticks.map((tick, index) => {
          const point = pointOnCircle(index, NUMBER_RADIUS);
          const selected = index === selectedIndex;
          return (
            <View
              key={`${mode}-${tick}`}
              pointerEvents="none"
              style={[
                styles.tick,
                {
                  left: point.x - KNOB / 2,
                  top: point.y - KNOB / 2,
                },
              ]}
            >
              <Text style={[styles.tickText, selected && styles.tickTextSelected]}>
                {mode === 'hour' ? tick : String(tick).padStart(2, '0')}
              </Text>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
};

export default ReminderTimePicker;

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },

  digitalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },

  digitalBlock: {
    minWidth: ms(58),
    height: ms(52),
    borderRadius: radii.md,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  digitalActive: {
    backgroundColor: colors.primary,
  },

  digitalText: {
    color: colors.text,
    fontSize: ms(28),
    lineHeight: ms(32),
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.8,
  },

  digitalTextActive: {
    color: colors.white,
  },

  colon: {
    marginHorizontal: spacing.sm,
    color: colors.text,
    fontSize: ms(28),
    fontWeight: fontWeight.extrabold,
  },

  periodColumn: {
    marginLeft: spacing.md,
    gap: spacing.xs,
  },

  periodChip: {
    minWidth: ms(40),
    height: ms(24),
    borderRadius: radii.xs,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  periodChipActive: {
    backgroundColor: colors.primaryLight,
  },

  periodText: {
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },

  periodTextActive: {
    color: colors.primary,
  },

  clock: {
    width: CLOCK_SIZE,
    height: CLOCK_SIZE,
    alignSelf: 'center',
  },

  tick: {
    position: 'absolute',
    width: KNOB,
    height: KNOB,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tickText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  tickTextSelected: {
    color: colors.white,
    fontWeight: fontWeight.bold,
  },
});
