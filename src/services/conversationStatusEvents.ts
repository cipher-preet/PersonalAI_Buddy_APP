import { BUDDY_ENDPOINTS } from '../config/apiConfig';

type EventSourceMessage = {
  event?: string;
  data: string;
};

export type ConversationStatusEvent = {
  userId?: string;
  spaceId?: string;
  conversationId?: string;
  status?: string;
  extractionRunStatus?: string;
  eventType?: string;
  raw: unknown;
};

type SubscribeParams = {
  userId: string;
  token?: string | null;
  onStatusChange: (event: ConversationStatusEvent) => void;
  onError?: (error: unknown) => void;
};

const SSE_RECORD_SEPARATOR = /\r?\n\r?\n/;

const readString = (value: unknown) =>
  typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined;

const readNestedString = (source: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const directValue = readString(source[key]);

    if (directValue) {
      return directValue;
    }
  }

  return undefined;
};

const normalizeStatusEvent = (
  message: EventSourceMessage,
): ConversationStatusEvent | null => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(message.data);
  } catch {
    parsed = message.data;
  }

  if (!parsed || typeof parsed !== 'object') {
    return null;
  }

  const payload = parsed as Record<string, unknown>;
  const data =
    payload.data && typeof payload.data === 'object'
      ? (payload.data as Record<string, unknown>)
      : payload;
  const extractionRun =
    data.extractionRun && typeof data.extractionRun === 'object'
      ? (data.extractionRun as Record<string, unknown>)
      : undefined;

  const spaceId = readNestedString(data, ['spaceId', 'space_id']);

  if (!spaceId) {
    return null;
  }

  return {
    userId: readNestedString(data, ['userId', 'user_id']),
    spaceId,
    conversationId: readNestedString(data, [
      'conversationId',
      'conversation_id',
    ]),
    status: readString(data.status),
    extractionRunStatus:
      readString(data.extractionRunStatus) || readString(extractionRun?.status),
    eventType:
      readString(payload.eventType) ||
      readString(data.eventType) ||
      message.event,
    raw: parsed,
  };
};

const parseSseMessage = (record: string): EventSourceMessage | null => {
  const lines = record.split(/\r?\n/);
  const dataLines: string[] = [];
  let event: string | undefined;

  lines.forEach(line => {
    if (line.startsWith('event:')) {
      event = line.slice('event:'.length).trim();
      return;
    }

    if (line.startsWith('data:')) {
      dataLines.push(line.slice('data:'.length).trimStart());
    }
  });

  if (dataLines.length === 0) {
    return null;
  }

  return {
    event,
    data: dataLines.join('\n'),
  };
};

const buildEventsUrl = (userId: string) => {
  const query = `userId=${encodeURIComponent(userId)}`;

  return `${BUDDY_ENDPOINTS.conversationEvents}?${query}`;
};

export const subscribeToConversationStatusEvents = ({
  userId,
  token,
  onStatusChange,
  onError,
}: SubscribeParams) => {
  const xhr = new XMLHttpRequest();
  let processedLength = 0;
  let pendingRecord = '';
  let isClosed = false;

  const processRecords = () => {
    const response = xhr.responseText || '';
    const nextChunk = response.slice(processedLength);
    processedLength = response.length;

    if (!nextChunk) {
      return;
    }

    pendingRecord += nextChunk;
    const records = pendingRecord.split(SSE_RECORD_SEPARATOR);
    pendingRecord = records.pop() || '';

    records.forEach(record => {
      const message = parseSseMessage(record);
      const statusEvent = message ? normalizeStatusEvent(message) : null;

      if (statusEvent) {
        onStatusChange(statusEvent);
      }
    });
  };

  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.LOADING) {
      processRecords();
      return;
    }

    if (xhr.readyState === XMLHttpRequest.DONE && !isClosed) {
      processRecords();

      if (xhr.status !== 200) {
        onError?.({
          status: xhr.status,
          message: 'Conversation status SSE connection closed.',
        });
      }
    }
  };

  xhr.onerror = error => {
    if (!isClosed) {
      onError?.(error);
    }
  };

  xhr.open('GET', buildEventsUrl(userId), true);
  xhr.setRequestHeader('Accept', 'text/event-stream');
  xhr.setRequestHeader('Cache-Control', 'no-cache');
  xhr.setRequestHeader('ngrok-skip-browser-warning', 'true');

  if (token) {
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
  }

  xhr.send();

  return () => {
    isClosed = true;
    xhr.abort();
  };
};
