import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  radii,
  screenWidth,
  spacing,
} from '../../../theme';

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

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'Wed', 'Th', 'Fr', 'Sa'];
const VISIBLE_DAYS = 7;
const DAY_WIDTH = Math.round((screenWidth - layout.screenPadding * 2) / VISIBLE_DAYS);
const DAY_HEIGHT = ms(62);

export const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isSameDay = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

type CalendarDay = {
  key: string;
  date: Date;
  dayLabel: string;
  dayNumber: number;
};

type DayCellProps = {
  item: CalendarDay;
  selected: boolean;
  isToday: boolean;
  hasNotes: boolean;
  onPress: (date: Date) => void;
};

type Props = {
  selectedDate: Date;
  markedDateKeys?: Set<string>;
  onSelectDate: (date: Date) => void;
  onAddPress: () => void;
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

const PlusIcon = ({ color = colors.icon }: { color?: string }) => (
  <Svg width={ms(20)} height={ms(20)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5v14M5 12h14"
      stroke={color}
      strokeWidth={2.1}
      strokeLinecap="round"
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

const DayCell = memo(({ item, selected, isToday, hasNotes, onPress }: DayCellProps) => (
  <TouchableOpacity
    activeOpacity={0.82}
    onPress={() => onPress(item.date)}
    style={[styles.dayCell, selected && styles.dayCellSelected]}
    accessibilityRole="button"
    accessibilityLabel={`${item.dayLabel} ${item.dayNumber}`}
    accessibilityState={{ selected }}
  >
    <Text style={[styles.dayLabel, selected && styles.dayLabelSelected]}>
      {item.dayLabel}
    </Text>
    <View style={[styles.dateNumberWrap, isToday && !selected && styles.todayRing]}>
      <Text style={[styles.dateNumber, selected && styles.dateNumberSelected]}>
        {item.dayNumber}
      </Text>
    </View>
    {hasNotes ? (
      <View style={[styles.noteDot, selected && styles.noteDotSelected]} />
    ) : (
      <View style={styles.noteDotSpacer} />
    )}
  </TouchableOpacity>
));

DayCell.displayName = 'DayCell';

const NotesCalendarStrip = ({
  selectedDate,
  markedDateKeys,
  onSelectDate,
  onAddPress,
}: Props) => {
  const listRef = useRef<FlatList<CalendarDay>>(null);
  const today = useMemo(() => startOfDay(new Date()), []);
  const todayKey = useMemo(() => toDateKey(today), [today]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerYear, setPickerYear] = useState(selectedDate.getFullYear());

  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth();
  const monthKey = `${selectedYear}-${selectedMonth}`;

  const days = useMemo(() => {
    const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    return Array.from({ length: totalDays }, (_, index) => {
      const date = new Date(selectedYear, selectedMonth, index + 1);
      return {
        key: toDateKey(date),
        date,
        dayLabel: DAY_LABELS[date.getDay()],
        dayNumber: index + 1,
      };
    });
  }, [selectedMonth, selectedYear]);

  const selectedIndex = Math.max(0, selectedDate.getDate() - 1);

  useEffect(() => {
    if (days.length === 0) {
      return;
    }

    const index = Math.min(selectedDate.getDate() - 1, days.length - 1);

    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({
        index,
        animated: false,
        viewPosition: 0.15,
      });
    });
  }, [days.length, monthKey]);

  const handleSelectDate = useCallback(
    (date: Date) => {
      onSelectDate(startOfDay(date));
    },
    [onSelectDate],
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
      const nextDay = Math.min(selectedDate.getDate(), daysInMonth);
      onSelectDate(new Date(pickerYear, monthIndex, nextDay));
    }

    setPickerVisible(false);
  };

  const renderDay = useCallback(
    ({ item }: ListRenderItemInfo<CalendarDay>) => (
      <DayCell
        item={item}
        selected={item.key === toDateKey(selectedDate)}
        isToday={item.key === todayKey}
        hasNotes={Boolean(markedDateKeys?.has(item.key))}
        onPress={handleSelectDate}
      />
    ),
    [handleSelectDate, markedDateKeys, selectedDate, todayKey],
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<CalendarDay> | null | undefined, index: number) => ({
      length: DAY_WIDTH,
      offset: layout.screenPadding + DAY_WIDTH * index,
      index,
    }),
    [],
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handleOpenPicker}
          style={styles.monthButton}
          accessibilityRole="button"
          accessibilityLabel="Choose month"
        >
          <Text style={styles.monthTitle}>
            {MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </Text>
          <View style={styles.chevronWrap}>
            <ChevronDownIcon />
          </View>
        </TouchableOpacity>

        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onAddPress}
            style={styles.iconButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Add"
          >
            <PlusIcon />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={days}
        horizontal
        keyExtractor={item => item.key}
        renderItem={renderDay}
        extraData={`${toDateKey(selectedDate)}-${markedDateKeys?.size ?? 0}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        style={styles.dateList}
        getItemLayout={getItemLayout}
        initialScrollIndex={Math.min(selectedIndex, Math.max(days.length - 1, 0))}
        onScrollToIndexFailed={info => {
          setTimeout(() => {
            listRef.current?.scrollToIndex({
              index: info.index,
              animated: false,
              viewPosition: 0.15,
            });
          }, 60);
        }}
        decelerationRate="fast"
        initialNumToRender={14}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={false}
        overScrollMode="never"
      />

      <Modal
        visible={pickerVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setPickerVisible(false)}
      >
        <Pressable style={styles.pickerBackdrop} onPress={() => setPickerVisible(false)}>
          <Pressable style={styles.pickerCard} onPress={event => event.stopPropagation()}>
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
                  pickerYear === selectedDate.getFullYear() &&
                  index === selectedDate.getMonth();
                const isCurrent =
                  pickerYear === today.getFullYear() && index === today.getMonth();

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

export default memo(NotesCalendarStrip);

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.white,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.sm,
  },

  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },

  monthTitle: {
    color: colors.black,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.3,
  },

  chevronWrap: {
    marginLeft: spacing.sm,
    marginTop: spacing.xxs,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  iconButton: {
    width: layout.iconButtonSm,
    height: layout.iconButtonSm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  listContent: {
    paddingHorizontal: layout.screenPadding,
  },

  dateList: {
    height: DAY_HEIGHT,
    flexGrow: 0,
  },

  dayCell: {
    width: DAY_WIDTH,
    height: DAY_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
  },

  dayCellSelected: {
    backgroundColor: colors.lightGray,
  },

  dayLabel: {
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },

  dayLabelSelected: {
    color: colors.subText,
  },

  dateNumberWrap: {
    width: ms(28),
    height: ms(28),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ms(14),
    borderWidth: 1.5,
    borderColor: 'transparent',
  },

  todayRing: {
    borderColor: colors.border,
  },

  dateNumber: {
    color: colors.black,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.3,
  },

  dateNumberSelected: {
    color: colors.black,
  },

  noteDot: {
    width: ms(4),
    height: ms(4),
    borderRadius: ms(2),
    marginTop: spacing.xs,
    backgroundColor: colors.primary,
  },

  noteDotSelected: {
    backgroundColor: colors.primaryDark,
  },

  noteDotSpacer: {
    width: ms(4),
    height: ms(4),
    marginTop: spacing.xs,
  },

  pickerBackdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
    justifyContent: 'center',
    paddingHorizontal: layout.screenPadding,
  },

  pickerCard: {
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['2xl'],
  },

  pickerYearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing['2xl'],
  },

  yearArrow: {
    width: layout.iconButtonSm,
    height: layout.iconButtonSm,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.inputBg,
  },

  pickerYear: {
    color: colors.black,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.extrabold,
  },

  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
  },

  monthChip: {
    width: '23.5%',
    minHeight: ms(40),
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.inputBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  monthChipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.borderFocus,
  },

  monthChipToday: {
    borderColor: colors.primary,
  },

  monthChipText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  monthChipTextSelected: {
    color: colors.primaryDark,
  },
});
