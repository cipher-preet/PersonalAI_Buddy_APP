import { colors } from '../../theme';
import type { CalendarEventTone } from '../../store/api/calendar';

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

export const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const isSameDay = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

export const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateLabel = (date: Date) =>
  date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const formatTimeLabel = (date: Date) => {
  const hour24 = date.getHours();
  const minute = date.getMinutes();
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
};

export const formatHour = (hour: number) => {
  if (hour === 12) {
    return '12 PM';
  }
  if (hour > 12) {
    return `${hour - 12} PM`;
  }
  if (hour === 0) {
    return '12 AM';
  }
  return `${hour} AM`;
};

export const parseTimeToHours = (label: string) => {
  const match = label.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return null;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hour < 12) {
    hour += 12;
  }
  if (period === 'AM' && hour === 12) {
    hour = 0;
  }

  return hour + minute / 60;
};

export const normalizeEventHours = (startLabel: string, endLabel: string) => {
  const start = parseTimeToHours(startLabel) ?? 9;
  let end = parseTimeToHours(endLabel) ?? start + 1;
  if (end <= start) {
    end = start >= 12 && end < 12 ? end + 24 : start + 1;
  }
  return { start, end };
};

export type TimedCalendarEvent<T> = {
  event: T;
  start: number;
  end: number;
  top: number;
  height: number;
  column: number;
  columnCount: number;
};

export const layoutEventsInTimeSlots = <T,>(
  items: Array<{ event: T; start: number; end: number }>,
  startHour: number,
  hourHeight: number,
  minHeight: number,
  gap: number,
): Array<TimedCalendarEvent<T>> => {
  const sorted = [...items].sort(
    (first, second) => first.start - second.start || second.end - first.end,
  );

  const columnEnds: number[] = [];
  const withColumns = sorted.map(item => {
    let column = columnEnds.findIndex(end => end <= item.start + 0.001);
    if (column < 0) {
      column = columnEnds.length;
      columnEnds.push(item.end);
    } else {
      columnEnds[column] = item.end;
    }
    return { ...item, column };
  });

  return withColumns.map(item => {
    const overlapping = withColumns.filter(
      other => other.start < item.end && other.end > item.start,
    );
    const columnCount = Math.max(
      1,
      ...overlapping.map(other => other.column + 1),
    );
    const top = (item.start - startHour) * hourHeight;
    const height = Math.max(
      minHeight,
      (item.end - item.start) * hourHeight - gap,
    );
    return { ...item, top, height, columnCount };
  });
};

export const parseTimeLabelToDate = (dateKey: string, timeLabel: string) => {
  const base = new Date(`${dateKey}T12:00:00`);
  const hours = parseTimeToHours(timeLabel);
  if (hours == null || Number.isNaN(base.getTime())) {
    return new Date();
  }

  const hour = Math.floor(hours);
  const minute = Math.round((hours - hour) * 60);
  base.setHours(hour, minute, 0, 0);
  return base;
};

export const createDefaultStart = (date: Date) => {
  const next = new Date(date);
  const now = new Date();

  if (isSameDay(date, now)) {
    next.setHours(now.getHours() + 1, 0, 0, 0);
    if (!isSameDay(next, date)) {
      next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      next.setHours(21, 0, 0, 0);
    }
  } else {
    next.setHours(9, 0, 0, 0);
  }

  return next;
};

export const createDefaultEnd = (start: Date) => {
  const next = new Date(start);
  if (start.getHours() >= 23) {
    next.setHours(23, 45, 0, 0);
    return next;
  }
  next.setHours(start.getHours() + 1, start.getMinutes(), 0, 0);
  return next;
};

export const eventToneColors = (tone: CalendarEventTone) => {
  if (tone === 'violet') {
    return {
      background: colors.primarySoft,
      accent: colors.primaryPurple,
      time: colors.primaryPurpleDark,
    };
  }
  if (tone === 'cyan') {
    return {
      background: colors.overlay,
      accent: colors.accentCyan,
      time: colors.info,
    };
  }
  if (tone === 'teal') {
    return {
      background: colors.successSoft,
      accent: colors.success,
      time: colors.successText,
    };
  }
  return {
    background: colors.primaryLight,
    accent: colors.primary,
    time: colors.primaryDark,
  };
};
