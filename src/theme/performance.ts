import { Platform } from 'react-native';

/**
 * FlatList defaults tuned for low-end phones.
 * Keep batches small so JS and native stay responsive while scrolling.
 */
export const listPerf = {
  initialNumToRender: 6,
  maxToRenderPerBatch: 4,
  windowSize: 5,
  updateCellsBatchingPeriod: 60,
  removeClippedSubviews: Platform.OS === 'android',
} as const;

/** Chat lists: avoid clipping, which can blank bubbles mid-scroll. */
export const chatListPerf = {
  initialNumToRender: 10,
  maxToRenderPerBatch: 6,
  windowSize: 7,
  updateCellsBatchingPeriod: 50,
  removeClippedSubviews: false,
} as const;

/** Prefer cheaper scroll sampling on low-end devices. */
export const scrollThrottle = Platform.OS === 'android' ? 32 : 16;

/** Shorter enter animations — less main-thread work on weak GPUs. */
export const motion = {
  sheetMs: 220,
  fadeMs: 160,
  pressScale: 0.98,
} as const;
