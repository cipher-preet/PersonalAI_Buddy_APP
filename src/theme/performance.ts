import { Platform } from 'react-native';

/**
 * FlatList defaults tuned for low-end phones.
 * Keep batches small so JS and native stay responsive while scrolling.
 */
export const listPerf = {
  initialNumToRender: 8,
  maxToRenderPerBatch: 6,
  windowSize: 7,
  updateCellsBatchingPeriod: 50,
  removeClippedSubviews: Platform.OS === 'android',
} as const;

/** Chat lists: avoid clipping, which can blank bubbles mid-scroll. */
export const chatListPerf = {
  initialNumToRender: 12,
  maxToRenderPerBatch: 8,
  windowSize: 9,
  updateCellsBatchingPeriod: 40,
  removeClippedSubviews: false,
} as const;
