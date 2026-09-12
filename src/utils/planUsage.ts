import type { PlanStatus } from '../store/api/payments';

export const UNLIMITED_LIMIT = -1;
export const MS_PER_HOUR = 60 * 60 * 1000;

export const isUnlimitedLimit = (limit?: number | null) =>
  typeof limit === 'number' && limit < 0;

export const hasReachedCountLimit = (used = 0, limit?: number | null) => {
  if (isUnlimitedLimit(limit) || limit == null) {
    return false;
  }

  return used >= limit;
};

export const getRecordingUsedMs = (planStatus?: PlanStatus | null) => {
  if (typeof planStatus?.usage?.recordingMs === 'number') {
    return Math.max(0, planStatus.usage.recordingMs);
  }

  return Math.max(0, Math.round((planStatus?.usage?.recordingHours ?? 0) * MS_PER_HOUR));
};

export const getRecordingLimitMs = (planStatus?: PlanStatus | null) => {
  const hours = planStatus?.plan?.limits?.recordingHours;

  if (hours == null || hours < 0) {
    return UNLIMITED_LIMIT;
  }

  return hours * MS_PER_HOUR;
};

export const getRecordingRemainingMs = (
  planStatus?: PlanStatus | null,
  extraUsedMs = 0,
) => {
  const limitMs = getRecordingLimitMs(planStatus);

  if (limitMs === UNLIMITED_LIMIT) {
    return UNLIMITED_LIMIT;
  }

  return Math.max(0, limitMs - getRecordingUsedMs(planStatus) - extraUsedMs);
};

export const formatClock = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  return hours > 0 ? `${hours}:${mm}:${ss}` : `${minutes}:${ss}`;
};

export const formatHoursShort = (ms: number) => {
  const totalMinutes = Math.max(0, Math.ceil(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  if (totalMinutes > 0) {
    return `${minutes}m`;
  }

  return `${Math.max(0, Math.ceil(ms / 1000))}s`;
};

export const formatRecordingQuota = (
  usedMs: number,
  limitHours?: number | null,
) => {
  if (isUnlimitedLimit(limitHours)) {
    return 'Unlimited';
  }

  const limitMs = Math.max(0, (limitHours ?? 0) * MS_PER_HOUR);
  return `${formatHoursShort(usedMs)} of ${formatHoursShort(limitMs)}`;
};

export const getListeningCardCopy = ({
  isUploading,
  isChecking,
  isListening,
  spaceName,
  remainingMs,
  elapsedMs,
}: {
  isUploading: boolean;
  isChecking: boolean;
  isListening: boolean;
  spaceName?: string;
  remainingMs: number;
  elapsedMs: number;
}) => {
  if (isUploading) {
    return 'Uploading voice message...';
  }

  if (isChecking) {
    return 'Checking active space...';
  }

  const remainingLabel =
    remainingMs === UNLIMITED_LIMIT
      ? 'Unlimited time'
      : remainingMs <= 0
        ? 'No recording time left'
        : `${formatHoursShort(remainingMs)} remaining`;

  if (isListening) {
    return `${formatClock(elapsedMs)} · ${
      spaceName ? `In ${spaceName}` : remainingLabel
    }`;
  }

  return remainingLabel;
};
