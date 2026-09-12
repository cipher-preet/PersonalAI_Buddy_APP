export type PlanLimitResource = 'spaces' | 'notes' | 'tasks' | 'recordingHours';

const collectMessages = (value: unknown): string[] => {
  if (!value) {
    return [];
  }

  if (typeof value === 'string') {
    return [value];
  }

  if (typeof value !== 'object') {
    return [];
  }

  const record = value as Record<string, unknown>;
  const messages: string[] = [];

  ['message', 'error', 'raw'].forEach(key => {
    const entry = record[key];

    if (typeof entry === 'string') {
      messages.push(entry);
    }
  });

  if (record.data) {
    messages.push(...collectMessages(record.data));
  }

  return messages;
};

export const getPlanLimitResource = (
  error: unknown,
): PlanLimitResource | undefined => {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const record = error as Record<string, any>;
  const resource =
    record.data?.data?.resource ||
    record.data?.resource ||
    record.resource;
  const message = collectMessages(error).join(' ');

  if (
    resource === 'spaces' ||
    resource === 'notes' ||
    resource === 'tasks' ||
    resource === 'recordingHours'
  ) {
    return resource;
  }

  if (/recording time|meeting recording|listening/i.test(message)) {
    return 'recordingHours';
  }

  if (/more notes/i.test(message)) {
    return 'notes';
  }

  if (/more tasks/i.test(message)) {
    return 'tasks';
  }

  if (/more spaces/i.test(message)) {
    return 'spaces';
  }

  return undefined;
};

export const getPlanLimitPrompt = (resource?: PlanLimitResource) => {
  if (resource === 'notes') {
    return {
      title: 'Note limit reached',
      message:
        'Your current plan has no more notes left. Upgrade to keep capturing ideas.',
    };
  }

  if (resource === 'tasks') {
    return {
      title: 'Task limit reached',
      message:
        'Your current plan has no more tasks left. Upgrade to keep planning work.',
    };
  }

  if (resource === 'recordingHours') {
    return {
      title: 'Recording time used up',
      message:
        'You have used the listening time included in your plan. Upgrade to keep recording meetings.',
    };
  }

  return {
    title: 'Space limit reached',
    message:
      'Your current plan has no more spaces left. Upgrade to create more workspaces.',
  };
};

export const isPlanLimitError = (error: unknown) => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const record = error as Record<string, any>;
  const status =
    record.status ??
    record.originalStatus ??
    record.data?.status ??
    record.data?.statusCode;
  const message = collectMessages(error).join(' ');

  return (
    Number(status) === 403 ||
    /free plan limit|limit reached|upgrade your plan|upgrade to pro|create more (spaces|notes|tasks)|recording time/i.test(
      message,
    )
  );
};
