import React, { useEffect, useRef } from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { FilterIcon, SearchIcon } from '../../../../styles/icons';
import type { TaskFilter } from '../types/filter';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  radii,
  spacing,
} from '../../../theme';

type Props = {
  searchQuery: string;
  taskFilter: TaskFilter;
  isSearchActive: boolean;
  onSearchQueryChange: (value: string) => void;
  onSearchOpen: () => void;
  onSearchClose: () => void;
  onFilterPress: () => void;
};

const CloseIcon = ({ color = colors.subText }: { color?: string }) => (
  <Svg width={ms(14)} height={ms(14)} viewBox="0 0 24 24" fill="none">
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
  const isFilterActive = taskFilter !== 'newest';

  useEffect(() => {
    if (!isSearchActive) {
      inputRef.current?.blur();
      return undefined;
    }

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 40);

    return () => clearTimeout(timer);
  }, [isSearchActive]);

  const handleCloseSearch = () => {
    Keyboard.dismiss();
    onSearchClose();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title} numberOfLines={1}>
        Tasks
      </Text>

      {isSearchActive ? (
        <View style={styles.searchField}>
          <View style={styles.searchIconSlot}>
            <SearchIcon width={ms(16)} height={ms(16)} color={colors.subText} />
          </View>

          <TextInput
            ref={inputRef}
            value={searchQuery}
            onChangeText={onSearchQueryChange}
            placeholder="Search..."
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="never"
            underlineColorAndroid="transparent"
          />

          <TouchableOpacity
            style={styles.clearButton}
            activeOpacity={0.75}
            onPress={handleCloseSearch}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Close search"
          >
            <CloseIcon />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.spacer} />
      )}

      <View style={styles.actions}>
        {!isSearchActive ? (
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.78}
            onPress={onSearchOpen}
            accessibilityRole="button"
            accessibilityLabel="Search tasks"
          >
            <SearchIcon width={ms(18)} height={ms(18)} color={colors.text} />
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[styles.iconButton, isFilterActive && styles.iconButtonActive]}
          activeOpacity={0.78}
          onPress={onFilterPress}
          accessibilityRole="button"
          accessibilityLabel="Filter tasks"
        >
          <FilterIcon
            width={ms(18)}
            height={ms(18)}
            color={isFilterActive ? colors.primaryDark : colors.text}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;

const SEARCH_HEIGHT = ms(40);

const styles = StyleSheet.create({
  container: {
    minHeight: ms(44),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  title: {
    flexShrink: 0,
    maxWidth: '32%',
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extrabold,
    color: colors.black,
    lineHeight: ms(28),
    includeFontPadding: false,
  },

  spacer: {
    flex: 1,
    minWidth: 0,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexShrink: 0,
  },

  searchField: {
    flex: 1,
    minWidth: 0,
    maxWidth: ms(220),
    height: SEARCH_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingLeft: spacing.sm,
    paddingRight: spacing.xs,
    marginLeft: 'auto',
  },

  searchIconSlot: {
    width: ms(24),
    height: ms(24),
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    height: SEARCH_HEIGHT,
    paddingVertical: 0,
    paddingHorizontal: spacing.xs,
    margin: 0,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  clearButton: {
    width: ms(28),
    height: ms(28),
    borderRadius: radii.sm,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconButton: {
    width: layout.iconButtonSm,
    height: layout.iconButtonSm,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  iconButtonActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.brandBorder,
  },
});
