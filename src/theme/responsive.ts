import { Dimensions, PixelRatio, useWindowDimensions } from 'react-native';

const { width: BOOT_WIDTH, height: BOOT_HEIGHT } = Dimensions.get('window');

/** Design baseline — iPhone 11 / 12 / 13 logical width */
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const widthRatioFor = (width: number) => {
  const isWide = width >= 600;
  return clamp(width / BASE_WIDTH, 0.85, isWide ? 1.22 : 1.15);
};

const heightRatioFor = (height: number) =>
  clamp(height / BASE_HEIGHT, 0.85, 1.12);

/** Boot-time ratios — used by StyleSheet tokens created at module load. */
const WIDTH_RATIO = widthRatioFor(BOOT_WIDTH);
const HEIGHT_RATIO = heightRatioFor(BOOT_HEIGHT);

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

/**
 * Live moderate scale from current window width (rotation / fold / split).
 */
export const useMs = (size: number, factor = 0.5): number => {
  const { width } = useWindowDimensions();
  const ratio = widthRatioFor(width);
  const scaled = size * ratio;
  return PixelRatio.roundToNearestPixel(size + (scaled - size) * factor);
};

export const screenWidth = BOOT_WIDTH;
export const screenHeight = BOOT_HEIGHT;

/** Narrow phones (Android Go / compact iPhones) */
export const isSmallDevice = BOOT_WIDTH < 360;
/** Short viewports (landscape or small Android) */
export const isCompactHeight = BOOT_HEIGHT < 700;
export const isTablet = Math.min(BOOT_WIDTH, BOOT_HEIGHT) >= 600;

/** Shared reading-column cap for tablets. */
export const contentMaxWidth = 720;
