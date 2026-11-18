import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import EqualMark from '../../navigation/EqualMark';
import { colors, fonts } from '../../theme';

type ChipKind = 'callback' | 'always' | 'mute';

type ChatRow = {
  id: string;
  name: string;
  preview: string;
  time: string;
  recent?: boolean;
  unread?: number;
  verified?: boolean;
  kind: 'assistant' | 'unknown';
  chips: ChipKind[];
};

const ROWS: ChatRow[] = [
  {
    id: 'assistant',
    name: 'Equal AI Assistant',
    preview: 'Hi Preet!...',
    time: 'Yesterday',
    recent: true,
    unread: 1,
    verified: true,
    kind: 'assistant',
    chips: [],
  },
  {
    id: 'pankaj',
    name: 'Pankaj P2',
    preview: 'No information shared',
    time: '02 Nov',
    unread: 1,
    kind: 'unknown',
    chips: ['callback', 'always'],
  },
  {
    id: 'sidhu',
    name: 'Sidhu Kothari',
    preview: 'Request to speak directly',
    time: '02 Nov',
    kind: 'unknown',
    chips: ['callback', 'mute'],
  },
];

const LANGUAGE_GRID = [
  ['E', 'ह', 'த'],
  ['म', 'ம', 'ಕ'],
  ['ગ', 'ব', 'ଓ'],
];

const track = (size: number) => Number((size * -0.026).toFixed(2));

const type = (
  family: string,
  size: number,
  line: number,
  color: string,
  tracking?: number,
): TextStyle => ({
  fontFamily: family,
  fontSize: size,
  lineHeight: line,
  letterSpacing: tracking ?? track(size),
  color,
  includeFontPadding: false,
});

const SearchIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.35-4.35"
      stroke={colors.equalInk}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const ChevronIcon = ({ color = '#8E8E8E' }: { color?: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 6l6 6-6 6"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const StarIcon = ({ color }: { color: string }) => (
  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
    <Path
      d="m12 3.2 2.2 5.3 5.7.5-4.3 3.7 1.3 5.6L12 15.4 7.1 18.3l1.3-5.6L4.1 9l5.7-.5L12 3.2Z"
      fill={color}
    />
  </Svg>
);

const AssistantGlyph = () => (
  <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
    <Path
      d="M9 7.2 10.1 10 13 11.1 10.1 12.2 9 15l-1.1-2.8L5 11.1 7.9 10 9 7.2Z"
      fill="#F5C451"
    />
    <Path
      d="M15.2 4.4 15.8 6.2 17.6 6.8 15.8 7.4 15.2 9.2 14.6 7.4 12.8 6.8 14.6 6.2 15.2 4.4Z"
      fill="#F5C451"
    />
    <Path
      d="M16.2 9.5h8.4c1.2 0 2.2 1 2.2 2.2v15.2c0 1.2-1 2.2-2.2 2.2h-8.4c-1.2 0-2.2-1-2.2-2.2V11.7c0-1.2 1-2.2 2.2-2.2Z"
      fill="#F4F7FB"
      stroke="#D5DDEA"
      strokeWidth={1.2}
    />
    <Path
      d="M16.8 12.2h7.2v12.2h-7.2V12.2Z"
      fill="#8EB7F2"
    />
    <Circle cx="20.4" cy="26.6" r="0.9" fill="#9AA6B8" />
  </Svg>
);

const RotaryPhone = () => (
  <Svg width={36} height={36} viewBox="0 0 48 48" fill="none">
    <Path
      d="M12 15.2c.2-3.4 4.6-6 12-6s11.8 2.6 12 6c.1 1.5-1 2.6-2.4 2.6h-2.8c-.9 0-1.5-.7-1.5-1.4 0-1.6-2.4-2.6-5.3-2.6s-5.3 1-5.3 2.6c0 .7-.6 1.4-1.5 1.4h-2.8c-1.4 0-2.5-1.1-2.4-2.6Z"
      fill="#E53935"
    />
    <Path
      d="M13.5 20.2h21c2.4 0 4.3 1.9 4.3 4.3v7.6c0 2.4-1.9 4.3-4.3 4.3h-21c-2.4 0-4.3-1.9-4.3-4.3v-7.6c0-2.4 1.9-4.3 4.3-4.3Z"
      fill="#E53935"
    />
    <Circle cx="24" cy="28.4" r="5.4" fill="#C62828" />
    <Circle cx="24" cy="28.4" r="1.7" fill="#FFCDD2" />
    <Circle cx="24" cy="23.8" r="0.7" fill="#FFCDD2" />
    <Circle cx="27.6" cy="25.2" r="0.7" fill="#FFCDD2" />
    <Circle cx="20.4" cy="25.2" r="0.7" fill="#FFCDD2" />
  </Svg>
);

const MuteIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="8.2" stroke="#E53935" strokeWidth={1.7} />
    <Path
      d="M8 12.2a4 4 0 0 1 6.4-3.2M16.2 12.2v.4a4 4 0 0 1-.5 1.9M10.6 17.2a1.6 1.6 0 0 0 2.8 0M7.2 7.2l9.6 9.6"
      stroke="#E53935"
      strokeWidth={1.6}
      strokeLinecap="round"
    />
  </Svg>
);

