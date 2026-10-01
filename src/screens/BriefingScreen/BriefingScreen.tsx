import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import UpgradePlanPromptModal from '../../components/UpgradePlanPromptModal';
import type { MainTabParamList } from '../../navigation/types';
import {
  useForceGenerateDailyBriefingMutation,
  useGetDailyBriefingQuery,
} from '../../store/api/home';
import { useGetPlanStatusQuery } from '../../store/api/payments';
import { useAppSelector } from '../../store/hooks';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  radii,
  spacing,
} from '../../theme';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import {
  formatDateKey,
  greetingForHour,
  isPreparingStatus,
  toLocalDateKey,
} from './briefingUtils';
import { toBriefingView } from './briefingMapper';
import type { BriefingTask } from './briefingTypes';
import BriefingEmptyState, {
  type BriefingEmptyVariant,
} from './components/BriefingEmptyState';
import {
  Segment,
  StatTile,
  cardStyle,
  type SegmentOption,
} from './components/BriefingParts';
import TodayView from './components/TodayView';
import YesterdayView from './components/YesterdayView';
import {
  BackIcon,
  BellIcon,
  CalendarIcon,
  ChatIcon,
  SparkleIcon,
  TaskIcon,
} from './components/briefingIcons';

type BriefingTab = 'today' | 'yesterday';

const TAB_OPTIONS: SegmentOption<BriefingTab>[] = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
];

const minutesNow = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

const errorStatus = (error: unknown) =>
  typeof error === 'object' && error !== null && 'status' in error
    ? (error as { status: unknown }).status
    : undefined;

