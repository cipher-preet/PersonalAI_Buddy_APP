import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../navigation/types';

import Header from './component/Header';
import NotesFilterMenu from './component/NotesFilterMenu';
import CategoryTabs from './component/CategoryTabs';
import NoteCard from './component/NoteCard';
import NoteDetailBottomSheet from './component/NoteDetailBottomSheet';
import NotesCalendarStrip, { toDateKey } from './component/NotesCalendarStrip';
import AddNoteBottomSheet from './component/AddNoteBottomSheet';
import { LocalNote, NoteItem } from './types/note';
import type { NoteSortOrder } from './types/sort';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useToast } from '../../store/context/ToastContext';
import {
  homeApi,
  StagedNoteCard,
  useCreateStagedNoteMutation,
  useDeleteStagedNoteMutation,
  useGetNoteDateMarkersBySpaceQuery,
  useGetNoteWorkspacesQuery,
  useGetStagedNotesBySpaceQuery,
  useLazyGetStagedNoteByIdQuery,
} from '../../store/api/home';
import { useGetPlanStatusQuery } from '../../store/api/payments';
import UpgradePlanPromptModal from '../../components/UpgradePlanPromptModal';
import {
  getPlanLimitPrompt,
  getPlanLimitResource,
  isPlanLimitError,
  type PlanLimitResource,
} from '../../utils/planLimitError';
import { hasReachedCountLimit } from '../../utils/planUsage';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  listPerf,
  ms,
  mvs,
  radii,
  spacing,
} from '../../theme';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

const NOTES_PAGE_SIZE = 10;

