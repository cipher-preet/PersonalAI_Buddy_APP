import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import UpgradePlanPromptModal from '../../components/UpgradePlanPromptModal';
import type { MainTabParamList } from '../../navigation/types';
import {
  type BriefingInsightCard,
  type BriefingListItem,
  useForceGenerateDailyBriefingMutation,
  useGetDailyBriefingQuery,
} from '../../store/api/home';
import { useGetPlanStatusQuery } from '../../store/api/payments';
import { useAppSelector } from '../../store/hooks';
import { useToast } from '../../store/context/ToastContext';
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
  capturedCount,
  deriveProgress,
  formatDateKey,
  formatDateKeyParts,
  formatGeneratedAt,
  isBriefingReady,
  isPreparingStatus,
  listOrEmpty,
  sectionItems,
  sourceSummary,
  tasksFromBriefing,
} from './briefingUtils';
import BriefingEmptyState, {
  type BriefingEmptyVariant,
} from './components/BriefingEmptyState';
import BriefingSourceBottomSheet from './components/BriefingSourceBottomSheet';

const BackIcon = () => (
  <Svg width={ms(18)} height={ms(18)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18 9 12l6-6"
      stroke={colors.text}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SparkleIcon = ({
  color = colors.primary,
  size = 18,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={ms(size)} height={ms(size)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3.8c.7 4.1 2.4 5.8 6.5 6.5-4.1.7-5.8 2.4-6.5 6.5-.7-4.1-2.4-5.8-6.5-6.5C9.6 9.6 11.3 7.9 12 3.8Z"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
  </Svg>
);

const ChatIcon = () => (
  <Svg width={ms(22)} height={ms(22)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 5.5h14a2.5 2.5 0 0 1 2.5 2.5v6.5A2.5 2.5 0 0 1 19 17H10l-5.5 3v-3.6A2.5 2.5 0 0 1 2.5 14V8A2.5 2.5 0 0 1 5 5.5Z"
      stroke={colors.primary}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
    <Path
      d="M7.5 11h.1m4.4 0h.1m4.4 0h.1"
      stroke={colors.primary}
      strokeWidth={2.4}
      strokeLinecap="round"
    />
  </Svg>
);

const CheckIcon = () => (
  <Svg width={ms(13)} height={ms(13)} viewBox="0 0 24 24" fill="none">
    <Path
      d="m6 12.5 4 4L18.5 8"
      stroke={colors.white}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CalendarIcon = () => (
  <Svg width={ms(18)} height={ms(18)} viewBox="0 0 24 24" fill="none">
    <Rect
      x={3.5}
      y={5}
      width={17}
      height={15.5}
      rx={3}
      stroke={colors.primary}
      strokeWidth={1.7}
    />
    <Path
      d="M8 3.5v3M16 3.5v3M3.5 9.5h17"
      stroke={colors.primary}
      strokeWidth={1.7}
      strokeLinecap="round"
    />
  </Svg>
);

const ChevronIcon = () => (
  <Svg width={ms(15)} height={ms(15)} viewBox="0 0 24 24" fill="none">
    <Path
      d="m9 6 6 6-6 6"
      stroke={colors.primary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const isNotFoundError = (error: unknown) =>
  typeof error === 'object' &&
  error != null &&
  'status' in error &&
  (error as { status?: number }).status === 404;

const ItemSection = ({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: BriefingListItem[];
}) => {
  if (!items.length) {
    return null;
  }
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeading}>
        <View style={styles.sectionHeadingCopy}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.listCard}>
        {items.map((item, index) => (
          <View key={item.id || `${title}-${index}`}>
            <View style={styles.listRow}>
              <View style={styles.listBullet} />
              <View style={styles.taskCopy}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                {item.detail ? (
                  <Text style={styles.taskMeta}>{item.detail}</Text>
                ) : null}
              </View>
            </View>
            {index < items.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
};

const BriefingScreen = () => {
  const navigation =
    useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { tabBarClearance, screenPadding, contentMaxWidth, isTablet } =
    useResponsiveLayout();
  const userId = useAppSelector(state => state.auth.userId);
  const { showToast } = useToast();
  const sourceSheetRef = useRef<BottomSheetModal>(null);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [selectedInsight, setSelectedInsight] =
    useState<BriefingInsightCard | null>(null);
  const [pollMs, setPollMs] = useState(0);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [forceGenerate, { isLoading: isForceGenerating }] =
    useForceGenerateDailyBriefingMutation();

  const { data: planStatus, isSuccess: isPlanLoaded } = useGetPlanStatusQuery(
    { userId: userId ?? '' },
    { skip: !userId },
  );
  const isFreePlan = isPlanLoaded && planStatus?.plan?.code === 'free';

  useFocusEffect(
    useCallback(() => {
      if (isFreePlan) {
        setShowUpgradePrompt(true);
      } else {
        setShowUpgradePrompt(false);
      }
    }, [isFreePlan]),
  );

  const { data, error, isLoading, isError, isFetching, refetch } =
    useGetDailyBriefingQuery(undefined, {
      // Session auth restores userId without always having a JWT in Redux.
      // Free-plan users see the upgrade prompt instead of briefing content.
      skip: !userId || isFreePlan,
      pollingInterval: pollMs,
      refetchOnFocus: true,
    });

  const briefing = data?.success ? data.data : undefined;
  const ready = isBriefingReady(briefing);

  useEffect(() => {
    const next = isPreparingStatus(briefing?.status) ? 12000 : 0;
    setPollMs(current => (current === next ? current : next));
  }, [briefing?.status]);

  const tasks = useMemo(
    () => (briefing ? tasksFromBriefing(briefing) : []),
    [briefing],
  );
  const meetings = listOrEmpty(briefing?.meetings);
  const insights = listOrEmpty(briefing?.insights);
  const highlights = sectionItems(briefing?.highlights);
  const importantMoments = sectionItems(briefing?.importantMoments);
  const completedItems = sectionItems(briefing?.completed);
  const followUps = sectionItems(briefing?.followUps);
  const tomorrowFocus = sectionItems(briefing?.tomorrowFocus);
  const decisions = sectionItems(briefing?.decisions);
  const people = listOrEmpty(briefing?.people);
  const topics = listOrEmpty(briefing?.topics);
  const progress = briefing ? deriveProgress(briefing) : { done: 0, total: 0, percent: 0 };
  const localProgress = tasks.length
    ? completedTasks.length / tasks.length
    : progress.percent / 100;
  const dateParts = formatDateKeyParts(briefing?.dateKey);
  const generatedLabel = formatGeneratedAt(briefing?.generatedAt);
  const snapshotCount = capturedCount(briefing?.sourceStats);
  const snapshotLabel = sourceSummary(briefing?.sourceStats);
  const ringOffset = 2 * Math.PI * 27 * (1 - Math.min(Math.max(localProgress, 0), 1));

  const openChat = useCallback(() => {
    navigation.navigate({ name: 'AI', params: {}, merge: false });
  }, [navigation]);

  const handleForceGenerate = useCallback(async () => {
    try {
      await forceGenerate({ period: 'today' }).unwrap();
      showToast({
        message: 'Generating today’s briefing…',
        description: 'This can take a minute. The screen will update automatically.',
        type: 'info',
      });
      setPollMs(5000);
      await refetch();
    } catch (err) {
      const message =
        typeof err === 'object' &&
        err != null &&
        'data' in err &&
        typeof (err as { data?: { message?: string } }).data?.message === 'string'
          ? (err as { data: { message: string } }).data.message
          : 'Could not generate briefing. Is Python API running?';
      showToast({ message, type: 'error' });
    }
  }, [forceGenerate, refetch, showToast]);

  const toggleTask = (id: string) => {
    setCompletedTasks(current =>
      current.includes(id)
        ? current.filter(taskId => taskId !== id)
        : [...current, id],
    );
  };

  const openInsightSource = (insight: BriefingInsightCard) => {
    setSelectedInsight(insight);
    requestAnimationFrame(() => sourceSheetRef.current?.present());
  };

  const emptyVariant: BriefingEmptyVariant | null = (() => {
    if (isFreePlan) {
      return null;
    }
    if (!userId) {
      return 'signedOut';
    }
    if (isLoading && !briefing) {
      return 'loading';
    }
    if (isError && isNotFoundError(error)) {
      return 'missing';
    }
    if (isError) {
      return 'error';
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
    if (briefing.status === 'FAILED') {
      return 'failed';
    }
    return null;
  })();

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.78}
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <BackIcon />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Daily Briefing</Text>
            <Text style={styles.headerDate}>
              {formatDateKey(briefing?.dateKey)}
            </Text>
          </View>
          <View style={styles.buddyBadge}>
            <SparkleIcon size={17} />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
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
          refreshControl={
            userId ? (
              <RefreshControl
                refreshing={isFetching && !isLoading}
                onRefresh={refetch}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            ) : undefined
          }
        >
          {emptyVariant ? (
            <BriefingEmptyState
              variant={emptyVariant}
              onRetry={userId ? refetch : undefined}
              onStartChat={openChat}
              onForceGenerate={userId ? handleForceGenerate : undefined}
              forceGenerating={isForceGenerating}
            />
          ) : null}

          {ready && briefing ? (
            <>
              {(briefing.headline || briefing.overview) ? (
                <View style={styles.introCard}>
                  {briefing.headline ? (
                    <Text style={styles.overviewText}>{briefing.headline}</Text>
                  ) : null}
                  {briefing.overview ? (
                    <Text style={styles.overviewBody}>{briefing.overview}</Text>
                  ) : null}
                </View>
              ) : null}

              <LinearGradient
                colors={[colors.primaryDark, colors.primary, colors.primaryMid]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.dayCard}
              >
                <View style={styles.dateColumn}>
                  <View style={styles.buddyPlanRow}>
                    <SparkleIcon color={colors.white} size={13} />
                    <Text style={styles.buddyPlanText}>Yesterday</Text>
                  </View>
                  <Text style={styles.bigDate}>
                    {dateParts.month} {dateParts.day}
                  </Text>
                  <Text style={styles.dayName}>{dateParts.dayName}</Text>
                  {generatedLabel ? (
                    <Text style={styles.dayMeta}>Prepared {generatedLabel}</Text>
                  ) : null}
                </View>
                <View style={styles.dayMeetings}>
                  {(meetings.length ? meetings : highlights)
                    .slice(0, 2)
                    .map((item, index) => (
                      <View key={item.id || `peek-${index}`} style={styles.dayMeeting}>
                        <View
                          style={[
                            styles.meetingAccent,
                            index === 1 && styles.meetingAccentSecondary,
                          ]}
                        />
                        <View style={styles.dayMeetingCopy}>
                          <Text numberOfLines={1} style={styles.dayMeetingTitle}>
                            {item.title}
                          </Text>
                          <Text numberOfLines={1} style={styles.dayMeetingTime}>
                            {'time' in item
                              ? `${item.time}${item.meta ? ` · ${item.meta.split(' · ')[0]}` : ''}`
                              : item.detail || 'Highlight'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  {!meetings.length && !highlights.length ? (
                    <View style={styles.dayMeeting}>
                      <View style={styles.meetingAccent} />
                      <View style={styles.dayMeetingCopy}>
                        <Text style={styles.dayMeetingTitle}>Quiet snapshot</Text>
                        <Text style={styles.dayMeetingTime}>{snapshotLabel}</Text>
                      </View>
                    </View>
                  ) : null}
                </View>
              </LinearGradient>

              <View style={styles.quickGrid}>
                <View style={[styles.quickCard, styles.chatCard]}>
                  <View style={styles.chatIconWrap}>
                    <ChatIcon />
                  </View>
                  <Text style={styles.quickTitle}>Plan with Buddy</Text>
                  <Text style={styles.quickBody}>
                    Turn this briefing into today’s plan.
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.82}
                    style={styles.chatButton}
                    onPress={openChat}
                  >
                    <Text style={styles.chatButtonText}>Start chat</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.quickCard, styles.focusCard]}>
                  <Text style={styles.focusEyebrow}>Progress</Text>
                  <Text style={styles.focusValue}>
                    {progress.total ? `${progress.percent}%` : snapshotCount}
                  </Text>
                  <Text style={styles.focusLabel}>
                    {progress.total
                      ? `${progress.done} of ${progress.total} done`
                      : 'Items captured'}
                  </Text>
                  <View style={styles.focusRingWrap}>
                    <Svg width={ms(64)} height={ms(64)} viewBox="0 0 72 72">
                      <Circle
                        cx={36}
                        cy={36}
                        r={27}
                        fill="none"
                        stroke={colors.white}
                        strokeWidth={6}
                        opacity={0.7}
                      />
                      <Circle
                        cx={36}
                        cy={36}
                        r={27}
                        fill="none"
                        stroke={colors.info}
                        strokeWidth={6}
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 27}`}
                        strokeDashoffset={`${ringOffset}`}
                        rotation={-90}
                        origin="36, 36"
                      />
                    </Svg>
                    <View style={styles.focusRingCenter}>
                      <Text style={styles.focusRingText}>
                        {progress.total ? `${progress.percent}%` : snapshotCount}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <ItemSection
                title="Highlights"
                subtitle="What mattered most"
                items={highlights}
              />
              <ItemSection
                title="Important moments"
                subtitle="Worth remembering"
                items={importantMoments}
              />
              <ItemSection
                title="Completed yesterday"
                subtitle="Already wrapped up"
                items={completedItems}
              />

              {tasks.length ? (
                <View style={styles.sectionBlock}>
                  <View style={styles.sectionHeading}>
                    <View style={styles.sectionHeadingCopy}>
                      <Text style={styles.sectionTitle}>Today’s priorities</Text>
                      <Text style={styles.sectionSubtitle}>
                        {completedTasks.length} of {tasks.length} completed
                      </Text>
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.72}
                      style={styles.viewAllButton}
                      onPress={() => navigation.navigate('Tasks')}
                    >
                      <Text style={styles.viewAllText}>View all</Text>
                      <ChevronIcon />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.priorityCard}>
                    {tasks.map((task, index) => {
                      const completed = completedTasks.includes(task.id);
                      return (
                        <React.Fragment key={task.id || `task-${index}`}>
                          <TouchableOpacity
                            activeOpacity={0.76}
                            style={styles.taskRow}
                            onPress={() => toggleTask(task.id)}
                          >
                            <View
                              style={[
                                styles.checkbox,
                                completed && styles.checkboxCompleted,
                              ]}
                            >
                              {completed ? <CheckIcon /> : null}
                            </View>
                            <View style={styles.taskCopy}>
                              <Text
                                style={[
                                  styles.taskTitle,
                                  completed && styles.taskTitleCompleted,
                                ]}
                              >
                                {task.title}
                              </Text>
                              {task.meta ? (
                                <Text style={styles.taskMeta}>{task.meta}</Text>
                              ) : null}
                            </View>
                          </TouchableOpacity>
                          {index < tasks.length - 1 ? (
                            <View style={styles.divider} />
                          ) : null}
                        </React.Fragment>
                      );
                    })}
                    <View style={styles.progressRow}>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${Math.max(localProgress * 100, 4)}%`,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {Math.round(localProgress * 100)}%
                      </Text>
                    </View>
                  </View>
                </View>
              ) : null}

              {meetings.length ? (
                <View style={styles.sectionBlock}>
                  <View style={styles.sectionHeading}>
                    <View style={styles.sectionHeadingCopy}>
                      <Text style={styles.sectionTitle}>Upcoming meetings</Text>
                      <Text style={styles.sectionSubtitle}>
                        From yesterday’s calendar
                      </Text>
                    </View>
                    <View style={styles.sectionIcon}>
                      <CalendarIcon />
                    </View>
                  </View>

                  <View style={styles.meetingsCard}>
                    {meetings.map((meeting, index) => (
                      <View
                        key={meeting.id || `meeting-${index}`}
                        style={styles.meetingRow}
                      >
                        <View style={styles.meetingTimeColumn}>
                          <Text style={styles.meetingTime}>{meeting.time}</Text>
                        </View>
                        <View style={styles.timelineColumn}>
                          <View
                            style={[
                              styles.timelineDot,
                              index === 1 && styles.timelineDotSecondary,
                              index === 2 && styles.timelineDotTertiary,
                            ]}
                          />
                          {index < meetings.length - 1 ? (
                            <View style={styles.timelineLine} />
                          ) : null}
                        </View>
                        <View style={styles.meetingCopy}>
                          <Text style={styles.meetingTitle}>{meeting.title}</Text>
                          {meeting.meta ? (
                            <Text style={styles.meetingMeta}>{meeting.meta}</Text>
                          ) : null}
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              <ItemSection
                title="Follow-ups"
                subtitle="Don’t let these slip"
                items={followUps}
              />
              <ItemSection
                title="Tomorrow’s focus"
                subtitle="Start here next"
                items={tomorrowFocus}
              />
              <ItemSection
                title="Decisions"
                subtitle="Locked in yesterday"
                items={decisions}
              />

              {insights.length ? (
                <View style={styles.sectionBlock}>
                  <View style={styles.sectionHeading}>
                    <View style={styles.sectionHeadingCopy}>
                      <Text style={styles.sectionTitle}>Captured by Buddy</Text>
                      <Text style={styles.sectionSubtitle}>
                        Context worth remembering
                      </Text>
                    </View>
                    <View style={styles.sectionIcon}>
                      <SparkleIcon size={16} />
                    </View>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.insightsScroll}
                    contentContainerStyle={styles.insightsContent}
                  >
                    {insights.map(insight => (
                      <TouchableOpacity
                        key={insight.id}
                        activeOpacity={0.8}
                        style={styles.insightCard}
                        onPress={() => openInsightSource(insight)}
                      >
                        <View style={styles.insightTop}>
                          <View style={styles.insightBadge}>
                            <SparkleIcon size={12} />
                            <Text style={styles.insightBadgeText}>Insight</Text>
                          </View>
                          <Text style={styles.insightSource}>{insight.source}</Text>
                        </View>
                        <Text numberOfLines={2} style={styles.insightTitle}>
                          {insight.title}
                        </Text>
                        <Text numberOfLines={3} style={styles.insightBody}>
                          {insight.body}
                        </Text>
                        <View style={styles.insightAction}>
                          <Text style={styles.insightActionText}>View source</Text>
                          <ChevronIcon />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ) : null}

              {people.length || topics.length ? (
                <View style={styles.chipsCard}>
                  {people.length ? (
                    <View style={styles.chipBlock}>
                      <Text style={styles.chipLabel}>People</Text>
                      <View style={styles.chipsRow}>
                        {people.map(person => (
                          <View key={person} style={styles.chip}>
                            <Text style={styles.chipText}>{person}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ) : null}
                  {topics.length ? (
                    <View style={styles.chipBlock}>
                      <Text style={styles.chipLabel}>Topics</Text>
                      <View style={styles.chipsRow}>
                        {topics.map(topic => (
                          <View key={topic} style={styles.chip}>
                            <Text style={styles.chipText}>{topic}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ) : null}
                </View>
              ) : null}

              <View style={styles.endNote}>
                <SparkleIcon color={colors.muted} size={14} />
                <Text style={styles.endNoteText}>
                  {generatedLabel
                    ? `Prepared ${generatedLabel}. Buddy updates this after each day ends.`
                    : 'Buddy prepares your briefing after each local day ends.'}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.forceBanner}
                onPress={handleForceGenerate}
                disabled={isForceGenerating}
              >
                <Text style={styles.forceBannerText}>
                  {isForceGenerating
                    ? 'Generating briefing…'
                    : 'Regenerate today’s briefing'}
                </Text>
              </TouchableOpacity>
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>

      <BriefingSourceBottomSheet
        ref={sourceSheetRef}
        insight={selectedInsight}
      />

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
  },
  header: {
    minHeight: ms(56),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingTop: layout.screenTop,
    paddingBottom: spacing.md,
  },
  headerButton: {
    width: layout.headerButton,
    height: layout.headerButton,
    borderRadius: layout.headerButton / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: layout.hairline,
    borderColor: colors.border,
  },
  headerCopy: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  headerTitle: {
    color: colors.text,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    letterSpacing: -0.4,
    lineHeight: ms(24),
  },
  headerDate: {
    marginTop: spacing.xxs,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(16),
  },
  buddyBadge: {
    width: layout.headerButton,
    height: layout.headerButton,
    borderRadius: layout.headerButton / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    borderWidth: layout.hairline,
    borderColor: colors.brandBorder,
  },
  content: {
    paddingTop: spacing.sm,
    gap: spacing['2xl'],
  },
  introCard: {
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    borderWidth: layout.hairline,
    borderColor: colors.border,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['2xl'],
    gap: spacing.sm,
  },
  overviewText: {
    color: colors.text,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    letterSpacing: -0.35,
    lineHeight: ms(26),
  },
  overviewBody: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    lineHeight: ms(22),
  },
  dayCard: {
    minHeight: ms(148),
    flexDirection: 'row',
    padding: spacing['2xl'],
    borderRadius: radii['2xl'],
    overflow: 'hidden',
    gap: spacing.md,
  },
  dateColumn: {
    width: '38%',
    justifyContent: 'center',
    paddingRight: spacing.sm,
  },
  buddyPlanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  buddyPlanText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  bigDate: {
    color: colors.white,
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.8,
    lineHeight: ms(30),
  },
  dayName: {
    marginTop: spacing.xs,
    color: 'rgba(255,255,255,0.82)',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  dayMeta: {
    marginTop: spacing.md,
    color: 'rgba(255,255,255,0.65)',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  dayMeetings: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dayMeeting: {
    minHeight: ms(52),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255,255,255,0.96)',
  },
  meetingAccent: {
    width: ms(3),
    alignSelf: 'stretch',
    marginRight: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryPurple,
  },
  meetingAccentSecondary: {
    backgroundColor: colors.info,
  },
  dayMeetingCopy: {
    flex: 1,
    minWidth: 0,
  },
  dayMeetingTitle: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    lineHeight: ms(16),
  },
  dayMeetingTime: {
    marginTop: spacing.xxs,
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: ms(14),
  },
  quickGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickCard: {
    flex: 1,
    minHeight: ms(168),
    padding: spacing['2xl'],
    borderRadius: radii['2xl'],
    borderWidth: layout.hairline,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  chatCard: {
    backgroundColor: colors.white,
  },
  focusCard: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.brandBorder,
  },
  chatIconWrap: {
    width: ms(44),
    height: ms(44),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
    backgroundColor: colors.primaryLight,
  },
  quickTitle: {
    marginTop: spacing.xl,
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    lineHeight: ms(20),
  },
  quickBody: {
    marginTop: spacing.xs,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(17),
  },
  chatButton: {
    alignSelf: 'flex-start',
    marginTop: 'auto',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  chatButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  focusEyebrow: {
    color: colors.primaryDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  focusValue: {
    marginTop: spacing.sm,
    color: colors.primaryDark,
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.7,
    lineHeight: ms(30),
  },
  focusLabel: {
    marginTop: spacing.xs,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(17),
  },
  focusRingWrap: {
    position: 'relative',
    alignSelf: 'flex-end',
    width: ms(64),
    height: ms(64),
    marginTop: 'auto',
  },
  focusRingCenter: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusRingText: {
    color: colors.primaryDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  sectionBlock: {
    gap: spacing.md,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sectionHeadingCopy: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.25,
    lineHeight: ms(22),
  },
  sectionSubtitle: {
    marginTop: spacing.xxs,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(16),
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    borderWidth: layout.hairline,
    borderColor: colors.border,
  },
  viewAllText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  sectionIcon: {
    width: ms(36),
    height: ms(36),
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  priorityCard: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['2xl'],
    borderRadius: radii['2xl'],
    backgroundColor: colors.white,
    borderWidth: layout.hairline,
    borderColor: colors.border,
  },
  listCard: {
    paddingHorizontal: spacing['2xl'],
    borderRadius: radii['2xl'],
    backgroundColor: colors.white,
    borderWidth: layout.hairline,
    borderColor: colors.border,
  },
  listRow: {
    minHeight: ms(60),
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.xl,
  },
  listBullet: {
    width: ms(7),
    height: ms(7),
    borderRadius: ms(4),
    marginTop: ms(7),
    marginRight: spacing.xl,
    backgroundColor: colors.primary,
  },
  taskRow: {
    minHeight: ms(62),
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  checkbox: {
    width: ms(22),
    height: ms(22),
    borderRadius: ms(7),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xl,
    backgroundColor: colors.inputBg,
    borderWidth: layout.hairline,
    borderColor: colors.borderFocus,
  },
  checkboxCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  taskCopy: {
    flex: 1,
    minWidth: 0,
  },
  taskTitle: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: ms(20),
  },
  taskTitleCompleted: {
    color: colors.muted,
    textDecorationLine: 'line-through',
  },
  taskMeta: {
    marginTop: spacing.xs,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(17),
  },
  divider: {
    height: layout.hairline,
    backgroundColor: colors.border,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  progressTrack: {
    flex: 1,
    height: ms(7),
    overflow: 'hidden',
    borderRadius: radii.pill,
    backgroundColor: colors.lightGray,
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  progressText: {
    color: colors.primaryDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  meetingsCard: {
    paddingHorizontal: spacing['2xl'],
    borderRadius: radii['2xl'],
    backgroundColor: colors.white,
    borderWidth: layout.hairline,
    borderColor: colors.border,
  },
  meetingRow: {
    minHeight: ms(70),
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingVertical: spacing.xl,
  },
  meetingTimeColumn: {
    width: ms(58),
    paddingTop: spacing.xxs,
  },
  meetingTime: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  timelineColumn: {
    width: ms(24),
    alignItems: 'center',
  },
  timelineDot: {
    width: ms(9),
    height: ms(9),
    marginTop: spacing.xs,
    borderRadius: ms(5),
    backgroundColor: colors.primary,
    borderWidth: ms(2),
    borderColor: colors.primaryLight,
  },
  timelineDotSecondary: {
    backgroundColor: colors.primaryPurple,
    borderColor: colors.purpleLight,
  },
  timelineDotTertiary: {
    backgroundColor: colors.info,
    borderColor: colors.primaryLight,
  },
  timelineLine: {
    flex: 1,
    width: layout.hairline,
    marginTop: spacing.xs,
    marginBottom: -spacing.xl,
    backgroundColor: colors.borderFocus,
  },
  meetingCopy: {
    flex: 1,
    minWidth: 0,
  },
  meetingTitle: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: ms(20),
  },
  meetingMeta: {
    marginTop: spacing.xs,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(17),
  },
  insightsScroll: {
    marginHorizontal: -layout.screenPadding,
  },
  insightsContent: {
    gap: spacing.md,
    paddingHorizontal: layout.screenPadding,
  },
  insightCard: {
    width: ms(268),
    minHeight: ms(176),
    padding: spacing['2xl'],
    borderRadius: radii['2xl'],
    backgroundColor: colors.white,
    borderWidth: layout.hairline,
    borderColor: colors.border,
  },
  insightTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  insightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryLight,
  },
  insightBadgeText: {
    color: colors.primaryDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.2,
  },
  insightSource: {
    flexShrink: 1,
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textAlign: 'right',
  },
  insightTitle: {
    marginTop: spacing.xl,
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    lineHeight: ms(22),
  },
  insightBody: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(18),
  },
  insightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 'auto',
    paddingTop: spacing.xl,
  },
  insightActionText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  chipsCard: {
    padding: spacing['2xl'],
    borderRadius: radii['2xl'],
    backgroundColor: colors.white,
    borderWidth: layout.hairline,
    borderColor: colors.border,
    gap: spacing.xl,
  },
  chipBlock: {
    gap: spacing.md,
  },
  chipLabel: {
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.35,
    textTransform: 'uppercase',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    borderWidth: layout.hairline,
    borderColor: colors.brandBorder,
  },
  chipText: {
    color: colors.primaryDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  endNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  endNoteText: {
    flexShrink: 1,
    color: colors.muted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
    lineHeight: ms(18),
  },
  forceBanner: {
    minHeight: ms(44),
    paddingHorizontal: spacing['2xl'],
    borderRadius: radii.xl,
    borderWidth: layout.hairline,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forceBannerText: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
});
