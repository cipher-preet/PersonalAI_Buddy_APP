import { NativeModules, Platform } from 'react-native';

export const REMINDER_ALERT_EVENT = 'BuddyReminderAlert';
export const SNOOZE_MINUTES = 5;

export type ReminderAlertType =
  | 'reminder_notification'
  | 'reminder_alarm'
  | 'ai_reminder_call';

export type ReminderAlertAction =
  | 'incoming'
  | 'answer'
  | 'reject'
  | 'stop'
  | 'snooze'
  | 'open'
  | 'fire';

export type ReminderAlertPayload = {
  reminderId?: string;
  title: string;
  message: string;
  type: ReminderAlertType;
  action: ReminderAlertAction;
  callId?: string;
  autoAnswer?: boolean;
};

type BuddyNotificationsModule = {
  SNOOZE_MINUTES?: number;
  ensureChannels: () => Promise<boolean>;
  showReminder: (
    title: string,
    body: string,
    reminderId?: string,
    type?: string,
    callId?: string,
  ) => Promise<boolean>;
  stopAlert: () => Promise<boolean>;
  snoozeAlert: (
    reminderId: string,
    title: string,
    message: string,
    type: string,
    minutes: number,
  ) => Promise<boolean>;
  getPendingAlert: () => Promise<ReminderAlertPayload | null>;
  clearPendingAlert: () => Promise<boolean>;
};

const { BuddyNotifications } = NativeModules as {
  BuddyNotifications?: BuddyNotificationsModule;
};

export const hasBuddyNotifications = () =>
  Platform.OS === 'android' && Boolean(BuddyNotifications);

export const showReminderNotification = async (payload: {
  title: string;
  body: string;
  reminderId?: string;
  type?: string;
  callId?: string;
}) => {
  if (!BuddyNotifications) {
    throw new Error('Notifications are unavailable on this device.');
  }

  await BuddyNotifications.showReminder(
    payload.title,
    payload.body,
    payload.reminderId ?? '',
    payload.type ?? 'reminder_notification',
    payload.callId ?? '',
  );
};

const dismissedAtById = new Map<string, number>();
const DISMISS_TTL_MS = 15 * 60 * 1000;

const dismissedKey = (reminderId?: string) => reminderId?.trim() || '_empty';

export const markReminderAlertDismissed = (reminderId?: string) => {
  dismissedAtById.set(dismissedKey(reminderId), Date.now());
};

export const isReminderAlertDismissed = (reminderId?: string) => {
  const dismissedAt = dismissedAtById.get(dismissedKey(reminderId));
  if (!dismissedAt) {
    return false;
  }
  if (Date.now() - dismissedAt > DISMISS_TTL_MS) {
    dismissedAtById.delete(dismissedKey(reminderId));
    return false;
  }
  return true;
};

export const stopReminderAlert = async (reminderId?: string) => {
  markReminderAlertDismissed(reminderId);
  if (!BuddyNotifications) {
    return;
  }
  await BuddyNotifications.stopAlert();
};

export const snoozeReminderAlert = async (payload: {
  reminderId?: string;
  title: string;
  message: string;
  minutes?: number;
}) => {
  if (!BuddyNotifications) {
    throw new Error('Unable to snooze this alarm right now.');
  }

  await BuddyNotifications.snoozeAlert(
    payload.reminderId ?? '',
    payload.title,
    payload.message,
    'reminder_alarm',
    payload.minutes ?? SNOOZE_MINUTES,
  );
};

export const getPendingReminderAlert = async () => {
  if (!BuddyNotifications) {
    return null;
  }
  return BuddyNotifications.getPendingAlert();
};

export const ensureReminderChannels = async () => {
  if (!BuddyNotifications) {
    return;
  }
  await BuddyNotifications.ensureChannels();
};
