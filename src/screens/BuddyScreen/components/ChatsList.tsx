import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import BrandLogo from '../../../components/BrandLogo';
import EqualMark from '../../../navigation/EqualMark';
import { useListening } from '../../../store/context/ListeningContext';
import type { ChatSession } from '../types';
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
  sessions: ChatSession[];
  loading?: boolean;
  loadingMore?: boolean;
  error?: string | null;
  hasMore?: boolean;
  bottomInset: number;
  onOpenSession: (sessionId: string, prompt?: string) => void;
  onNewChat: () => void;
  onRetry?: () => void;
  onLoadMore?: () => void;
};

const SearchIcon = ({ color = colors.equalInk }: { color?: string }) => (
  <Svg width={ms(22)} height={ms(22)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.35-4.35"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const ChevronIcon = ({ color = colors.equalMuted }: { color?: string }) => (
  <Svg width={ms(14)} height={ms(14)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 6l6 6-6 6"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChatIcon = ({ color }: { color: string }) => (
  <Svg width={ms(16)} height={ms(16)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5.2 5.2h13.6A2.2 2.2 0 0 1 21 7.4v6.6a2.2 2.2 0 0 1-2.2 2.2H9.2L5.4 19.6a.7.7 0 0 1-1.1-.56V7.4a2.2 2.2 0 0 1 2.2-2.2Z"
      stroke={color}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
  </Svg>
);

const LinesIcon = ({ color }: { color: string }) => (
  <Svg width={ms(16)} height={ms(16)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 7.5h12M6 12h12M6 16.5h7"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
    />
  </Svg>
);

const initialsFor = (title: string) => {
  const parts = title.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'C';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const dayDelta = (date: Date) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  return Math.round((startOfToday.getTime() - startOfDate.getTime()) / 86400000);
};

const formatChatTime = (date: Date) => {
  const diffDays = dayDelta(date);
  if (diffDays <= 0) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const ChatsList = ({
  sessions,
  loading = false,
  loadingMore = false,
  error,
  hasMore = false,
  bottomInset,
  onOpenSession,
  onNewChat,
  onRetry,
  onLoadMore,
}: Props) => {
  const { isActive, spaceName, requestStop } = useListening();
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const latestId = sessions[0]?.id;
  const needle = query.trim().toLowerCase();

  const visibleSessions = useMemo(() => {
    if (!needle) {
      return sessions;
    }
    return sessions.filter(session =>
      `${session.title} ${session.preview}`.toLowerCase().includes(needle),
    );
  }, [needle, sessions]);

  const showBuddy =
    !needle ||
    'buddy'.startsWith(needle) ||
    'ask about your notes and tasks'.includes(needle);

  return (
    <FlatList
      data={visibleSessions}
      keyExtractor={item => item.id}
      style={styles.root}
      contentContainerStyle={[styles.listContent, { paddingBottom: bottomInset }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      onEndReached={() => {
        if (hasMore && !needle) {
          onLoadMore?.();
        }
      }}
      onEndReachedThreshold={0.4}
      ListHeaderComponent={
        <View>
          <View style={styles.topBar}>
            <BrandLogo size={ms(36)} showWordmark />
          </View>

          <View style={styles.statusCard}>
            <View style={styles.statusIcon}>
              <ChatIcon color={colors.primaryText} />
            </View>
            <View style={styles.statusCopy}>
              <Text style={styles.statusTitle}>
                {isActive ? 'Listening is on' : 'Buddy is ready'}
              </Text>
              <Text style={styles.statusSubtitle} numberOfLines={2}>
                {isActive
                  ? `Capturing ${spaceName}`
                  : 'Ask about notes, tasks, and what to do next.'}
              </Text>
            </View>
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: isActive }}
              accessibilityLabel={isActive ? 'Stop listening' : 'Start a chat'}
              onPress={isActive ? requestStop : onNewChat}
              style={[styles.switchTrack, isActive && styles.switchTrackOn]}
            >
              <View style={styles.switchThumb} />
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CHATS</Text>
            <Pressable
              style={styles.searchButton}
              onPress={() => setSearchOpen(open => !open)}
              accessibilityRole="button"
              accessibilityLabel={searchOpen ? 'Hide search' : 'Search chats'}
            >
              <SearchIcon color={searchOpen ? colors.primaryText : colors.equalInk} />
            </Pressable>
          </View>

          {searchOpen ? (
            <View style={styles.search}>
              <SearchIcon color={colors.equalMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search"
                placeholderTextColor={colors.equalMuted}
                style={styles.searchInput}
                autoFocus
                autoCorrect={false}
                autoCapitalize="none"
                accessibilityLabel="Search chats"
              />
            </View>
          ) : null}

          {showBuddy ? (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={onNewChat}
              accessibilityRole="button"
              accessibilityLabel="New chat with Buddy"
            >
              <View style={styles.assistantAvatar}>
                <EqualMark />
              </View>
              <View style={styles.rowBody}>
                <View style={styles.titleLine}>
                  <Text style={styles.name} numberOfLines={1}>
                    Buddy
                  </Text>
                  <Text style={styles.timeRecent}>Now</Text>
                </View>
                <Text style={styles.preview} numberOfLines={1}>
                  Ask about your notes and tasks
                </Text>
                <View style={styles.chips}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.chip,
                      styles.chipHighlighted,
                      pressed && styles.pressed,
                    ]}
                    onPress={onNewChat}
                    accessibilityRole="button"
                    accessibilityLabel="Start a new chat"
                  >
                    <ChatIcon color={colors.primaryText} />
                    <Text style={[styles.chipText, styles.chipTextOn]}>New chat</Text>
                    <ChevronIcon color={colors.primaryText} />
                  </Pressable>
                </View>
              </View>
            </Pressable>
          ) : null}

          {loading && sessions.length === 0 ? (
            <ActivityIndicator style={styles.footer} color={colors.primary} />
          ) : null}

          {!loading && visibleSessions.length === 0 && !showBuddy ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No matches</Text>
              <Text style={styles.emptyBody}>Try a different name or message.</Text>
            </View>
          ) : null}

          {!loading && sessions.length === 0 && !needle ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                {error ? 'Could not load chats' : 'No other chats yet'}
              </Text>
              <Text style={styles.emptyBody}>
                {error
                  ? 'Check your connection and try again.'
                  : 'Conversations you start with Buddy show up here.'}
              </Text>
              {error && onRetry ? (
                <Pressable onPress={onRetry} accessibilityRole="button">
                  <Text style={styles.retryText}>Retry</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>
      }
      ListFooterComponent={
        loadingMore ? (
          <ActivityIndicator style={styles.footer} color={colors.primary} />
        ) : null
      }
      renderItem={({ item }) => (
        <ChatRow
          session={item}
          highlighted={item.id === latestId}
          onOpen={() => onOpenSession(item.id)}
          onSummarize={
            item.messageCount > 0
              ? () => onOpenSession(item.id, 'Summarize this conversation')
              : undefined
          }
        />
      )}
    />
  );
};

const ChatRow = ({
  session,
  highlighted,
  onOpen,
  onSummarize,
}: {
  session: ChatSession;
  highlighted: boolean;
  onOpen: () => void;
  onSummarize?: () => void;
}) => {
  const recent = dayDelta(session.updatedAt) <= 1;

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={session.title}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initialsFor(session.title)}</Text>
      </View>
      <View style={styles.rowBody}>
        <View style={styles.titleLine}>
          <Text style={styles.name} numberOfLines={1}>
            {session.title}
          </Text>
          <Text style={recent ? styles.timeRecent : styles.time}>
            {formatChatTime(session.updatedAt)}
          </Text>
        </View>
        <Text style={styles.preview} numberOfLines={1}>
          {session.preview}
        </Text>
        <View style={styles.chips}>
          <Pressable
            style={({ pressed }) => [
              styles.chip,
              highlighted && styles.chipHighlighted,
              pressed && styles.pressed,
            ]}
            onPress={onOpen}
            accessibilityRole="button"
            accessibilityLabel={`Continue ${session.title}`}
          >
            <ChatIcon color={highlighted ? colors.primaryText : colors.equalInk} />
            <Text
              style={[
                styles.chipText,
                highlighted && styles.chipTextOn,
              ]}
            >
              Continue
            </Text>
            <ChevronIcon color={highlighted ? colors.primaryText : colors.equalMuted} />
          </Pressable>
          {onSummarize ? (
            <Pressable
              style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
              onPress={onSummarize}
              accessibilityRole="button"
              accessibilityLabel={`Summarize ${session.title}`}
            >
              <LinesIcon color={colors.equalInk} />
              <Text style={styles.chipText}>Summarize</Text>
              <ChevronIcon />
            </Pressable>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
};

export default ChatsList;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  listContent: {
    flexGrow: 1,
  },

  topBar: {
    minHeight: ms(56),
    justifyContent: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
  },

  statusCard: {
    marginHorizontal: layout.screenPadding,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    minHeight: ms(76),
    borderRadius: radii.lg,
    backgroundColor: colors.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.xl,
  },

  statusIcon: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },

  statusTitle: {
    color: colors.equalInk,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    letterSpacing: -0.4,
  },

  statusSubtitle: {
    color: colors.equalMuted,
    fontSize: fontSize.sm,
    lineHeight: ms(18),
  },

  switchTrack: {
    width: ms(52),
    height: ms(32),
    borderRadius: radii.pill,
    backgroundColor: '#D5D5D5',
    padding: ms(3),
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  switchTrackOn: {
    backgroundColor: colors.primary,
    alignItems: 'flex-end',
  },

  switchThumb: {
    width: ms(26),
    height: ms(26),
    borderRadius: ms(13),
    backgroundColor: colors.white,
  },

  section: {
    minHeight: ms(40),
    paddingHorizontal: layout.screenPadding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionLabel: {
    color: colors.equalInk,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    letterSpacing: 1.1,
  },

  searchButton: {
    width: ms(40),
    height: ms(40),
    alignItems: 'center',
    justifyContent: 'center',
  },

  search: {
    marginHorizontal: layout.screenPadding,
    marginBottom: spacing.md,
    minHeight: ms(44),
    borderRadius: radii.pill,
    backgroundColor: colors.searchField,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing['2xl'],
  },

  searchInput: {
    flex: 1,
    color: colors.equalInk,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    paddingVertical: spacing.md,
    letterSpacing: -0.3,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xl,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },

  rowPressed: {
    backgroundColor: colors.primarySoft,
  },

  assistantAvatar: {
    width: ms(56),
    height: ms(56),
    borderRadius: ms(28),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatar: {
    width: ms(56),
    height: ms(56),
    borderRadius: ms(28),
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: colors.equalInk,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    letterSpacing: -0.4,
  },

  rowBody: {
    flex: 1,
    minWidth: 0,
    paddingTop: spacing.xxs,
  },

  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  name: {
    flex: 1,
    color: colors.equalInk,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    letterSpacing: -0.4,
  },

  time: {
    color: colors.equalMuted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  timeRecent: {
    color: colors.primaryText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  preview: {
    marginTop: spacing.xxs,
    color: colors.equalMuted,
    fontSize: fontSize.base,
    lineHeight: ms(22),
  },

  chips: {
    marginTop: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  chip: {
    minHeight: ms(36),
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.equalLine,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  chipHighlighted: {
    backgroundColor: colors.primaryLight,
    borderColor: 'transparent',
  },

  chipText: {
    color: colors.equalInk,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    letterSpacing: -0.2,
  },

  chipTextOn: {
    color: colors.primaryText,
  },

  pressed: {
    opacity: 0.72,
  },

  empty: {
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing['4xl'],
    gap: spacing.sm,
  },

  emptyTitle: {
    color: colors.equalInk,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    letterSpacing: -0.3,
  },

  emptyBody: {
    maxWidth: ms(280),
    textAlign: 'center',
    color: colors.equalMuted,
    fontSize: fontSize.base,
    lineHeight: ms(22),
  },

  retryText: {
    color: colors.primaryText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.sm,
  },

  footer: {
    paddingVertical: spacing.xl,
  },
});
