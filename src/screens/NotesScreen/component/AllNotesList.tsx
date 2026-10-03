import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import NoteCard from './NoteCard';
import ListStateBox, { LoadMoreFooter } from './ListStateBox';
import { NoteItem } from '../types/note';
import {
  type GetStagedNotesBySpaceResponse,
  type StagedNoteCard,
  useGetStagedNotesBySpaceQuery,
} from '../../../store/api/home';
import { useKeyedCursor, usePageAccumulator } from '../../../hooks/usePaginatedList';
import {
  colors,
  fontSize,
  fontWeight,
  listPerf,
  radii,
  scrollThrottle,
  spacing,
} from '../../../theme';

const NOTES_PAGE_SIZE = 15;

const selectNotes = (response: GetStagedNotesBySpaceResponse) =>
  response.data?.notes ?? [];
const selectNextCursor = (response: GetStagedNotesBySpaceResponse) =>
  response.data?.nextCursor ?? null;
const getNoteId = (note: StagedNoteCard) => note.id;

type Row =
  | { type: 'header'; key: string; label: string; count: number }
  | { type: 'note'; key: string; note: StagedNoteCard };

const formatSessionLabel = (value: string | null) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return 'Conversation';
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const day =
    date.toDateString() === today.toDateString()
      ? 'Today'
      : date.toDateString() === yesterday.toDateString()
        ? 'Yesterday'
        : date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            ...(date.getFullYear() !== today.getFullYear()
              ? { year: 'numeric' }
              : {}),
          });
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return `Conversation · ${day}, ${time}`;
};

/** Consecutive notes from the same conversation share one section heading. */
const buildRows = (notes: StagedNoteCard[]): Row[] => {
  const rows: Row[] = [];
  let index = 0;

  while (index < notes.length) {
    const groupKey = notes[index].conversationId ?? null;
    let end = index;
    while (end + 1 < notes.length && (notes[end + 1].conversationId ?? null) === groupKey) {
      end += 1;
    }

    const run = notes.slice(index, end + 1);
    const oldest = run[run.length - 1];
    rows.push({
      type: 'header',
      key: `header-${run[0].id}`,
      label: groupKey
        ? formatSessionLabel(oldest.createdAt || oldest.updatedAt)
        : 'Added by you',
      count: run.length,
    });
    run.forEach(note => rows.push({ type: 'note', key: note.id, note }));
    index = end + 1;
  }

  return rows;
};

type Props = {
  userId: string;
  spaceId: string;
  /**
   * Bump to jump back to the first page (e.g. after a note is added); the
   * `Notes` cache invalidation performs the actual refetch.
   */
  refreshKey: number;
  searchQuery: string;
  contentContainerStyle: StyleProp<ViewStyle>;
  toNoteItem: (note: StagedNoteCard) => NoteItem;
  onOpenNote: (note: NoteItem) => void;
  /** Resolves true when the note was deleted on the server. */
  onDeleteNote: (note: NoteItem) => Promise<boolean>;
};

