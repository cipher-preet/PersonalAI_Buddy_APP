import type {
  BriefingListItem,
  DailyBriefingPayload,
} from '../../store/api/home';
import { formatDateKey, listOrEmpty } from './briefingUtils';
import type {
  AgendaItem,
  BriefingNote,
  BriefingTask,
  BriefingTaskPriority,
  BriefingView,
} from './briefingTypes';

const PRIORITIES: Record<string, BriefingTaskPriority> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? '' : 's'}`;

const toNotes = (items?: BriefingListItem[]): BriefingNote[] =>
  listOrEmpty(items)
    .filter(item => item.title?.trim())
    .map(item => ({
      id: item.id,
      title: item.title,
      detail: item.detail || undefined,
    }));

const toPriority = (priority?: string, meta?: string): BriefingTaskPriority => {
  const fromMeta = meta?.split('·')[0]?.trim().toLowerCase();
  return (
    PRIORITIES[priority?.toLowerCase() ?? ''] ??
    PRIORITIES[fromMeta ?? ''] ??
    'Medium'
  );
};

const toAgenda = (briefing: DailyBriefingPayload): AgendaItem[] => {
  const agenda = listOrEmpty(briefing.agenda);
  if (agenda.length) {
    return agenda.map(item => ({
      id: item.id,
      kind: item.kind === 'meeting' ? 'meeting' : 'reminder',
      title: item.title,
      startTime: item.time,
      endTime: item.endTime || undefined,
      location: item.location || undefined,
      prep: item.prep || undefined,
    }));
  }
  return listOrEmpty(briefing.meetings).map(item => ({
    id: item.id,
    kind: 'meeting',
    title: item.title,
    startTime: item.time,
    location: item.meta || undefined,
  }));
};

const toTasks = (briefing: DailyBriefingPayload): BriefingTask[] =>
  listOrEmpty(briefing.tasks).map(task => ({
    id: task.id,
    title: task.title,
    space: task.space ?? '',
    priority: toPriority(task.priority, task.meta),
    done: false,
    reason: task.reason || undefined,
    due: task.due || undefined,
    overdue: task.dueStatus === 'overdue',
  }));

const toFocus = (briefing: DailyBriefingPayload): BriefingNote[] => {
  const focus = listOrEmpty(briefing.focus);
  if (focus.length) {
    return focus.map(item => ({
      id: item.id,
      title: item.title,
      detail:
        [item.timeHint, item.why].filter(Boolean).join(' · ') || undefined,
    }));
  }
  return toNotes(briefing.tomorrowFocus);
};

const recapSummary = (briefing: DailyBriefingPayload) => {
  const stats = briefing.stats;
  const parts: string[] = [];
  if (stats?.completedTasks) {
    parts.push(`closed ${plural(stats.completedTasks, 'task')}`);
  }
  if (stats?.conversations) {
    parts.push(`captured ${plural(stats.conversations, 'conversation')}`);
  }
  if (stats?.chatMessages) {
    parts.push(`asked Buddy ${plural(stats.chatMessages, 'question')}`);
  }
  if (stats?.notes) {
    parts.push(`saved ${plural(stats.notes, 'note')}`);
  }
  if (!parts.length) {
    return briefing.headline || 'A quiet day with little captured activity.';
  }
  return `You ${parts.join(', ')}.`;
};

export const toBriefingView = (
  briefing: DailyBriefingPayload,
): BriefingView => {
  const stats = briefing.stats;
  return {
    headline: briefing.headline,
    summary: briefing.overview || briefing.headline,
    planDateKey: briefing.planDateKey || briefing.dateKey,
    focus: toFocus(briefing),
    agenda: toAgenda(briefing),
    tasks: toTasks(briefing),
    followUps: toNotes(briefing.followUps),
    risks: toNotes(briefing.risks),
    yesterday: {
      dateLabel: formatDateKey(briefing.dateKey),
      summary: recapSummary(briefing),
      stats: {
        completed:
          stats?.completedTasks ?? listOrEmpty(briefing.completed).length,
        meetings: briefing.sourceStats?.eventCount ?? 0,
        notes: stats?.notes ?? briefing.sourceStats?.noteCount ?? 0,
      },
      highlights: [
        ...toNotes(briefing.highlights),
        ...toNotes(briefing.importantMoments),
      ],
      decisions: toNotes(briefing.decisions),
      completed: toNotes(briefing.completed),
      people: listOrEmpty(briefing.people),
    },
  };
};
