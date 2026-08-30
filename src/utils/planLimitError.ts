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
    /free plan limit|limit reached|upgrade to pro|create more (spaces|notes|tasks)/i.test(
      message,
    )
  );
};
