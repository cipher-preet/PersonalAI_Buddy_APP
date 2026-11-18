import { TextStyle } from 'react-native';

import { colors } from './colors';
import { fonts } from './fonts';
import { ms } from './responsive';

/**
 * Equal AI iOS type scale (DM Sans).
 * Sizes follow the reported library: 11 through 34.
 * Tracking is −2.6% of the size.
 */
const track = (size: number) => Number((ms(size) * -0.026).toFixed(2));

export const fontSize = {
  xs: ms(11),
  sm: ms(12),
  md: ms(13),
  base: ms(16),
  lg: ms(17),
  xl: ms(18),
  '2xl': ms(20),
  '3xl': ms(22),
  '4xl': ms(28),
  '5xl': ms(34),
  '6xl': ms(40),
} as const;

export const fontWeight = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  extrabold: '700' as TextStyle['fontWeight'],
};

export const lineHeight = {
  tight: 1.2,
  snug: 1.3,
  normal: 1.35,
  relaxed: 1.5,
};

const face = (
  family: string,
  size: number,
  line: number,
  weight: TextStyle['fontWeight'],
  color: string = colors.text,
): TextStyle => ({
  fontFamily: family,
  fontSize: ms(size),
  lineHeight: ms(line),
  letterSpacing: track(size),
  fontWeight: weight,
  color,
});

/** Ready-to-use text style presets, named from the Equal iOS scale. */
export const typography = {
  hero: face(fonts.bold, 34, 41, fontWeight.bold),
  title: face(fonts.bold, 28, 34, fontWeight.bold),
  heading: face(fonts.bold, 22, 28, fontWeight.bold),
  subheading: face(fonts.semibold, 20, 25, fontWeight.semibold),
  body: face(fonts.regular, 17, 22, fontWeight.regular),
  bodyMedium: face(fonts.semibold, 16, 21, fontWeight.semibold),
  caption: face(fonts.medium, 13, 18, fontWeight.medium, colors.subText),
  label: face(fonts.semibold, 12, 16, fontWeight.semibold, colors.subText),
  overline: face(fonts.semibold, 12, 16, fontWeight.semibold, colors.primaryText),
  button: face(fonts.semibold, 16, 21, fontWeight.semibold, colors.onPrimary),
  tab: face(fonts.semibold, 12, 16, fontWeight.semibold, colors.tabInactive),
} as const;
