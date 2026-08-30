import { PermissionsAndroid, Platform } from 'react-native';

export const getDevicePlatform = (): 'android' | 'ios' | 'web' =>
  Platform.OS === 'ios' ? 'ios' : 'android';

const requestAndroidNotificationPermission = async () => {
  if (Platform.OS !== 'android' || Number(Platform.Version) < 33) {
    return;
  }

  await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
};

export const getFcmToken = async (): Promise<string | null> => {
  try {
    await requestAndroidNotificationPermission();
    const messaging = require('@react-native-firebase/messaging').default;
    await messaging().registerDeviceForRemoteMessages();
    await messaging().requestPermission();
    const token = await messaging().getToken();
    return typeof token === 'string' && token.length >= 8 ? token : null;
  } catch {
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
