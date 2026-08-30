import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import Svg, { Circle, Path } from 'react-native-svg';

import EventBottomSheet, {
  type EventDraft,
} from './components/EventBottomSheet';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import { useToast } from '../../store/context/ToastContext';
import { useAppSelector } from '../../store/hooks';
import {
  useCreateCalendarEventMutation,
  useDeleteCalendarEventMutation,
  useGetCalendarEventsQuery,
  useUpdateCalendarEventMutation,
  type CalendarEventCard,
} from '../../store/api/calendar';
import {
  DAY_NAMES,
  MONTH_NAMES,
  addDays,
  eventToneColors,
  isSameDay,
  parseTimeToHours,
  startOfDay,
  toDateKey,
} from './calendarUtils';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  radii,
  shadows,
  spacing,
} from '../../theme';

const TIME_COLUMN_WIDTH = ms(68);
const EVENT_CARD_HEIGHT = ms(108);
const EVENT_ROW_GAP = spacing.xl;
const PAST_DAYS = 21;
const FUTURE_DAYS = 60;
const DAY_CHIP_WIDTH = ms(54);
const DAY_CHIP_GAP = spacing.sm;
const DAY_ITEM_WIDTH = DAY_CHIP_WIDTH + DAY_CHIP_GAP;
const DATE_STRIP_PADDING = layout.screenPadding;

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

