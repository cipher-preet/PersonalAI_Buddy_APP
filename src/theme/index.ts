export { colors } from './colors';
export type { AppColors } from './colors';
export {
  fontSize,
  fontWeight,
  lineHeight,
  typography,
} from './typography';
export { spacing, vSpacing, layout, radii, shadows } from './spacing';
export {
  scale,
  verticalScale,
  ms,
  mvs,
  screenWidth,
  screenHeight,
  isSmallDevice,
  isTablet,
} from './responsive';

import { colors } from './colors';
import { fontSize, fontWeight, typography } from './typography';
import { spacing, vSpacing, layout, radii, shadows } from './spacing';
import {
  scale,
  verticalScale,
  ms,
  mvs,
  screenWidth,
  screenHeight,
  isSmallDevice,
  isTablet,
} from './responsive';

/** Single import: `import { theme } from '../theme'` */
export const theme = {
  colors,
  fontSize,
  fontWeight,
  typography,
  spacing,
  vSpacing,
  layout,
  radii,
  shadows,
  scale,
  verticalScale,
  ms,
  mvs,
  screenWidth,
  screenHeight,
  isSmallDevice,
  isTablet,
} as const;

export default theme;
