import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';

import { NoteWorkspace } from '../../../store/api/home';
import { COLORS } from './styles/color';

type Props = {
  spaces: NoteWorkspace[];
  selectedSpaceId?: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onSelectSpace?: (spaceId: string) => void;
};

const CategoryTabs = ({
  spaces,
  selectedSpaceId,
  isLoading = false,
  isError = false,
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
          <Text style={styles.count}>0 notes</Text>
        </View>
      );
    }

    return spaces.map(item => {
      const activeId = selectedSpaceId || localActiveId || spaces[0]?.id;
      const isActive = item.id === activeId;

      return (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.85}
          style={[styles.tab, isActive && styles.activeTab]}
          onPress={() => {
            setLocalActiveId(item.id);
            onSelectSpace?.(item.id);
          }}
        >
          <Text
            numberOfLines={1}
            style={[styles.label, isActive && styles.activeLabel]}
          >
            {item.name}
          </Text>
          <Text style={[styles.count, isActive && styles.activeCount]}>
            {item.notesCount} notes
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
    marginTop: 20,
  },

  container: {
    paddingRight: 4,
    gap: 10,
  },

  tab: {
    minWidth: 132,
    maxWidth: 172,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  stateTab: {
    minWidth: 180,
    minHeight: 70,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
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
    fontWeight: '700',
    fontSize: 14,
  },

  activeLabel: {
    color: COLORS.white,
  },

  count: {
    marginTop: 4,
    color: COLORS.gray,
    fontWeight: '600',
    fontSize: 12,
  },

  activeCount: {
    color: 'rgba(255, 255, 255, 0.85)',
  },

  stateText: {
    marginTop: 6,
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '700',
  },

  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '800',
  },

  retryText: {
    marginTop: 4,
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '800',
  },
});
