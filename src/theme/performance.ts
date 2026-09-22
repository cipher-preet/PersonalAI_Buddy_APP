import { Platform } from 'react-native';

/**
 * FlatList defaults tuned for low-end phones.
 * Keep batches small so JS and native stay responsive while scrolling.
 */
export const listPerf = {
  initialNumToRender: Platform.OS === 'android' ? 4 : 6,
  maxToRenderPerBatch: Platform.OS === 'android' ? 3 : 4,
  windowSize: Platform.OS === 'android' ? 4 : 5,
  updateCellsBatchingPeriod: Platform.OS === 'android' ? 80 : 60,
  removeClippedSubviews: Platform.OS === 'android',
} as const;

/** Chat lists: avoid clipping, which can blank bubbles mid-scroll. */
export const chatListPerf = {
  initialNumToRender: Platform.OS === 'android' ? 8 : 10,
  maxToRenderPerBatch: Platform.OS === 'android' ? 4 : 6,
  windowSize: Platform.OS === 'android' ? 5 : 7,
  updateCellsBatchingPeriod: Platform.OS === 'android' ? 70 : 50,
  removeClippedSubviews: false,
} as const;

/** Prefer cheaper scroll sampling on low-end devices. */
export const scrollThrottle = Platform.OS === 'android' ? 48 : 16;

/** Shorter enter animations — less main-thread work on weak GPUs. */
export const motion = {
  sheetMs: Platform.OS === 'android' ? 180 : 220,
  fadeMs: Platform.OS === 'android' ? 120 : 160,
  pressScale: 0.98,
} as const;

/** Fewer decorative wave bars on weak GPUs. */
export const listeningWaveCount = Platform.OS === 'android' ? 6 : 12;
