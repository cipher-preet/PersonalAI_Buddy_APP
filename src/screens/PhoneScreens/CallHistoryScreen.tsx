import React, { memo, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors, fonts } from '../../theme';
import { AVATAR_TONE, CALLS, type CallKind, type CallRecord } from './phoneData';

type Props = {
  bottomPadding: number;
  onBack: () => void;
  onOpenContacts: () => void;
  onOpenDialer: (number: string) => void;
};

type FilterId = 'all' | 'missed' | 'clean' | 'spam';

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'missed', label: 'Missed' },
  { id: 'clean', label: 'Not spam' },
  { id: 'spam', label: 'Spam' },
];

const BackIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18 9 12l6-6"
      stroke={colors.equalInk}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SearchGlyph = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="6.2" stroke={colors.equalMuted} strokeWidth={1.7} />
    <Path d="M16 16.5 19.2 19.7" stroke={colors.equalMuted} strokeWidth={1.7} strokeLinecap="round" />
  </Svg>
);

const PersonIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="9" r="2.8" stroke={colors.white} strokeWidth={1.7} />
    <Path
      d="M6.6 17.8c.7-2.8 2.4-4.2 5.4-4.2s4.7 1.4 5.4 4.2"
      stroke={colors.white}
      strokeWidth={1.7}
      strokeLinecap="round"
    />
  </Svg>
);

const PhoneIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8.2 4.8h2.1l1.1 2.6-1.4 1.1a12.2 12.2 0 0 0 5.5 5.5l1.1-1.4 2.6 1.1v2.1c0 .8-.6 1.5-1.4 1.6A14.2 14.2 0 0 1 6.6 6.2c.1-.8.8-1.4 1.6-1.4Z"
      stroke={colors.primaryText}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
  </Svg>
);

const kindLabel = (kind: CallKind) => {
  if (kind === 'missed') return 'Missed';
  if (kind === 'spam') return 'Spam';
  if (kind === 'outgoing') return 'Outgoing';
  return 'Incoming';
};

const CallHistoryScreen = ({
  bottomPadding,
  onBack,
  onOpenContacts,
  onOpenDialer,
}: Props) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterId>('all');

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return CALLS.filter(row => {
      if (filter === 'missed' && row.kind !== 'missed') return false;
      if (filter === 'spam' && row.kind !== 'spam') return false;
      if (filter === 'clean' && row.kind === 'spam') return false;
      if (!needle) return true;
      return `${row.name} ${row.number}`.toLowerCase().includes(needle);
    });
  }, [filter, query]);

  const sections = useMemo(() => {
    const order: CallRecord['section'][] = ['Recent', 'Last week'];
    return order
      .map(section => ({
        section,
        items: rows.filter(row => row.section === section),
      }))
      .filter(group => group.items.length > 0);
  }, [rows]);

  const openDialer = (row: CallRecord) => {
    onOpenDialer(row.number);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.searchRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to chats"
          onPress={onBack}
          hitSlop={8}
          style={styles.back}
        >
          <BackIcon />
        </Pressable>
        <View style={styles.search}>
          <SearchGlyph />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search numbers, names"
            placeholderTextColor={colors.equalMuted}
            style={styles.searchInput}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Contacts"
          onPress={onOpenContacts}
          style={styles.people}
        >
          <PersonIcon />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {FILTERS.map(item => {
          const selected = item.id === filter;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setFilter(item.id)}
              style={[styles.chip, selected && styles.chipOn]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextOn]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPadding }]}
      >
        {sections.map(group => (
          <View key={group.section}>
            {group.section === 'Last week' ? (
              <Text style={styles.section}>{group.section}</Text>
            ) : null}
            {group.items.map(row => {
              const tone = AVATAR_TONE[row.tone];
              const alert = row.kind === 'missed' || row.kind === 'spam';
              return (
                <Pressable
                  key={row.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${row.name}, ${kindLabel(row.kind)}`}
                  onPress={() => openDialer(row)}
                  style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                >
                  <View>
                    <View style={[styles.avatar, { backgroundColor: tone.bg }]}>
                      <Text style={[styles.avatarText, { color: tone.fg }]}>{row.initial}</Text>
                    </View>
                    {row.ago ? (
                      <View style={styles.ago}>
                        <Text style={styles.agoText}>{row.ago}</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.copy}>
                    <Text style={styles.name} numberOfLines={1}>
                      {row.name}
                    </Text>
                    <Text style={[styles.detail, alert && styles.detailAlert]} numberOfLines={1}>
                      {kindLabel(row.kind)} · {row.when}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Dial ${row.name}`}
                    onPress={() => openDialer(row)}
                    hitSlop={8}
                    style={styles.call}
                  >
                    <PhoneIcon />
                  </Pressable>
                </Pressable>
              );
            })}
          </View>
        ))}
        {rows.length === 0 ? (
          <Text style={styles.empty}>No calls in this filter.</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 16,
    paddingTop: 8,
    gap: 8,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.searchField,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.equalInk,
    padding: 0,
  },
  people: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    gap: 8,
  },
  chip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.equalLine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 18,
    color: colors.equalInk,
  },
  chipTextOn: {
    color: colors.onPrimary,
  },
  list: {
    paddingTop: 6,
    paddingBottom: 24,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 6,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 18,
    color: colors.equalMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.medium,
    fontSize: 18,
    lineHeight: 22,
  },
  ago: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    minWidth: 28,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: '#F4EEFF',
    borderWidth: 1.5,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agoText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 12,
    color: colors.primaryText,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 21,
    color: colors.equalInk,
  },
  detail: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.equalMuted,
  },
  detailAlert: {
    color: colors.error,
  },
  call: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    paddingHorizontal: 20,
    paddingTop: 28,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 21,
    color: colors.equalMuted,
  },
  pressed: {
    opacity: 0.72,
  },
});

export default memo(CallHistoryScreen);
