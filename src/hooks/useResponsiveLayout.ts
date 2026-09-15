import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ms, mvs, spacing } from '../theme';

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

    const tabBarHeight = isSmallDevice ? ms(68) : isTablet ? ms(76) : ms(80);
    const tabBarSideInset = isTablet ? spacing['5xl'] : spacing['2xl'];
    /** Gap above the system nav / home indicator. */
    const tabBarBottomGap = mvs(8);
    const tabBarBottom =
      Math.max(insets.bottom, mvs(10)) + tabBarBottomGap;

    /** Scroll/list padding so content clears the floating tab bar. */
    const tabBarClearance =
      tabBarBottom + tabBarHeight + spacing['2xl'];

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
