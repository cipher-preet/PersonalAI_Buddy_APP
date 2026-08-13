import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { useAppSelector } from '../../../store/hooks';
import { useGetSpaceStatsQuery } from '../../../store/api/home';
import { MySpcaes } from '../../../../styles/icons';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../theme';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const EXPAND_ANIM = {
  duration: 220,
  create: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
  },
  delete: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
};

type Props = {
  spaceId: string;
  title: string;
  description: string;
  badgeText?: string;
  time?: string;
  isListening?: boolean;
  isDeleting?: boolean;
  onDelete?: () => void;
  onOpenNotes?: () => void;
  onOpenTasks?: () => void;
  onAskBuddy?: () => void;
};

const CalendarIcon = memo(() => (
  <Svg width={ms(12)} height={ms(12)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 3v3M17 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
      stroke={colors.textSecondary}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
));

const MoreIcon = memo(() => (
  <Svg width={ms(15)} height={ms(15)} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="5" r="1.6" fill={colors.text} />
    <Circle cx="12" cy="12" r="1.6" fill={colors.text} />
    <Circle cx="12" cy="19" r="1.6" fill={colors.text} />
  </Svg>
));

const TrashIcon = memo(() => (
  <Svg width={ms(15)} height={ms(15)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
      stroke={colors.error}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
));

const ChevronIcon = memo(() => (
  <Svg width={ms(14)} height={ms(14)} viewBox="0 0 24 24" fill="none">
    <Path
      d="m6 10 6 6 6-6"
      stroke={colors.primary}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
));

const NotesMiniIcon = memo(() => (
  <Svg width={ms(14)} height={ms(14)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
      stroke={colors.primary}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
    <Path
      d="M14 3v5h5M8.5 13h7M8.5 17h4"
      stroke={colors.primary}
      strokeWidth={1.6}
      strokeLinecap="round"
    />
  </Svg>
));

const TasksMiniIcon = memo(() => (
  <Svg width={ms(14)} height={ms(14)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 6h10M9 12h10M9 18h10"
      stroke={colors.primary}
      strokeWidth={1.6}
      strokeLinecap="round"
    />
    <Path
      d="m4 6 1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"
      stroke={colors.primary}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
));

const BuddyMiniIcon = memo(() => (
  <Svg width={ms(14)} height={ms(14)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"
      stroke={colors.primary}
      strokeWidth={1.6}
      strokeLinecap="round"
    />
    <Circle cx="12" cy="12" r="3" stroke={colors.primary} strokeWidth={1.6} />
  </Svg>
));

const SPACE_ICON_COLORS = [
  { bg: '#EDE9FE', icon: '#6D28D9' },
  { bg: '#DBEAFE', icon: '#1D4ED8' },
  { bg: '#DCFCE7', icon: '#15803D' },
  { bg: '#FFEDD5', icon: '#C2410C' },
  { bg: '#FCE7F3', icon: '#BE185D' },
  { bg: '#E0F2FE', icon: '#0369A1' },
  { bg: '#FEF3C7', icon: '#B45309' },
  { bg: '#E0E7FF', icon: '#4338CA' },
];

const getSpaceIconColor = (spaceId: string) => {
  const hash = spaceId.split('').reduce((total, char) => {
    return total + char.charCodeAt(0);
  }, 0);

  return SPACE_ICON_COLORS[hash % SPACE_ICON_COLORS.length];
};

const runExpandAnimation = () => {
  LayoutAnimation.configureNext(EXPAND_ANIM);
};

const SpaceCard = ({
  spaceId,
  title,
  description,
  badgeText,
  time,
  isListening = false,
  isDeleting = false,
  onDelete,
  onOpenNotes,
  onOpenTasks,
  onAskBuddy,
}: Props) => {
  const userId = useAppSelector(state => state.auth.userId) ?? '';
  const [menuVisible, setMenuVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const wasFetchingRef = useRef(false);
  const chevronProgress = useSharedValue(0);

  const {
    data: statsData,
    isFetching: isFetchingStats,
    isError: isStatsError,
    refetch: refetchStats,
  } = useGetSpaceStatsQuery(
    { userId, spaceId },
    { skip: !userId || !spaceId || !expanded },
  );

  const stats = statsData?.data;
  const notesCount = stats?.notesCount ?? 0;
  const tasksCount = stats?.tasksCount ?? 0;
  const doneTasks = stats?.doneTasksCount ?? 0;
  const completion = Math.min(
    Math.max(stats?.completionPercentage ?? 0, 0),
    100,
  );
  const statusLabel = badgeText || (isListening ? 'Listening' : undefined);
  const hasStats = Boolean(stats) && !isStatsError;
  const iconColor = getSpaceIconColor(spaceId);

  useEffect(() => {
    chevronProgress.value = withTiming(expanded ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
  }, [chevronProgress, expanded]);

  // Smooth height change when loading finishes (avoid a hard content snap).
  useEffect(() => {
    if (!expanded) {
      wasFetchingRef.current = false;
      return;
    }

    if (wasFetchingRef.current && !isFetchingStats) {
      runExpandAnimation();
    }

    wasFetchingRef.current = isFetchingStats;
  }, [expanded, isFetchingStats]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronProgress.value * 180}deg` }],
  }));

  const handleToggleExpand = useCallback(() => {
    runExpandAnimation();
    setExpanded(prev => !prev);
  }, []);

  return (
    <View style={[styles.shadowWrap, isDeleting && styles.cardDeleting]}>
      <View style={styles.card}>
      <View style={styles.topRow}>
        {time ? (
          <View style={styles.dateRow}>
            <CalendarIcon />
            <Text style={styles.dateText} numberOfLines={1}>
              {time}
            </Text>
          </View>
        ) : (
          <View />
        )}

        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.moreButton}
          onPress={() => setMenuVisible(true)}
          disabled={isDeleting}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Space options"
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={colors.error} />
          ) : (
            <MoreIcon />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.bodyRow}>
        <View
          style={[styles.spaceIconWrap, { backgroundColor: iconColor.bg }]}
        >
          <MySpcaes width={ms(16)} height={ms(16)} color={iconColor.icon} />
        </View>

        <View style={styles.bodyCopy}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {description ? (
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          ) : null}
        </View>
      </View>

      {statusLabel ? (
        <View style={styles.tagRow}>
          <View
            style={[
              styles.statusTag,
              isListening && styles.statusTagListening,
            ]}
          >
            <Text
              style={[
                styles.statusTagText,
                isListening && styles.statusTagTextListening,
              ]}
            >
              {statusLabel}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.dashedDivider} />

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.footer}
        onPress={handleToggleExpand}
        accessibilityRole="button"
        accessibilityLabel={expanded ? 'Collapse space' : 'Expand space'}
      >
        <View style={styles.footerMeta}>
          {expanded && hasStats && !isFetchingStats ? (
            <>
              <Text style={styles.metaText}>{notesCount} notes</Text>
              <View style={styles.metaDot} />
              <Text style={styles.metaText}>{tasksCount} tasks</Text>
            </>
          ) : (
            <Text style={styles.metaText}>
              {expanded ? 'Loading overview...' : 'View notes & tasks'}
            </Text>
          )}
        </View>

        <View
          style={[styles.expandButton, expanded && styles.expandButtonActive]}
        >
          <Animated.View style={chevronStyle}>
            <ChevronIcon />
          </Animated.View>
        </View>
      </TouchableOpacity>

      {expanded ? (
        <View style={styles.expandPanel}>
          {isFetchingStats && !hasStats ? (
            <View style={styles.expandState}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.expandStateText}>Loading space details...</Text>
            </View>
          ) : isStatsError && !hasStats ? (
            <View style={styles.expandState}>
              <Text style={styles.expandErrorText}>Unable to load details.</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.retryButton}
                onPress={() => refetchStats()}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={styles.statsRow}>
                <View style={styles.statChip}>
                  <Text style={styles.statValue}>{notesCount}</Text>
                  <Text style={styles.statLabel}>Notes</Text>
                </View>
                <View style={styles.statChip}>
                  <Text style={styles.statValue}>{tasksCount}</Text>
                  <Text style={styles.statLabel}>Tasks</Text>
                </View>
                <View style={styles.statChip}>
                  <Text style={styles.statValue}>{completion}%</Text>
                  <Text style={styles.statLabel}>Done</Text>
                </View>
              </View>

              <Text style={styles.progressHint}>
                {doneTasks} of {tasksCount} tasks completed
              </Text>

              <TouchableOpacity
                activeOpacity={0.82}
                style={styles.actionRow}
                onPress={onOpenNotes}
              >
                <View style={styles.actionIcon}>
                  <NotesMiniIcon />
                </View>
                <View style={styles.actionCopy}>
                  <Text style={styles.actionTitle}>Open Notes</Text>
                  <Text style={styles.actionSubtitle}>
                    {notesCount} note{notesCount === 1 ? '' : 's'}
                  </Text>
                </View>
                <Text style={styles.actionChevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.82}
                style={styles.actionRow}
                onPress={onOpenTasks}
              >
                <View style={styles.actionIcon}>
                  <TasksMiniIcon />
                </View>
                <View style={styles.actionCopy}>
                  <Text style={styles.actionTitle}>Open Tasks</Text>
                  <Text style={styles.actionSubtitle}>
                    {tasksCount} task{tasksCount === 1 ? '' : 's'}
                  </Text>
                </View>
                <Text style={styles.actionChevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.82}
                style={[styles.actionRow, styles.actionRowLast]}
                onPress={onAskBuddy}
              >
                <View style={styles.actionIcon}>
                  <BuddyMiniIcon />
                </View>
                <View style={styles.actionCopy}>
                  <Text style={styles.actionTitle}>Ask Buddy</Text>
                  <Text style={styles.actionSubtitle}>
                    Chat about this space
                  </Text>
                </View>
                <Text style={styles.actionChevron}>›</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : null}
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.menuBackdrop}
          onPress={() => setMenuVisible(false)}
        >
          <Pressable style={styles.menuCard}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                onDelete?.();
              }}
            >
              <TrashIcon />
              <Text style={styles.menuItemText}>Delete space</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default memo(SpaceCard);

const styles = StyleSheet.create({
  shadowWrap: {
    width: '100%',
    marginTop: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },

  card: {
    borderRadius: radii.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    overflow: 'hidden',
  },

  cardDeleting: {
    opacity: 0.7,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    maxWidth: ms(140),
  },

  dateText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },

  moreButton: {
    width: ms(26),
    height: ms(26),
    borderRadius: ms(13),
    alignItems: 'center',
    justifyContent: 'center',
  },

  bodyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },

  spaceIconWrap: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
  },

  bodyCopy: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    color: colors.black,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.2,
    lineHeight: ms(21),
  },

  description: {
    marginTop: spacing.xxs,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(17),
  },

  tagRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },

  statusTag: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
  },

  statusTagListening: {
    borderColor: '#A7F3D0',
    backgroundColor: '#ECFDF5',
  },

  statusTagText: {
    color: colors.primaryDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },

  statusTagTextListening: {
    color: colors.success,
  },

  dashedDivider: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    borderStyle: 'dashed',
    borderBottomWidth: 1,
    borderColor: colors.border,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },

  footerMeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  metaText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  metaDot: {
    width: ms(3),
    height: ms(3),
    borderRadius: ms(2),
    backgroundColor: colors.textSecondary,
  },

  expandButton: {
    width: ms(28),
    height: ms(28),
    borderRadius: ms(14),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },

  expandButtonActive: {
    backgroundColor: colors.primaryLight,
  },

  expandPanel: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },

  expandState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },

  expandStateText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  expandErrorText: {
    color: colors.errorDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  retryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryLight,
  },

  retryText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },

  statChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
  },

  statValue: {
    color: colors.black,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },

  statLabel: {
    marginTop: 1,
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },

  progressHint: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },

  actionRowLast: {
    borderBottomWidth: 0,
  },

  actionIcon: {
    width: ms(30),
    height: ms(30),
    borderRadius: ms(10),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  actionCopy: {
    flex: 1,
    minWidth: 0,
  },

  actionTitle: {
    color: colors.black,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },

  actionSubtitle: {
    marginTop: 1,
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },

  actionChevron: {
    color: colors.textSecondary,
    fontSize: fontSize.xl,
    lineHeight: ms(20),
  },

  menuBackdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['4xl'],
  },

  menuCard: {
    width: '100%',
    maxWidth: ms(260),
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    overflow: 'hidden',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.xl,
  },

  menuItemText: {
    color: colors.error,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
});
