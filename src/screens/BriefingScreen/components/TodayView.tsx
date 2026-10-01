import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../theme';
import type {
  AgendaItem,
  AgendaKind,
  BriefingNote,
  BriefingTask,
  BriefingTaskPriority,
} from '../briefingTypes';
import { parseTimeLabelToMinutes } from '../briefingUtils';
import { Avatars, SectionHeader, Tag, cardStyle } from './BriefingParts';
import {
  ArrowUpRightIcon,
  BellIcon,
  CalendarIcon,
  TargetIcon,
} from './briefingIcons';

const KIND_META: Record<
  AgendaKind,
  { label: string; color: string; soft: string }
> = {
  meeting: {
    label: 'Meeting',
    color: colors.primary,
    soft: colors.primaryLight,
  },
  focus: { label: 'Focus', color: colors.success, soft: colors.successSoft },
  reminder: {
    label: 'Reminder',
    color: colors.primaryPurple,
    soft: colors.purpleLight,
  },
};

const PRIORITY_META: Record<
  BriefingTaskPriority,
  { color: string; bg: string }
> = {
  High: { color: colors.errorDark, bg: colors.errorSoft },
  Medium: { color: colors.warningText, bg: colors.warningSoft },
  Low: { color: colors.subText, bg: colors.lightGray },
};

const KindIcon = ({
  kind,
  color,
  size,
}: {
  kind: AgendaKind;
  color: string;
  size: number;
}) => {
  if (kind === 'meeting') {
    return <CalendarIcon color={color} size={size} />;
  }
  if (kind === 'reminder') {
    return <BellIcon color={color} size={size} />;
  }
  return <TargetIcon color={color} size={size} />;
};

const formatStartsIn = (diff: number) => {
  if (diff <= 0) {
    return 'Happening now';
  }
  if (diff < 60) {
    return `Starts in ${diff} min`;
  }
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  return `Starts in ${hours} h${minutes ? ` ${minutes} min` : ''}`;
};

const taskSubtitle = (task: BriefingTask) =>
  [task.overdue ? task.due : null, task.reason || task.space]
    .filter(Boolean)
    .join(' · ');

type Props = {
  focus: BriefingNote[];
  agenda: AgendaItem[];
  tasks: BriefingTask[];
  followUps: BriefingNote[];
  risks: BriefingNote[];
  nowMinutes: number | null;
  onToggleTask: (id: string) => void;
  onOpenCalendar: () => void;
  onOpenTasks: () => void;
};

