import React, { useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import type { MainTabParamList } from '../../navigation/types';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  radii,
  shadows,
  spacing,
} from '../../theme';
import BriefingSourceBottomSheet from './components/BriefingSourceBottomSheet';
import { insights, type InsightItem } from './components/mockBriefing';

type TaskItem = {
  id: string;
  title: string;
  meta: string;
};

type MeetingItem = {
  id: string;
  time: string;
  title: string;
  meta: string;
};

const tasks: TaskItem[] = [
  {
    id: 'proposal',
    title: 'Finish product proposal',
    meta: 'Due today · Product Launch',
  },
  {
    id: 'research',
    title: 'Review research notes',
    meta: 'Due 2:00 PM · Personal',
  },
  {
    id: 'invoice',
    title: 'Send August invoice',
    meta: 'Due 5:00 PM · Finance',
  },
];

const meetings: MeetingItem[] = [
  {
    id: 'sync',
    time: '10:30 AM',
    title: 'Product sync',
    meta: '30 min · Google Meet',
  },
  {
    id: 'review',
    time: '3:00 PM',
    title: 'Client review',
    meta: '45 min · Zoom',
  },
  {
    id: 'critique',
    time: '5:30 PM',
    title: 'Design critique',
    meta: '40 min · Office',
  },
];

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
  <Svg width={ms(32)} height={ms(32)} viewBox="0 0 24 24" fill="none">
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

