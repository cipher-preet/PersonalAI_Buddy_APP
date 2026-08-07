import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/** Design baseline — iPhone 11 / 12 / 13 logical width */
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/** Clamp factor so tablets don't over-scale and small phones don't shrink too much */
const WIDTH_RATIO = Math.min(Math.max(SCREEN_WIDTH / BASE_WIDTH, 0.85), 1.25);
const HEIGHT_RATIO = Math.min(Math.max(SCREEN_HEIGHT / BASE_HEIGHT, 0.85), 1.2);

/**
 * Scale size by screen width (icons, widths, horizontal padding).
 */
export const scale = (size: number): number =>
  PixelRatio.roundToNearestPixel(size * WIDTH_RATIO);

/**
 * Scale size by screen height (vertical gaps, sheet heights).
 */
export const verticalScale = (size: number): number =>
  PixelRatio.roundToNearestPixel(size * HEIGHT_RATIO);

/**
 * Moderate scale — gentler than full scale. Prefer for fontSize, radius, padding.
 * @param factor 0 = no scale, 1 = full width scale. Default 0.5.
 */
export const ms = (size: number, factor = 0.5): number =>
  PixelRatio.roundToNearestPixel(size + (scale(size) - size) * factor);

/**
 * Vertical moderate scale for vertical spacing.
 */
export const mvs = (size: number, factor = 0.5): number =>
  PixelRatio.roundToNearestPixel(
    size + (verticalScale(size) - size) * factor,
  );

export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

/** True when device is phone-sized (shortest side < 600) */
export const isSmallDevice = SCREEN_WIDTH < 360;
export const isTablet = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) >= 600;
