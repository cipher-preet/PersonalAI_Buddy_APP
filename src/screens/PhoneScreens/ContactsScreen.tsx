import React, { useMemo, useState } from 'react';
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
import { AVATAR_TONE, CONTACTS, type PhoneContact } from './phoneData';

type Props = {
  bottomPadding: number;
  onBack: () => void;
  onOpenDialer: (number: string) => void;
};

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

const SearchIcon = ({ color = colors.equalMuted }: { color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="6.2" stroke={color} strokeWidth={1.7} />
    <Path d="M16 16.5 19.2 19.7" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
  </Svg>
);

const FilterIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 7h16M7 12h10M10 17h4"
      stroke={colors.equalInk}
      strokeWidth={1.7}
      strokeLinecap="round"
    />
  </Svg>
);

const AddPersonIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx="10" cy="9" r="2.6" stroke={colors.equalInk} strokeWidth={1.7} />
    <Path
      d="M5.2 17.4c.6-2.4 2.2-3.6 4.8-3.6s4.2 1.2 4.8 3.6"
      stroke={colors.equalInk}
      strokeWidth={1.7}
      strokeLinecap="round"
    />
    <Path d="M18 8.2v5M15.5 10.7H20.5" stroke={colors.equalInk} strokeWidth={1.7} strokeLinecap="round" />
  </Svg>
);

const ShieldIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3.8 19 6.4v5.2c0 4.2-2.8 6.8-7 8.6-4.2-1.8-7-4.4-7-8.6V6.4L12 3.8Z"
      stroke={colors.primaryText}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
    <Path
      d="M9.2 12.1 11 13.9 14.9 10"
      stroke={colors.primaryText}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const sectionKey = (name: string) => (/[A-Za-z]/.test(name[0] ?? '') ? name[0].toUpperCase() : '#');

const ContactsScreen = ({ bottomPadding, onBack, onOpenDialer }: Props) => {
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = CONTACTS.filter(item =>
      `${item.name} ${item.number}`.toLowerCase().includes(needle),
    );
    const map = new Map<string, PhoneContact[]>();
    list.forEach(item => {
      const key = sectionKey(item.name);
      map.set(key, [...(map.get(key) ?? []), item]);
    });
    return [...map.keys()]
      .sort((a, b) => (a === '#' ? -1 : b === '#' ? 1 : a.localeCompare(b)))
      .map(key => ({ key, items: map.get(key) ?? [] }));
  }, [query]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to chats"
          onPress={onBack}
          hitSlop={8}
          style={styles.back}
        >
          <BackIcon />
        </Pressable>
        <Text style={styles.title}>Contacts</Text>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search contacts"
            onPress={() => setSearching(open => !open)}
            hitSlop={6}
            style={styles.headerIcon}
          >
            <SearchIcon />
          </Pressable>
          <View style={styles.headerIcon}>
            <FilterIcon />
          </View>
          <View style={styles.headerIcon}>
            <AddPersonIcon />
          </View>
        </View>
      </View>

      {searching ? (
        <View style={styles.searchWrap}>
          <SearchIcon />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search names and numbers"
            placeholderTextColor={colors.equalMuted}
            style={styles.searchInput}
            autoFocus
          />
        </View>
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.list, { paddingBottom: bottomPadding }]}
      >
        <View style={styles.banner}>
          <ShieldIcon />
          <Text style={styles.bannerText}>
            Your contacts are safe and will not be shared with anyone
          </Text>
        </View>

        {groups.map(group => (
          <View key={group.key}>
            <Text style={styles.section}>{group.key}</Text>
            {group.items.map(item => {
              const tone = AVATAR_TONE[item.tone];
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={item.name}
                  onPress={() => onOpenDialer(item.number)}
                  style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                >
                  <View style={[styles.avatar, { backgroundColor: tone.bg }]}>
                    <Text style={[styles.avatarText, { color: tone.fg }]}>{item.initial}</Text>
                  </View>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 12,
    paddingTop: 6,
    paddingBottom: 8,
    gap: 4,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 28,
    lineHeight: 34,
    color: colors.equalInk,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    marginHorizontal: 16,
    marginBottom: 8,
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
    fontSize: 16,
    color: colors.equalInk,
    padding: 0,
  },
  list: {
    paddingBottom: 24,
  },
  banner: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#E7F8EE',
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bannerText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.primaryText,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 22,
    color: colors.equalMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.medium,
    fontSize: 18,
    lineHeight: 22,
  },
  name: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 17,
    lineHeight: 22,
    color: colors.equalInk,
  },
  pressed: {
    opacity: 0.7,
  },
});

export default ContactsScreen;
