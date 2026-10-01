import type {
  BriefingListItem,
  BriefingSourceStats,
  BriefingStatus,
  BriefingTaskCard,
  DailyBriefingPayload,
} from '../../store/api/home';

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const emptyStats: BriefingSourceStats = {
  transcriptCount: 0,
  taskCount: 0,
  noteCount: 0,
  eventCount: 0,
  reminderCount: 0,
  pendingTranscriptCount: 0,
};

export const isPreparingStatus = (status?: BriefingStatus) =>
  status === 'PENDING' || status === 'PROCESSING';

export const formatDateKey = (dateKey?: string) => {
  if (!dateKey || !DATE_KEY_PATTERN.test(dateKey)) {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateKeyParts = (dateKey?: string) => {
  const source = dateKey && DATE_KEY_PATTERN.test(dateKey)
    ? (() => {
        const [year, month, day] = dateKey.split('-').map(Number);
        return new Date(year, month - 1, day);
      })()
    : new Date();

  return {
    month: source.toLocaleDateString('en-US', { month: 'short' }),
    day: source.getDate(),
    dayName: source.toLocaleDateString('en-US', { weekday: 'long' }),
  };
};

export const formatGeneratedAt = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const listOrEmpty = <T,>(value: T[] | undefined): T[] =>
  Array.isArray(value) ? value : [];

export const tasksFromBriefing = (
  briefing: DailyBriefingPayload,
): BriefingTaskCard[] => {
  const cards = listOrEmpty(briefing.tasks);
  if (cards.length) {
    return cards;
  }
  return listOrEmpty(briefing.pendingTasks).map(item => ({
    id: item.id,
    title: item.title,
    meta: item.detail,
  }));
};

export const deriveProgress = (briefing: DailyBriefingPayload) => {
  const done = listOrEmpty(briefing.completed).length;
  const pending = listOrEmpty(briefing.pendingTasks).length;
  const taskCards = listOrEmpty(briefing.tasks).length;
  const total = done + (pending || taskCards);
  const percent = total ? Math.round((done / total) * 100) : 0;
  return { done, total, percent };
};

export const sourceSummary = (stats: BriefingSourceStats | undefined) => {
  const safe = stats ?? emptyStats;
  const parts: string[] = [];
  if (safe.taskCount) {
    parts.push(`${safe.taskCount} task${safe.taskCount === 1 ? '' : 's'}`);
  }
  if (safe.noteCount) {
    parts.push(`${safe.noteCount} note${safe.noteCount === 1 ? '' : 's'}`);
  }
  if (safe.eventCount) {
    parts.push(`${safe.eventCount} meeting${safe.eventCount === 1 ? '' : 's'}`);
  }
  if (safe.reminderCount) {
    parts.push(
      `${safe.reminderCount} reminder${safe.reminderCount === 1 ? '' : 's'}`,
    );
  }
  if (safe.transcriptCount) {
    parts.push(
      `${safe.transcriptCount} capture${safe.transcriptCount === 1 ? '' : 's'}`,
    );
  }
  return parts.join(' · ') || 'No captured activity';
};

export const capturedCount = (stats: BriefingSourceStats | undefined) => {
  const safe = stats ?? emptyStats;
  return (
    safe.taskCount +
    safe.noteCount +
    safe.eventCount +
    safe.reminderCount +
    safe.transcriptCount
  );
};

export const isBriefingReady = (briefing?: DailyBriefingPayload) =>
  briefing?.status === 'READY';

export const sectionItems = (items?: BriefingListItem[]) =>
  listOrEmpty(items).filter(item => item.title.trim().length > 0);

export const toLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Minutes since midnight for labels like "9:30 AM"; null when unparseable. */
export const parseTimeLabelToMinutes = (label?: string | null) => {
  const match = label?.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) {
    return null;
  }
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3]?.toUpperCase();
  if (period === 'PM' && hour < 12) {
    hour += 12;
  }
  if (period === 'AM' && hour === 12) {
    hour = 0;
  }
  return hour * 60 + minute;
};

export const greetingForHour = (hour: number) => {
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
};

export type ScheduleEntryKind = 'meeting' | 'reminder';

export type ScheduleEntry = {
  id: string;
  kind: ScheduleEntryKind;
  title: string;
  timeLabel: string;
  endTimeLabel?: string;
  detail?: string;
  minutes: number | null;
  done: boolean;
};

type ScheduleEvent = {
  id: string;
  title: string;
  location?: string;
  description?: string;
  startTimeLabel: string;
  endTimeLabel: string;
};

type ScheduleReminder = {
  id: string;
  title: string;
  description?: string;
  timeLabel: string;
  expired?: boolean;
};

export const buildTodaySchedule = (
  events: ScheduleEvent[],
  reminders: ScheduleReminder[],
  nowMinutes: number,
): ScheduleEntry[] => {
  const entries: ScheduleEntry[] = [
    ...events.map(event => {
      const minutes = parseTimeLabelToMinutes(event.startTimeLabel);
      const endMinutes = parseTimeLabelToMinutes(event.endTimeLabel);
      return {
        id: `event-${event.id}`,
        kind: 'meeting' as const,
        title: event.title,
        timeLabel: event.startTimeLabel,
        endTimeLabel: event.endTimeLabel,
        detail: event.location || event.description || undefined,
        minutes,
        done: (endMinutes ?? minutes ?? Infinity) < nowMinutes,
      };
    }),
    ...reminders.map(reminder => {
      const minutes = parseTimeLabelToMinutes(reminder.timeLabel);
      return {
        id: `reminder-${reminder.id}`,
        kind: 'reminder' as const,
        title: reminder.title,
        timeLabel: reminder.timeLabel,
        detail: reminder.description || undefined,
        minutes,
        done: Boolean(reminder.expired) || (minutes ?? Infinity) < nowMinutes,
      };
    }),
  ];

  return entries.sort(
    (left, right) => (left.minutes ?? 24 * 60) - (right.minutes ?? 24 * 60),
  );
};
