import { PermissionsAndroid, Platform } from 'react-native';
import {
  getMessaging,
  getToken,
  isDeviceRegisteredForRemoteMessages,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
} from '@react-native-firebase/messaging';

export const getDevicePlatform = (): 'android' | 'ios' | 'web' =>
  Platform.OS === 'ios' ? 'ios' : 'android';

export const ensureNotificationPermission = async () => {
  if (Platform.OS !== 'android' || Number(Platform.Version) < 33) {
    return true;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
};

export const getFcmToken = async (): Promise<string | null> => {
  try {
    await ensureNotificationPermission();
    const messaging = getMessaging();

    if (!isDeviceRegisteredForRemoteMessages(messaging)) {
      await registerDeviceForRemoteMessages(messaging);
    }

    const token = await getToken(messaging);
    return typeof token === 'string' && token.length >= 8 ? token : null;
  } catch (error) {
    console.warn('Failed to get FCM token', error);
    return null;
  }
};

export const getAuthDevicePayload = async () => {
  const fcmToken = await getFcmToken();
  if (!fcmToken) {
    return {};
  }

  return {
    fcmToken,
    platform: getDevicePlatform(),
  };
};

export const subscribeToFcmTokenRefresh = (
  onToken: (token: string) => void,
) => {
  try {
    return onTokenRefresh(getMessaging(), token => {
      if (typeof token === 'string' && token.length >= 8) {
        onToken(token);
      }
    });
  } catch (error) {
    console.warn('Failed to subscribe to FCM token refresh', error);
    return () => undefined;
  }
};
