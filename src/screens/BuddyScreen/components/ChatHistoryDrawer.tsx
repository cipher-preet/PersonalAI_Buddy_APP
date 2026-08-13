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

import { HistoryIcon } from '../../../../styles/icons';
import type { ChatSession } from '../types';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  screenWidth,
  spacing,
} from '../../../theme';

const DRAWER_WIDTH = Math.min(screenWidth * 0.86, ms(340));
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

const CloseIcon = ({ color = colors.text }: { color?: string }) => (
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

const PlusIcon = () => (
  <Svg width={ms(14)} height={ms(14)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5v14M5 12h14"
      stroke={colors.white}
      strokeWidth={2.2}
      strokeLinecap="round"
    />
  </Svg>
);

const formatSessionDate = (date: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sessionDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const diffDays = Math.round(
    (today.getTime() - sessionDay.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) {
    return 'Today';
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const formatSessionTime = (date: Date): string =>
  date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

const groupSessions = (sessions: ChatSession[]) => {
  const groups: { label: string; data: ChatSession[] }[] = [];
  const map = new Map<string, ChatSession[]>();

  sessions.forEach(session => {
    const label = formatSessionDate(session.updatedAt);
    const existing = map.get(label);
    if (existing) {
      existing.push(session);
    } else {
      map.set(label, [session]);
    }
  });

  map.forEach((data, label) => {
    groups.push({ label, data });
  });

  return groups;
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
    opacity: progress.value * 0.4,
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
  const groupedSessions = groupSessions(visibleSessions);

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
              paddingTop: insets.top + spacing.xl,
              paddingBottom: Math.max(insets.bottom, spacing['2xl']),
            },
          ]}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.headerEyebrow}>Buddy</Text>
              <Text style={styles.headerTitle}>History</Text>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.75}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <CloseIcon />
            </TouchableOpacity>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>
              {visibleSessions.length} conversation
              {visibleSessions.length === 1 ? '' : 's'}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={onNewChat}
            style={[styles.newChatButton, creating && styles.newChatDisabled]}
            disabled={creating}
          >
            {creating ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <PlusIcon />
            )}
            <Text style={styles.newChatText}>
              {creating ? 'Starting...' : 'New Chat'}
            </Text>
          </TouchableOpacity>

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            bounces
          >
            {loading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Loading conversations...</Text>
              </View>
            ) : null}

            {!loading && error ? (
              <View style={styles.errorState}>
                <Text style={styles.errorTitle}>Couldn't load history</Text>
                <Text style={styles.errorText} numberOfLines={3}>
                  {error}
                </Text>
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

                <View style={styles.sectionCards}>
                  {group.data.map(session => {
                    const isActive = session.id === activeSessionId;

                    return (
                      <TouchableOpacity
                        key={session.id}
                        activeOpacity={0.86}
                        onPress={() => onSelectSession(session.id)}
                        style={[
                          styles.sessionCard,
                          isActive && styles.sessionCardActive,
                        ]}
                      >
                        <View style={styles.sessionTop}>
                          <Text
                            style={[
                              styles.sessionTitle,
                              isActive && styles.sessionTitleActive,
                            ]}
                            numberOfLines={1}
                          >
                            {session.title}
                          </Text>
                          {isActive ? (
                            <View style={styles.activePill}>
                              <Text style={styles.activePillText}>Active</Text>
                            </View>
                          ) : null}
                        </View>

                        <Text style={styles.sessionPreview} numberOfLines={2}>
                          {session.preview}
                        </Text>

                        <View style={styles.sessionMeta}>
                          <Text style={styles.sessionMetaText}>
                            {formatSessionTime(session.updatedAt)}
                          </Text>
                          <View style={styles.metaDot} />
                          <Text style={styles.sessionMetaText}>
                            {session.messageCount} msg
                            {session.messageCount === 1 ? '' : 's'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}

            {!loading && hasMore && onLoadMore ? (
              <View style={styles.loadMoreWrap}>
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  activeOpacity={0.82}
                  onPress={onLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text style={styles.loadMoreText}>Load more</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : null}

            {!loading && !error && visibleSessions.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <HistoryIcon
                    width={ms(22)}
                    height={ms(22)}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.emptyTitle}>No conversations yet</Text>
                <Text style={styles.emptySubtitle}>
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
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0F172A',
  },

  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    backgroundColor: colors.background,
    borderTopRightRadius: radii['2xl'],
    borderBottomRightRadius: radii['2xl'],
    overflow: 'hidden',
    borderRightWidth: 1,
    borderColor: colors.border,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    marginBottom: spacing.md,
  },

  headerEyebrow: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: spacing.xxs,
  },

  headerTitle: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    color: colors.text,
    letterSpacing: -0.4,
  },

  closeButton: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(17),
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  summaryRow: {
    paddingHorizontal: spacing['2xl'],
    marginBottom: spacing.xl,
  },

  summaryText: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  newChatButton: {
    marginHorizontal: spacing['2xl'],
    marginBottom: spacing['2xl'],
    minHeight: ms(44),
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing['2xl'],
  },

  newChatDisabled: {
    opacity: 0.75,
  },

  newChatText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing.xl,
  },

  section: {
    marginBottom: spacing['2xl'],
  },

  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.subText,
    marginBottom: spacing.md,
  },

  sectionCards: {
    gap: spacing.md,
  },

  sessionCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },

  sessionCardActive: {
    backgroundColor: colors.primarySoft,
    borderColor: '#C4B5FD',
  },

  sessionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },

  sessionTitle: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },

  sessionTitleActive: {
    color: colors.primaryDark,
  },

  activePill: {
    backgroundColor: colors.primaryLight,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },

  activePillText: {
    color: colors.primaryDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },

  sessionPreview: {
    fontSize: fontSize.sm,
    lineHeight: ms(18),
    fontWeight: fontWeight.medium,
    color: colors.subText,
    marginBottom: spacing.md,
  },

  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sessionMetaText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.muted,
  },

  metaDot: {
    width: ms(3),
    height: ms(3),
    borderRadius: ms(2),
    backgroundColor: colors.muted,
    marginHorizontal: spacing.sm,
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: spacing['6xl'],
    paddingHorizontal: spacing.xl,
  },

  emptyIconWrap: {
    width: ms(56),
    height: ms(56),
    borderRadius: ms(28),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },

  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },

  emptySubtitle: {
    fontSize: fontSize.sm,
    lineHeight: ms(20),
    fontWeight: fontWeight.medium,
    color: colors.subText,
    textAlign: 'center',
  },

  loadingState: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
    gap: spacing.lg,
  },

  loadingText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.subText,
  },

  errorState: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },

  errorTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: '#991B1B',
    marginBottom: spacing.xs,
  },

  errorText: {
    fontSize: fontSize.sm,
    lineHeight: ms(18),
    fontWeight: fontWeight.medium,
    color: colors.errorDark,
  },

  retryButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.lg,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },

  retryButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: '#991B1B',
  },

  loadMoreWrap: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },

  loadMoreButton: {
    minHeight: ms(36),
    paddingHorizontal: spacing['3xl'],
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadMoreText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
});