const PhoneChipIcon = () => (
  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8.2 4.8h2.1l1.1 2.6-1.4 1.1a12.2 12.2 0 0 0 5.5 5.5l1.1-1.4 2.6 1.1v2.1c0 .8-.6 1.5-1.4 1.6A14.2 14.2 0 0 1 6.6 6.2c.1-.8.8-1.4 1.6-1.4Z"
      stroke={colors.equalInk}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
  </Svg>
);

const VerifiedMark = () => (
  <View style={styles.verified}>
    <Svg width={10} height={10} viewBox="0 0 12 12" fill="none">
      <Path
        d="M2.2 6.2 4.7 8.6 9.8 3.4"
        stroke={colors.white}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

const StaticChatsScreen = () => {
  const { tabBarClearance } = useResponsiveLayout();
  const [assistantOn, setAssistantOn] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return ROWS;
    }
    return ROWS.filter(row =>
      `${row.name} ${row.preview}`.toLowerCase().includes(needle),
    );
  }, [query]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: tabBarClearance }}
      >
        <View style={styles.brandRow}>
          <EqualMark large color={colors.primary} />
          <Text style={styles.wordmark}>equal ai</Text>
        </View>

        <View style={styles.statusCard}>
          <AssistantGlyph />
          <View style={styles.statusCopy}>
            <Text style={styles.statusTitle}>
              {assistantOn ? 'AI Assistant is On' : 'AI Assistant is Off'}
            </Text>
            <Text style={styles.statusSubtitle}>
              {assistantOn
                ? 'Equal Assistant is managing your calls!'
                : 'Turn it on when you want calls handled.'}
            </Text>
          </View>
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: assistantOn }}
            accessibilityLabel="AI Assistant"
            onPress={() => setAssistantOn(on => !on)}
            style={[styles.switchTrack, assistantOn && styles.switchTrackOn]}
          >
            <View style={styles.switchThumb} />
          </Pressable>
        </View>

        <View style={styles.rule} />

        <View style={styles.carousel}>
          <View style={styles.peek} />
          <View style={styles.langCard}>
            <View style={styles.langCopy}>
              <View style={styles.featurePill}>
                <StarIcon color="#E0A100" />
                <Text style={styles.featureText}>NEW FEATURE</Text>
              </View>
              <Text style={styles.langTitle}>Assistant Languages</Text>
              <Text style={styles.langBody}>
                Checkout how your assistant speaks in 9 languages
              </Text>
              <View style={styles.tryButton}>
                <StarIcon color={colors.white} />
                <Text style={styles.tryText}>Try Languages</Text>
              </View>
            </View>
            <View style={styles.langBoard}>
              {LANGUAGE_GRID.map(line => (
                <View key={line.join('')} style={styles.langLine}>
                  {line.map(glyph => (
                    <Text key={glyph} style={styles.langGlyph}>
                      {glyph}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          </View>
          <View style={styles.peek} />
        </View>

        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CHATS</Text>
          <Pressable
            onPress={() => setSearchOpen(open => !open)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Search"
          >
            <SearchIcon />
          </Pressable>
        </View>

        {searchOpen ? (
          <View style={styles.search}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search"
              placeholderTextColor="#9A9A9A"
              style={styles.searchInput}
              autoFocus
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
        ) : null}

        {rows.map(row => (
          <View key={row.id} style={styles.row}>
            {row.kind === 'assistant' ? (
              <View style={styles.assistantAvatar}>
                <EqualMark color={colors.white} />
              </View>
            ) : (
              <View style={styles.unknownAvatar}>
                <RotaryPhone />
              </View>
            )}
            <View style={styles.rowBody}>
              <View style={styles.titleLine}>
                <Text style={styles.name} numberOfLines={1}>
                  {row.name}
                </Text>
                {row.verified ? <VerifiedMark /> : null}
                <View style={styles.titleSpacer} />
                <Text style={row.recent ? styles.timeRecent : styles.time}>
                  {row.time}
                </Text>
              </View>
              <View style={styles.previewLine}>
                <Text style={styles.preview} numberOfLines={1}>
                  {row.preview}
                </Text>
                {row.unread ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{row.unread}</Text>
                  </View>
                ) : null}
              </View>
              {row.chips.length > 0 ? (
                <View style={styles.chips}>
                  {row.chips.map(chip => (
                    <Chip key={chip} kind={chip} />
                  ))}
                </View>
              ) : null}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const Chip = ({ kind }: { kind: ChipKind }) => {
  if (kind === 'callback') {
    return (
      <View style={[styles.chip, styles.chipTint]}>
        <PhoneChipIcon />
        <Text style={styles.chipText}>Call back to identify</Text>
        <ChevronIcon color="#6E6E6E" />
      </View>
    );
  }

  if (kind === 'always') {
    return (
      <View style={styles.chip}>
        <Text style={styles.chipText}>Always</Text>
        <ChevronIcon />
      </View>
    );
  }

  return (
    <View style={styles.chip}>
      <MuteIcon />
      <Text style={styles.chipText}>Mute</Text>
    </View>
  );
};

export default StaticChatsScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 14,
  },

  wordmark: type(fonts.bold, 26, 32, colors.primary),

  statusCard: {
    marginHorizontal: 16,
    minHeight: 78,
    borderRadius: 18,
    backgroundColor: '#E7F6EC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 12,
    paddingRight: 14,
    paddingVertical: 12,
  },

  statusCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  statusTitle: type(fonts.bold, 16, 21, colors.equalInk),

  statusSubtitle: type(fonts.regular, 13, 18, '#8A8A8A'),

  switchTrack: {
    width: 52,
    height: 32,
    borderRadius: 999,
    backgroundColor: '#D9D9D9',
    padding: 3,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  switchTrackOn: {
    backgroundColor: colors.primary,
    alignItems: 'flex-end',
  },

  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.white,
  },

  rule: {
    height: 3,
    marginTop: 14,
    backgroundColor: colors.primary,
  },

  carousel: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },

  peek: {
    width: 16,
    borderRadius: 16,
    backgroundColor: '#D7F3E2',
  },

  langCard: {
    flex: 1,
    minHeight: 168,
    borderRadius: 22,
    backgroundColor: '#DFF6E8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 12,
    paddingVertical: 16,
    gap: 8,
  },

  langCopy: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },

  featurePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 22,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },

  featureText: type(fonts.semibold, 10, 13, '#7A7A7A', 0.6),

  langTitle: type(fonts.bold, 20, 25, '#149A45'),

  langBody: type(fonts.regular, 13, 18, '#7A7A7A'),

  tryButton: {
    alignSelf: 'flex-start',
    marginTop: 6,
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  tryText: type(fonts.semibold, 14, 18, colors.white),

  langBoard: {
    width: 92,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.55)',
    paddingVertical: 8,
    paddingHorizontal: 6,
    gap: 4,
  },

  langLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  langGlyph: {
    width: 26,
    textAlign: 'center',
    fontFamily: 'sans-serif',
    fontSize: 15,
    lineHeight: 20,
    color: '#149A45',
    fontWeight: '600',
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    marginBottom: 6,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D5D5D5',
  },

  dotActive: {
    backgroundColor: colors.primary,
    width: 7,
    height: 7,
  },

  section: {
    minHeight: 40,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionLabel: type(fonts.semibold, 13, 18, '#6E6E6E', 1.1),

  search: {
    marginHorizontal: 20,
    marginBottom: 4,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  searchInput: {
    ...type(fonts.regular, 15, 20, colors.equalInk),
    paddingVertical: 0,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },

  assistantAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  unknownAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF1D6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  rowBody: {
    flex: 1,
    minWidth: 0,
  },

  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  name: {
    ...type(fonts.bold, 16, 21, colors.equalInk),
    flexShrink: 1,
  },

  verified: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  titleSpacer: {
    flex: 1,
  },

  time: type(fonts.medium, 13, 18, '#9A9A9A'),

  timeRecent: type(fonts.semibold, 13, 18, '#149A45'),

  previewLine: {
    marginTop: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  preview: {
    ...type(fonts.regular, 15, 20, '#8A8A8A'),
    flex: 1,
  },

  badge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 5,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeText: type(fonts.bold, 12, 16, colors.white),

  chips: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  chip: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  chipTint: {
    backgroundColor: '#E7F8EE',
    borderColor: 'transparent',
  },

  chipText: type(fonts.medium, 13, 18, colors.equalInk),
});
