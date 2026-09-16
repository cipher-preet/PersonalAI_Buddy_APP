import {
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  Platform,
  type EmitterSubscription,
} from 'react-native';

type PrecisionAudioNativeModule = {
  startRecording: (gainMultiplier: number) => Promise<string>;
  stopRecording: () => Promise<boolean>;
  addListener: (eventName: string) => void;
  removeListeners: (count: number) => void;
};

type MeteringEvent = {
  metering: number;
};

const precisionAudioModule = NativeModules.PrecisionAudioModule as
  | PrecisionAudioNativeModule
  | undefined;

const getPrecisionAudioModule = (): PrecisionAudioNativeModule => {
  if (!precisionAudioModule) {
    throw new Error(
      'PrecisionAudioModule is unavailable. Rebuild the native application.',
    );
  }

  return precisionAudioModule;
};

export async function requestMicPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  const permission = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;
  if (await PermissionsAndroid.check(permission)) {
    return true;
  }

  const granted = await PermissionsAndroid.request(permission);
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export const startAudioCapture = async (
  gainMultiplier: number = 2.0,
): Promise<string> => {
  const hasPermission = await requestMicPermission();
  if (!hasPermission) {
    throw new Error('Microphone permission denied');
  }

  return getPrecisionAudioModule().startRecording(gainMultiplier);
};

export const stopAudioCapture = (): Promise<boolean> =>
  getPrecisionAudioModule().stopRecording();

export const addAudioMeteringListener = (
  listener: (metering: number) => void,
): EmitterSubscription => {
  const nativeModule = getPrecisionAudioModule();
  const eventEmitter = new NativeEventEmitter(nativeModule);

  return eventEmitter.addListener(
    'PrecisionAudioMetering',
    ({metering}: MeteringEvent) => listener(metering),
  );
};
