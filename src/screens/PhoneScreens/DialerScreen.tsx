import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors, fonts } from '../../theme';
import { AVATAR_TONE, CONTACTS, digitsOf, type PhoneContact } from './phoneData';

const KEYS: { digit: string; letters: string }[][] = [
  [
    { digit: '1', letters: '' },
    { digit: '2', letters: 'ABC' },
    { digit: '3', letters: 'DEF' },
  ],
  [
    { digit: '4', letters: 'GHI' },
    { digit: '5', letters: 'JKL' },
    { digit: '6', letters: 'MNO' },
  ],
  [
    { digit: '7', letters: 'PQRS' },
    { digit: '8', letters: 'TUV' },
    { digit: '9', letters: 'WXYZ' },
  ],
  [
    { digit: '*', letters: '' },
    { digit: '0', letters: '+' },
    { digit: '#', letters: '' },
  ],
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

const SearchIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="6.2" stroke={colors.equalInk} strokeWidth={1.7} />
    <Path d="M16 16.5 19.2 19.7" stroke={colors.equalInk} strokeWidth={1.7} strokeLinecap="round" />
  </Svg>
);

const FilterIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M4 7h16M7 12h10M10 17h4" stroke={colors.equalInk} strokeWidth={1.7} strokeLinecap="round" />
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
  </Svg>
);

const DeleteIcon = () => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9.2 5.5h10.2a1.6 1.6 0 0 1 1.6 1.6v9.8a1.6 1.6 0 0 1-1.6 1.6H9.2L4 12l5.2-6.5Z"
      stroke={colors.equalInk}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
    <Path d="M11 9.4 16.2 14.6M16.2 9.4 11 14.6" stroke={colors.equalInk} strokeWidth={1.6} strokeLinecap="round" />
  </Svg>
);

type Props = {
  bottomPadding: number;
  initialNumber?: string;
  onBack: () => void;
};

export type DialerHandle = {
  close: () => void;
};

const PAD_TRAVEL = 640;