const BriefingScreen = () => {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { tabBarClearance, screenPadding, contentMaxWidth, isTablet } =
    useResponsiveLayout();
  const userId = useAppSelector(state => state.auth.userId);
  const userName = useAppSelector(state => state.auth.name);
  const [tab, setTab] = useState<BriefingTab>('today');
  const [tasks, setTasks] = useState<BriefingTask[]>([]);
  const [nowMinutes, setNowMinutes] = useState(minutesNow);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const { data: planStatus, isSuccess: isPlanLoaded } = useGetPlanStatusQuery(
    { userId: userId ?? '' },
    { skip: !userId },
  );
  const isFreePlan = isPlanLoaded && planStatus?.plan?.code === 'free';

  const {
    data: briefingResponse,
    error: briefingError,
    isLoading,
    isFetching,
    refetch,
  } = useGetDailyBriefingQuery(undefined, { skip: !userId || isFreePlan });
  const [forceGenerate, { isLoading: isForceGenerating }] =
    useForceGenerateDailyBriefingMutation();

  const briefing = briefingResponse?.data;
  const view = useMemo(
    () => (briefing?.status === 'READY' ? toBriefingView(briefing) : null),
    [briefing],
  );

  useEffect(() => {
    setTasks(view?.tasks ?? []);
  }, [view]);

  useFocusEffect(
    useCallback(() => {
      setNowMinutes(minutesNow());
      setShowUpgradePrompt(isFreePlan);
    }, [isFreePlan]),
  );

  useEffect(() => {
    const id = setInterval(() => setNowMinutes(minutesNow()), 60_000);
    return () => clearInterval(id);
  }, []);

  const agenda = view?.agenda ?? [];
  const meetingCount = agenda.filter(item => item.kind === 'meeting').length;
  const reminderCount = agenda.filter(item => item.kind === 'reminder').length;
  const pendingCount = tasks.filter(task => !task.done).length;
  const isPlanToday = view?.planDateKey === toLocalDateKey(new Date());

  const firstName = userName?.trim().split(/\s+/)[0];
  const greeting = `${greetingForHour(Math.floor(nowMinutes / 60))}${
    firstName ? `, ${firstName}` : ''
  }`;
  const dateLabel = formatDateKey(view?.planDateKey);

  const emptyVariant: BriefingEmptyVariant | null = (() => {
    if (!userId) {
      return 'signedOut';
    }
    if (isLoading || isFreePlan) {
      return 'loading';
    }
    if (briefingError) {
      return errorStatus(briefingError) === 404 ? 'missing' : 'error';
    }
    if (!briefing) {
      return 'missing';
    }
    if (isPreparingStatus(briefing.status)) {
      return 'preparing';
    }
    if (briefing.status === 'SKIPPED') {
      return 'skipped';
    }
    if (briefing.status !== 'READY') {
      return 'failed';
    }
    return null;
  })();
  const canForceGenerate =
    emptyVariant === 'missing' ||
    emptyVariant === 'skipped' ||
    emptyVariant === 'failed';

  const openChat = useCallback(() => {
    navigation.navigate({ name: 'AI', params: {}, merge: false });
  }, [navigation]);

  const handleForceGenerate = useCallback(async () => {
    try {
      await forceGenerate({ period: 'yesterday' }).unwrap();
    } catch {
      refetch();
    }
  }, [forceGenerate, refetch]);

  const toggleTask = useCallback((id: string) => {
    setTasks(current =>
      current.map(task =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    );
  }, []);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={[styles.header, { paddingHorizontal: screenPadding }]}>
          <TouchableOpacity
            activeOpacity={0.78}
            style={styles.iconButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Daily Briefing
          </Text>
          <TouchableOpacity
            activeOpacity={0.78}
            style={styles.iconButton}
            onPress={openChat}
            accessibilityRole="button"
            accessibilityLabel="Ask Buddy"
          >
            <ChatIcon color={colors.text} size={18} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            userId && !isFreePlan ? (
              <RefreshControl
                refreshing={isFetching && !isLoading}
                onRefresh={refetch}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            ) : undefined
          }
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: tabBarClearance,
              paddingHorizontal: screenPadding,
              maxWidth: isTablet ? contentMaxWidth : undefined,
              width: '100%',
              alignSelf: 'center',
            },
          ]}
        >
          <View>
            <Text style={styles.date}>{dateLabel}</Text>
            <Text style={styles.greeting}>{greeting}</Text>
          </View>

          {emptyVariant || !view ? (
            <BriefingEmptyState
              variant={emptyVariant ?? 'loading'}
              onRetry={refetch}
              onStartChat={openChat}
              onForceGenerate={
                canForceGenerate ? handleForceGenerate : undefined
              }
              forceGenerating={isForceGenerating}
            />
          ) : (
            <>
              <View style={styles.summaryCard}>
                <View style={styles.summaryTop}>
                  <View style={styles.summaryIcon}>
                    <SparkleIcon color={colors.white} size={15} />
                  </View>
                  <Text style={styles.summaryLabel}>Buddy’s summary</Text>
                </View>
                {view.headline && view.headline !== view.summary ? (
                  <Text style={styles.summaryHeadline}>{view.headline}</Text>
                ) : null}
                <Text style={styles.summaryText}>{view.summary}</Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.summaryButton}
                  onPress={openChat}
                >
                  <Text style={styles.summaryButtonText}>Plan my day</Text>
                  <Text style={styles.summaryChevron}>›</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.statsRow}>
                <StatTile
                  icon={<CalendarIcon color={colors.white} size={16} />}
                  iconBg={colors.primary}
                  value={meetingCount}
                  label="Meetings"
                  onPress={() => navigation.navigate('Calendar')}
                />
                <StatTile
                  icon={<TaskIcon color={colors.white} size={16} />}
                  iconBg={colors.successBright}
                  value={pendingCount}
                  label="Tasks left"
                  onPress={() => navigation.navigate('Tasks')}
                />
                <StatTile
                  icon={<BellIcon color={colors.white} size={16} />}
                  iconBg={colors.primaryPurple}
                  value={reminderCount}
                  label="Reminders"
                  onPress={() => navigation.navigate('Reminders')}
                />
              </View>

              <Segment options={TAB_OPTIONS} value={tab} onChange={setTab} />

              {tab === 'today' ? (
                <TodayView
                  focus={view.focus}
                  agenda={agenda}
                  tasks={tasks}
                  followUps={view.followUps}
                  risks={view.risks}
                  nowMinutes={isPlanToday ? nowMinutes : null}
                  onToggleTask={toggleTask}
                  onOpenCalendar={() => navigation.navigate('Calendar')}
                  onOpenTasks={() => navigation.navigate('Tasks')}
                />
              ) : (
                <YesterdayView recap={view.yesterday} />
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      <UpgradePlanPromptModal
        visible={showUpgradePrompt}
        title="Daily Briefing is a Pro feature"
        message="Upgrade to Pro to unlock personalized daily briefings from your conversations, tasks, notes, and meetings."
        onClose={() => {
          setShowUpgradePrompt(false);
          navigation.goBack();
        }}
        onUpgrade={() => {
          setShowUpgradePrompt(false);
          navigation.navigate('Plans');
        }}
      />
    </View>
  );
};

export default BriefingScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    paddingTop: layout.screenTop,
  },
  header: {
    minHeight: ms(44),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  iconButton: {
    width: layout.iconButtonSm,
    height: layout.iconButtonSm,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  headerTitle: {
    flex: 1,
    color: colors.black,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extrabold,
    lineHeight: ms(28),
    includeFontPadding: false,
  },
  content: {
    paddingTop: spacing.md,
    gap: spacing['2xl'],
  },
  date: {
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  greeting: {
    marginTop: spacing.xs,
    color: colors.black,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.3,
  },
  summaryCard: {
    ...cardStyle,
    padding: spacing['2xl'],
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryIcon: {
    width: ms(30),
    height: ms(30),
    borderRadius: ms(15),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  summaryLabel: {
    color: colors.black,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  summaryHeadline: {
    marginTop: spacing.xl,
    color: colors.black,
    fontSize: fontSize.base,
    fontWeight: fontWeight.extrabold,
    lineHeight: ms(21),
  },
  summaryText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(20),
  },
  summaryButton: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderStyle: 'dashed',
  },
  summaryButtonText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  summaryChevron: {
    color: colors.primary,
    fontSize: fontSize.xl,
    lineHeight: ms(20),
    fontWeight: fontWeight.bold,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
