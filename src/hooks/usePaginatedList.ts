import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Cursor state scoped to `resetKey`: changing the key (space, filter, refresh
 * version, ...) yields '' immediately, in the same render, so a stale cursor is
 * never sent with new query args.
 */
export const useKeyedCursor = (resetKey: string) => {
  const [state, setState] = useState({ key: resetKey, cursor: '' });
  const cursor = state.key === resetKey ? state.cursor : '';
  const setCursor = useCallback(
    (next: string) => setState({ key: resetKey, cursor: next }),
    [resetKey],
  );
  return [cursor, setCursor] as const;
};

type PageAccumulatorOptions<TResponse, TItem> = {
  resetKey: string;
  cursor: string;
  /** Pass RTK Query `currentData` so responses for previous args are ignored. */
  response: TResponse | undefined;
  isFetching: boolean;
  selectItems: (response: TResponse) => TItem[];
  selectNextCursor: (response: TResponse) => string | null;
  getId: (item: TItem) => string;
};

type AccumulatedState<TItem> = {
  key: string | null;
  items: TItem[];
  nextCursor: string | null;
};

const EMPTY: never[] = [];

/**
 * Accumulates cursor pages into one list. The first page replaces the list;
 * later pages merge by id (refreshing existing rows, appending new ones) so a
 * refetch of the same page after cache invalidation never duplicates rows.
 */
export const usePageAccumulator = <TResponse, TItem>({
  resetKey,
  cursor,
  response,
  isFetching,
  selectItems,
  selectNextCursor,
  getId,
}: PageAccumulatorOptions<TResponse, TItem>) => {
  const [state, setState] = useState<AccumulatedState<TItem>>({
    key: null,
    items: EMPTY,
    nextCursor: null,
  });
  const appliedRef = useRef<{ key: string; response: TResponse } | null>(null);

  useEffect(() => {
    if (
      !response ||
      isFetching ||
      (appliedRef.current?.key === resetKey &&
        appliedRef.current.response === response)
    ) {
      return;
    }
    appliedRef.current = { key: resetKey, response };

    const pageItems = selectItems(response) ?? EMPTY;
    const nextCursor = selectNextCursor(response) ?? null;

    setState(prev => {
      if (!cursor || prev.key !== resetKey) {
        return { key: resetKey, items: pageItems, nextCursor };
      }

      const freshById = new Map(pageItems.map(item => [getId(item), item]));
      const merged = prev.items.map(item => freshById.get(getId(item)) ?? item);
      const seen = new Set(prev.items.map(getId));
      const appended = pageItems.filter(item => !seen.has(getId(item)));

      return {
        key: resetKey,
        items: appended.length > 0 ? [...merged, ...appended] : merged,
        nextCursor,
      };
    });
  }, [cursor, getId, isFetching, resetKey, response, selectItems, selectNextCursor]);

  const removeItem = useCallback(
    (id: string) => {
      setState(prev =>
        prev.key === resetKey
          ? { ...prev, items: prev.items.filter(item => getId(item) !== id) }
          : prev,
      );
    },
    [getId, resetKey],
  );

  const isCurrent = state.key === resetKey;

  return {
    items: isCurrent ? state.items : (EMPTY as TItem[]),
    nextCursor: isCurrent ? state.nextCursor : null,
    hasLoaded: isCurrent,
    removeItem,
  };
};
