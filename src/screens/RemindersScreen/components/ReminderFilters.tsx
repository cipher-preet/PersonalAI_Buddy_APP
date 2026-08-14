import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../theme';

export type SourceFilter = 'all' | 'ai' | 'manual';
export type DateFilter = 'all' | 'today' | 'tomorrow' | 'week';

type Props = {
  sourceFilter: SourceFilter;
  dateFilter: DateFilter;
  isDateMenuOpen: boolean;
  onSourceChange: (value: SourceFilter) => void;
  onDateChange: (value: DateFilter) => void;
  onDateMenuOpen: () => void;
  onDateMenuClose: () => void;
};

const DATE_OPTIONS: { id: DateFilter; label: string }[] = [
  { id: 'all', label: 'All dates' },
  { id: 'today', label: 'Today' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'week', label: 'This week' },
];

const SOURCE_OPTIONS: { id: SourceFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'ai', label: 'AI' },
  { id: 'manual', label: 'Manual' },
];

const ChevronIcon = ({ color = colors.subText }: { color?: string }) => (
  <Svg width={ms(12)} height={ms(12)} viewBox="0 0 24 24" fill="none">
    <Path
      d="m6 9 6 6 6-6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const getDateLabel = (filter: DateFilter) =>
  DATE_OPTIONS.find(option => option.id === filter)?.label ?? 'Date';

const ReminderFilters = ({
  sourceFilter,
  dateFilter,
  isDateMenuOpen,
  onSourceChange,
  onDateChange,
  onDateMenuOpen,
  onDateMenuClose,
}: Props) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {SOURCE_OPTIONS.map(option => {
          const isActive = sourceFilter === option.id;

          return (
            <TouchableOpacity
              key={option.id}
              activeOpacity={0.85}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onSourceChange(option.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.chip, styles.dateChip, dateFilter !== 'all' && styles.chipActive]}
          onPress={onDateMenuOpen}
          accessibilityRole="button"
          accessibilityLabel="Date filter"
        >
          <Text
            style={[
              styles.chipText,
              dateFilter !== 'all' && styles.chipTextActive,
            ]}
          >
            {getDateLabel(dateFilter)}
          </Text>
          <ChevronIcon color={dateFilter !== 'all' ? colors.white : colors.subText} />
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={isDateMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={onDateMenuClose}
      >
        <Pressable style={styles.overlay} onPress={onDateMenuClose}>
          <View style={styles.menuCard}>
            <Text style={styles.menuTitle}>Filter by date</Text>

            {DATE_OPTIONS.map(option => {
              const isActive = dateFilter === option.id;

              return (
                <TouchableOpacity
                  key={option.id}
                  activeOpacity={0.85}
                  style={[styles.menuRow, isActive && styles.menuRowActive]}
                  onPress={() => {
                    onDateChange(option.id);
                    onDateMenuClose();
                  }}
                >
                  <Text
                    style={[
                      styles.menuRowText,
                      isActive && styles.menuRowTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default ReminderFilters;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing['2xl'],
  },

  row: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },

  chip: {
    minHeight: ms(36),
    paddingHorizontal: spacing['2xl'],
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  chipActive: {
    backgroundColor: colors.text,
  },

  dateChip: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.xl,
  },

  chipText: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  chipTextActive: {
    color: colors.white,
  },

  overlay: {
    flex: 1,
    backgroundColor: colors.backdrop,
    justifyContent: 'center',
    paddingHorizontal: spacing['3xl'],
  },

  menuCard: {
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    padding: spacing['2xl'],
    gap: spacing.sm,
  },

  menuTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },

  menuRow: {
    minHeight: ms(44),
    borderRadius: radii.lg,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },

  menuRowActive: {
    backgroundColor: colors.primaryLight,
  },

  menuRowText: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },

  menuRowTextActive: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
});
