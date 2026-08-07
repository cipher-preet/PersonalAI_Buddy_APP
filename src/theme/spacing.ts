import { ms, mvs } from './responsive';

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
  /** Bottom padding above floating tab bar */
  tabBarClearance: mvs(110),
  /** Standard card padding */
  cardPadding: spacing['2xl'],
  /** Gap between major sections */
  sectionGap: spacing['2xl'],
  /** Gap between list items */
  listGap: spacing.xl,
  /** Icon button hit target */
  iconButton: ms(44),
  /** Compact icon button */
  iconButtonSm: ms(40),
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

export const shadows = {
  soft: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  card: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  elevated: {
    shadowColor: '#162B75',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 24,
  },
  primary: {
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 8,
  },
} as const;
