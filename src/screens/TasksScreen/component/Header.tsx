import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { FilterIcon, SearchIcon } from '../../../../styles/icons';
import { COLORS } from './styles/color';
import type { TaskFilter } from '../types/filter';

const ICON_SIZE = 40;
const ICON_GAP = 10;
const RIGHT_ACTIONS_WIDTH = ICON_SIZE * 2 + ICON_GAP;

type Props = {
  searchQuery: string;
  taskFilter: TaskFilter;
  isSearchActive: boolean;
  onSearchQueryChange: (value: string) => void;
  onSearchOpen: () => void;
  onSearchClose: () => void;
  onFilterPress: () => void;
};

const CloseIcon = ({ color = COLORS.gray }: { color?: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6 6 18M6 6l12 12"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Header = ({
  searchQuery,
  taskFilter,
  isSearchActive,
  onSearchQueryChange,
  onSearchOpen,
  onSearchClose,
  onFilterPress,
}: Props) => {
  const inputRef = useRef<TextInput>(null);
  const searchProgress = useSharedValue(0);
  const middleWidth = useSharedValue(0);
  const [innerSearchWidth, setInnerSearchWidth] = useState(0);

  useEffect(() => {
    searchProgress.value = isSearchActive
      ? withSpring(1, { damping: 22, stiffness: 260, mass: 0.85 })
      : withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) });
  }, [isSearchActive, searchProgress]);

  useEffect(() => {
    if (isSearchActive) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 140);
      return () => clearTimeout(timer);
    }
    inputRef.current?.blur();
    return undefined;
  }, [isSearchActive]);

  const handleMiddleLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    if (nextWidth > 0) {
      middleWidth.value = nextWidth;
      setInnerSearchWidth(nextWidth);
    }
  };

  const searchBarStyle = useAnimatedStyle(() => ({
    width: middleWidth.value * searchProgress.value,
    opacity: interpolate(searchProgress.value, [0, 0.12, 1], [0, 0.7, 1]),
  }));

  const handleCloseSearch = () => {
    Keyboard.dismiss();
    onSearchClose();
  };

  const isFilterActive = taskFilter !== 'newest';

  return (
    <View style={styles.container}>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>Tasks</Text>
      </View>

      <View
        style={[
          styles.middleSection,
          isSearchActive && styles.middleSectionActive,
        ]}
        onLayout={handleMiddleLayout}
      >
        <Animated.View
          style={[styles.searchBarWrap, searchBarStyle]}
          pointerEvents={isSearchActive ? 'auto' : 'none'}
        >
          <View
            style={[
              styles.searchInputContainer,
              innerSearchWidth > 0 && { width: innerSearchWidth },
            ]}
          >
            <SearchIcon width={15} height={15} color={COLORS.gray} />

            <TextInput
              ref={inputRef}
              value={searchQuery}
              onChangeText={onSearchQueryChange}
              placeholder="Search tasks..."
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
              editable={isSearchActive}
            />

            <TouchableOpacity
              style={styles.closeButton}
              activeOpacity={0.75}
              onPress={handleCloseSearch}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <CloseIcon />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      <View style={styles.rightActions}>
        <View style={styles.searchSlot}>
          {!isSearchActive ? (
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.78}
              onPress={onSearchOpen}
            >
              <SearchIcon width={18} height={18} color={COLORS.black} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.iconButton, isFilterActive && styles.iconButtonActive]}
          activeOpacity={0.78}
          onPress={onFilterPress}
        >
          <FilterIcon
            width={18}
            height={18}
            color={isFilterActive ? COLORS.primaryDark : COLORS.black}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
  },

  titleWrap: {
    flexShrink: 0,
    zIndex: 2,
  },

  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.black,
    lineHeight: 22,
  },

  middleSection: {
    flex: 1,
    minWidth: 0,
    height: ICON_SIZE,
    justifyContent: 'center',
    overflow: 'hidden',
  },

  middleSectionActive: {
    marginLeft: 12,
  },

  searchBarWrap: {
    alignSelf: 'flex-end',
    overflow: 'hidden',
    height: ICON_SIZE,
  },

  searchInputContainer: {
    height: ICON_SIZE,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 6,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    marginRight: 4,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    paddingVertical: 0,
    height: ICON_SIZE,
  },

  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  rightActions: {
    width: RIGHT_ACTIONS_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexShrink: 0,
  },

  searchSlot: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    marginRight: ICON_GAP,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconButton: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },

  iconButtonActive: {
    backgroundColor: COLORS.purpleLight,
    borderColor: '#E9D5FF',
  },
});