const formatDate = (value: string | null) => {
  if (!value) {
    return 'Recently';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTime = (value: string | null) => {
  if (!value) {
    return 'Recently';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatDateKey = (value: string | null) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return toDateKey(date);
};

const formatFullDate = (date: Date) =>
  date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

const toLocalStagedNote = (note: LocalNote): StagedNoteCard => ({
  id: note.id,
  title: note.title,
  bodyPreview: note.description || 'No description added.',
  confidence: null,
  createdAt: note.createdAt,
  updatedAt: note.createdAt,
});

const isLocalNoteId = (id: string) => id.startsWith('local-');

const Notes = () => {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { tabBarClearance, screenPadding, contentMaxWidth, isTablet } =
    useResponsiveLayout();
  const route = useRoute<RouteProp<MainTabParamList, 'Notes'>>();
  const noteSheetRef = useRef<BottomSheetModal>(null);
  const addNoteSheetRef = useRef<BottomSheetModal>(null);
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [selectedSpaceId, setSelectedSpaceId] = useState('');
  const [notesCursor, setNotesCursor] = useState('');
  const [loadedNotes, setLoadedNotes] = useState<StagedNoteCard[]>([]);
  const [loadedNotesDateKey, setLoadedNotesDateKey] = useState('');
  const [dayNotesTotal, setDayNotesTotal] = useState(0);
  const appliedNotesCursorsRef = useRef<Set<string>>(new Set());
  const [localNotes, setLocalNotes] = useState<LocalNote[]>([]);
  const [nextNotesCursor, setNextNotesCursor] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [sortOrder, setSortOrder] = useState<NoteSortOrder>('newest');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeResource, setUpgradeResource] =
    useState<PlanLimitResource>('notes');
  const userId = useAppSelector(state => state.auth.userId) ?? '';
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [createStagedNote, { isLoading: isCreatingNote }] =
    useCreateStagedNoteMutation();
  const [deleteStagedNote] = useDeleteStagedNoteMutation();
  const [
    getStagedNoteById,
    {
      data: stagedNoteDetailData,
      isFetching: isFetchingNoteDetail,
      isError: isNoteDetailError,
    },
  ] = useLazyGetStagedNoteByIdQuery();
  const {
    data: noteWorkspacesData,
    isFetching,
    isError,
    refetch,
  } = useGetNoteWorkspacesQuery({ userId }, { skip: !userId });
  const { data: planStatus } = useGetPlanStatusQuery(
    { userId },
    { skip: !userId },
  );

  const spaces = useMemo(
    () => noteWorkspacesData?.data?.spaces ?? [],
    [noteWorkspacesData],
  );
  const isSpacesInitialLoading = isFetching && spaces.length === 0;
  const selectedSpace = spaces.find(space => space.id === selectedSpaceId);
  const selectedDateKey = useMemo(() => toDateKey(selectedDate), [selectedDate]);
  const markerRange = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const from = toDateKey(new Date(year, month, 1));
    const to = toDateKey(new Date(year, month + 1, 0));
    return { from, to };
  }, [selectedDate]);

  const {
    data: stagedNotesData,
    isFetching: isFetchingNotes,
    isError: isNotesError,
    isSuccess: isNotesSuccess,
    refetch: refetchNotes,
  } = useGetStagedNotesBySpaceQuery(
    {
      userId,
      spaceId: selectedSpaceId,
      limit: NOTES_PAGE_SIZE,
      cursor: notesCursor,
      date: selectedDateKey,
    },
    { skip: !userId || !selectedSpaceId || !selectedDateKey },
  );

  const { data: noteMarkersData } = useGetNoteDateMarkersBySpaceQuery(
    {
      userId,
      spaceId: selectedSpaceId,
      from: markerRange.from,
      to: markerRange.to,
    },
    { skip: !userId || !selectedSpaceId },
  );

  const isInitialNotesLoading =
    isFetchingNotes &&
    (loadedNotesDateKey !== selectedDateKey || loadedNotes.length === 0) &&
    notesCursor === '';
  const isLoadingMoreNotes = isFetchingNotes && notesCursor !== '';

  const spaceLocalNotes = useMemo(
    () =>
      localNotes.filter(
        note =>
          note.spaceId === selectedSpaceId && note.dateKey === selectedDateKey,
      ),
    [localNotes, selectedDateKey, selectedSpaceId],
  );

  const calendarMarkedDateKeys = useMemo(() => {
    const keys = new Set<string>(noteMarkersData?.data?.dates ?? []);
    spaceLocalNotes.forEach(note => {
      keys.add(note.dateKey);
    });
    if (loadedNotesDateKey === selectedDateKey && loadedNotes.length > 0) {
      keys.add(selectedDateKey);
    }
    return keys;
  }, [
    loadedNotes.length,
    loadedNotesDateKey,
    noteMarkersData?.data?.dates,
    selectedDateKey,
    spaceLocalNotes,
  ]);

  const dateScopedNotes =
    loadedNotesDateKey === selectedDateKey ? loadedNotes : [];

  const displayedNotes = useMemo(() => {
    const localForDate = spaceLocalNotes.map(toLocalStagedNote);
    const normalizedQuery = searchQuery.trim().toLowerCase();
    let result = [...localForDate, ...dateScopedNotes];

    if (normalizedQuery) {
      result = result.filter(note => {
        const title = note.title?.toLowerCase() ?? '';
        const preview = note.bodyPreview?.toLowerCase() ?? '';
        return (
          title.includes(normalizedQuery) || preview.includes(normalizedQuery)
        );
      });
    }

    result.sort((left, right) => {
      const leftTime = new Date(
        left.updatedAt || left.createdAt || 0,
      ).getTime();
      const rightTime = new Date(
        right.updatedAt || right.createdAt || 0,
      ).getTime();

      return sortOrder === 'newest' ? rightTime - leftTime : leftTime - rightTime;
    });

    return result;
  }, [dateScopedNotes, searchQuery, sortOrder, spaceLocalNotes]);

  useFocusEffect(
    useCallback(() => {
      const spaceId = route.params?.spaceId;

      if (!spaceId) {
        return;
      }

      setSelectedSpaceId(spaceId);
      navigation.setParams({ spaceId: undefined });
    }, [navigation, route.params?.spaceId]),
  );

  useEffect(() => {
    if (spaces.length === 0) {
      return;
    }

    const selectedStillExists = spaces.some(space => space.id === selectedSpaceId);

    if (!selectedSpaceId || !selectedStillExists) {
      setSelectedSpaceId(spaces[0].id);
    }
  }, [selectedSpaceId, spaces]);

  useEffect(() => {
    setNotesCursor('');
    setLoadedNotes([]);
    setLoadedNotesDateKey('');
    setDayNotesTotal(0);
    setNextNotesCursor(null);
    appliedNotesCursorsRef.current = new Set();
  }, [selectedSpaceId, selectedDateKey]);

  useEffect(() => {
    const response = stagedNotesData?.data;

    if (!response || !isNotesSuccess || isFetchingNotes) {
      return;
    }

    // Ignore stale responses from a previous date/space while args are changing.
    if (response.date && response.date !== selectedDateKey) {
      return;
    }

    const cursorKey = notesCursor || '__root__';

    // First page: always replace. Later pages: apply once per cursor (avoids
    // duplicates when RTK refetches the same cursor after invalidation).
    if (notesCursor !== '' && appliedNotesCursorsRef.current.has(cursorKey)) {
      setNextNotesCursor(response.nextCursor);
      if (typeof response.total === 'number') {
        setDayNotesTotal(response.total);
      }
      return;
    }

    appliedNotesCursorsRef.current.add(cursorKey);
    setNextNotesCursor(response.nextCursor);
    setLoadedNotesDateKey(selectedDateKey);
    if (typeof response.total === 'number') {
      setDayNotesTotal(response.total);
    }

    if (notesCursor === '') {
      appliedNotesCursorsRef.current = new Set(['__root__']);
      setLoadedNotes(response.notes);
      return;
    }

    setLoadedNotes(prev => {
      const existingIds = new Set(prev.map(note => note.id));
      const newNotes = response.notes.filter(note => !existingIds.has(note.id));
      return newNotes.length > 0 ? [...prev, ...newNotes] : prev;
    });
  }, [
    isFetchingNotes,
    isNotesSuccess,
    notesCursor,
    selectedDateKey,
    stagedNotesData,
  ]);

  const handleOpenNote = useCallback(
    (note: NoteItem) => {
      setSelectedNote(note);
      setSelectedNoteId(note.id);

      requestAnimationFrame(() => {
        noteSheetRef.current?.present();
      });

      if (!isLocalNoteId(note.id)) {
        getStagedNoteById({ noteId: note.id });
      }
    },
    [getStagedNoteById],
  );

  const handleOpenAddNote = useCallback(() => {
    if (!selectedSpaceId) {
      showToast({
        message: 'Select a space before adding a note.',
        type: 'info',
      });
      return;
    }

    if (
      hasReachedCountLimit(
        planStatus?.usage?.notes,
        planStatus?.plan?.limits?.notes,
      )
    ) {
      setUpgradeResource('notes');
      setShowUpgradePrompt(true);
      return;
    }

    requestAnimationFrame(() => {
      addNoteSheetRef.current?.present();
    });
  }, [planStatus?.plan?.limits?.notes, planStatus?.usage?.notes, selectedSpaceId, showToast]);

  const getApiErrorMessage = (error: any, fallback: string) =>
    error?.data?.message || error?.message || fallback;

  const handleSaveNote = useCallback(
    async (title: string, description: string) => {
      if (!selectedSpaceId) {
        showToast({
          message: 'Select a space before adding a note.',
          type: 'info',
        });
        throw new Error('Missing space');
      }

      try {
        const response = await createStagedNote({
          spaceId: selectedSpaceId,
          title,
          description,
          date: selectedDateKey,
        }).unwrap();

        const createdNote = response?.data?.note;

        if (createdNote) {
          const createdDateKey =
            formatDateKey(createdNote.createdAt || createdNote.updatedAt) ||
            selectedDateKey;

          if (createdDateKey === selectedDateKey) {
            setLoadedNotes(prev => [
              createdNote,
              ...prev.filter(item => item.id !== createdNote.id),
            ]);
            setLoadedNotesDateKey(selectedDateKey);
            setDayNotesTotal(prev => prev + 1);
          }

          if (userId) {
            dispatch(
              homeApi.util.updateQueryData(
                'getNoteDateMarkersBySpace',
                {
                  userId,
                  spaceId: selectedSpaceId,
                  from: markerRange.from,
                  to: markerRange.to,
                },
                draft => {
                  if (!draft?.data?.dates.includes(createdDateKey)) {
                    draft.data.dates = [...draft.data.dates, createdDateKey].sort();
                  }
                },
              ),
            );
          }
        }

        if (userId) {
          dispatch(
            homeApi.util.updateQueryData(
              'getNoteWorkspaces',
              { userId },
              draft => {
                const space = draft?.data?.spaces?.find(
                  item => item.id === selectedSpaceId,
                );
                if (space) {
                  space.notesCount += 1;
                }
              },
            ),
          );
        }

        showToast({
          message: response?.data?.message || 'Note saved.',
          type: 'success',
        });
      } catch (error: any) {
        if (isPlanLimitError(error)) {
          setUpgradeResource(getPlanLimitResource(error) || 'notes');
          setShowUpgradePrompt(true);
          throw error;
        }

        showToast({
          message: getApiErrorMessage(error, 'Unable to save note.'),
          type: 'error',
        });
        throw error;
      }
    },
    [createStagedNote, dispatch, markerRange.from, markerRange.to, selectedDateKey, selectedSpaceId, showToast, userId],
  );

  const handleRetryNoteDetail = useCallback(() => {
    if (!selectedNoteId || isLocalNoteId(selectedNoteId)) {
      return;
    }

    getStagedNoteById({ noteId: selectedNoteId });
  }, [getStagedNoteById, selectedNoteId]);

  const handleDeleteNote = useCallback(
    async (note: NoteItem) => {
      if (isLocalNoteId(note.id)) {
        setLocalNotes(prev => prev.filter(item => item.id !== note.id));

        if (selectedNoteId === note.id) {
          noteSheetRef.current?.dismiss();
          setSelectedNote(null);
          setSelectedNoteId('');
        }

        showToast({
          message: 'Note deleted.',
          type: 'success',
        });
        return;
      }

      try {
        const response = await deleteStagedNote({
          noteId: note.id,
        }).unwrap();

        setLoadedNotes(prev => prev.filter(item => item.id !== note.id));
        setDayNotesTotal(prev => {
          const next = Math.max(0, prev - 1);
          if (
            next === 0 &&
            userId &&
            selectedSpaceId &&
            loadedNotesDateKey === selectedDateKey
          ) {
            dispatch(
              homeApi.util.updateQueryData(
                'getNoteDateMarkersBySpace',
                {
                  userId,
                  spaceId: selectedSpaceId,
                  from: markerRange.from,
                  to: markerRange.to,
                },
                draft => {
                  draft.data.dates = draft.data.dates.filter(
                    key => key !== selectedDateKey,
                  );
                },
              ),
            );
          }
          return next;
        });

        if (selectedSpaceId && userId) {
          dispatch(
            homeApi.util.updateQueryData(
              'getNoteWorkspaces',
              { userId },
              draft => {
                const space = draft?.data?.spaces?.find(
                  item => item.id === selectedSpaceId,
                );
                if (space && space.notesCount > 0) {
                  space.notesCount -= 1;
                }
              },
            ),
          );
        }

        if (selectedNoteId === note.id) {
          noteSheetRef.current?.dismiss();
          setSelectedNote(null);
          setSelectedNoteId('');
        }

        showToast({
          message:
            response?.data?.message ||
            response?.message ||
            'Note deleted successfully.',
          type: 'success',
        });
      } catch (error: any) {
        showToast({
          message: getApiErrorMessage(error, 'Unable to delete note.'),
          type: 'error',
        });
      }
    },
    [
      deleteStagedNote,
      dispatch,
      loadedNotesDateKey,
      markerRange.from,
      markerRange.to,
      selectedDateKey,
      selectedNoteId,
      selectedSpaceId,
      showToast,
      userId,
    ],
  );

  const handleLoadMoreNotes = useCallback(() => {
    if (!nextNotesCursor || isLoadingMoreNotes) {
      return;
    }

    setNotesCursor(nextNotesCursor);
  }, [isLoadingMoreNotes, nextNotesCursor]);

  const toNoteItem = useCallback((note: StagedNoteCard): NoteItem => {
    const preview = note.bodyPreview || 'No note preview available.';
    const workspaceName = selectedSpace?.name || 'Space';

    return {
      id: note.id,
      tag: 'NOTE',
      title: note.title || 'Untitled note',
      desc: preview,
      time: formatTime(note.updatedAt || note.createdAt),
      updatedAt: formatDate(note.updatedAt),
      createdAt: formatDate(note.createdAt),
      workspace: workspaceName,
      readTime: 'Quick note',
      tags: ['#Note'],
      summary: preview,
      highlights: [preview],
      sections: [
        {
          title: 'Captured note',
          content: preview,
        },
      ],
      actionItems: [],
      body: preview,
      relatedNotes: [],
    };
  }, [selectedSpace?.name]);

  const renderNoteItem = useCallback(
    ({ item: note }: { item: StagedNoteCard }) => {
      const item = toNoteItem(note);

      return (
        <NoteCard
          item={item}
          onPress={() => handleOpenNote(item)}
          onDelete={() => handleDeleteNote(item)}
        />
      );
    },
    [handleDeleteNote, handleOpenNote, toNoteItem],
  );

  const notesListEmpty = useMemo(() => {
    if (isInitialNotesLoading || (isFetchingNotes && displayedNotes.length === 0)) {
      return (
        <View style={styles.stateBox}>
          <ActivityIndicator size="small" color={colors.primaryDark} />
          <Text style={styles.stateText}>Loading notes...</Text>
        </View>
      );
    }

    if (isNotesError) {
      return (
        <View style={styles.stateBox}>
          <Text style={styles.errorText}>Unable to load notes.</Text>
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.retryButton}
            onPress={refetchNotes}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!selectedSpaceId) {
      return (
        <View style={styles.stateBox}>
          <Text style={styles.emptyTitle}>Select a space</Text>
          <Text style={styles.stateText}>Space notes will appear here.</Text>
        </View>
      );
    }

    if (searchQuery.trim()) {
      return (
        <View style={styles.stateBox}>
          <Text style={styles.emptyTitle}>No matching notes</Text>
          <Text style={styles.stateText}>
            Try a different search term or clear your filters.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.stateBox}>
        <Text style={styles.emptyTitle}>No notes on this day</Text>
        <Text style={styles.stateText}>
          Tap + to add a note for {formatFullDate(selectedDate)}.
        </Text>
      </View>
    );
  }, [
    displayedNotes.length,
    isFetchingNotes,
    isInitialNotesLoading,
    isNotesError,
    refetchNotes,
    searchQuery,
    selectedDate,
    selectedSpaceId,
  ]);

  const notesListFooter = useMemo(() => {
    if (displayedNotes.length === 0) {
      return null;
    }

    const loadedCount = dateScopedNotes.length;
    const totalForDay = Math.max(dayNotesTotal, loadedCount);

    return (
      <View style={styles.paginationFooter}>
        <Text style={styles.paginationText}>
          Showing {loadedCount}
          {totalForDay > 0 ? ` of ${totalForDay}` : ''} notes for this day
        </Text>
        {nextNotesCursor ? (
          <View style={styles.loadMoreWrap}>
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={isLoadingMoreNotes}
              style={[
                styles.loadMoreButton,
                isLoadingMoreNotes && styles.loadMoreButtonDisabled,
              ]}
              onPress={handleLoadMoreNotes}
            >
              {isLoadingMoreNotes ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.loadMoreText}>Load more</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  }, [
    dateScopedNotes.length,
    dayNotesTotal,
    displayedNotes.length,
    handleLoadMoreNotes,
    isLoadingMoreNotes,
    nextNotesCursor,
  ]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View
        style={[styles.headerWrap, { paddingHorizontal: screenPadding }]}
      >
        <Header
          searchQuery={searchQuery}
          sortOrder={sortOrder}
          isSearchActive={isSearchActive}
          onSearchQueryChange={setSearchQuery}
          onSearchOpen={() => setIsSearchActive(true)}
          onSearchClose={() => {
            setIsSearchActive(false);
            setSearchQuery('');
          }}
          onFilterPress={() => setFilterMenuVisible(true)}
        />
      </View>

      <CategoryTabs
        spaces={spaces}
        selectedSpaceId={selectedSpaceId}
        isLoading={isSpacesInitialLoading}
        isError={isError}
        onRetry={refetch}
        onSelectSpace={setSelectedSpaceId}
        onNavigateTasks={() => navigation.navigate('Tasks')}
      />

      <NotesCalendarStrip
        selectedDate={selectedDate}
        markedDateKeys={calendarMarkedDateKeys}
        onSelectDate={setSelectedDate}
        onAddPress={handleOpenAddNote}
      />

      <FlatList
        data={
          displayedNotes.length === 0 &&
          (isInitialNotesLoading || isNotesError || isFetchingNotes)
            ? []
            : displayedNotes
        }
        keyExtractor={item => item.id}
        renderItem={renderNoteItem}
        ListEmptyComponent={notesListEmpty}
        ListFooterComponent={notesListFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: tabBarClearance,
            paddingHorizontal: screenPadding,
            maxWidth: isTablet ? contentMaxWidth : undefined,
            width: '100%',
            alignSelf: 'center',
          },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        style={styles.notesScroll}
        {...listPerf}
      />

      <NoteDetailBottomSheet
        ref={noteSheetRef}
        note={selectedNote}
        detail={
          selectedNoteId && isLocalNoteId(selectedNoteId)
            ? null
            : stagedNoteDetailData?.data ?? null
        }
        isLoading={
          Boolean(selectedNoteId) &&
          !isLocalNoteId(selectedNoteId) &&
          isFetchingNoteDetail
        }
        isError={
          Boolean(selectedNoteId) &&
          !isLocalNoteId(selectedNoteId) &&
          isNoteDetailError
        }
        onRetry={handleRetryNoteDetail}
      />

      <AddNoteBottomSheet
        ref={addNoteSheetRef}
        dateLabel={formatFullDate(selectedDate)}
        isSaving={isCreatingNote}
        onSave={handleSaveNote}
      />

      <NotesFilterMenu
        visible={filterMenuVisible}
        sortOrder={sortOrder}
        onClose={() => setFilterMenuVisible(false)}
        onSelect={setSortOrder}
      />

      <UpgradePlanPromptModal
        visible={showUpgradePrompt}
        title={getPlanLimitPrompt(upgradeResource).title}
        message={getPlanLimitPrompt(upgradeResource).message}
        onClose={() => setShowUpgradePrompt(false)}
        onUpgrade={() => {
          setShowUpgradePrompt(false);
          addNoteSheetRef.current?.dismiss();
          navigation.navigate('Plans' as never);
        }}
      />
    </SafeAreaView>
  );
};

export default Notes;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: layout.screenTop,
  },

  headerWrap: {
    marginBottom: spacing.md,
  },

  notesScroll: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  stateBox: {
    minHeight: mvs(120),
    marginBottom: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  stateText: {
    marginTop: spacing.sm,
    color: colors.gray,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },

  emptyTitle: {
    color: colors.black,
    fontSize: fontSize.base,
    fontWeight: fontWeight.extrabold,
  },

  errorText: {
    color: colors.errorDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
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

  paginationFooter: {
    marginTop: spacing.lg,
    marginBottom: mvs(24),
  },

  paginationText: {
    marginBottom: spacing.sm,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
});
