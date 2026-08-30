import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
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
import ReminderDetailBottomSheet, {
  ReminderDraft,
} from './components/ReminderDetailBottomSheet';
import { ReminderItem } from './components/mockReminders';
import useReminderVoice from './hooks/useReminderVoice';
import { useToast } from '../../store/context/ToastContext';
import { useAppSelector } from '../../store/hooks';
import {
  useCreateReminderMutation,
  useDeleteReminderMutation,
  useGetRemindersQuery,
  useUpdateReminderMutation,
  type ReminderCard as ReminderApiCard,
} from '../../store/api/reminders';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  listPerf,
  ms,
  radii,
  spacing,
} from '../../theme';

const GRID_GAP = spacing.xl;
const REMINDERS_PAGE_SIZE = 20;

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toReminderItem = (item: ReminderApiCard): ReminderItem => ({
  id: item.id,
  title: item.title,
  description: item.description,
  timeLabel: item.timeLabel,
  dateLabel: item.dateLabel,
  source: item.source,
  dateKey: item.dateKey,
  tone: item.tone,
  repeat: item.repeat,
  aiCalling: item.aiCalling,
  notification: item.notification,
  beeping: item.beeping,
});

const RemindersScreen = () => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const reminderSheetRef = useRef<BottomSheetModal>(null);
  const userId = useAppSelector(state => state.auth.userId) ?? '';

  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<'create' | 'edit'>('edit');
  const [remindersCursor, setRemindersCursor] = useState('');
  const [loadedReminders, setLoadedReminders] = useState<ReminderItem[]>([]);
  const [nextRemindersCursor, setNextRemindersCursor] = useState<string | null>(
    null,
  );
  const [selectedReminder, setSelectedReminder] = useState<ReminderItem | null>(
    null,
  );

  const cardWidth = (width - layout.screenPadding * 2 - GRID_GAP) / 2;
  const anchorDate = useMemo(() => toDateKey(new Date()), []);

  const {
    data: remindersData,
    isFetching: isFetchingReminders,
    isError: isRemindersError,
    refetch: refetchReminders,
  } = useGetRemindersQuery(
    {
      limit: REMINDERS_PAGE_SIZE,
      cursor: remindersCursor,
      source: sourceFilter,
      dateFilter,
      anchorDate,
    },
    { skip: !userId },
  );

  const [createReminder, { isLoading: isCreatingReminder }] =
    useCreateReminderMutation();
  const [updateReminder, { isLoading: isUpdatingReminder }] =
    useUpdateReminderMutation();
  const [deleteReminder, { isLoading: isDeletingReminder }] =
    useDeleteReminderMutation();

  const isSavingReminder = isCreatingReminder || isUpdatingReminder;
  const isInitialRemindersLoading =
    isFetchingReminders && loadedReminders.length === 0;
  const isLoadingMoreReminders =
    isFetchingReminders && loadedReminders.length > 0;

  useEffect(() => {
    setRemindersCursor('');
    setLoadedReminders([]);
    setNextRemindersCursor(null);
  }, [dateFilter, sourceFilter]);

  useEffect(() => {
    const response = remindersData?.data;

    if (!response) {
      return;
    }

    setNextRemindersCursor(response.nextCursor);

    const mapped = response.reminders.map(toReminderItem);

    if (remindersCursor === '') {
      setLoadedReminders(mapped);
      return;
    }

    setLoadedReminders(prev => {
      const existingIds = new Set(prev.map(item => item.id));
      const newItems = mapped.filter(item => !existingIds.has(item.id));
      return newItems.length > 0 ? [...prev, ...newItems] : prev;
    });
  }, [remindersCursor, remindersData]);

  const getApiErrorMessage = (error: any, fallback: string) =>
    error?.data?.message || error?.message || fallback;

  const handleOpenReminder = useCallback((item: ReminderItem) => {
    setSheetMode('edit');
    setSelectedReminder(item);
    requestAnimationFrame(() => {
      reminderSheetRef.current?.present();
    });
  }, []);

  const handleOpenAddReminder = useCallback(() => {
    setSheetMode('create');
    setSelectedReminder(null);
    requestAnimationFrame(() => {
      reminderSheetRef.current?.present();
    });
  }, []);

  const handleSaveReminder = useCallback(
    async (draft: ReminderDraft) => {
      try {
        if (sheetMode === 'edit' && selectedReminder) {
          const response = await updateReminder({
            reminderId: selectedReminder.id,
            ...draft,
          }).unwrap();

          const updated = response?.data?.reminder
            ? toReminderItem(response.data.reminder)
            : { ...selectedReminder, ...draft };

          setLoadedReminders(prev =>
            prev.map(item => (item.id === updated.id ? updated : item)),
          );
          setSelectedReminder(updated);

          showToast({
            message: response?.data?.message || 'Reminder updated.',
            type: 'success',
          });
          return;
        }

        const response = await createReminder(draft).unwrap();
        const created = response?.data?.reminder
          ? toReminderItem(response.data.reminder)
          : null;

        if (created) {
          setLoadedReminders(prev => [
            created,
            ...prev.filter(item => item.id !== created.id),
          ]);
        }

        if (remindersCursor !== '') {
          setRemindersCursor('');
        }

        showToast({
          message: response?.data?.message || 'Reminder saved.',
          type: 'success',
        });
      } catch (error: any) {
        showToast({
          message: getApiErrorMessage(
            error,
            sheetMode === 'edit'
              ? 'Unable to update reminder.'
              : 'Unable to save reminder.',
          ),
          type: 'error',
        });
        throw error;
      }
    },
    [
      createReminder,
      remindersCursor,
      selectedReminder,
      sheetMode,
      showToast,
      updateReminder,
    ],
  );

  const handleSaveVoiceReminder = useCallback(
    async (draft: ReminderDraft) => {
      try {
        const response = await createReminder({
          ...draft,
          source: 'ai',
        }).unwrap();
        const created = response?.data?.reminder
          ? toReminderItem(response.data.reminder)
          : null;

        if (created) {
          setLoadedReminders(prev => [
            created,
            ...prev.filter(item => item.id !== created.id),
          ]);
        }

        if (remindersCursor !== '') {
          setRemindersCursor('');
        }

        showToast({
          message: response?.data?.message || 'Reminder saved.',
          type: 'success',
        });
      } catch (error: any) {
        const message = getApiErrorMessage(error, 'Unable to save reminder.');
        showToast({
          message,
          type: 'error',
        });
        throw new Error(message);
      }
    },
    [createReminder, remindersCursor, showToast],
  );

  const reminderVoice = useReminderVoice({
    userId,
    onSave: handleSaveVoiceReminder,
  });

  const handleDeleteReminder = useCallback(
    async (item: ReminderItem) => {
      try {
        const response = await deleteReminder({
          reminderId: item.id,
        }).unwrap();

        setLoadedReminders(prev =>
          prev.filter(reminder => reminder.id !== item.id),
        );

        if (selectedReminder?.id === item.id) {
          reminderSheetRef.current?.dismiss();
          setSelectedReminder(null);
        }

        showToast({
          message:
            response?.data?.message ||
            response?.message ||
            'Reminder deleted.',
          type: 'success',
        });
      } catch (error: any) {
        showToast({
          message: getApiErrorMessage(error, 'Unable to delete reminder.'),
          type: 'error',
        });
      }
    },
    [deleteReminder, selectedReminder?.id, showToast],
  );

  const handleStartListening = useCallback(() => {
    reminderVoice.startSession().catch(error => {
      showToast({
        message:
          error?.message || 'Unable to start voice reminder. Please try again.',
        type: 'error',
      });
    });
  }, [reminderVoice, showToast]);

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

  const remindersListEmpty = useMemo(() => {
    if (!userId) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Sign in required</Text>
          <Text style={styles.emptyText}>
            Sign in to view and add reminders.
          </Text>
        </View>
      );
    }

    if (isInitialRemindersLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="small" color={colors.primaryDark} />
          <Text style={styles.emptyText}>Loading reminders...</Text>
        </View>
      );
    }

    if (isRemindersError) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.errorText}>Unable to load reminders.</Text>
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.retryButton}
            onPress={refetchReminders}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No reminders found</Text>
        <Text style={styles.emptyText}>
          Tap + to add a reminder, or try a different filter.
        </Text>
      </View>
    );
  }, [
    isInitialRemindersLoading,
    isRemindersError,
    refetchReminders,
    userId,
  ]);

  const remindersListFooter = useMemo(() => {
    if (loadedReminders.length === 0 || !nextRemindersCursor) {
      return null;
    }

    return (
      <View style={styles.loadMoreWrap}>
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={isLoadingMoreReminders || isDeletingReminder}
          style={[
            styles.loadMoreButton,
            isLoadingMoreReminders && styles.loadMoreButtonDisabled,
          ]}
          onPress={() => setRemindersCursor(nextRemindersCursor)}
        >
          {isLoadingMoreReminders ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.loadMoreText}>Load more</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }, [
    isDeletingReminder,
    isLoadingMoreReminders,
    loadedReminders.length,
    nextRemindersCursor,
  ]);

  return (
    <View style={styles.container}>
      <View
        style={styles.listTarget}
        pointerEvents={reminderVoice.visible ? 'none' : 'auto'}
      >
        <LinearGradient
          colors={['#FFF5EE', '#F3EEFF', '#F7F7FB', colors.white]}
          locations={[0, 0.35, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />

        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <FlatList
            data={
              loadedReminders.length === 0 &&
              (isInitialRemindersLoading || isRemindersError)
                ? []
                : loadedReminders
            }
            keyExtractor={item => item.id}
            renderItem={renderItem}
            numColumns={2}
            columnWrapperStyle={
              loadedReminders.length > 0 ? styles.columnWrapper : undefined
            }
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
              </View>
            }
            ListEmptyComponent={remindersListEmpty}
            ListFooterComponent={remindersListFooter}
            {...listPerf}
          />

          <View style={styles.micDock}>
            <ReminderMicButton
              bottomInset={insets.bottom}
              onPress={handleStartListening}
              onAddPress={handleOpenAddReminder}
            />
          </View>
        </SafeAreaView>
      </View>

      <ReminderDetailBottomSheet
        ref={reminderSheetRef}
        mode={sheetMode}
        reminder={selectedReminder}
        isSaving={isSavingReminder}
        onSave={handleSaveReminder}
      />

      <ReminderListeningOverlay
        visible={reminderVoice.visible}
        phase={reminderVoice.phase}
        statusText={reminderVoice.statusText}
        hintText={reminderVoice.hintText}
        errorText={reminderVoice.errorText}
        onStop={reminderVoice.handleStopListening}
        onRetry={reminderVoice.retryTurn}
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
    flexGrow: 1,
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
    marginTop: spacing.sm,
  },

  errorText: {
    color: colors.errorDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },

  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: ms(14),
    paddingVertical: ms(7),
    borderRadius: radii.pill,
    backgroundColor: colors.purpleLight,
  },

  retryText: {
    color: colors.primaryDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold,
  },

  loadMoreWrap: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },

  loadMoreButton: {
    minHeight: ms(36),
    paddingHorizontal: layout.screenPadding,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  loadMoreButtonDisabled: {
    opacity: 0.7,
  },

  loadMoreText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  micDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
});
