import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import ReminderHeader from './components/ReminderHeader';
import ReminderFilters, {
  DateFilter,
  SourceFilter,
} from './components/ReminderFilters';
import ReminderCard from './components/ReminderCard';
import ReminderMicButton from './components/ReminderMicButton';
import ReminderListeningOverlay from './components/ReminderListeningOverlay';
import ReminderDetailBottomSheet from './components/ReminderDetailBottomSheet';
import { MOCK_REMINDERS, ReminderItem } from './components/mockReminders';
import { useToast } from '../../store/context/ToastContext';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  listPerf,
  ms,
  spacing,
} from '../../theme';

const GRID_GAP = spacing.xl;

const toDateKey = (date: Date) => date.toISOString().slice(0, 10);

const isSameWeek = (dateKey: string) => {
  const target = new Date(`${dateKey}T12:00:00`);
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return target >= start && target <= end;
};

const matchesDateFilter = (item: ReminderItem, filter: DateFilter) => {
  const todayKey = toDateKey(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = toDateKey(tomorrow);

  switch (filter) {
    case 'today':
      return item.dateKey === todayKey;
    case 'tomorrow':
      return item.dateKey === tomorrowKey;
    case 'week':
      return isSameWeek(item.dateKey);
    default:
      return true;
  }
};

const RemindersScreen = () => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const reminderSheetRef = useRef<BottomSheetModal>(null);

  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [reminders, setReminders] = useState<ReminderItem[]>(MOCK_REMINDERS);
  const [selectedReminder, setSelectedReminder] = useState<ReminderItem | null>(
    null,
  );

  const cardWidth = (width - layout.screenPadding * 2 - GRID_GAP) / 2;

  const filteredReminders = useMemo(() => {
    return reminders.filter(item => {
      const matchesSource =
        sourceFilter === 'all' || item.source === sourceFilter;
      const matchesDate = matchesDateFilter(item, dateFilter);
      return matchesSource && matchesDate;
    });
  }, [dateFilter, reminders, sourceFilter]);

  const handleOpenReminder = useCallback((item: ReminderItem) => {
    setSelectedReminder(item);
    requestAnimationFrame(() => {
      reminderSheetRef.current?.present();
    });
  }, []);

  const handleDeleteReminder = useCallback(
    (item: ReminderItem) => {
      setReminders(prev => prev.filter(reminder => reminder.id !== item.id));

      if (selectedReminder?.id === item.id) {
        reminderSheetRef.current?.dismiss();
        setSelectedReminder(null);
      }

      showToast({
        message: 'Reminder deleted.',
        type: 'success',
      });
    },
    [selectedReminder?.id, showToast],
  );

  const handleStartListening = useCallback(() => {
    setIsListening(true);
  }, []);

  const handleStopListening = useCallback(() => {
    setIsListening(false);
    showToast({
      message: 'Voice reminder coming soon.',
      type: 'success',
    });
  }, [showToast]);

  const renderItem = useCallback(
    ({ item }: { item: ReminderItem }) => (
      <ReminderCard
        item={item}
        width={cardWidth}
        onPress={() => handleOpenReminder(item)}
        onDelete={() => handleDeleteReminder(item)}
      />
    ),
    [cardWidth, handleDeleteReminder, handleOpenReminder],
  );

  return (
    <View style={styles.container}>
      <View
        style={styles.listTarget}
        pointerEvents={isListening ? 'none' : 'auto'}
      >
        <LinearGradient
          colors={['#FFF5EE', '#F3EEFF', '#F7F7FB', colors.white]}
          locations={[0, 0.35, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />

        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <FlatList
            data={filteredReminders}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.content,
              { paddingBottom: ms(220) + insets.bottom },
            ]}
            ListHeaderComponent={
              <View>
                <ReminderHeader />

                <ReminderFilters
                  sourceFilter={sourceFilter}
                  dateFilter={dateFilter}
                  isDateMenuOpen={isDateMenuOpen}
                  onSourceChange={setSourceFilter}
                  onDateChange={setDateFilter}
                  onDateMenuOpen={() => setIsDateMenuOpen(true)}
                  onDateMenuClose={() => setIsDateMenuOpen(false)}
                />

                {filteredReminders.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>No reminders found</Text>
                    <Text style={styles.emptyText}>
                      Try changing your AI, Manual, or Date filters.
                    </Text>
                  </View>
                ) : null}
              </View>
            }
            {...listPerf}
          />

          <View style={styles.micDock}>
            <ReminderMicButton
              bottomInset={insets.bottom}
              onPress={handleStartListening}
            />
          </View>
        </SafeAreaView>
      </View>

      <ReminderDetailBottomSheet
        ref={reminderSheetRef}
        reminder={selectedReminder}
      />

      <ReminderListeningOverlay
        visible={isListening}
        onStop={handleStopListening}
      />
    </View>
  );
};

export default RemindersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  listTarget: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  content: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
  },

  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: GRID_GAP,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['5xl'],
    paddingHorizontal: spacing['2xl'],
  },

  emptyTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },

  emptyText: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
    lineHeight: ms(20),
  },

  micDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
});
