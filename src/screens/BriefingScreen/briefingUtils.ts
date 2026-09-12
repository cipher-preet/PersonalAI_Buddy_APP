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
