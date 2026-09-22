import React, { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import type { ChatSession } from '../types';
import { CHAT } from '../styles';
import {
  fontSize,
  fontWeight,
  ms,
  radii,
  screenWidth,
  spacing,
} from '../../../theme';

const DRAWER_WIDTH = Math.min(screenWidth * 0.86, ms(320));
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  visible: boolean;
  sessions: ChatSession[];
  activeSessionId: string;
  loading?: boolean;
  loadingMore?: boolean;
  creating?: boolean;
  error?: string | null;
  hasMore?: boolean;
  onClose: () => void;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onRetry?: () => void;
  onLoadMore?: () => void;
};

const CloseIcon = ({ color = CHAT.text }: { color?: string }) => (
  <Svg width={ms(16)} height={ms(16)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6 6 18M6 6l12 12"
      stroke={color}
      strokeWidth={2.1}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PlusIcon = ({ color = CHAT.text }: { color?: string }) => (
  <Svg width={ms(14)} height={ms(14)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5v14M5 12h14"
      stroke={color}
      strokeWidth={2.1}
      strokeLinecap="round"
    />
  </Svg>
);

const formatHistoryMeta = (date: Date) => {
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const diffMinutes = Math.floor(diffMs / 60000);
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / 86400000,
  );

  if (diffMinutes < 1) {
    return 'Just now';
  }
  if (diffDays === 0 && diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const groupChatSessions = (sessions: ChatSession[]) => {
  const groups: Record<'today' | 'yesterday' | 'week' | 'older', ChatSession[]> =
    {
      today: [],
      yesterday: [],
      week: [],
      older: [],
    };

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  sessions.forEach(session => {
    const startOfDate = new Date(
      session.updatedAt.getFullYear(),
      session.updatedAt.getMonth(),
      session.updatedAt.getDate(),
    );
    const diffDays = Math.round(
      (startOfToday.getTime() - startOfDate.getTime()) / 86400000,
    );

    if (diffDays <= 0) {
      groups.today.push(session);
    } else if (diffDays === 1) {
      groups.yesterday.push(session);
    } else if (diffDays < 7) {
      groups.week.push(session);
    } else {
      groups.older.push(session);
    }
  });

  return [
    { label: 'Today', sessions: groups.today },
    { label: 'Yesterday', sessions: groups.yesterday },
    { label: 'Past week', sessions: groups.week },
    { label: 'Older', sessions: groups.older },
  ].filter(group => group.sessions.length > 0);
};

const ChatHistoryDrawer = ({
  visible,
  sessions,
  activeSessionId,
  loading = false,
  loadingMore = false,
  creating = false,
  error,
  hasMore = false,
  onClose,
  onSelectSession,
  onNewChat,
  onRetry,
  onLoadMore,
}: Props) => {
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);
  const [mounted, setMounted] = React.useState(visible);

  const finishClose = useCallback(() => {
    setMounted(false);
  }, []);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withSpring(1, {
        damping: 22,
        stiffness: 240,
        mass: 0.85,
      });
      return;
    }

    progress.value = withTiming(
      0,
      {
        duration: 260,
        easing: Easing.out(Easing.cubic),
      },
      finished => {
        if (finished) {
          runOnJS(finishClose)();
        }
      },
    );
  }, [visible, progress, finishClose]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.28,
  }));

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: -DRAWER_WIDTH + progress.value * DRAWER_WIDTH,
      },
    ],
  }));

  if (!mounted) {
    return null;
  }

  const visibleSessions = sessions.filter(
    session => !session.id.startsWith('pending-'),
  );
  const groupedSessions = groupChatSessions(visibleSessions);

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <AnimatedPressable
          style={[styles.backdrop, backdropStyle]}
          onPress={onClose}
        />

        <Animated.View
          style={[
            styles.drawer,
            drawerStyle,
            {
              paddingTop: insets.top + spacing.lg,
              paddingBottom: Math.max(insets.bottom, spacing.lg),
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Chat history</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.newButton}
                onPress={onNewChat}
                activeOpacity={0.8}
                disabled={creating}
                accessibilityRole="button"
                accessibilityLabel="New chat"
              >
                {creating ? (
                  <ActivityIndicator size="small" color={CHAT.primary} />
                ) : (
                  <>
                    <PlusIcon color={CHAT.text} />
                    <Text style={styles.newButtonText}>New</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="Close history"
              >
                <CloseIcon />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {loading ? (
              <View style={styles.stateBlock}>
                <ActivityIndicator size="small" color={CHAT.primary} />
                <Text style={styles.stateText}>Loading conversations…</Text>
              </View>
            ) : null}

            {!loading && error ? (
              <View style={styles.stateBlock}>
                <Text style={styles.errorText}>{error}</Text>
                {onRetry ? (
                  <TouchableOpacity
                    style={styles.retryButton}
                    activeOpacity={0.82}
                    onPress={onRetry}
                  >
                    <Text style={styles.retryButtonText}>Try again</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}

            {groupedSessions.map(group => (
              <View key={group.label} style={styles.section}>
                <Text style={styles.sectionLabel}>{group.label}</Text>
                {group.sessions.map(session => {
                  const isActive = session.id === activeSessionId;
                  return (
                    <TouchableOpacity
                      key={session.id}
                      activeOpacity={0.82}
                      onPress={() => onSelectSession(session.id)}
                      style={[
                        styles.historyItem,
                        isActive && styles.historyItemActive,
                      ]}
                    >
                      <Text style={styles.historyTitle} numberOfLines={1}>
                        {session.title}
                      </Text>
                      <Text style={styles.historyMeta}>
                        {formatHistoryMeta(session.updatedAt)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            {!loading && hasMore && onLoadMore ? (
              <TouchableOpacity
                style={styles.loadMoreButton}
                activeOpacity={0.82}
                onPress={onLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <ActivityIndicator size="small" color={CHAT.primary} />
                ) : (
                  <Text style={styles.loadMoreText}>Load more</Text>
                )}
              </TouchableOpacity>
            ) : null}

            {!loading && !error && visibleSessions.length === 0 ? (
              <View style={styles.stateBlock}>
                <Text style={styles.stateText}>No conversations yet</Text>
                <Text style={styles.stateHint}>
                  Start a new chat and it will show up here.
                </Text>
              </View>
            ) : null}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default ChatHistoryDrawer;

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
  },

  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    backgroundColor: CHAT.surface,
    borderTopRightRadius: radii['2xl'],
    borderBottomRightRadius: radii['2xl'],
    borderRightWidth: 1,
    borderColor: CHAT.border,
    overflow: 'hidden',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },

  headerTitle: {
    flex: 1,
    color: CHAT.textMuted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  newButton: {
    minHeight: ms(34),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
  },

  newButtonText: {
    color: CHAT.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  closeButton: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(8),
    alignItems: 'center',
    justifyContent: 'center',
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing['2xl'],
    gap: spacing.lg,
  },

  section: {
    gap: spacing.xs,
  },

  sectionLabel: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
    color: CHAT.textMuted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  historyItem: {
    minHeight: ms(54),
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },

  historyItemActive: {
    backgroundColor: '#E8ECF2',
  },

  historyTitle: {
    color: CHAT.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },

  historyMeta: {
    color: CHAT.textMuted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  stateBlock: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['4xl'],
  },

  stateText: {
    color: CHAT.textMuted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },

  stateHint: {
    color: CHAT.textSoft,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },

  errorText: {
    color: '#B42318',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },

  retryButton: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: CHAT.surfaceMuted,
  },

  retryButtonText: {
    color: CHAT.text,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },

  loadMoreButton: {
    alignSelf: 'center',
    minHeight: ms(36),
    paddingHorizontal: spacing.xl,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CHAT.surfaceMuted,
  },

  loadMoreText: {
    color: CHAT.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
});
