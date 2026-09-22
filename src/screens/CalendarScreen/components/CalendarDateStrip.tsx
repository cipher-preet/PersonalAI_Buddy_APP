import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { DAY_NAMES, MONTH_NAMES, startOfDay, toDateKey } from '../calendarUtils';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  radii,
  scrollThrottle,
  spacing,
} from '../../../theme';

const DAY_CHIP_WIDTH = ms(54);
const DAY_CHIP_GAP = spacing.sm;
const DAY_ITEM_WIDTH = DAY_CHIP_WIDTH + DAY_CHIP_GAP;
const DATE_STRIP_PADDING = layout.screenPadding;

type StripDay = {
  key: string;
  date: Date;
};

type DayChipProps = {
  item: StripDay;
  selected: boolean;
  isToday: boolean;
  hasEvents: boolean;
  onPress: (date: Date) => void;
};

type Props = {
  selectedDate: Date;
  today?: Date;
  markedDateKeys?: Set<string>;
  onSelectDate: (date: Date) => void;
};

const ChevronDownIcon = ({ color = colors.muted }: { color?: string }) => (
  <Svg width={ms(12)} height={ms(12)} viewBox="0 0 24 24" fill="none">
    <Path
      d="m6 9 6 6 6-6"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronIcon = ({
  direction,
  color = colors.icon,
}: {
  direction: 'left' | 'right';
  color?: string;
}) => (
  <Svg width={ms(16)} height={ms(16)} viewBox="0 0 24 24" fill="none">
    <Path
      d={direction === 'left' ? 'M15 18 9 12l6-6' : 'M9 18l6-6-6-6'}
      stroke={color}
      strokeWidth={2.1}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const DayChip = memo(
  ({ item, selected, isToday, hasEvents, onPress }: DayChipProps) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.dayChip, selected && styles.dayChipSelected]}
      onPress={() => onPress(item.date)}
      accessibilityRole="button"
      accessibilityLabel={`${DAY_NAMES[item.date.getDay()]} ${item.date.getDate()}`}
      accessibilityState={{ selected }}
    >
      <Text style={[styles.dayName, selected && styles.dayNameSelected]}>
        {DAY_NAMES[item.date.getDay()].slice(0, 3)}
      </Text>
      <Text style={[styles.dayNumber, selected && styles.dayNumberSelected]}>
        {item.date.getDate()}
      </Text>
      {hasEvents ? (
        <View style={[styles.eventDot, selected && styles.eventDotSelected]} />
      ) : isToday && !selected ? (
        <View style={styles.todayDot} />
      ) : (
        <View style={styles.dotSpacer} />
      )}
    </TouchableOpacity>
  ),
);

DayChip.displayName = 'DayChip';