const DialerScreen = forwardRef<DialerHandle, Props>(function DialerScreen(
  { bottomPadding, initialNumber = '', onBack },
  ref,
) {
  const [number, setNumber] = useState(
    typeof initialNumber === 'string' ? initialNumber : '',
  );
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [padHeight, setPadHeight] = useState(PAD_TRAVEL);
  const padY = useRef(new Animated.Value(PAD_TRAVEL)).current;
  const screenOpacity = useRef(new Animated.Value(0)).current;
  const closing = useRef(false);

  const groups = useMemo(() => {
    const digits = digitsOf(number);
    const needle = query.trim().toLowerCase();
    const matches = CONTACTS.filter(item => {
      const matchesNumber = !digits || digitsOf(item.number).includes(digits) || item.name.includes(number);
      const matchesQuery = !needle || `${item.name} ${item.number}`.toLowerCase().includes(needle);
      return matchesNumber && matchesQuery;
    });
    const map = new Map<string, PhoneContact[]>();
    matches.forEach(item => {
      const key = /[A-Za-z]/.test(item.name[0] ?? '') ? item.name[0].toUpperCase() : '#';
      map.set(key, [...(map.get(key) ?? []), item]);
    });
    return [...map.keys()]
      .sort((a, b) => (a === '#' ? -1 : b === '#' ? 1 : a.localeCompare(b)))
      .map(key => ({ key, items: map.get(key) ?? [] }));
  }, [number, query]);

  const push = (digit: string) => setNumber(current => `${current}${digit}`);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      Animated.parallel([
        Animated.timing(screenOpacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(padY, {
          toValue: 0,
          duration: 460,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    });
    return () => cancelAnimationFrame(frame);
  }, [padY, screenOpacity]);

  const close = () => {
    if (closing.current) {
      return;
    }
    closing.current = true;
    Animated.parallel([
      Animated.timing(padY, {
        toValue: padHeight,
        duration: 280,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onBack();
      } else {
        closing.current = false;
      }
    });
  };

  useImperativeHandle(ref, () => ({ close }), [close]);

  return (
    <Animated.View style={[styles.screen, { opacity: screenOpacity }]}>
    <StatusBar barStyle="dark-content" backgroundColor={colors.white} translucent={false} />
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={close}
          hitSlop={8}
          style={styles.back}
        >
          <BackIcon />
        </Pressable>
        <Text style={styles.title}>Contacts</Text>
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

      {searching ? (
        <View style={styles.searchWrap}>
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
        style={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.listContent, { paddingBottom: padHeight }]}
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
                  onPress={() => setNumber(item.number)}
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
        {groups.length === 0 ? (
          <Text style={styles.empty}>No contact matches this number.</Text>
        ) : null}
      </ScrollView>

      <Animated.View
        onLayout={event => {
          const next = Math.round(event.nativeEvent.layout.height);
          setPadHeight(current => (current === next ? current : next));
        }}
        style={[
          styles.pad,
          styles.padFloat,
          { paddingBottom: bottomPadding, transform: [{ translateY: padY }] },
        ]}
      >
        <View style={styles.numberRow}>
          <Text style={styles.number} numberOfLines={1}>
            {number || ' '}
          </Text>
          {number ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Delete digit"
              onPress={() => setNumber(current => current.slice(0, -1))}
              onLongPress={() => setNumber('')}
              hitSlop={8}
            >
              <DeleteIcon />
            </Pressable>
          ) : (
            <View style={styles.deleteSpacer} />
          )}
        </View>

        {KEYS.map(row => (
          <View key={row[0].digit} style={styles.keyRow}>
            {row.map(key => (
              <Pressable
                key={key.digit}
                accessibilityRole="button"
                accessibilityLabel={key.digit}
                onPress={() => push(key.digit)}
                onLongPress={key.digit === '0' ? () => push('+') : undefined}
                style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
              >
                <Text style={styles.digit}>{key.digit}</Text>
                <Text style={styles.letters}>{key.letters || ' '}</Text>
              </Pressable>
            ))}
          </View>
        ))}

        <View style={styles.simRow}>
          <View style={styles.sim}>
            <View style={styles.simBadge}>
              <Text style={styles.simBadgeText}>1</Text>
            </View>
            <Text style={styles.simLabel}>SIM 1</Text>
          </View>
          <View style={styles.sim}>
            <View style={styles.simBadge}>
              <Text style={styles.simBadgeText}>2</Text>
            </View>
            <Text style={styles.simLabel}>SIM 2</Text>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 16,
    paddingTop: 4,
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
  headerIcon: {
    width: 36,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    marginHorizontal: 16,
    marginBottom: 6,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.searchField,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  searchInput: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.equalInk,
    padding: 0,
  },
  banner: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: '#F4EEFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
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
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 8,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 4,
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
    paddingVertical: 8,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 20,
  },
  name: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 21,
    color: colors.equalInk,
  },
  empty: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.equalMuted,
  },
  pad: {
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.equalLine,
    backgroundColor: colors.white,
  },
  padFloat: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  numberRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 8,
  },
  number: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.semibold,
    fontSize: 28,
    lineHeight: 34,
    color: colors.equalInk,
  },
  deleteSpacer: {
    width: 26,
  },
  keyRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  key: {
    flex: 1,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F4EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPressed: {
    backgroundColor: '#DDD0FF',
  },
  digit: {
    fontFamily: fonts.semibold,
    fontSize: 26,
    lineHeight: 30,
    color: colors.equalInk,
  },
  letters: {
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 1,
    color: colors.primaryText,
  },
  simRow: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 4,
    paddingBottom: 6,
  },
  sim: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  simBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 14,
    color: colors.primaryText,
  },
  simLabel: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 20,
    color: colors.onPrimary,
  },
  pressed: {
    opacity: 0.7,
  },
});

export default DialerScreen;
