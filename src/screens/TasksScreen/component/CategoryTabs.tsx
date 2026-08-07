import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';

import { Space } from '../../../store/api/home';
import { COLORS } from './styles/color';
import {
  fontSize,
  fontWeight,
  ms,
  mvs,
  radii,
  spacing,
} from '../../../theme';

type Props = {
  spaces: Space[];
  selectedSpaceId?: string;
  isLoading?: boolean;
  isError?: boolean;
  getTaskCount?: (spaceId: string) => number;
  onRetry?: () => void;
  onSelectSpace?: (spaceId: string) => void;
};

const CategoryTabs = ({
  spaces,
  selectedSpaceId,
  isLoading = false,
  isError = false,
  getTaskCount,
  onRetry,
  onSelectSpace,
}: Props) => {
  const [localActiveId, setLocalActiveId] = useState('');

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.stateTab}>
          <ActivityIndicator size="small" color={COLORS.primaryDark} />
          <Text style={styles.stateText}>Loading spaces...</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.stateTab}
          onPress={onRetry}
        >
          <Text style={styles.errorText}>Unable to load spaces</Text>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      );
    }

    if (spaces.length === 0) {
      return (
        <View style={styles.stateTab}>
          <Text style={styles.label}>No spaces yet</Text>
          <Text style={styles.count}>0 tasks</Text>
        </View>
      );
    }

    return spaces.map(item => {
      const activeId = selectedSpaceId || localActiveId || spaces[0]?._id;
      const isActive = item._id === activeId;
      const taskCount = getTaskCount?.(item._id) ?? 0;

      return (
        <TouchableOpacity
          key={item._id}
          activeOpacity={0.85}
          style={[styles.tab, isActive && styles.activeTab]}
          onPress={() => {
            setLocalActiveId(item._id);
            onSelectSpace?.(item._id);
          }}
        >
          <Text
            numberOfLines={1}
            style={[styles.label, isActive && styles.activeLabel]}
          >
            {item.spacename}
          </Text>
          <Text style={[styles.count, isActive && styles.activeCount]}>
            {taskCount} tasks
          </Text>
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
};

export default CategoryTabs;

const styles = StyleSheet.create({
  wrapper: {
    marginTop: spacing['3xl'],
  },

  container: {
    paddingRight: spacing.xs,
    gap: spacing.lg,
  },

  tab: {
    minWidth: ms(132),
    maxWidth: ms(172),
    backgroundColor: COLORS.white,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: ms(14),
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  stateTab: {
    minWidth: ms(180),
    minHeight: mvs(70),
    backgroundColor: COLORS.white,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: ms(14),
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
  },

  activeTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  label: {
    color: COLORS.black,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.base,
  },

  activeLabel: {
    color: COLORS.white,
  },

  count: {
    marginTop: spacing.xs,
    color: COLORS.gray,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.sm,
  },

  activeCount: {
    color: 'rgba(255, 255, 255, 0.85)',
  },

  stateText: {
    marginTop: spacing.sm,
    color: COLORS.gray,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  errorText: {
    color: COLORS.errorDark,
    fontSize: fontSize.md,
    fontWeight: fontWeight.extrabold,
  },

  retryText: {
    marginTop: spacing.xs,
    color: COLORS.primaryDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold,
  },
});
