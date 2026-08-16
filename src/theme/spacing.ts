import { StyleSheet } from 'react-native';

import { isCompactHeight, isSmallDevice, ms, mvs } from './responsive';

/**
 * Consistent spacing scale (padding / margin / gap).
 * Prefer these over raw numbers.
 */
export const spacing = {
  /** 2 */
  xxs: ms(2),
  /** 4 */
  xs: ms(4),
  /** 6 */
  sm: ms(6),
  /** 8 */
  md: ms(8),
  /** 10 */
  lg: ms(10),
  /** 12 */
  xl: ms(12),
  /** 16 */
  '2xl': ms(16),
  /** 20 — default screen horizontal padding */
  '3xl': ms(20),
  /** 24 */
  '4xl': ms(24),
  /** 32 */
  '5xl': ms(32),
  /** 40 */
  '6xl': ms(40),
  /** 48 */
  '7xl': ms(48),
} as const;

/** Vertical spacing (uses height-aware moderate scale) */
export const vSpacing = {
  xs: mvs(4),
  sm: mvs(8),
  md: mvs(12),
  lg: mvs(16),
  xl: mvs(20),
  '2xl': mvs(24),
  '3xl': mvs(32),
  '4xl': mvs(40),
} as const;

/** Screen / section layout constants */
export const layout = {
  /** Horizontal padding for most screens */
  screenPadding: spacing['3xl'],
  /** Top inset below the status/safe area */
  screenTop: isCompactHeight ? mvs(4) : mvs(8),
  /** Floating tab bar height */
  tabBarHeight: isSmallDevice ? ms(72) : ms(80),
  /** Bottom padding above floating tab bar */
  tabBarClearance: isSmallDevice || isCompactHeight ? mvs(96) : mvs(110),
  /** Standard card padding */
  cardPadding: spacing['2xl'],
  /** Gap between major sections */
  sectionGap: spacing['2xl'],
  /** Gap between list items */
  listGap: spacing.xl,
  /** Primary CTA / button height */
  buttonHeight: ms(54),
  /** Text input field height */
  inputHeight: ms(56),
  /** Compact pill / chip control height */
  chipHeight: ms(36),
  /** Icon button hit target */
  iconButton: ms(44),
  /** Compact icon button */
  iconButtonSm: ms(40),
  /** Circular back / header control */
  headerButton: ms(38),
  /** Hairline borders — cheaper than shadows on Android */
  hairline: StyleSheet.hairlineWidth,
} as const;

export const radii = {
  xs: ms(6),
  sm: ms(10),
  md: ms(12),
  lg: ms(16),
  xl: ms(20),
  '2xl': ms(22),
  '3xl': ms(24),
  pill: 999,
  tabBar: ms(30),
} as const;

/** Keep elevation low — Android rasterizes shadows on the GPU. */
export const shadows = {
  soft: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#162B75',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  primary: {
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 3,
  },
} as const;
