import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

export type CallSyncCompatibility = {
  isSupported: boolean;
  manufacturer: string;
  isConfigured: boolean;
};

export type ManualSyncResult = {
  scanned: number;
  uploaded: number;
  failed: number;
  recordingPending: boolean;
  errorCode?: string;
};

type CallSyncNativeModule = {
  setActiveUser(userId: string | null): Promise<boolean>;
  getWhitelistedNumbers(): Promise<string[]>;
  addNumberToWhitelist(number: string): Promise<boolean>;
  removeNumberFromWhitelist(number: string): Promise<boolean>;
  triggerManualSync(): Promise<ManualSyncResult>;
  checkOemCompatibility(): Promise<CallSyncCompatibility>;
};

const nativeModule = NativeModules.CallSyncBridge as
  | CallSyncNativeModule
  | undefined;

const requireModule = () => {
  if (Platform.OS !== 'android' || !nativeModule) {
    throw new Error(
      'Call recording sync is only available in the Android app.',
    );
  }
  return nativeModule;
};

export const normalizePhoneNumber = (raw: string): string | null => {
  const value = raw.trim();
  const digits = value.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) return null;
  return digits;
};

export const setActiveCallSyncUser = (userId: string | null) =>
  Platform.OS === 'android' && nativeModule
    ? nativeModule.setActiveUser(userId)
    : Promise.resolve(false);

export const getWhitelistedNumbers = () =>
  requireModule().getWhitelistedNumbers();
export const addNumberToWhitelist = (number: string) =>
  requireModule().addNumberToWhitelist(number);
export const removeNumberFromWhitelist = (number: string) =>
  requireModule().removeNumberFromWhitelist(number);
export const triggerManualSync = () => requireModule().triggerManualSync();
export const checkOemCompatibility = () =>
  requireModule().checkOemCompatibility();

export const requestCallSyncPermissions = async () => {
  if (Platform.OS !== 'android') return false;
  const permissions = [
    PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
    PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
    Platform.Version >= 33
      ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
      : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    ...(Platform.Version >= 33
      ? [PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS]
      : []),
  ];
  const result = await PermissionsAndroid.requestMultiple(permissions);
  const requiredPermissions = permissions.filter(
    permission =>
      permission !== PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  return requiredPermissions.every(
    permission => result[permission] === PermissionsAndroid.RESULTS.GRANTED,
  );
};

export const requestContactsPermission = async () => {
  if (Platform.OS !== 'android') return false;
  const permission = PermissionsAndroid.PERMISSIONS.READ_CONTACTS;
  const current = await PermissionsAndroid.check(permission);
  return (
    current ||
    (await PermissionsAndroid.request(permission)) ===
      PermissionsAndroid.RESULTS.GRANTED
  );
};
