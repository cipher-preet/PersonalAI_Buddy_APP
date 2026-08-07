import { TextStyle } from 'react-native';
import { colors } from './colors';
import { ms } from './responsive';

/**
 * Consistent type scale across the app.
 * Weights: regular 400 | medium 500 | semibold 600 | bold 700 | extrabold 800
 */
export const fontSize = {
  xs: ms(11),
  sm: ms(12),
  md: ms(13),
  base: ms(14),
  lg: ms(15),
  xl: ms(16),
  '2xl': ms(18),
  '3xl': ms(20),
  '4xl': ms(24),
  '5xl': ms(28),
  '6xl': ms(32),
} as const;

export const fontWeight = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  extrabold: '800' as TextStyle['fontWeight'],
};

export const lineHeight = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.65,
};

/** Ready-to-use text style presets */
export const typography = {
  hero: {
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.extrabold,
    color: colors.text,
    letterSpacing: -0.5,
    lineHeight: ms(36),
  } satisfies TextStyle,

  title: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    color: colors.text,
    letterSpacing: -0.4,
    lineHeight: ms(32),
  } satisfies TextStyle,

  heading: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.text,
    letterSpacing: -0.3,
    lineHeight: ms(24),
  } satisfies TextStyle,

  subheading: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    lineHeight: ms(22),
  } satisfies TextStyle,

  body: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.regular,
    color: colors.text,
    lineHeight: ms(22),
  } satisfies TextStyle,

  bodyMedium: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.text,
    lineHeight: ms(22),
  } satisfies TextStyle,

  caption: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.subText,
    lineHeight: ms(18),
  } satisfies TextStyle,

  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.subText,
    letterSpacing: 0.2,
    lineHeight: ms(16),
  } satisfies TextStyle,

  overline: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    letterSpacing: 0.3,
    lineHeight: ms(14),
  } satisfies TextStyle,

  button: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.white,
    letterSpacing: 0.2,
  } satisfies TextStyle,

  tab: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.2,
  } satisfies TextStyle,
} as const;
