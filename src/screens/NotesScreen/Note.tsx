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
  useDeleteStagedNoteMutation,
  useGetNoteWorkspacesQuery,
  useGetStagedNotesBySpaceQuery,
  useLazyGetStagedNoteByIdQuery,
} from '../../store/api/home';
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
  const route = useRoute<RouteProp<MainTabParamList, 'Notes'>>();
  const noteSheetRef = useRef<BottomSheetModal>(null);
  const addNoteSheetRef = useRef<BottomSheetModal>(null);
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [selectedSpaceId, setSelectedSpaceId] = useState('');
  const [notesCursor, setNotesCursor] = useState('');
  const [loadedNotes, setLoadedNotes] = useState<StagedNoteCard[]>([]);
  const [localNotes, setLocalNotes] = useState<LocalNote[]>([]);
  const [nextNotesCursor, setNextNotesCursor] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [sortOrder, setSortOrder] = useState<NoteSortOrder>('newest');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const userId = useAppSelector(state => state.auth.userId) ?? '';
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
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

  const spaces = useMemo(
    () => noteWorkspacesData?.data?.spaces ?? [],
    [noteWorkspacesData],
  );
  const isSpacesInitialLoading = isFetching && spaces.length === 0;
  const selectedSpace = spaces.find(space => space.id === selectedSpaceId);
  const {
    data: stagedNotesData,
    isFetching: isFetchingNotes,
    isError: isNotesError,
    refetch: refetchNotes,
  } = useGetStagedNotesBySpaceQuery(
    {
      userId,
      spaceId: selectedSpaceId,
      limit: NOTES_PAGE_SIZE,
      cursor: notesCursor,
    },
    { skip: !userId || !selectedSpaceId },
  );

  const isInitialNotesLoading = isFetchingNotes && loadedNotes.length === 0;
  const isLoadingMoreNotes = isFetchingNotes && loadedNotes.length > 0;

  const selectedDateKey = useMemo(() => toDateKey(selectedDate), [selectedDate]);

  const spaceLocalNotes = useMemo(
    () => localNotes.filter(note => note.spaceId === selectedSpaceId),
    [localNotes, selectedSpaceId],
  );

  const markedDateKeys = useMemo(() => {
    const keys = new Set<string>();

    spaceLocalNotes.forEach(note => {
      keys.add(note.dateKey);
    });

    loadedNotes.forEach(note => {
      const key = formatDateKey(note.createdAt || note.updatedAt);
      if (key) {
        keys.add(key);
      }
    });

    return keys;
  }, [loadedNotes, spaceLocalNotes]);

  const displayedNotes = useMemo(() => {
    const localForDate = spaceLocalNotes
      .filter(note => note.dateKey === selectedDateKey)
      .map(toLocalStagedNote);

    const apiForDate = loadedNotes.filter(note => {
      const key = formatDateKey(note.createdAt || note.updatedAt);
      return key === selectedDateKey;
    });

    const normalizedQuery = searchQuery.trim().toLowerCase();
    let result = [...localForDate, ...apiForDate];

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
  }, [loadedNotes, searchQuery, selectedDateKey, sortOrder, spaceLocalNotes]);

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
    setNextNotesCursor(null);
  }, [selectedSpaceId]);

  useEffect(() => {
    const response = stagedNotesData?.data;

    if (!response) {
      return;
    }

    setNextNotesCursor(response.nextCursor);

    if (notesCursor === '') {
      setLoadedNotes(response.notes);
      return;
    }

    setLoadedNotes(prev => {
      const existingIds = new Set(prev.map(note => note.id));
      const newNotes = response.notes.filter(note => !existingIds.has(note.id));

      return newNotes.length > 0 ? [...prev, ...newNotes] : prev;
    });
  }, [notesCursor, stagedNotesData]);

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

    requestAnimationFrame(() => {
      addNoteSheetRef.current?.present();
    });
  }, [selectedSpaceId, showToast]);

  const handleSaveLocalNote = useCallback(
    (title: string, description: string) => {
      const createdAt = new Date().toISOString();
      const nextNote: LocalNote = {
        id: `local-${Date.now()}`,
        spaceId: selectedSpaceId,
        title,
        description,
        dateKey: selectedDateKey,
        createdAt,
      };

      setLocalNotes(prev => [nextNote, ...prev]);
      showToast({
        message: 'Note saved.',
        type: 'success',
      });
    },
    [selectedDateKey, selectedSpaceId, showToast],
  );

  const handleRetryNoteDetail = useCallback(() => {
    if (!selectedNoteId || isLocalNoteId(selectedNoteId)) {
      return;
    }

    getStagedNoteById({ noteId: selectedNoteId });
  }, [getStagedNoteById, selectedNoteId]);

  const getApiErrorMessage = (error: any, fallback: string) =>
    error?.data?.message || error?.message || fallback;

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
    const confidencePercent =
      typeof note.confidence === 'number'
        ? Math.round(note.confidence * 100)
        : null;
    const preview = note.bodyPreview || 'No note preview available.';
    const workspaceName = selectedSpace?.name || 'Space';

    return {
      id: note.id,
      tag: confidencePercent ? `CONF ${confidencePercent}%` : 'NOTE',
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
    if (isInitialNotesLoading) {
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

    if (loadedNotes.length === 0 && spaceLocalNotes.length === 0) {
      return (
        <View style={styles.stateBox}>
          <Text style={styles.emptyTitle}>No notes yet</Text>
          <Text style={styles.stateText}>
            Tap + to add a note for this day.
          </Text>
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
    isInitialNotesLoading,
    isNotesError,
    loadedNotes.length,
    refetchNotes,
    searchQuery,
    selectedDate,
    selectedSpaceId,
    spaceLocalNotes.length,
  ]);

  const notesListFooter = useMemo(() => {
    if (displayedNotes.length === 0) {
      return null;
    }

    if (nextNotesCursor) {
      return (
        <View style={styles.paginationFooter}>
          <Text style={styles.paginationText}>
            Showing {loadedNotes.length}
            {selectedSpace?.notesCount ? ` of ${selectedSpace.notesCount}` : ''}{' '}
            notes
          </Text>
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
        </View>
      );
    }

    if (loadedNotes.length >= NOTES_PAGE_SIZE) {
      return (
        <View style={styles.paginationFooter}>
          <Text style={styles.paginationText}>
            All {loadedNotes.length} notes loaded
          </Text>
        </View>
      );
    }

    return null;
  }, [
    displayedNotes.length,
    handleLoadMoreNotes,
    isLoadingMoreNotes,
    loadedNotes.length,
    nextNotesCursor,
    selectedSpace?.notesCount,
  ]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerWrap}>
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
        markedDateKeys={markedDateKeys}
        onSelectDate={setSelectedDate}
        onAddPress={handleOpenAddNote}
      />

      <FlatList
        data={
          displayedNotes.length === 0 &&
          (isInitialNotesLoading || isNotesError)
            ? []
            : displayedNotes
        }
        keyExtractor={item => item.id}
        renderItem={renderNoteItem}
        ListEmptyComponent={notesListEmpty}
        ListFooterComponent={notesListFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
        onSave={handleSaveLocalNote}
      />

      <NotesFilterMenu
        visible={filterMenuVisible}
        sortOrder={sortOrder}
        onClose={() => setFilterMenuVisible(false)}
        onSelect={setSortOrder}
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
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.md,
  },

  notesScroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: layout.tabBarClearance,
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