const PlusIcon = () => (
  <Svg width={ms(20)} height={ms(20)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5v14M5 12h14"
      stroke={colors.white}
      strokeWidth={2.4}
      strokeLinecap="round"
    />
  </Svg>
);

const PinMiniIcon = ({ color = colors.subText }: { color?: string }) => (
  <Svg width={ms(12)} height={ms(12)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21s6-4.8 6-10a6 6 0 1 0-12 0c0 5.2 6 10 6 10Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Path
      d="M12 11.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z"
      fill={color}
    />
  </Svg>
);

const SparkMiniIcon = ({ color = colors.primaryMid }: { color?: string }) => (
  <Svg width={ms(12)} height={ms(12)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 4v3M12 17v3M6 6l2 2M16 16l2 2M4 12h3M17 12h3M6 18l2-2M16 8l2-2"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const MoreIcon = ({ color = colors.text }: { color?: string }) => (
  <Svg width={ms(15)} height={ms(15)} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="5" r="1.6" fill={color} />
    <Circle cx="12" cy="12" r="1.6" fill={color} />
    <Circle cx="12" cy="19" r="1.6" fill={color} />
  </Svg>
);

const TrashIcon = () => (
  <Svg width={ms(15)} height={ms(15)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
      stroke={colors.error}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

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

const DayChip = React.memo(
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
        {DAY_NAMES[item.date.getDay()]}
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

type MeetingCardProps = {
  event: CalendarEventCard;
  onPress: () => void;
  onDelete: () => void;
};

const MeetingCard = React.memo(
  ({ event, onPress, onDelete }: MeetingCardProps) => {
    const tone = eventToneColors(event.tone);
    const [menuVisible, setMenuVisible] = useState(false);

    return (
      <View style={styles.eventCardWrap}>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={onPress}
          style={styles.eventCardPress}
          accessibilityRole="button"
          accessibilityLabel={`${event.title}, ${event.startTimeLabel} to ${event.endTimeLabel}`}
        >
          <View style={[styles.eventCard, { backgroundColor: tone.background }]}>
            <View
              style={[styles.eventAccent, { backgroundColor: tone.accent }]}
            />
            <View style={styles.eventBody}>
              <View style={styles.eventTopRow}>
                <Text
                  numberOfLines={1}
                  style={[styles.eventTime, { color: tone.time }]}
                >
                  {event.startTimeLabel} – {event.endTimeLabel}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.75}
                  style={styles.moreButton}
                  onPress={pressEvent => {
                    pressEvent.stopPropagation();
                    setMenuVisible(true);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel="Event options"
                >
                  <MoreIcon color={tone.time} />
                </TouchableOpacity>
              </View>
              <View style={styles.titleRow}>
                <Text numberOfLines={1} style={styles.eventTitle}>
                  {event.title}
                </Text>
                {event.aiReminder ? (
                  <View style={styles.aiMark}>
                    <SparkMiniIcon color={tone.accent} />
                  </View>
                ) : null}
              </View>
              <View style={styles.eventMetaRow}>
                <PinMiniIcon
                  color={event.location ? tone.accent : colors.muted}
                />
                <Text numberOfLines={1} style={styles.eventMeta}>
                  {event.location || 'No location'}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => setMenuVisible(false)}
        >
          <Pressable
            style={styles.menuBackdrop}
            onPress={() => setMenuVisible(false)}
          >
            <Pressable style={styles.menuCard}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  onDelete();
                }}
              >
                <TrashIcon />
                <Text style={styles.menuItemText}>Delete event</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    );
  },
);

MeetingCard.displayName = 'MeetingCard';

const CalendarScreen = () => {
  const navigation = useNavigation();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const eventSheetRef = useRef<BottomSheetModal>(null);
  const dateListRef = useRef<FlatList<StripDay>>(null);
  const hasScrolledToInitialDate = useRef(false);
  const userId = useAppSelector(state => state.auth.userId) ?? '';
  const today = useMemo(() => startOfDay(new Date()), []);
  const todayKey = useMemo(() => toDateKey(today), [today]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [sheetMode, setSheetMode] = useState<'create' | 'edit'>('create');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventCard | null>(
    null,
  );
  const [eventPendingDelete, setEventPendingDelete] =
    useState<CalendarEventCard | null>(null);

  const stripDays = useMemo<StripDay[]>(
    () =>
      Array.from({ length: PAST_DAYS + FUTURE_DAYS + 1 }, (_, index) => {
        const date = addDays(today, index - PAST_DAYS);
        return { key: toDateKey(date), date };
      }),
    [today],
  );

  const range = useMemo(
    () => ({
      from: stripDays[0]?.key ?? toDateKey(today),
      to: stripDays[stripDays.length - 1]?.key ?? toDateKey(today),
    }),
    [stripDays, today],
  );

  const selectedKey = toDateKey(selectedDate);
  const selectedIndex = useMemo(() => {
    const index = stripDays.findIndex(item => item.key === selectedKey);
    return index >= 0 ? index : PAST_DAYS;
  }, [selectedKey, stripDays]);

  const scrollToDateIndex = useCallback((index: number, animated: boolean) => {
    if (index < 0) {
      return;
    }

    requestAnimationFrame(() => {
      dateListRef.current?.scrollToIndex({
        index,
        animated,
        viewPosition: 0.45,
      });
    });
  }, []);

  useEffect(() => {
    if (!hasScrolledToInitialDate.current) {
      hasScrolledToInitialDate.current = true;
      return;
    }

    scrollToDateIndex(selectedIndex, true);
  }, [scrollToDateIndex, selectedIndex]);

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(startOfDay(date));
  }, []);

  const {
    data: eventsData,
    isFetching,
    isError,
    refetch,
  } = useGetCalendarEventsQuery(range, { skip: !userId });

  const [createEvent, { isLoading: isCreating }] =
    useCreateCalendarEventMutation();
  const [updateEvent, { isLoading: isUpdating }] =
    useUpdateCalendarEventMutation();
  const [deleteEvent, { isLoading: isDeleting }] =
    useDeleteCalendarEventMutation();

  const isSaving = isCreating || isUpdating;
  const allEvents = eventsData?.data?.events ?? [];
  const dayEvents = useMemo(
    () =>
      allEvents
        .filter(event => event.dateKey === selectedKey)
        .slice()
        .sort((first, second) => {
          const startA = parseTimeToHours(first.startTimeLabel) ?? 0;
          const startB = parseTimeToHours(second.startTimeLabel) ?? 0;
          return startA - startB;
        }),
    [allEvents, selectedKey],
  );
  const daysWithEvents = useMemo(
    () => new Set(allEvents.map(event => event.dateKey)),
    [allEvents],
  );

  const openCreateSheet = () => {
    setSheetMode('create');
    setSelectedEvent(null);
    eventSheetRef.current?.present();
  };

  const openEditSheet = (event: CalendarEventCard) => {
    setSheetMode('edit');
    setSelectedEvent(event);
    eventSheetRef.current?.present();
  };

  const requestDeleteEvent = (event: CalendarEventCard) => {
    eventSheetRef.current?.dismiss();
    setEventPendingDelete(event);
  };

  const handleSaveEvent = async (draft: EventDraft) => {
    try {
      if (sheetMode === 'edit' && selectedEvent) {
        await updateEvent({ ...draft, eventId: selectedEvent.id }).unwrap();
        showToast({ message: 'Event updated' });
      } else {
        await createEvent(draft).unwrap();
        showToast({
          message: 'Event added',
          description: draft.aiReminder
            ? 'AI reminder is set for this meeting.'
            : undefined,
        });
      }
      const [year, month, day] = draft.dateKey.split('-').map(Number);
      setSelectedDate(new Date(year, month - 1, day));
    } catch (error: any) {
      showToast({
        message: 'Could not save event',
        description: error?.data?.message || error?.message || 'Please try again.',
        type: 'error',
      });
      throw error;
    }
  };

  const handleConfirmDelete = async () => {
    if (!eventPendingDelete) {
      return;
    }

    try {
      const response = await deleteEvent({
        eventId: eventPendingDelete.id,
      }).unwrap();
      eventSheetRef.current?.dismiss();
      setEventPendingDelete(null);
      setSelectedEvent(null);
      showToast({
        message:
          response?.data?.message ||
          response?.message ||
          'Event deleted',
      });
    } catch (error: any) {
      showToast({
        message: 'Could not delete event',
        description: error?.data?.message || error?.message || 'Please try again.',
        type: 'error',
      });
    }
  };

  const renderDay = useCallback(
    ({ item }: ListRenderItemInfo<StripDay>) => (
      <DayChip
        item={item}
        selected={item.key === selectedKey}
        isToday={item.key === todayKey}
        hasEvents={daysWithEvents.has(item.key)}
        onPress={handleSelectDate}
      />
    ),
    [daysWithEvents, handleSelectDate, selectedKey, todayKey],
  );

  const getDayLayout = useCallback(
    (_: ArrayLike<StripDay> | null | undefined, index: number) => ({
      length: DAY_ITEM_WIDTH,
      offset: DATE_STRIP_PADDING + DAY_ITEM_WIDTH * index,
      index,
    }),
    [],
  );

  const handleDateScrollFailed = useCallback(
    (info: { index: number }) => {
      setTimeout(() => {
        scrollToDateIndex(info.index, false);
      }, 80);
    },
    [scrollToDateIndex],
  );

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
          <Pressable
            onPress={openCreateSheet}
            accessibilityRole="button"
            accessibilityLabel="Add event"
            style={({ pressed }) => [
              styles.addPressable,
              pressed && styles.addPressableActive,
            ]}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryMid, colors.accentCyan]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addButton}
            >
              <PlusIcon />
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.dateStrip}>
          <FlatList
            ref={dateListRef}
            data={stripDays}
            keyExtractor={item => item.key}
            renderItem={renderDay}
            extraData={`${selectedKey}-${daysWithEvents.size}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateStripContent}
            getItemLayout={getDayLayout}
            initialScrollIndex={PAST_DAYS}
            onScrollToIndexFailed={handleDateScrollFailed}
            initialNumToRender={14}
            windowSize={5}
            maxToRenderPerBatch={12}
          />
        </View>

        <View style={styles.agendaHeader}>
          <View style={styles.agendaCopy}>
            <Text style={styles.agendaTitle}>
              {isSameDay(selectedDate, today)
                ? "Today's meetings"
                : `${DAY_NAMES[selectedDate.getDay()]}, ${
                    MONTH_NAMES[selectedDate.getMonth()]
                  } ${selectedDate.getDate()}`}
            </Text>
            <Text style={styles.agendaSubtitle}>
              {dayEvents.length === 0
                ? 'No meetings scheduled'
                : `${dayEvents.length} meeting${
                    dayEvents.length === 1 ? '' : 's'
                  }`}
            </Text>
          </View>
          {!isSameDay(selectedDate, today) ? (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.jumpToday}
              onPress={() => handleSelectDate(today)}
            >
              <Text style={styles.jumpTodayText}>Today</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.eventCountPill}>
              <Text style={styles.eventCountText}>
                {dayEvents.length} up next
              </Text>
            </View>
          )}
        </View>

        <ScrollView
          style={styles.timelineScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.timelineScrollContent,
            { paddingBottom: insets.bottom + spacing['6xl'] },
          ]}
        >
          {!userId ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Sign in required</Text>
              <Text style={styles.emptyCopy}>
                Sign in to add meetings and see them on your calendar.
              </Text>
            </View>
          ) : isFetching && allEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.emptyCopy}>Loading your schedule…</Text>
            </View>
          ) : isError ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Couldn’t load events</Text>
              <Text style={styles.emptyCopy}>
                Check your connection, then try again.
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => refetch()}
                activeOpacity={0.85}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : dayEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <TouchableOpacity
                style={styles.emptyIconWrap}
                onPress={openCreateSheet}
                activeOpacity={0.88}
              >
                <PlusIcon />
              </TouchableOpacity>
              <Text style={styles.emptyTitle}>No meetings yet</Text>
              <Text style={styles.emptyCopy}>
                Add an event to see it on this day, including time, location, and
                AI reminder.
              </Text>
              <TouchableOpacity
                style={styles.emptyCta}
                onPress={openCreateSheet}
                activeOpacity={0.88}
              >
                <Text style={styles.emptyCtaText}>Add event</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.agendaList}>
              {dayEvents.map((event, index) => (
                <View key={event.id} style={styles.agendaRow}>
                  <View style={styles.agendaTimeCol}>
                    <Text numberOfLines={2} style={styles.agendaStartTime}>
                      {event.startTimeLabel}
                    </Text>
                    {index < dayEvents.length - 1 ? (
                      <View style={styles.agendaRail} />
                    ) : null}
                  </View>
                  <MeetingCard
                    event={event}
                    onPress={() => openEditSheet(event)}
                    onDelete={() => requestDeleteEvent(event)}
                  />
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <EventBottomSheet
        ref={eventSheetRef}
        mode={sheetMode}
        event={selectedEvent}
        initialDate={selectedDate}
        isSaving={isSaving}
        onSave={handleSaveEvent}
        onDelete={
          selectedEvent
            ? () => requestDeleteEvent(selectedEvent)
            : undefined
        }
      />

      <DeleteConfirmationModal
        visible={Boolean(eventPendingDelete)}
        itemType="event"
        itemTitle={eventPendingDelete?.title}
        loading={isDeleting}
        onCancel={() => setEventPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />
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
  addPressable: {
    borderRadius: radii.pill,
    ...shadows.primary,
  },
  addPressableActive: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
  addButton: {
    width: ms(42),
    height: ms(42),
    borderRadius: ms(21),
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateStrip: {
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  dateStripContent: {
    paddingHorizontal: DATE_STRIP_PADDING,
    paddingVertical: spacing.xl,
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
    marginTop: spacing.sm,
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: colors.primaryPurple,
  },
  eventDotSelected: {
    backgroundColor: colors.white,
  },
  todayDot: {
    marginTop: spacing.sm,
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: colors.primary,
  },
  dotSpacer: {
    marginTop: spacing.sm,
    height: ms(6),
  },
  agendaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  agendaCopy: {
    flex: 1,
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
  jumpToday: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryLight,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
  },
  jumpTodayText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
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
    flexGrow: 1,
  },
  agendaList: {
    gap: EVENT_ROW_GAP,
  },
  agendaRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: EVENT_CARD_HEIGHT,
  },
  agendaTimeCol: {
    width: TIME_COLUMN_WIDTH,
    paddingTop: spacing.sm,
    paddingRight: spacing.sm,
    alignItems: 'flex-end',
  },
  agendaStartTime: {
    width: '100%',
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    textAlign: 'right',
    lineHeight: ms(16),
    includeFontPadding: false,
  },
  agendaRail: {
    flex: 1,
    width: ms(2),
    marginTop: spacing.sm,
    marginRight: spacing.sm,
    alignSelf: 'flex-end',
    borderRadius: radii.pill,
    backgroundColor: colors.border,
  },
  eventCardWrap: {
    flex: 1,
    height: EVENT_CARD_HEIGHT,
  },
  eventCardPress: {
    flex: 1,
    ...shadows.soft,
  },
  eventCard: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  eventAccent: {
    width: ms(4),
    alignSelf: 'stretch',
  },
  eventBody: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  eventTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  moreButton: {
    width: ms(28),
    height: ms(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTime: {
    flex: 1,
    minWidth: 0,
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.1,
    includeFontPadding: false,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  eventTitle: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    lineHeight: ms(20),
    includeFontPadding: false,
  },
  aiMark: {
    flexShrink: 0,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  eventMeta: {
    flex: 1,
    minWidth: 0,
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    includeFontPadding: false,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['4xl'],
  },
  menuCard: {
    width: '100%',
    maxWidth: ms(260),
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.xl,
  },
  menuItemText: {
    color: colors.error,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['4xl'],
    paddingTop: spacing['6xl'],
    gap: spacing.md,
  },
  emptyIconWrap: {
    width: ms(56),
    height: ms(56),
    borderRadius: ms(28),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  emptyCopy: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
    lineHeight: ms(20),
  },
  emptyCta: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing['2xl'],
    minHeight: ms(44),
    borderRadius: radii.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCtaText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  retryButton: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing['2xl'],
    minHeight: ms(40),
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
});
