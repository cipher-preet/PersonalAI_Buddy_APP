import { Platform } from 'react-native';
import {
  getInitialNotification,
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
} from '@react-native-firebase/messaging';

import { ensureNotificationPermission } from './fcmTokenService';
import {
  ensureReminderChannels,
  isReminderAlertDismissed,
  showReminderNotification,
} from './buddyNotifications';

type RemoteNotificationMessage = {
  notification?: {
    title?: string | null;
    body?: string | null;
  };
  data?: Record<string, string>;
};

const REMINDER_TYPES = new Set([
  'reminder_notification',
  'reminder_alarm',
  'ai_reminder_call',
]);

const readString = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value.trim() : '';

export const displayReminderFromRemoteMessage = async (
  remoteMessage: RemoteNotificationMessage | null | undefined,
) => {
  if (!remoteMessage) {
    return;
  }

  const data = remoteMessage.data ?? {};
  const type = readString(data.type) || 'reminder_notification';
  if (data.type && !REMINDER_TYPES.has(type)) {
    return;
  }

  const reminderId = readString(data.reminderId);
  if (
    (type === 'reminder_alarm' || type === 'ai_reminder_call') &&
    isReminderAlertDismissed(reminderId)
  ) {
    return;
  }

  const title =
    readString(remoteMessage.notification?.title) ||
    readString(data.title) ||
    'Buddy';
  const body =
    readString(remoteMessage.notification?.body) ||
    readString(data.message);

  try {
    await showReminderNotification({
      title,
      body,
      reminderId,
      type,
      callId: readString(data.callId),
    });
  } catch (error) {
    console.warn('Failed to display reminder notification', error);
  }
};

export const setupReminderNotifications = () => {
  if (Platform.OS !== 'android') {
    return () => undefined;
  }

  void (async () => {
    await ensureNotificationPermission();
    await ensureReminderChannels();
  })();

  const messaging = getMessaging();
  const unsubscribeMessage = onMessage(messaging, async remoteMessage => {
    await displayReminderFromRemoteMessage(remoteMessage);
  });
  const unsubscribeOpened = onNotificationOpenedApp(messaging, async remoteMessage => {
    const type = readString(remoteMessage?.data?.type);
    if (type === 'reminder_alarm' || type === 'ai_reminder_call') {
      return;
    }
    await displayReminderFromRemoteMessage(remoteMessage);
  });
  void getInitialNotification(messaging).then(remoteMessage => {
    const type = readString(remoteMessage?.data?.type);
    if (type === 'reminder_alarm' || type === 'ai_reminder_call') {
      return;
    }
    if (remoteMessage) {
      void displayReminderFromRemoteMessage(remoteMessage);
    }
  });

  return () => {
    unsubscribeMessage();
    unsubscribeOpened();
  };
};
