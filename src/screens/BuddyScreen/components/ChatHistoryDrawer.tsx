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
import LinearGradient from 'react-native-linear-gradient';
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

import AddIcon from '../../../../styles/icons/AddSpace';
import { HistoryIcon } from '../../../../styles/icons';
import { COLORS } from '../styles';
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

const CloseIcon = ({ color = COLORS.text }: { color?: string }) => (
  <Svg width={ms(18)} height={ms(18)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6 6 18M6 6l12 12"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChatBubbleIcon = ({ color = COLORS.primary }: { color?: string }) => (
  <Svg width={ms(16)} height={ms(16)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
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
    opacity: progress.value * 0.52,
  }));

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: -DRAWER_WIDTH + progress.value * DRAWER_WIDTH,
      },
    ],
  }));

  const handleClose = () => {
    onClose();
  };

  if (!mounted) {
    return null;
  }

  const groupedSessions = groupSessions(sessions);

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.modalRoot}>
        <AnimatedPressable
          style={[styles.backdrop, backdropStyle]}
          onPress={handleClose}
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
          <LinearGradient
            colors={[COLORS.gradientStart, COLORS.white, COLORS.white]}
            locations={[0, 0.35, 1]}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconWrap}>
                <HistoryIcon width={ms(18)} height={ms(18)} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Chat History</Text>
                <Text style={styles.headerSubtitle}>
                  {sessions.length} conversation{sessions.length === 1 ? '' : 's'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.75}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <CloseIcon />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={onNewChat}
            style={styles.newChatTouchable}
            disabled={creating}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryPurple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.newChatGradient}
            >
              <View style={styles.newChatIconWrap}>
                {creating ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <AddIcon width={ms(18)} height={ms(18)} color={colors.white} />
                )}
              </View>
              <View style={styles.newChatTextWrap}>
                <Text style={styles.newChatTitle}>New Chat</Text>
                <Text style={styles.newChatSubtitle}>
                  {creating ? 'Creating conversation...' : 'Start a fresh conversation'}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            bounces
          >
            {loading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading chats...</Text>
              </View>
            ) : null}

            {!loading && error ? (
              <View style={styles.errorState}>
                <Text style={styles.errorTitle}>Could not load chats</Text>
                <Text style={styles.errorText}>{error}</Text>
                {onRetry ? (
                  <TouchableOpacity
                    style={styles.retryButton}
                    activeOpacity={0.82}
                    onPress={onRetry}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}

            {groupedSessions.map(group => (
              <View key={group.label} style={styles.section}>
                <Text style={styles.sectionLabel}>{group.label}</Text>

                {group.data.map(session => {
                  const isActive = session.id === activeSessionId;

                  return (
                    <TouchableOpacity
                      key={session.id}
                      activeOpacity={0.82}
                      onPress={() => onSelectSession(session.id)}
                      style={[
                        styles.sessionCard,
                        isActive && styles.sessionCardActive,
                      ]}
                    >
                      <View
                        style={[
                          styles.sessionIconWrap,
                          isActive && styles.sessionIconWrapActive,
                        ]}
                      >
                        <ChatBubbleIcon
                          color={isActive ? COLORS.primary : COLORS.subText}
                        />
                      </View>

                      <View style={styles.sessionContent}>
                        <Text
                          style={[
                            styles.sessionTitle,
                            isActive && styles.sessionTitleActive,
                          ]}
                          numberOfLines={1}
                        >
                          {session.title}
                        </Text>
                        <Text style={styles.sessionPreview} numberOfLines={2}>
                          {session.preview}
                        </Text>
                        <View style={styles.sessionMeta}>
                          <Text style={styles.sessionMetaText}>
                            {formatSessionTime(session.updatedAt)}
                          </Text>
                          <View style={styles.metaDot} />
                          <Text style={styles.sessionMetaText}>
                            {session.messageCount} message
                            {session.messageCount === 1 ? '' : 's'}
                          </Text>
                        </View>
                      </View>

                      {isActive ? <View style={styles.activeIndicator} /> : null}
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
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Text style={styles.loadMoreText}>Load more</Text>
                )}
              </TouchableOpacity>
            ) : null}

            {!loading && sessions.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <HistoryIcon width={ms(28)} height={ms(28)} color={COLORS.muted} />
                </View>
                <Text style={styles.emptyTitle}>No conversations yet</Text>
                <Text style={styles.emptySubtitle}>
                  Start a new chat and your history will appear here.
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
    backgroundColor: colors.text,
  },

  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    borderTopRightRadius: radii['3xl'],
    borderBottomRightRadius: radii['3xl'],
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: ms(6), height: 0 },
    shadowOpacity: 0.14,
    shadowRadius: ms(24),
    elevation: 16,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.9)',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['2xl'],
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    flex: 1,
  },

  headerIconWrap: {
    width: ms(40),
    height: ms(40),
    borderRadius: radii.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderFocus,
  },

  headerTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extrabold,
    color: COLORS.text,
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    marginTop: spacing.xxs,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: COLORS.subText,
  },

  closeButton: {
    width: ms(36),
    height: ms(36),
    borderRadius: radii.md,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  newChatTouchable: {
    marginHorizontal: spacing['2xl'],
    marginBottom: spacing['2xl'],
    borderRadius: radii.lg,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: ms(8) },
    shadowOpacity: 0.22,
    shadowRadius: ms(16),
    elevation: 6,
  },

  newChatGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.xl,
    gap: spacing.xl,
  },

  newChatIconWrap: {
    width: ms(36),
    height: ms(36),
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  newChatTextWrap: {
    flex: 1,
  },

  newChatTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extrabold,
    color: colors.white,
    letterSpacing: -0.2,
  },

  newChatSubtitle: {
    marginTop: spacing.xxs,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: 'rgba(255, 255, 255, 0.82)',
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
    fontSize: fontSize.xs,
    fontWeight: fontWeight.extrabold,
    color: COLORS.muted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: spacing.lg,
    paddingLeft: spacing.xxs,
  },

  sessionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
    overflow: 'hidden',
  },

  sessionCardActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: '#C7D2FE',
  },

  sessionIconWrap: {
    width: ms(34),
    height: ms(34),
    borderRadius: radii.sm,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  sessionIconWrapActive: {
    backgroundColor: colors.white,
    borderColor: '#C7D2FE',
  },

  sessionContent: {
    flex: 1,
    paddingRight: spacing.sm,
  },

  sessionTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: COLORS.text,
    marginBottom: spacing.xxs,
  },

  sessionTitleActive: {
    color: COLORS.primary,
  },

  sessionPreview: {
    fontSize: fontSize.sm,
    lineHeight: ms(17),
    fontWeight: fontWeight.medium,
    color: COLORS.subText,
    marginBottom: spacing.sm,
  },

  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sessionMetaText: {
    fontSize: ms(10),
    fontWeight: fontWeight.bold,
    color: COLORS.muted,
  },

  metaDot: {
    width: ms(3),
    height: ms(3),
    borderRadius: ms(2),
    backgroundColor: COLORS.muted,
    marginHorizontal: spacing.sm,
  },

  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: spacing.xl,
    bottom: spacing.xl,
    width: ms(3),
    borderTopRightRadius: ms(3),
    borderBottomRightRadius: ms(3),
    backgroundColor: COLORS.primary,
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: spacing['7xl'],
    paddingHorizontal: spacing['3xl'],
  },

  emptyIconWrap: {
    width: ms(64),
    height: ms(64),
    borderRadius: radii.xl,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },

  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extrabold,
    color: COLORS.text,
    marginBottom: spacing.sm,
  },

  emptySubtitle: {
    fontSize: fontSize.md,
    lineHeight: ms(20),
    fontWeight: fontWeight.medium,
    color: COLORS.subText,
    textAlign: 'center',
  },

  loadingState: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
    gap: spacing.lg,
  },

  loadingText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: COLORS.subText,
  },

  errorState: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: ms(14),
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },

  errorTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.extrabold,
    color: '#991B1B',
    marginBottom: spacing.xs,
  },

  errorText: {
    fontSize: fontSize.sm,
    lineHeight: ms(17),
    fontWeight: fontWeight.semibold,
    color: colors.errorDark,
  },

  retryButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.lg,
    borderRadius: radii.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },

  retryButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold,
    color: '#991B1B',
  },

  loadMoreButton: {
    height: ms(42),
    borderRadius: ms(13),
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },

  loadMoreText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.extrabold,
    color: COLORS.primary,
  },
});
