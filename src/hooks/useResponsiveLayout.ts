import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ms, spacing } from '../theme';

/** Comfortable reading column on tablets / large phones. */
export const CONTENT_MAX_WIDTH = 720;

/**
 * Live layout metrics for phones, tall/short devices, and tablets.
 * Prefer this over frozen module-level Dimensions for bottom chrome and grids.
 */
export const useResponsiveLayout = () => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return useMemo(() => {
    const shortest = Math.min(width, height);
    const isTablet = shortest >= 600;
    const isSmallDevice = width < 360;
    const isCompactHeight = height < 700;

    const tabBarHeight = isSmallDevice ? ms(64) : isTablet ? ms(70) : ms(66);
    const tabBarSideInset = 0;
    /** Docked bar sits on the home indicator; no floating gap. */
    const tabBarBottom = 0;
    const safeBottom = Math.max(insets.bottom, spacing.sm);

    /** Scroll/list padding so content clears the docked tab bar + center mic. */
    const tabBarClearance =
      safeBottom + tabBarHeight + spacing['3xl'];

    const screenPadding = isTablet
      ? spacing['5xl']
      : isSmallDevice
        ? spacing['2xl']
        : spacing['3xl'];

    const contentMaxWidth = isTablet ? CONTENT_MAX_WIDTH : width;
    const contentWidth = Math.min(width - screenPadding * 2, contentMaxWidth);

    const spacesColumns = isTablet ? 4 : width >= 400 ? 3 : 2;

    return {
      width,
      height,
      insets,
      isTablet,
      isSmallDevice,
      isCompactHeight,
      tabBarHeight,
      tabBarBottom,
      tabBarSideInset,
      tabBarClearance,
      screenPadding,
      contentMaxWidth,
      contentWidth,
      spacesColumns,
    };
  }, [height, insets, width]);
};

export default useResponsiveLayout;