const CalendarDateStrip = ({
  selectedDate,
  today: todayProp,
  markedDateKeys,
  onSelectDate,
}: Props) => {
  const listRef = useRef<FlatList<StripDay>>(null);
  const listWidthRef = useRef(0);
  const scrollXRef = useRef(0);
  const monthKeyRef = useRef('');
  const didInitialScrollRef = useRef(false);

  const today = useMemo(
    () => startOfDay(todayProp ?? new Date()),
    [todayProp],
  );
  const todayKey = useMemo(() => toDateKey(today), [today]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerYear, setPickerYear] = useState(selectedDate.getFullYear());

  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth();
  const monthKey = `${selectedYear}-${selectedMonth}`;
  const selectedKey = toDateKey(selectedDate);
  const selectedIndex = Math.max(0, selectedDate.getDate() - 1);

  const days = useMemo<StripDay[]>(() => {
    const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    return Array.from({ length: totalDays }, (_, index) => {
      const date = new Date(selectedYear, selectedMonth, index + 1);
      return { key: toDateKey(date), date };
    });
  }, [selectedMonth, selectedYear]);

  const scrollToIndex = useCallback(
    (index: number, animated: boolean) => {
      if (!days.length || listWidthRef.current <= 0) {
        return;
      }
      const safeIndex = Math.min(Math.max(index, 0), days.length - 1);
      listRef.current?.scrollToIndex({
        index: safeIndex,
        animated,
        viewPosition: 0.45,
      });
    },
    [days.length],
  );

  // Position strip when month changes (or on first layout). Avoid re-scrolling
  // on every day tap — that was the main jerk.
  useEffect(() => {
    if (!days.length) {
      return;
    }

    const monthChanged = monthKeyRef.current !== monthKey;
    const isFirst = monthKeyRef.current === '';
    monthKeyRef.current = monthKey;

    if (!monthChanged && !isFirst) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      scrollToIndex(selectedIndex, !isFirst);
    });
    return () => cancelAnimationFrame(frame);
  }, [days.length, monthKey, scrollToIndex, selectedIndex]);

  const ensureSelectedVisible = useCallback(
    (index: number) => {
      const width = listWidthRef.current;
      if (width <= 0) {
        return;
      }
      const itemStart = DATE_STRIP_PADDING + DAY_ITEM_WIDTH * index;
      const itemEnd = itemStart + DAY_CHIP_WIDTH;
      const viewStart = scrollXRef.current;
      const viewEnd = viewStart + width;
      const edgePad = DAY_ITEM_WIDTH;

      if (itemStart < viewStart + edgePad || itemEnd > viewEnd - edgePad) {
        scrollToIndex(index, true);
      }
    },
    [scrollToIndex],
  );

  const handleSelectDay = useCallback(
    (date: Date) => {
      const next = startOfDay(date);
      onSelectDate(next);
      ensureSelectedVisible(Math.max(0, next.getDate() - 1));
    },
    [ensureSelectedVisible, onSelectDate],
  );

  const shiftMonth = useCallback(
    (delta: number) => {
      const next = new Date(selectedYear, selectedMonth + delta, 1);
      const daysInMonth = new Date(
        next.getFullYear(),
        next.getMonth() + 1,
        0,
      ).getDate();
      const isCurrentMonth =
        next.getFullYear() === today.getFullYear() &&
        next.getMonth() === today.getMonth();
      if (isCurrentMonth) {
        onSelectDate(today);
        return;
      }
      onSelectDate(
        new Date(
          next.getFullYear(),
          next.getMonth(),
          Math.min(selectedDate.getDate(), daysInMonth),
        ),
      );
    },
    [onSelectDate, selectedDate, selectedMonth, selectedYear, today],
  );

  const handleOpenPicker = () => {
    setPickerYear(selectedDate.getFullYear());
    setPickerVisible(true);
  };

  const handleSelectMonth = (monthIndex: number) => {
    const isCurrentMonth =
      pickerYear === today.getFullYear() && monthIndex === today.getMonth();
    if (isCurrentMonth) {
      onSelectDate(today);
    } else {
      const daysInMonth = new Date(pickerYear, monthIndex + 1, 0).getDate();
      onSelectDate(
        new Date(
          pickerYear,
          monthIndex,
          Math.min(selectedDate.getDate(), daysInMonth),
        ),
      );
    }
    setPickerVisible(false);
  };

  const renderDay = useCallback(
    ({ item }: ListRenderItemInfo<StripDay>) => (
      <DayChip
        item={item}
        selected={item.key === selectedKey}
        isToday={item.key === todayKey}
        hasEvents={Boolean(markedDateKeys?.has(item.key))}
        onPress={handleSelectDay}
      />
    ),
    [handleSelectDay, markedDateKeys, selectedKey, todayKey],
  );

  // Offset is item-only; content padding is applied by contentContainerStyle.
  const getItemLayout = useCallback(
    (_: ArrayLike<StripDay> | null | undefined, index: number) => ({
      length: DAY_ITEM_WIDTH,
      offset: DAY_ITEM_WIDTH * index,
      index,
    }),
    [],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollXRef.current = event.nativeEvent.contentOffset.x;
    },
    [],
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => shiftMonth(-1)}
          style={styles.monthArrow}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
        >
          <ChevronIcon direction="left" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handleOpenPicker}
          style={styles.monthButton}
          accessibilityRole="button"
          accessibilityLabel="Choose month"
        >
          <Text style={styles.monthTitle}>
            {MONTH_NAMES[selectedMonth]} {selectedYear}
          </Text>
          <View style={styles.chevronWrap}>
            <ChevronDownIcon />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => shiftMonth(1)}
          style={styles.monthArrow}
          accessibilityRole="button"
          accessibilityLabel="Next month"
        >
          <ChevronIcon direction="right" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={days}
        keyExtractor={item => item.key}
        renderItem={renderDay}
        extraData={`${selectedKey}-${markedDateKeys?.size ?? 0}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        getItemLayout={getItemLayout}
        onLayout={event => {
          listWidthRef.current = event.nativeEvent.layout.width;
          if (!didInitialScrollRef.current && days.length) {
            didInitialScrollRef.current = true;
            requestAnimationFrame(() => {
              scrollToIndex(selectedIndex, false);
            });
          }
        }}
        onScroll={handleScroll}
        scrollEventThrottle={scrollThrottle}
        onScrollToIndexFailed={info => {
          // Rare with full month rendered; soft retry once layout catches up.
          setTimeout(() => {
            listRef.current?.scrollToOffset({
              offset: Math.max(0, DAY_ITEM_WIDTH * info.index),
              animated: true,
            });
          }, 40);
        }}
        // Month strip is tiny (≤31); render everything to avoid virtualization hitches.
        initialNumToRender={31}
        maxToRenderPerBatch={31}
        windowSize={5}
        removeClippedSubviews={false}
        decelerationRate="normal"
        bounces
      />

      <Modal
        visible={pickerVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setPickerVisible(false)}
      >
        <Pressable
          style={styles.pickerBackdrop}
          onPress={() => setPickerVisible(false)}
        >
          <Pressable
            style={styles.pickerCard}
            onPress={event => event.stopPropagation()}
          >
            <View style={styles.pickerYearRow}>
              <TouchableOpacity
                activeOpacity={0.75}
                style={styles.yearArrow}
                onPress={() => setPickerYear(year => year - 1)}
                accessibilityLabel="Previous year"
              >
                <ChevronIcon direction="left" />
              </TouchableOpacity>
              <Text style={styles.pickerYear}>{pickerYear}</Text>
              <TouchableOpacity
                activeOpacity={0.75}
                style={styles.yearArrow}
                onPress={() => setPickerYear(year => year + 1)}
                accessibilityLabel="Next year"
              >
                <ChevronIcon direction="right" />
              </TouchableOpacity>
            </View>

            <View style={styles.monthGrid}>
              {MONTH_NAMES.map((monthName, index) => {
                const selected =
                  pickerYear === selectedYear && index === selectedMonth;
                const isCurrent =
                  pickerYear === today.getFullYear() &&
                  index === today.getMonth();
                return (
                  <TouchableOpacity
                    key={monthName}
                    activeOpacity={0.82}
                    style={[
                      styles.monthChip,
                      selected && styles.monthChipSelected,
                      isCurrent && !selected && styles.monthChipToday,
                    ]}
                    onPress={() => handleSelectMonth(index)}
                  >
                    <Text
                      style={[
                        styles.monthChipText,
                        selected && styles.monthChipTextSelected,
                      ]}
                    >
                      {monthName.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default memo(CalendarDateStrip);

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DATE_STRIP_PADDING,
    marginBottom: spacing.md,
  },
  monthArrow: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(17),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderLight,
  },
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  monthTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.2,
  },
  chevronWrap: {
    marginLeft: spacing.xs,
    marginTop: 1,
  },
  listContent: {
    paddingHorizontal: DATE_STRIP_PADDING,
  },
  dayChip: {
    width: DAY_CHIP_WIDTH,
    height: ms(78),
    marginRight: DAY_CHIP_GAP,
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
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  dayNumberSelected: {
    color: colors.white,
  },
  dayName: {
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  dayNameSelected: {
    color: colors.white,
  },
  eventDot: {
    marginTop: spacing.xs,
    width: ms(5),
    height: ms(5),
    borderRadius: ms(2.5),
    backgroundColor: colors.primaryPurple,
  },
  eventDotSelected: {
    backgroundColor: colors.white,
  },
  todayDot: {
    marginTop: spacing.xs,
    width: ms(5),
    height: ms(5),
    borderRadius: ms(2.5),
    backgroundColor: colors.primary,
  },
  dotSpacer: {
    marginTop: spacing.xs,
    width: ms(5),
    height: ms(5),
  },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
    justifyContent: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  pickerCard: {
    borderRadius: radii['2xl'],
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['2xl'],
  },
  pickerYearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  yearArrow: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
  },
  pickerYear: {
    color: colors.text,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
  },
  monthChip: {
    width: '30%',
    minHeight: ms(42),
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.inputBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  monthChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  monthChipToday: {
    borderColor: colors.primary,
  },
  monthChipText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  monthChipTextSelected: {
    color: colors.white,
  },
});