const BriefingScreen = () => {
  const navigation =
    useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const sourceSheetRef = useRef<BottomSheetModal>(null);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<InsightItem | null>(
    null,
  );

  const now = useMemo(() => new Date(), []);
  const month = now.toLocaleDateString('en-US', { month: 'short' });
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const fullDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const progress = completedTasks.length / tasks.length;

  const toggleTask = (id: string) => {
    setCompletedTasks(current =>
      current.includes(id)
        ? current.filter(taskId => taskId !== id)
        : [...current, id],
    );
  };

  const openInsightSource = (insight: InsightItem) => {
    setSelectedInsight(insight);
    requestAnimationFrame(() => sourceSheetRef.current?.present());
  };

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
            <Text style={styles.headerDate}>{fullDate}</Text>
          </View>
          <View style={styles.buddyBadge}>
            <SparkleIcon size={17} />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <LinearGradient
            colors={[colors.primaryDark, colors.primary, colors.primaryMid]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dayCard}
          >
            <View style={styles.dateColumn}>
              <View style={styles.buddyPlanRow}>
                <SparkleIcon color={colors.white} size={14} />
                <Text style={styles.buddyPlanText}>TODAY</Text>
              </View>
              <Text style={styles.bigDate}>
                {month} {now.getDate()}
              </Text>
              <Text style={styles.dayName}>{dayName}</Text>
            </View>
            <View style={styles.dayMeetings}>
              {meetings.slice(0, 2).map((meeting, index) => (
                <View key={meeting.id} style={styles.dayMeeting}>
                  <View
                    style={[
                      styles.meetingAccent,
                      index === 1 && styles.meetingAccentSecondary,
                    ]}
                  />
                  <View style={styles.dayMeetingCopy}>
                    <Text numberOfLines={1} style={styles.dayMeetingTitle}>
                      {meeting.title}
                    </Text>
                    <Text style={styles.dayMeetingTime}>
                      {meeting.time} · {meeting.meta.split(' · ')[0]}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </LinearGradient>

          <View style={styles.quickGrid}>
            <View style={[styles.quickCard, styles.chatCard]}>
              <View style={styles.chatIconWrap}>
                <ChatIcon />
              </View>
              <Text style={styles.quickTitle}>Let’s plan your day</Text>
              <Text style={styles.quickBody}>Buddy is ready when you are.</Text>
              <TouchableOpacity
                activeOpacity={0.82}
                style={styles.chatButton}
                onPress={() => navigation.navigate('AI')}
              >
                <Text style={styles.chatButtonText}>Start chat</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.quickCard, styles.focusCard]}>
              <Text style={styles.focusValue}>4h 30m</Text>
              <Text style={styles.focusLabel}>Focus time available</Text>
              <View style={styles.focusRingWrap}>
                <Svg width={ms(72)} height={ms(72)} viewBox="0 0 72 72">
                  <Circle
                    cx={36}
                    cy={36}
                    r={27}
                    fill="none"
                    stroke={colors.white}
                    strokeWidth={6}
                    opacity={0.72}
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
                    strokeDashoffset={`${2 * Math.PI * 27 * 0.28}`}
                    rotation={-90}
                    origin="36, 36"
                  />
                </Svg>
                <View style={styles.focusRingCenter}>
                  <Text style={styles.focusRingText}>72%</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.sectionHeading}>
            <View>
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
                <React.Fragment key={task.id}>
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
                      <Text style={styles.taskMeta}>{task.meta}</Text>
                    </View>
                  </TouchableOpacity>
                  {index < tasks.length - 1 ? <View style={styles.divider} /> : null}
                </React.Fragment>
              );
            })}
            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.max(progress * 100, 4)}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
          </View>

          <View style={styles.sectionHeading}>
            <View>
              <Text style={styles.sectionTitle}>Upcoming meetings</Text>
              <Text style={styles.sectionSubtitle}>Your next 8 hours</Text>
            </View>
            <View style={styles.sectionIcon}>
              <CalendarIcon />
            </View>
          </View>

          <View style={styles.meetingsCard}>
            {meetings.map((meeting, index) => (
              <View key={meeting.id} style={styles.meetingRow}>
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
                  <Text style={styles.meetingMeta}>{meeting.meta}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.sectionHeading}>
            <View>
              <Text style={styles.sectionTitle}>Captured by Buddy</Text>
              <Text style={styles.sectionSubtitle}>Context worth remembering</Text>
            </View>
            <View style={styles.sectionIcon}>
              <SparkleIcon size={17} />
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
                    <SparkleIcon size={13} />
                    <Text style={styles.insightBadgeText}>KEY INSIGHT</Text>
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

          <View style={styles.endNote}>
            <SparkleIcon color={colors.muted} size={14} />
            <Text style={styles.endNoteText}>
              Buddy keeps your briefing updated throughout the day.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      <BriefingSourceBottomSheet
        ref={sourceSheetRef}
        insight={selectedInsight}
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
    paddingVertical: spacing.sm,
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
    paddingHorizontal: spacing.sm,
  },
  headerTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
  },
  headerDate: {
    marginTop: spacing.xxs,
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
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
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing['5xl'],
  },
  dayCard: {
    minHeight: ms(142),
    flexDirection: 'row',
    padding: spacing['2xl'],
    borderRadius: radii['2xl'],
    overflow: 'hidden',
    ...shadows.card,
  },
  dateColumn: {
    width: '36%',
    justifyContent: 'center',
    paddingRight: spacing.md,
  },
  buddyPlanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  buddyPlanText: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.6,
  },
  bigDate: {
    color: colors.white,
    fontSize: fontSize['2xl'] + ms(4),
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.7,
  },
  dayName: {
    marginTop: spacing.xs,
    color: 'rgba(255,255,255,0.76)',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  dayMeetings: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dayMeeting: {
    minHeight: ms(50),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.95)',
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
  },
  dayMeetingTitle: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  dayMeetingTime: {
    marginTop: spacing.xxs,
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  quickCard: {
    flex: 1,
    minHeight: ms(178),
    padding: spacing['2xl'],
    borderRadius: radii['2xl'],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  chatCard: {
    backgroundColor: colors.primarySoft,
  },
  focusCard: {
    backgroundColor: colors.primaryLight,
  },
  chatIconWrap: {
    width: ms(50),
    height: ms(44),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
    backgroundColor: colors.white,
  },
  quickTitle: {
    marginTop: spacing.md,
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  quickBody: {
    marginTop: spacing.xs,
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  chatButton: {
    alignSelf: 'flex-start',
    marginTop: 'auto',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.text,
  },
  chatButtonText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  focusValue: {
    color: colors.primaryDark,
    fontSize: fontSize['2xl'] + ms(4),
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.6,
  },
  focusLabel: {
    marginTop: spacing.xxs,
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  focusRingWrap: {
    position: 'relative',
    alignSelf: 'flex-end',
    width: ms(72),
    height: ms(72),
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
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing['2xl'],
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    marginTop: spacing.xxs,
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  viewAllText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  sectionIcon: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(11),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  priorityCard: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  taskRow: {
    minHeight: ms(64),
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  checkbox: {
    width: ms(22),
    height: ms(22),
    borderRadius: ms(7),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    backgroundColor: colors.inputBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderFocus,
  },
  checkboxCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  taskCopy: {
    flex: 1,
  },
  taskTitle: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  taskTitleCompleted: {
    color: colors.muted,
    textDecorationLine: 'line-through',
  },
  taskMeta: {
    marginTop: spacing.xxs,
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
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
    height: ms(8),
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
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  meetingsCard: {
    paddingHorizontal: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  meetingRow: {
    minHeight: ms(68),
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingVertical: spacing.md,
  },
  meetingTimeColumn: {
    width: ms(62),
    paddingTop: spacing.xxs,
  },
  meetingTime: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  timelineColumn: {
    width: ms(28),
    alignItems: 'center',
  },
  timelineDot: {
    width: ms(10),
    height: ms(10),
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
    width: StyleSheet.hairlineWidth,
    marginTop: spacing.xs,
    marginBottom: -spacing.md,
    backgroundColor: colors.borderFocus,
  },
  meetingCopy: {
    flex: 1,
  },
  meetingTitle: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  meetingMeta: {
    marginTop: spacing.xxs,
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  insightsScroll: {
    marginHorizontal: -layout.screenPadding,
  },
  insightsContent: {
    gap: spacing.sm,
    paddingHorizontal: layout.screenPadding,
  },
  insightCard: {
    width: ms(280),
    minHeight: ms(182),
    padding: spacing['2xl'],
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
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
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryLight,
  },
  insightBadgeText: {
    color: colors.primaryDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.3,
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
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    lineHeight: ms(21),
  },
  insightBody: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: ms(17),
  },
  insightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 'auto',
    paddingTop: spacing.md,
  },
  insightActionText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  endNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing['2xl'],
  },
  endNoteText: {
    flexShrink: 1,
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
});
