import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import BriefingSourceBottomSheet from './components/BriefingSourceBottomSheet';
import { insights, type InsightItem } from './components/mockBriefing';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  radii,
  spacing,
} from '../../theme';

type IconProps = {
  color?: string;
  size?: number;
};

type TaskItem = {
  id: string;
  title: string;
  meta: string;
  priority?: 'High' | 'Medium';
};

type MeetingItem = {
  id: string;
  time: string;
  period: string;
  title: string;
  meta: string;
  note: string;
};

type FollowUpItem = {
  id: string;
  initials: string;
  name: string;
  reason: string;
  meta: string;
  tone: 'purple' | 'blue' | 'teal';
};

const SECTION_LIST_HEIGHT = ms(220);
const PAGE_BG = colors.background;

const BackIcon = ({ color = colors.text, size = 18 }: IconProps) => (
  <Svg width={ms(size)} height={ms(size)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18 9 12l6-6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SparkleIcon = ({ color = colors.primary, size = 18 }: IconProps) => (
  <Svg width={ms(size)} height={ms(size)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3.8c.7 4.1 2.4 5.8 6.5 6.5-4.1.7-5.8 2.4-6.5 6.5-.7-4.1-2.4-5.8-6.5-6.5C9.6 9.6 11.3 7.9 12 3.8Z"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
    <Path
      d="M18.5 16.5c.3 1.8 1.2 2.7 3 3-1.8.3-2.7 1.2-3 3-.3-1.8-1.2-2.7-3-3 1.8-.3 2.7-1.2 3-3Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
  </Svg>
);

const CheckIcon = ({ color = colors.white, size = 14 }: IconProps) => (
  <Svg width={ms(size)} height={ms(size)} viewBox="0 0 24 24" fill="none">
    <Path
      d="m6 12.5 4 4L18.5 8"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CalendarIcon = ({ color = colors.primary, size = 18 }: IconProps) => (
  <Svg width={ms(size)} height={ms(size)} viewBox="0 0 24 24" fill="none">
    <Rect
      x={3.5}
      y={5}
      width={17}
      height={15.5}
      rx={3}
      stroke={color}
      strokeWidth={1.7}
    />
    <Path
      d="M8 3.5v3M16 3.5v3M3.5 9.5h17"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
    />
  </Svg>
);

const ClockIcon = ({ color = colors.subText, size = 16 }: IconProps) => (
  <Svg width={ms(size)} height={ms(size)} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={1.7} />
    <Path
      d="M12 7.5V12l3 2"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PersonIcon = ({ color = colors.primaryMid, size = 18 }: IconProps) => (
  <Svg width={ms(size)} height={ms(size)} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={8} r={3.5} stroke={color} strokeWidth={1.7} />
    <Path
      d="M5.5 20c.4-4 2.8-6 6.5-6s6.1 2 6.5 6"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
    />
  </Svg>
);

const NoteIcon = ({ color = colors.info, size = 18 }: IconProps) => (
  <Svg width={ms(size)} height={ms(size)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 3.8h9.5L19 7.3v12.9H6V3.8Z"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
    <Path
      d="M15.5 3.8v3.5H19M9 11h6M9 15h6"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronIcon = ({ color = colors.muted, size = 16 }: IconProps) => (
  <Svg width={ms(size)} height={ms(size)} viewBox="0 0 24 24" fill="none">
    <Path
      d="m9 6 6 6-6 6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const todayTasks: TaskItem[] = [
  {
    id: 'proposal',
    title: 'Finish product proposal',
    meta: 'Due today · Work',
    priority: 'High',
  },
  {
    id: 'notes',
    title: 'Review research notes',
    meta: 'Due 2:00 PM · Personal',
    priority: 'Medium',
  },
  {
    id: 'invoice',
    title: 'Send August invoice',
    meta: 'Due 5:00 PM · Finance',
  },
  {
    id: 'standup',
    title: 'Prepare standup talking points',
    meta: 'Due 9:30 AM · Work',
    priority: 'Medium',
  },
  {
    id: 'docs',
    title: 'Update onboarding docs',
    meta: 'Due today · Ops',
  },
  {
    id: 'vendor',
    title: 'Reply to vendor quote',
    meta: 'Due 4:00 PM · Finance',
    priority: 'High',
  },
];

const overdueTasks: TaskItem[] = [
  {
    id: 'budget',
    title: 'Approve quarterly budget',
    meta: 'Overdue by 2 days · Finance',
    priority: 'High',
  },
  {
    id: 'feedback',
    title: 'Share design feedback',
    meta: 'Overdue since yesterday · Work',
  },
  {
    id: 'contract',
    title: 'Sign partner contract',
    meta: 'Overdue by 4 days · Legal',
    priority: 'High',
  },
  {
    id: 'expense',
    title: 'Submit travel expenses',
    meta: 'Overdue since Monday · Finance',
  },
];

const meetings: MeetingItem[] = [
  {
    id: 'sync',
    time: '10:30',
    period: 'AM',
    title: 'Product sync',
    meta: '30 min · Google Meet',
    note: 'Prepare the launch status and open decisions.',
  },
  {
    id: 'review',
    time: '3:00',
    period: 'PM',
    title: 'Client review',
    meta: '45 min · Zoom',
    note: 'Last note: client asked for revised milestones.',
  },
  {
    id: 'design',
    time: '5:30',
    period: 'PM',
    title: 'Design critique',
    meta: '40 min · Office',
    note: 'Bring the latest mobile flow screens.',
  },
];

const followUps: FollowUpItem[] = [
  {
    id: 'aarav',
    initials: 'AM',
    name: 'Aarav Mehta',
    reason: 'Send the revised project timeline',
    meta: 'Last contact · 3 days ago',
    tone: 'purple',
  },
  {
    id: 'sara',
    initials: 'SK',
    name: 'Sara Khan',
    reason: 'Confirm availability for Friday',
    meta: 'Last contact · Monday',
    tone: 'blue',
  },
  {
    id: 'noah',
    initials: 'NR',
    name: 'Noah Rivera',
    reason: 'Share the interview scorecard',
    meta: 'Last contact · Yesterday',
    tone: 'teal',
  },
];

type StickyHeaderProps = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconStyle?: object;
};

const StickySectionHeader = ({
  title,
  subtitle,
  icon,
  iconStyle,
}: StickyHeaderProps) => (
  <View style={styles.stickySectionHeader}>
    <View style={[styles.sectionIcon, iconStyle]}>{icon}</View>
    <View style={styles.sectionCopy}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  </View>
);

type ScrollableCardProps = {
  children: React.ReactNode;
  cardStyle?: object;
};

const ScrollableSectionCard = ({
  children,
  cardStyle,
}: ScrollableCardProps) => (
  <View style={[styles.sectionCard, cardStyle]}>
    <ScrollView
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      style={styles.sectionList}
      contentContainerStyle={styles.sectionListContent}
    >
      {children}
    </ScrollView>
  </View>
);

const BriefingScreen = () => {
  const navigation = useNavigation();
  const sourceSheetRef = useRef<BottomSheetModal>(null);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<InsightItem | null>(
    null,
  );

  const formattedDate = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }).format(new Date()),
    [],
  );

  const completedTodayCount = todayTasks.filter(task =>
    completedTasks.includes(task.id),
  ).length;

  const openInsightSource = useCallback((insight: InsightItem) => {
    setSelectedInsight(insight);
    requestAnimationFrame(() => {
      sourceSheetRef.current?.present();
    });
  }, []);

  const toggleTask = (id: string) => {
    setCompletedTasks(current =>
      current.includes(id)
        ? current.filter(taskId => taskId !== id)
        : [...current, id],
    );
  };

  const renderTask = (item: TaskItem, overdue = false) => {
    const completed = completedTasks.includes(item.id);

    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.75}
        style={styles.taskRow}
        onPress={() => toggleTask(item.id)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: completed }}
      >
        <View style={[styles.checkbox, completed && styles.checkboxChecked]}>
          {completed ? <CheckIcon /> : null}
        </View>

        <View style={styles.taskCopy}>
          <Text style={[styles.taskTitle, completed && styles.completedText]}>
            {item.title}
          </Text>
          <Text style={[styles.taskMeta, overdue && styles.overdueMeta]}>
            {item.meta}
          </Text>
        </View>

        {item.priority ? (
          <View
            style={[
              styles.priorityPill,
              item.priority === 'High'
                ? styles.priorityHigh
                : styles.priorityMedium,
            ]}
          >
            <Text
              style={[
                styles.priorityText,
                item.priority === 'High'
                  ? styles.priorityHighText
                  : styles.priorityMediumText,
              ]}
            >
              {item.priority}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  const avatarTone = {
    purple: styles.avatarPurple,
    blue: styles.avatarBlue,
    teal: styles.avatarTeal,
  };

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.78}
            style={styles.iconButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <BackIcon />
          </TouchableOpacity>

          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Daily Briefing</Text>
            <Text style={styles.headerDate}>{formattedDate}</Text>
          </View>

          <View style={styles.buddyBadge}>
            <SparkleIcon size={17} />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          stickyHeaderIndices={[1, 3, 5, 7, 9]}
          nestedScrollEnabled
        >
          <LinearGradient
            colors={[colors.primaryDark, colors.primary, colors.primaryMid]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroTop}>
              <View style={styles.heroEyebrow}>
                <SparkleIcon color={colors.white} size={15} />
                <Text style={styles.heroEyebrowText}>
                  BUDDY'S RECOMMENDATION
                </Text>
              </View>
              <Text style={styles.heroTime}>Today</Text>
            </View>

            <Text style={styles.heroTitle}>Start with the product proposal</Text>
            <Text style={styles.heroBody}>
              You have a clear focus window before your first meeting. Finishing
              the proposal now will remove today’s biggest blocker.
            </Text>

            <View style={styles.focusRow}>
              <View style={styles.focusChip}>
                <ClockIcon color={colors.white} size={14} />
                <Text style={styles.focusChipText}>90 min focus block</Text>
              </View>
              <View style={styles.focusChip}>
                <Text style={styles.focusChipText}>High impact</Text>
              </View>
            </View>
          </LinearGradient>

          <StickySectionHeader
            title="Today’s priorities"
            subtitle={`${completedTodayCount} of ${todayTasks.length} completed`}
            icon={<CheckIcon color={colors.primary} size={16} />}
          />

          <ScrollableSectionCard>
            {todayTasks.map((item, index) => (
              <React.Fragment key={item.id}>
                {renderTask(item)}
                {index < todayTasks.length - 1 ? (
                  <View style={styles.divider} />
                ) : null}
              </React.Fragment>
            ))}
          </ScrollableSectionCard>

          <StickySectionHeader
            title="Needs attention"
            subtitle={`${overdueTasks.length} overdue items`}
            icon={<Text style={styles.alertMark}>!</Text>}
            iconStyle={styles.alertIcon}
          />

          <ScrollableSectionCard cardStyle={styles.overdueCard}>
            {overdueTasks.map((item, index) => (
              <React.Fragment key={item.id}>
                {renderTask(item, true)}
                {index < overdueTasks.length - 1 ? (
                  <View style={styles.divider} />
                ) : null}
              </React.Fragment>
            ))}
          </ScrollableSectionCard>

          <StickySectionHeader
            title="Upcoming meetings"
            subtitle="Your next 8 hours"
            icon={<CalendarIcon />}
          />

          <ScrollableSectionCard>
            {meetings.map((item, index) => (
              <View key={item.id} style={styles.meetingRow}>
                <View style={styles.timeColumn}>
                  <Text style={styles.meetingTime}>{item.time}</Text>
                  <Text style={styles.meetingPeriod}>{item.period}</Text>
                </View>
                <View style={styles.timeline}>
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
                  <Text style={styles.meetingTitle}>{item.title}</Text>
                  <Text style={styles.meetingMeta}>{item.meta}</Text>
                  <Text style={styles.meetingNote}>{item.note}</Text>
                </View>
              </View>
            ))}
          </ScrollableSectionCard>

          <StickySectionHeader
            title="Follow-ups"
            subtitle="People waiting on you"
            icon={<PersonIcon />}
            iconStyle={styles.followUpIcon}
          />

          <ScrollableSectionCard>
            {followUps.map((item, index) => (
              <React.Fragment key={item.id}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  style={styles.followUpRow}
                >
                  <View style={[styles.avatar, avatarTone[item.tone]]}>
                    <Text style={styles.avatarText}>{item.initials}</Text>
                  </View>
                  <View style={styles.followUpCopy}>
                    <Text style={styles.followUpName}>{item.name}</Text>
                    <Text style={styles.followUpReason}>{item.reason}</Text>
                    <Text style={styles.followUpMeta}>{item.meta}</Text>
                  </View>
                </TouchableOpacity>
                {index < followUps.length - 1 ? (
                  <View style={styles.divider} />
                ) : null}
              </React.Fragment>
            ))}
          </ScrollableSectionCard>

          <StickySectionHeader
            title="Captured by Buddy"
            subtitle="Important context from your work"
            icon={<NoteIcon />}
            iconStyle={styles.noteIcon}
          />

          <ScrollableSectionCard cardStyle={styles.insightCard}>
            {insights.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.insightBlock,
                  index < insights.length - 1 && styles.insightBlockSpaced,
                ]}
              >
                <View style={styles.insightTop}>
                  <View style={styles.insightBadge}>
                    <SparkleIcon size={14} />
                    <Text style={styles.insightBadgeText}>KEY INSIGHT</Text>
                  </View>
                  <Text style={styles.insightSource}>{item.source}</Text>
                </View>
                <Text style={styles.insightTitle}>{item.title}</Text>
                <Text style={styles.insightBody}>{item.body}</Text>
                <TouchableOpacity
                  activeOpacity={0.75}
                  style={styles.insightAction}
                  onPress={() => openInsightSource(item)}
                >
                  <Text style={styles.insightActionText}>View source</Text>
                  <ChevronIcon color={colors.primary} size={15} />
                </TouchableOpacity>
                {index < insights.length - 1 ? (
                  <View style={[styles.divider, styles.insightDivider]} />
                ) : null}
              </View>
            ))}
          </ScrollableSectionCard>

          <View style={styles.endNote}>
            <SparkleIcon color={colors.muted} size={15} />
            <Text style={styles.endNoteText}>
              Buddy will keep this briefing updated throughout your day.
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
    backgroundColor: PAGE_BG,
  },
  safeArea: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  header: {
    minHeight: ms(54),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.sm,
    backgroundColor: PAGE_BG,
  },
  iconButton: {
    width: ms(38),
    height: ms(38),
    borderRadius: ms(19),
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
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
    width: ms(38),
    height: ms(38),
    borderRadius: ms(19),
    backgroundColor: colors.primaryLight,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing['5xl'],
    backgroundColor: PAGE_BG,
  },
  stickySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.md,
    backgroundColor: PAGE_BG,
  },
  sectionCopy: {
    flex: 1,
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
  sectionIcon: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(11),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertIcon: {
    backgroundColor: colors.errorSoft,
  },
  alertMark: {
    color: colors.error,
    fontSize: fontSize.base,
    fontWeight: fontWeight.extrabold,
  },
  followUpIcon: {
    backgroundColor: colors.purpleLight,
  },
  noteIcon: {
    backgroundColor: '#EAF5FF',
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  sectionList: {
    maxHeight: SECTION_LIST_HEIGHT,
  },
  sectionListContent: {
    paddingHorizontal: spacing.xl,
  },
  overdueCard: {
    borderColor: colors.errorSoftBorder,
  },
  insightCard: {
    borderColor: colors.brandBorder,
  },
  heroCard: {
    borderRadius: radii['2xl'],
    padding: spacing['2xl'],
    overflow: 'hidden',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  heroEyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroEyebrowText: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.7,
  },
  heroTime: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  heroTitle: {
    color: colors.white,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extrabold,
    lineHeight: ms(27),
    letterSpacing: -0.4,
  },
  heroBody: {
    marginTop: spacing.sm,
    color: 'rgba(255,255,255,0.84)',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(19),
  },
  focusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  focusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  focusChipText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  taskRow: {
    minHeight: ms(66),
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  checkbox: {
    width: ms(22),
    height: ms(22),
    borderRadius: ms(7),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderFocus,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  taskCopy: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  taskTitle: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: ms(20),
  },
  completedText: {
    color: colors.muted,
    textDecorationLine: 'line-through',
  },
  taskMeta: {
    marginTop: spacing.xxs,
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  overdueMeta: {
    color: colors.errorDark,
  },
  priorityPill: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  priorityHigh: {
    backgroundColor: colors.errorSoft,
  },
  priorityMedium: {
    backgroundColor: colors.warningSoft,
  },
  priorityText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  priorityHighText: {
    color: colors.errorDark,
  },
  priorityMediumText: {
    color: colors.warningText,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  meetingRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingVertical: spacing.lg,
  },
  timeColumn: {
    width: ms(48),
    alignItems: 'flex-end',
    paddingTop: spacing.xxs,
  },
  meetingTime: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  meetingPeriod: {
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  timeline: {
    width: ms(28),
    alignItems: 'center',
  },
  timelineDot: {
    width: ms(10),
    height: ms(10),
    borderRadius: ms(5),
    marginTop: spacing.xs,
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
    borderColor: '#DBEAFE',
  },
  timelineLine: {
    width: StyleSheet.hairlineWidth,
    flex: 1,
    marginTop: spacing.xs,
    marginBottom: -spacing.lg,
    backgroundColor: colors.borderFocus,
  },
  meetingCopy: {
    flex: 1,
  },
  meetingTitle: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  meetingMeta: {
    marginTop: spacing.xxs,
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  meetingNote: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(18),
  },
  followUpRow: {
    minHeight: ms(76),
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  avatar: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(14),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarPurple: {
    backgroundColor: colors.primaryLight,
  },
  avatarBlue: {
    backgroundColor: '#EAF5FF',
  },
  avatarTeal: {
    backgroundColor: '#E6F7F4',
  },
  avatarText: {
    color: colors.primaryDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.extrabold,
  },
  followUpCopy: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  followUpName: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  followUpReason: {
    marginTop: spacing.xxs,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  followUpMeta: {
    marginTop: spacing.xs,
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  insightBlock: {
    paddingVertical: spacing.md,
  },
  insightBlockSpaced: {
    paddingBottom: 0,
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
    letterSpacing: 0.4,
  },
  insightSource: {
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  insightTitle: {
    marginTop: spacing.md,
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    lineHeight: ms(21),
  },
  insightBody: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(19),
  },
  insightAction: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  insightActionText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  insightDivider: {
    marginTop: spacing.md,
  },
  endNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
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
