import {
  PermissionsAndroid,
  Permission,
  PermissionStatus,
  Platform,
} from 'react-native';
import AudioRecorderPlayer, {
  AudioEncoderAndroidType,
  AudioSet,
  AudioSourceAndroidType,
  AVEncoderAudioQualityIOSType,
  RecordBackType,
} from 'react-native-audio-recorder-player';
import axios from 'axios';
import { API_BASE_URL } from '../store/api/baseApi';

type RNFSType = typeof import('react-native-fs');

declare const require: (moduleName: string) => RNFSType;

const audioRecorderPlayer = AudioRecorderPlayer;
const SILENCE_THRESHOLD_DB = -30;
const SILENCE_DURATION_MS = 2000;
const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1$/, '');
const VOICE_MESSAGE_URL = `${API_ORIGIN}/api/voice/message`;

let currentRecordingPath: string | null = null;
let silenceStartedAt: number | null = null;
let isStopping = false;
let isRotatingSegment = false;
let isContinuousRecordingActive = false;

export type VoiceMode = string;

export interface VoiceRecordingResult {
  path: string;
  fileUri: string;
}

export interface StartVoiceRecordingOptions {
  onSilenceDetected?: (recording: VoiceRecordingResult) => void | Promise<void>;
  onMetering?: (metering: number) => void;
}

export interface UploadVoiceMessageParams {
  userId: string;
  spaceId: string;
  mode: VoiceMode;
  filePath: string;
}

export interface UploadVoiceMessageResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

const androidRecordPermission: Permission =
  PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;

const ensureFileUri = (path: string) => {
  if (path.startsWith('file://')) {
    return path;
  }

  return `file://${path}`;
};

const getRNFS = () => {
  try {
    const RNFS = require('react-native-fs');

    if (!RNFS?.CachesDirectoryPath) {
      throw new Error('RNFS.CachesDirectoryPath is unavailable.');
    }

    return RNFS;
  } catch {
    throw new Error(
      'react-native-fs native module is unavailable. Rebuild the Android app after installing react-native-fs.',
    );
  }
};

const getAudioFilePath = () => {
  const RNFS = getRNFS();

  return `${RNFS.CachesDirectoryPath}/buddy_voice_${Date.now()}.m4a`;
};

const getAudioSet = (): AudioSet => ({
  AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
  AudioSourceAndroid: AudioSourceAndroidType.MIC,
  AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
  AVFormatIDKeyIOS: 'aac',
  AVNumberOfChannelsKeyIOS: 1,
});

const startTempRecording = async (
  audioSet: AudioSet,
): Promise<VoiceRecordingResult> => {
  const path = getAudioFilePath();
  currentRecordingPath = path;
  silenceStartedAt = null;

  await audioRecorderPlayer.startRecorder(path, audioSet, true);

  return {
    path,
    fileUri: ensureFileUri(path),
  };
};

const finalizeCurrentRecording = async (
  removeListener: boolean,
): Promise<VoiceRecordingResult> => {
  if (!currentRecordingPath) {
    throw new Error('No active voice recording found.');
  }

  const recordingPath = currentRecordingPath;

  await audioRecorderPlayer.stopRecorder();

  if (removeListener) {
    audioRecorderPlayer.removeRecordBackListener();
  }

  currentRecordingPath = null;
  silenceStartedAt = null;

  return {
    path: recordingPath,
    fileUri: ensureFileUri(recordingPath),
  };
};

export const requestMicrophonePermission = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }

  const currentPermission = await PermissionsAndroid.check(
    androidRecordPermission,
  );

  if (currentPermission) {
    return true;
  }

  const status: PermissionStatus = await PermissionsAndroid.request(
    androidRecordPermission,
    {
      title: 'Microphone Permission',
      message: 'Buddy needs microphone access to record your voice message.',
      buttonPositive: 'Allow',
      buttonNegative: 'Cancel',
    },
  );

  return status === PermissionsAndroid.RESULTS.GRANTED;
};

export const stopVoiceRecording = async (): Promise<VoiceRecordingResult> => {
  if (!currentRecordingPath) {
    throw new Error('No active voice recording found.');
  }

  if (isStopping) {
    return {
      path: currentRecordingPath,
      fileUri: ensureFileUri(currentRecordingPath),
    };
  }

  isStopping = true;
  isContinuousRecordingActive = false;

  try {
    return await finalizeCurrentRecording(true);
  } finally {
    isStopping = false;
    isRotatingSegment = false;
  }
};

export const startVoiceRecordingWithSilenceDetection = async ({
  onSilenceDetected,
  onMetering,
}: StartVoiceRecordingOptions = {}): Promise<VoiceRecordingResult> => {
  const hasPermission = await requestMicrophonePermission();

  if (!hasPermission) {
    throw new Error('Microphone permission denied.');
  }

  if (currentRecordingPath) {
    await stopVoiceRecording();
  }

  const audioSet = getAudioSet();
  const firstRecording = await startTempRecording(audioSet);
  isContinuousRecordingActive = true;

  audioRecorderPlayer.addRecordBackListener((event: RecordBackType) => {
    const metering = event.currentMetering;

    if (typeof metering !== 'number') {
      return;
    }

    onMetering?.(metering);

    if (metering > SILENCE_THRESHOLD_DB) {
      silenceStartedAt = null;
      return;
    }

    if (!silenceStartedAt) {
      silenceStartedAt = Date.now();
      return;
    }

    const silenceDuration = Date.now() - silenceStartedAt;

    if (
      silenceDuration < SILENCE_DURATION_MS ||
      isStopping ||
      isRotatingSegment ||
      !isContinuousRecordingActive
    ) {
      return;
    }

    isRotatingSegment = true;

    (async () => {
      try {
        const completedRecording = await finalizeCurrentRecording(false);

        if (!isContinuousRecordingActive) {
          return;
        }

        await startTempRecording(audioSet);

        Promise.resolve(onSilenceDetected?.(completedRecording)).catch(
          error => {
            console.log('Voice segment upload handler failed:', error);
          },
        );
      } catch (error) {
        console.log('Voice recording rotation failed:', error);
      } finally {
        isRotatingSegment = false;
      }
    })();
  });

  return firstRecording;
};

export const uploadVoiceMessage = async ({
  userId,
  spaceId,
  mode,
  filePath,
}: UploadVoiceMessageParams): Promise<UploadVoiceMessageResponse> => {
  const RNFS = getRNFS();
  const fileUri = ensureFileUri(filePath);
  const formData = new FormData();

  formData.append('userId', userId);
  formData.append('spaceId', spaceId);
  formData.append('mode', mode);
  formData.append('audio', {
    uri: fileUri,
    name: 'voice-message.m4a',
    type: 'audio/mp4',
  } as unknown as Blob);

  const response = await axios.post<UploadVoiceMessageResponse>(
    VOICE_MESSAGE_URL,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  if (await RNFS.exists(filePath)) {
    await RNFS.unlink(filePath);
  }

  return response.data;
};