const AllNotesList = ({
  userId,
  spaceId,
  refreshKey,
  searchQuery,
  contentContainerStyle,
  toNoteItem,
  onOpenNote,
  onDeleteNote,
}: Props) => {
  const resetKey = `${spaceId}:${refreshKey}`;
  const [cursor, setCursor] = useKeyedCursor(resetKey);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);

  const { currentData, isFetching, isError, refetch } =
    useGetStagedNotesBySpaceQuery(
      { userId, spaceId, limit: NOTES_PAGE_SIZE, cursor },
      { skip: !userId || !spaceId, refetchOnMountOrArgChange: true },
    );

  const { items: notes, nextCursor, hasLoaded, removeItem } =
    usePageAccumulator({
      resetKey,
      cursor,
      response: currentData,
      isFetching,
      selectItems: selectNotes,
      selectNextCursor,
      getId: getNoteId,
    });

  useEffect(() => {
    if (!isFetching) {
      setIsPullRefreshing(false);
    }
  }, [isFetching]);

  // The backend only returns `total` with the first page.
  const [knownTotal, setKnownTotal] = useState({ key: '', total: 0 });
  const pageTotal = currentData?.data?.total;
  useEffect(() => {
    if (typeof pageTotal === 'number') {
      setKnownTotal({ key: resetKey, total: pageTotal });
    }
  }, [pageTotal, resetKey]);

  const isInitialLoading = !hasLoaded && (isFetching || !isError);
  const isLoadingMore = isFetching && cursor !== '';
  const loadMoreFailed = isError && hasLoaded && cursor !== '';
  const total = Math.max(knownTotal.key === resetKey ? knownTotal.total : 0, notes.length);

  const rows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const visible = query
      ? notes.filter(
          note =>
            note.title?.toLowerCase().includes(query) ||
            note.bodyPreview?.toLowerCase().includes(query),
        )
      : notes;
    return buildRows(visible);
  }, [notes, searchQuery]);

  const handleDelete = useCallback(
    async (item: NoteItem) => {
      if (await onDeleteNote(item)) {
        removeItem(item.id);
        setKnownTotal(prev =>
          prev.key === resetKey
            ? { ...prev, total: Math.max(0, prev.total - 1) }
            : prev,
        );
      }
    },
    [onDeleteNote, removeItem, resetKey],
  );

  const handleLoadMore = useCallback(() => {
    if (isFetching) {
      return;
    }
    if (loadMoreFailed) {
      refetch();
      return;
    }
    if (nextCursor) {
      setCursor(nextCursor);
    }
  }, [isFetching, loadMoreFailed, nextCursor, refetch, setCursor]);

  const handlePullRefresh = useCallback(() => {
    setIsPullRefreshing(true);
    if (cursor) {
      setCursor('');
    } else {
      refetch();
    }
  }, [cursor, refetch, setCursor]);

  const renderItem = useCallback(
    ({ item: row }: { item: Row }) => {
      if (row.type === 'header') {
        return (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel} numberOfLines={1}>
              {row.label}
            </Text>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionCount}>
              {row.count} {row.count === 1 ? 'note' : 'notes'}
            </Text>
          </View>
        );
      }

      const item = toNoteItem(row.note);
      return (
        <NoteCard
          item={item}
          onPress={() => onOpenNote(item)}
          onDelete={() => handleDelete(item)}
        />
      );
    },
    [handleDelete, onOpenNote, toNoteItem],
  );

  const listEmpty = useMemo(() => {
    if (isInitialLoading) {
      return <ListStateBox variant="loading" message="Loading notes..." />;
    }
    if (isError && !hasLoaded) {
      return (
        <ListStateBox
          variant="error"
          message="Unable to load notes."
          onRetry={refetch}
        />
      );
    }
    if (searchQuery.trim()) {
      return (
        <ListStateBox
          variant="empty"
          title="No matching notes"
          message="Try a different search term."
        />
      );
    }
    return (
      <ListStateBox
        variant="empty"
        title="No notes in this space yet"
        message="Notes captured from conversations will appear here. Tap + to add one."
      />
    );
  }, [hasLoaded, isError, isInitialLoading, refetch, searchQuery]);

  const listFooter = useMemo(
    () =>
      rows.length === 0 ? null : (
        <LoadMoreFooter
          summary={`Showing ${notes.length} of ${total} notes`}
          hasMore={Boolean(nextCursor) || loadMoreFailed}
          isLoadingMore={isLoadingMore}
          loadMoreError={loadMoreFailed}
          onLoadMore={handleLoadMore}
        />
      ),
    [handleLoadMore, isLoadingMore, loadMoreFailed, nextCursor, notes.length, rows.length, total],
  );

  return (
    <FlatList
      data={rows}
      keyExtractor={row => row.key}
      renderItem={renderItem}
      ListEmptyComponent={listEmpty}
      ListFooterComponent={listFooter}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={contentContainerStyle}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      scrollEventThrottle={scrollThrottle}
      refreshControl={
        <RefreshControl
          refreshing={isPullRefreshing}
          onRefresh={handlePullRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      {...listPerf}
    />
  );
};

export default memo(AllNotesList);

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },

  sectionLabel: {
    flexShrink: 1,
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.2,
  },

  sectionLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    marginHorizontal: spacing.md,
    backgroundColor: colors.border,
  },

  sectionCount: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
    borderRadius: radii.pill,
    overflow: 'hidden',
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
});
