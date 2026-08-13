import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

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
  userName?: string | null;
  suggestions: string[];
  sessions: ChatSession[];
  loadingSessions?: boolean;
  onSuggestionPress: (suggestion: string) => void;
  onSeeAllHistory: () => void;
  onSelectSession: (sessionId: string) => void;
};

const BuddyAvatar = () => (
  <View style={styles.avatarWrap}>
    <View style={styles.avatarInner}>
      <Svg width={ms(54)} height={ms(54)} viewBox="0 0 64 64" fill="none">
        <Circle cx="32" cy="32" r="30" fill={colors.white} />
        <Path
          d="M22 28c1.8-2.4 4.4-3.6 7-3.2"
          stroke={colors.primary}
          strokeWidth={2.6}
          strokeLinecap="round"
        />
        <Path
          d="M42 28c-1.8-2.4-4.4-3.6-7-3.2"
          stroke={colors.primary}
          strokeWidth={2.6}
          strokeLinecap="round"
        />
        <Path
          d="M24 40c2.6 3.4 6 5 8 5s5.4-1.6 8-5"
          stroke={colors.primary}
          strokeWidth={2.6}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  </View>
);

const ArrowUpIcon = ({ color = colors.primary }: { color?: string }) => (
  <Svg width={ms(13)} height={ms(13)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 17 17 7M10 7h7v7"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const formatHistoryDate = (date: Date) => {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startThatDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const dayDiff = Math.round(
    (startToday.getTime() - startThatDay.getTime()) / 86400000,
  );

  if (dayDiff === 0) {
    return 'Today';
  }
  if (dayDiff === 1) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const BuddyLanding = ({
  userName,
  suggestions,
  sessions,
  loadingSessions = false,
  onSuggestionPress,
  onSeeAllHistory,
  onSelectSession,
}: Props) => {
  const firstName = userName?.trim()?.split(/\s+/)[0];
  const greetingName = firstName || 'there';
  const recentSessions = sessions
    .filter(session => !session.id.startsWith('pending-'))
    .slice(0, 5);

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <BuddyAvatar />
          <Text style={styles.greeting}>
            Hi! I'm Buddy,{'\n'}your personal assistant
          </Text>
          <Text style={styles.greetingSub}>
            Ask me anything, {greetingName}.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Start a chat</Text>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onSeeAllHistory}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chipsWrap}>
          {suggestions.map(suggestion => (
            <Pressable
              key={suggestion}
              style={styles.chip}
              onPress={() => onSuggestionPress(suggestion)}
            >
              <Text style={styles.chipText}>{suggestion}</Text>
              <View style={styles.chipIcon}>
                <ArrowUpIcon />
              </View>
            </Pressable>
          ))}
        </View>

        <View style={[styles.sectionHeader, styles.historyHeader]}>
          <Text style={styles.sectionLabel}>History</Text>
        </View>

        {loadingSessions ? (
          <View style={styles.historyLoading}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : recentSessions.length === 0 ? (
          <View style={styles.historyEmpty}>
            <Text style={styles.historyEmptyText}>No conversations yet</Text>
            <Text style={styles.historyEmptySub}>
              Start a new chat to see it here
            </Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {recentSessions.map(session => (
              <TouchableOpacity
                key={session.id}
                activeOpacity={0.88}
                style={styles.historyCard}
                onPress={() => onSelectSession(session.id)}
              >
                <Text numberOfLines={2} style={styles.historyTitle}>
                  {session.title}
                </Text>
                <Text style={styles.historyDate}>
                  {formatHistoryDate(session.updatedAt)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default BuddyLanding;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  content: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: ms(160),
  },

  hero: {
    alignItems: 'center',
    paddingTop: spacing['3xl'],
    paddingBottom: spacing['4xl'],
  },

  avatarWrap: {
    width: ms(96),
    height: ms(96),
    borderRadius: ms(48),
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: spacing['2xl'],
  },

  avatarInner: {
    width: ms(78),
    height: ms(78),
    borderRadius: ms(39),
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  greeting: {
    textAlign: 'center',
    color: colors.text,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    lineHeight: ms(34),
    letterSpacing: -0.4,
  },

  greetingSub: {
    marginTop: spacing.md,
    textAlign: 'center',
    color: colors.subText,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },

  historyHeader: {
    marginTop: spacing['4xl'],
  },

  sectionLabel: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  seeAll: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },

  chip: {
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#EEF2FF',
    borderRadius: radii.xl,
    paddingVertical: spacing.lg,
    paddingLeft: spacing.xl,
    paddingRight: spacing.lg,
  },

  chipText: {
    flexShrink: 1,
    color: colors.primaryDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    lineHeight: ms(18),
  },

  chipIcon: {
    width: ms(22),
    height: ms(22),
    borderRadius: ms(11),
    alignItems: 'center',
    justifyContent: 'center',
  },

  historyLoading: {
    minHeight: ms(88),
    alignItems: 'center',
    justifyContent: 'center',
  },

  historyEmpty: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['3xl'],
    borderWidth: 1,
    borderColor: colors.border,
  },

  historyEmptyText: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },

  historyEmptySub: {
    marginTop: spacing.xs,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  historyList: {
    gap: spacing.lg,
  },

  historyCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },

  historyTitle: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: ms(20),
  },

  historyDate: {
    marginTop: spacing.sm,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
});