const TodayView = ({
  focus,
  agenda,
  tasks,
  followUps,
  risks,
  nowMinutes: liveMinutes,
  onToggleTask,
  onOpenCalendar,
  onOpenTasks,
}: Props) => {
  const isLiveDay = liveMinutes !== null;
  const nowMinutes = liveMinutes ?? -1;
  const timeline = agenda.map(item => {
    const start = parseTimeLabelToMinutes(item.startTime) ?? 0;
    const end = parseTimeLabelToMinutes(item.endTime) ?? start;
    return {
      item,
      start,
      isPast: end < nowMinutes || (end === start && start < nowMinutes),
      isLive: start <= nowMinutes && nowMinutes < end,
    };
  });
  const upNext = isLiveDay ? timeline.find(entry => !entry.isPast) : undefined;
  const doneCount = tasks.filter(task => task.done).length;
  const progress = tasks.length ? doneCount / tasks.length : 0;

  return (
    <View style={styles.container}>
      {upNext ? (
        <View style={styles.upNextCard}>
          <View style={styles.upNextTop}>
            <View style={styles.upNextLabel}>
              <View
                style={[
                  styles.liveDot,
                  !upNext.isLive && { backgroundColor: colors.accentCyan },
                ]}
              />
              <Text style={styles.upNextLabelText}>
                {upNext.isLive ? 'NOW' : 'UP NEXT'}
              </Text>
            </View>
            <Text style={styles.upNextStarts}>
              {formatStartsIn(upNext.start - nowMinutes)}
            </Text>
          </View>

          <Text style={styles.upNextTitle} numberOfLines={2}>
            {upNext.item.title}
          </Text>
          <Text style={styles.upNextTime}>
            {upNext.item.startTime}
            {upNext.item.endTime ? ` – ${upNext.item.endTime}` : ''}
            {upNext.item.location ? `  ·  ${upNext.item.location}` : ''}
          </Text>

          {upNext.item.attendees?.length ? (
            <View style={styles.upNextFooter}>
              <Avatars names={upNext.item.attendees} />
              <Text style={styles.upNextPeople}>
                {upNext.item.attendees.length} people
              </Text>
            </View>
          ) : null}
        </View>
      ) : isLiveDay ? (
        <View style={[styles.upNextCard, styles.allDoneCard]}>
          <Text style={styles.allDoneTitle}>You’re all caught up</Text>
          <Text style={styles.allDoneText}>
            Nothing else is scheduled for today.
          </Text>
        </View>
      ) : null}

      {focus.length ? (
        <View>
          <SectionHeader title="Top priorities" meta={`${focus.length}`} />
          <View style={styles.card}>
            {focus.map((item, index) => (
              <View
                key={item.id}
                style={[styles.followRow, index > 0 && styles.rowDivider]}
              >
                <View style={styles.focusNumber}>
                  <Text style={styles.focusNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.taskCopy}>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  {item.detail ? (
                    <Text style={styles.taskSpace}>{item.detail}</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {agenda.length ? (
        <View>
          <SectionHeader
            title="Schedule"
            meta={`${agenda.length}`}
            actionLabel="Calendar"
            onActionPress={onOpenCalendar}
          />
          <View style={styles.card}>
            {timeline.map(({ item, isPast, isLive }, index) => {
              const kind = KIND_META[item.kind];
              return (
                <View
                  key={item.id}
                  style={[
                    styles.agendaRow,
                    index > 0 && styles.rowDivider,
                    isPast && styles.pastRow,
                  ]}
                >
                  <View style={styles.agendaTime}>
                    <Text style={styles.agendaStart}>{item.startTime}</Text>
                    {item.endTime ? (
                      <Text style={styles.agendaEnd}>{item.endTime}</Text>
                    ) : null}
                  </View>
                  <View
                    style={[styles.agendaBar, { backgroundColor: kind.color }]}
                  />
                  <View style={styles.agendaCopy}>
                    <Text
                      style={[styles.agendaTitle, isPast && styles.pastTitle]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <View style={styles.agendaMetaRow}>
                      <KindIcon kind={item.kind} color={kind.color} size={12} />
                      <Text style={styles.agendaMeta} numberOfLines={1}>
                        {kind.label}
                        {item.location ? ` · ${item.location}` : ''}
                      </Text>
                    </View>
                    {item.prep ? (
                      <Text style={styles.agendaPrep} numberOfLines={2}>
                        {item.prep}
                      </Text>
                    ) : null}
                  </View>
                  {isLive ? (
                    <Tag
                      label="Now"
                      color={colors.successText}
                      bg={colors.successSoft}
                    />
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      {tasks.length ? (
        <View>
          <SectionHeader
            title="Tasks"
            meta={`${doneCount}/${tasks.length} done`}
            actionLabel="See all"
            onActionPress={onOpenTasks}
          />
          <View style={styles.card}>
            <View style={styles.progressWrap}>
              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFill, { width: `${progress * 100}%` }]}
                />
              </View>
            </View>
            {tasks.map(task => {
              const priority = PRIORITY_META[task.priority];
              return (
                <TouchableOpacity
                  key={task.id}
                  activeOpacity={0.8}
                  onPress={() => onToggleTask(task.id)}
                  style={[styles.taskRow, styles.rowDivider]}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: task.done }}
                >
                  <View
                    style={[styles.radio, task.done && styles.radioChecked]}
                  >
                    {task.done ? <View style={styles.radioInner} /> : null}
                  </View>
                  <View style={styles.taskCopy}>
                    <Text
                      style={[
                        styles.taskTitle,
                        task.done && styles.taskTitleDone,
                      ]}
                      numberOfLines={2}
                    >
                      {task.title}
                    </Text>
                    {taskSubtitle(task) ? (
                      <Text
                        style={[
                          styles.taskSpace,
                          task.overdue && styles.overdueText,
                        ]}
                        numberOfLines={2}
                      >
                        {taskSubtitle(task)}
                      </Text>
                    ) : null}
                  </View>
                  <Tag
                    label={task.priority}
                    color={priority.color}
                    bg={priority.bg}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : null}

      {risks.length ? (
        <View>
          <SectionHeader title="Heads-up" meta={`${risks.length}`} />
          <View style={styles.card}>
            {risks.map((item, index) => (
              <View
                key={item.id}
                style={[styles.followRow, index > 0 && styles.rowDivider]}
              >
                <View style={[styles.followIcon, styles.riskIcon]}>
                  <Text style={styles.riskMark}>!</Text>
                </View>
                <View style={styles.taskCopy}>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  {item.detail ? (
                    <Text style={styles.taskSpace}>{item.detail}</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {followUps.length ? (
        <View>
          <SectionHeader title="Follow-ups" meta={`${followUps.length}`} />
          <View style={styles.card}>
            {followUps.map((item, index) => (
              <View
                key={item.id}
                style={[styles.followRow, index > 0 && styles.rowDivider]}
              >
                <View style={styles.followIcon}>
                  <ArrowUpRightIcon color={colors.warningText} size={14} />
                </View>
                <View style={styles.taskCopy}>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  {item.detail ? (
                    <Text style={styles.taskSpace}>{item.detail}</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default TodayView;

const styles = StyleSheet.create({
  container: {
    gap: spacing['4xl'],
  },
  card: {
    ...cardStyle,
    paddingHorizontal: spacing.xl,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },

  upNextCard: {
    ...cardStyle,
    padding: spacing['2xl'],
    borderColor: colors.brandBorder,
    backgroundColor: colors.primarySoft,
  },
  upNextTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  upNextLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.brandBorder,
  },
  liveDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: colors.successBright,
  },
  upNextLabelText: {
    color: colors.primaryDark,
    fontSize: ms(10),
    fontWeight: fontWeight.extrabold,
    letterSpacing: 0.5,
  },
  upNextStarts: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  upNextTitle: {
    marginTop: spacing.xl,
    color: colors.black,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.3,
    lineHeight: ms(24),
  },
  upNextTime: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  upNextFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.brandBorder,
    borderStyle: 'dashed',
  },
  upNextPeople: {
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  allDoneCard: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  allDoneTitle: {
    color: colors.black,
    fontSize: fontSize.base,
    fontWeight: fontWeight.extrabold,
  },
  allDoneText: {
    marginTop: spacing.xs,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  agendaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.xl,
  },
  pastRow: {
    opacity: 0.5,
  },
  agendaTime: {
    width: ms(60),
  },
  agendaStart: {
    color: colors.black,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  agendaEnd: {
    marginTop: spacing.xxs,
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  agendaBar: {
    width: ms(3),
    alignSelf: 'stretch',
    borderRadius: radii.pill,
  },
  agendaCopy: {
    flex: 1,
    minWidth: 0,
  },
  agendaTitle: {
    color: colors.black,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  pastTitle: {
    textDecorationLine: 'line-through',
  },
  agendaMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  agendaMeta: {
    flexShrink: 1,
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },

  progressWrap: {
    paddingVertical: spacing.xl,
  },
  progressTrack: {
    height: ms(6),
    borderRadius: radii.pill,
    backgroundColor: colors.lightGray,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.successBright,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.xl,
  },
  radio: {
    width: ms(20),
    height: ms(20),
    borderRadius: ms(10),
    borderWidth: 2,
    borderColor: colors.borderFocus,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  radioChecked: {
    borderColor: colors.successBright,
    backgroundColor: colors.successBright,
  },
  radioInner: {
    width: ms(7),
    height: ms(7),
    borderRadius: ms(3.5),
    backgroundColor: colors.white,
  },
  taskCopy: {
    flex: 1,
    minWidth: 0,
  },
  taskTitle: {
    color: colors.black,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: ms(20),
  },
  taskTitleDone: {
    color: colors.muted,
    textDecorationLine: 'line-through',
  },
  taskSpace: {
    marginTop: spacing.xxs,
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  followRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.xl,
  },
  followIcon: {
    width: ms(30),
    height: ms(30),
    borderRadius: ms(15),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.warningSoft,
  },
  riskIcon: {
    backgroundColor: colors.errorSoft,
  },
  riskMark: {
    color: colors.errorDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold,
  },
  overdueText: {
    color: colors.errorDark,
  },
  focusNumber: {
    width: ms(26),
    height: ms(26),
    borderRadius: radii.xs,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  focusNumberText: {
    color: colors.primaryDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.extrabold,
  },
  agendaPrep: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: ms(16),
  },
});
