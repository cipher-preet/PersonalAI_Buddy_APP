import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  radii,
  spacing,
} from '../../theme';

type CalendarEvent = {
  id: string;
  title: string;
  start: number;
  end: number;
  tone: 'primary' | 'blue' | 'green';
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const START_HOUR = 8;
const END_HOUR = 20;
const HOUR_HEIGHT = ms(68);
const TIME_COLUMN_WIDTH = ms(52);

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const isSameDay = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

const formatHour = (hour: number) => {
  if (hour === 12) {
    return '12 PM';
  }
  if (hour > 12) {
    return `${hour - 12} PM`;
  }
  return `${hour} AM`;
};

const formatTime = (value: number) => {
  const hours = Math.floor(value);
  const minutes = Math.round((value - hours) * 60);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${String(displayHour).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0',
  )} ${period}`;
};

const getEventsForDate = (date: Date): CalendarEvent[] => {
  const dayVariant = date.getDate() % 3;
  const titles =
    dayVariant === 0
      ? ['Product design review', 'Buddy roadmap planning', 'Weekly wrap-up']
      : dayVariant === 1
        ? ['Design system audit', 'Launch planning', 'Research synthesis']
        : [
            'Front-end development',
            'Startup & product development',
            'Digital product creation',
          ];

  return [
    {
      id: `${date.toDateString()}-morning`,
      title: titles[0],
      start: 9.25,
      end: 11.75,
      tone: 'primary',
    },
    {
      id: `${date.toDateString()}-afternoon`,
      title: titles[1],
      start: 12.75,
      end: 15,
      tone: 'blue',
    },
    {
      id: `${date.toDateString()}-evening`,
      title: titles[2],
      start: 16.5,
      end: 19,
      tone: 'green',
    },
  ];
};

const BackIcon = () => (
  <Svg width={ms(18)} height={ms(18)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18 9 12l6-6"
      stroke={colors.text}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CalendarScreen = () => {
  const navigation = useNavigation();
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const weekDays = useMemo(
    () => Array.from({ length: 9 }, (_, index) => addDays(today, index - 3)),
    [today],
  );
  const hours = useMemo(
    () =>
      Array.from(
        { length: END_HOUR - START_HOUR + 1 },
        (_, index) => START_HOUR + index,
      ),
    [],
  );
  const events = useMemo(() => getEventsForDate(selectedDate), [selectedDate]);
  const timelineHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT;

  const eventTone = (tone: CalendarEvent['tone']) => {
    if (tone === 'blue') {
      return {
        background: colors.primaryLight,
        accent: colors.info,
      };
    }
    if (tone === 'green') {
      return {
        background: colors.successSoft,
        accent: colors.successBright,
      };
    }
    return {
      background: colors.primarySoft,
      accent: colors.primaryPurple,
    };
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.78}
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <BackIcon />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Calendar</Text>
            <Text style={styles.headerSubtitle}>
              {MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.78}
            style={styles.todayButton}
            onPress={() => setSelectedDate(today)}
          >
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateStrip}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateStripContent}
          >
            {weekDays.map(date => {
              const selected = isSameDay(date, selectedDate);
              const currentDay = isSameDay(date, today);
              return (
                <TouchableOpacity
                  key={date.toISOString()}
                  activeOpacity={0.8}
                  style={[styles.dayChip, selected && styles.dayChipSelected]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      selected && styles.dayNumberSelected,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                  <Text
                    style={[
                      styles.dayName,
                      selected && styles.dayNameSelected,
                    ]}
                  >
                    {DAY_NAMES[date.getDay()]}
                  </Text>
                  {currentDay && !selected ? <View style={styles.todayDot} /> : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.agendaHeader}>
          <View>
            <Text style={styles.agendaTitle}>
              {isSameDay(selectedDate, today)
                ? "Today's schedule"
                : `${DAY_NAMES[selectedDate.getDay()]}, ${
                    MONTH_NAMES[selectedDate.getMonth()]
                  } ${selectedDate.getDate()}`}
            </Text>
            <Text style={styles.agendaSubtitle}>{events.length} events planned</Text>
          </View>
          <View style={styles.eventCountPill}>
            <Text style={styles.eventCountText}>{events.length} events</Text>
          </View>
        </View>

        <ScrollView
          style={styles.timelineScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.timelineScrollContent}
        >
          <View style={[styles.timeline, { height: timelineHeight }]}>
            {hours.map(hour => (
              <React.Fragment key={hour}>
                <Text
                  style={[
                    styles.timeLabel,
                    { top: (hour - START_HOUR) * HOUR_HEIGHT - ms(7) },
                  ]}
                >
                  {formatHour(hour)}
                </Text>
                <View
                  style={[
                    styles.hourLine,
                    { top: (hour - START_HOUR) * HOUR_HEIGHT },
                  ]}
                />
              </React.Fragment>
            ))}

            {events.map(event => {
              const tone = eventTone(event.tone);
              const top = (event.start - START_HOUR) * HOUR_HEIGHT;
              const height = (event.end - event.start) * HOUR_HEIGHT - spacing.sm;
              return (
                <View
                  key={event.id}
                  style={[
                    styles.eventCard,
                    {
                      top,
                      height,
                      backgroundColor: tone.background,
                      borderLeftColor: tone.accent,
                    },
                  ]}
                >
                  <Text style={styles.eventTime}>
                    {formatTime(event.start)} – {formatTime(event.end)}
                  </Text>
                  <Text numberOfLines={2} style={styles.eventTitle}>
                    {event.title}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default CalendarScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  backButton: {
    width: layout.headerButton,
    height: layout.headerButton,
    borderRadius: layout.headerButton / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: layout.hairline,
    borderColor: colors.border,
  },
  headerCopy: {
    flex: 1,
    marginLeft: spacing.md,
  },
  headerTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    marginTop: spacing.xxs,
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  todayButton: {
    minHeight: ms(36),
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.primaryLight,
  },
  todayButtonText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  dateStrip: {
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  dateStripContent: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  dayChip: {
    position: 'relative',
    width: ms(52),
    height: ms(72),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.xl,
    backgroundColor: colors.lightGray,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderLight,
  },
  dayChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayNumber: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  dayNumberSelected: {
    color: colors.white,
  },
  dayName: {
    marginTop: spacing.xs,
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  dayNameSelected: {
    color: colors.white,
  },
  todayDot: {
    position: 'absolute',
    bottom: spacing.sm,
    width: ms(4),
    height: ms(4),
    borderRadius: ms(2),
    backgroundColor: colors.primary,
  },
  agendaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.lg,
  },
  agendaTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  agendaSubtitle: {
    marginTop: spacing.xxs,
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  eventCountPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryLight,
  },
  eventCountText: {
    color: colors.primaryDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  timelineScroll: {
    flex: 1,
  },
  timelineScrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing['5xl'],
  },
  timeline: {
    position: 'relative',
  },
  timeLabel: {
    position: 'absolute',
    left: 0,
    width: TIME_COLUMN_WIDTH - spacing.sm,
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  hourLine: {
    position: 'absolute',
    left: TIME_COLUMN_WIDTH,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  eventCard: {
    position: 'absolute',
    left: TIME_COLUMN_WIDTH + spacing['2xl'],
    right: 0,
    minHeight: ms(72),
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderLeftWidth: ms(5),
  },
  eventTime: {
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  eventTitle: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    lineHeight: ms(21),
  },
});
