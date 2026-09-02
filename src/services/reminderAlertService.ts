import { AppState, DeviceEventEmitter } from 'react-native';

import {
  dismissAlertScreen,
  navigateToAlertScreen,
} from '../navigation/navigationRef';
import {
  getPendingReminderAlert,
  hasBuddyNotifications,
  isReminderAlertDismissed,
  markReminderAlertDismissed,
  REMINDER_ALERT_EVENT,
  type ReminderAlertPayload,
} from './buddyNotifications';

const isAlertType = (value: string): value is ReminderAlertPayload['type'] =>
  value === 'reminder_notification' ||
  value === 'reminder_alarm' ||
  value === 'ai_reminder_call';

const normalizeAlert = (raw: ReminderAlertPayload | null | undefined) => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const type = isAlertType(raw.type) ? raw.type : 'reminder_notification';
  const title = (raw.title || 'Buddy').trim();
  const message = (raw.message || '').trim();

  return {
    reminderId: raw.reminderId || '',
    title,
    message,
    type,
    action: raw.action || 'incoming',
    callId: raw.callId || '',
    autoAnswer: Boolean(raw.autoAnswer),
  } satisfies ReminderAlertPayload;
};

const presentAlert = (alert: ReminderAlertPayload) => {
  if (alert.type === 'ai_reminder_call') {
    navigateToAlertScreen('ReminderCall', {
      reminderId: alert.reminderId,
      title: alert.title,
      message: alert.message,
      callId: alert.callId,
      autoAnswer: alert.autoAnswer || alert.action === 'answer',
    });
    return;
  }

  if (alert.type === 'reminder_alarm') {
    navigateToAlertScreen('ReminderAlarm', {
      reminderId: alert.reminderId,
      title: alert.title,
      message: alert.message,
    });
  }
};

const handleAlert = (raw: ReminderAlertPayload | null | undefined) => {
  const alert = normalizeAlert(raw);
  if (!alert) {
    return;
  }

  if (alert.action === 'reject' || alert.action === 'stop') {
    markReminderAlertDismissed(alert.reminderId);
    dismissAlertScreen(
      alert.type === 'ai_reminder_call' ? 'ReminderCall' : 'ReminderAlarm',
    );
    return;
  }

  if (
    (alert.action === 'incoming' ||
      alert.action === 'open' ||
      alert.action === 'fire') &&
    isReminderAlertDismissed(alert.reminderId)
  ) {
    return;
  }

  if (alert.action === 'snooze') {
    dismissAlertScreen('ReminderAlarm');
    return;
  }

  if (alert.type === 'ai_reminder_call') {
    const openedFromNotification =
      alert.action === 'answer' ||
      alert.action === 'open' ||
      alert.autoAnswer;
    if (!openedFromNotification && AppState.currentState !== 'active') {
      return;
    }
    presentAlert(alert);
    return;
  }

  if (alert.type === 'reminder_alarm') {
    presentAlert(alert);
  }
};

export const consumePendingReminderAlert = async () => {
  if (!hasBuddyNotifications()) {
    return;
  }

  try {
    const pending = await getPendingReminderAlert();
    handleAlert(pending);
  } catch (error) {
    console.warn('Failed to consume pending reminder alert', error);
  }
};

export const setupReminderAlertNavigation = () => {
  const subscription = DeviceEventEmitter.addListener(
    REMINDER_ALERT_EVENT,
    (payload: ReminderAlertPayload) => {
      handleAlert(payload);
    },
  );

  void consumePendingReminderAlert();

  return () => {
    subscription.remove();
  };
};
