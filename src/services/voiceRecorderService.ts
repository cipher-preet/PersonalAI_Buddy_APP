import {
  NativeModules,
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
import axios, { AxiosError } from 'axios';

import { BUDDY_ENDPOINTS } from '../config/apiConfig';

type RNFSType = typeof import('react-native-fs');

declare const require: (moduleName: string) => RNFSType;

type BuddyListeningServiceModule = {
  start: (title?: string, message?: string) => Promise<boolean>;
  stop: () => Promise<boolean>;
};

const { BuddyListeningService } = NativeModules as {
  BuddyListeningService?: BuddyListeningServiceModule;
};

const audioRecorderPlayer = AudioRecorderPlayer;
const SILENCE_THRESHOLD_DB = -30;
const SILENCE_DURATION_MS = 2000;
const MAX_RECORDING_SEGMENT_MS = 30000;
const AUDIO_FILE_EXTENSION = 'm4a';
const AUDIO_MIME_TYPE = 'audio/mp4';
const SPEECH_API_URL = BUDDY_ENDPOINTS.speechBase;
const VOICE_MESSAGE_URL = `${SPEECH_API_URL}/transcripting`;
const START_LISTENING_SESSION_URL = `${SPEECH_API_URL}/listening/start`;
const END_LISTENING_SESSION_URL = `${SPEECH_API_URL}/listening/end`;
const androidNotificationPermission =
  'android.permission.POST_NOTIFICATIONS' as Permission;

let currentRecordingPath: string | null = null;
let silenceStartedAt: number | null = null;
let recordingStartedAt: number | null = null;
let isStopping = false;
let isRotatingSegment = false;
let isContinuousRecordingActive = false;

export type VoiceMode = string;

export interface VoiceRecordingResult {
  path: string;
  fileUri: string;
}

export interface StartVoiceRecordingOptions {
  onSegmentReady?: (recording: VoiceRecordingResult) => void | Promise<void>;
  onSilenceDetected?: (recording: VoiceRecordingResult) => void | Promise<void>;
  onMetering?: (metering: number) => void;
  stopOnSilence?: boolean;
}

export interface UploadVoiceMessageParams {
  userId: string;
  spaceId: string;
  mode?: VoiceMode;
  filePath?: string;
  filePaths?: string[];
}

export interface UploadVoiceMessageResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

export interface ListeningSessionParams {
  userId: string;
  spaceId: string;
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

  return `${RNFS.CachesDirectoryPath}/buddy_voice_${Date.now()}.${AUDIO_FILE_EXTENSION}`;
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
  recordingStartedAt = Date.now();

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
  recordingStartedAt = null;

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

export const requestListeningNotificationPermission = async () => {
  if (Platform.OS !== 'android' || Number(Platform.Version) < 33) {
    return true;
  }

  const hasPermission = await PermissionsAndroid.check(
    androidNotificationPermission,
  );

  if (hasPermission) {
    return true;
  }

  const status = await PermissionsAndroid.request(
    androidNotificationPermission,
    {
      title: 'Listening Notification',
      message:
        'Buddy shows a notification while listening in the background or on the lock screen.',
      buttonPositive: 'Allow',
      buttonNegative: 'Cancel',
    },
  );

  return status === PermissionsAndroid.RESULTS.GRANTED;
};

export const requestVoiceListeningPermissions = async () => {
  const hasMicrophonePermission = await requestMicrophonePermission();

  if (!hasMicrophonePermission) {
    throw new Error('Microphone permission denied.');
  }

  const hasNotificationPermission =
    await requestListeningNotificationPermission();

  if (!hasNotificationPermission) {
    throw new Error('Notification permission denied.');
  }
};

export const startBackgroundListeningNotification = async ({
  spaceName,
}: {
  spaceName?: string;
} = {}) => {
  if (Platform.OS !== 'android') {
    return;
  }

  const hasPermission = await requestListeningNotificationPermission();

  if (!hasPermission) {
    throw new Error('Notification permission denied.');
  }

  if (!BuddyListeningService) {
    throw new Error(
      'Buddy listening service is unavailable. Rebuild the Android app.',
    );
  }

  await BuddyListeningService.start(
    'Buddy is listening',
    spaceName
      ? `Recording continues in ${spaceName}. Tap to return to Buddy.`
      : 'Recording continues in the background. Tap to return to Buddy.',
  );
};

export const stopBackgroundListeningNotification = async () => {
  if (Platform.OS !== 'android' || !BuddyListeningService) {
    return;
  }

  await BuddyListeningService.stop();
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
  onSegmentReady,
  onSilenceDetected,
  onMetering,
  stopOnSilence = true,
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

    const segmentDuration = recordingStartedAt
      ? Date.now() - recordingStartedAt
      : 0;

    if (
      segmentDuration >= MAX_RECORDING_SEGMENT_MS &&
      !isStopping &&
      !isRotatingSegment &&
      isContinuousRecordingActive
    ) {
      isRotatingSegment = true;

      (async () => {
        try {
          const completedRecording = await finalizeCurrentRecording(false);
          console.log('Max voice segment duration reached. Uploading chunk:', {
            path: completedRecording.path,
            durationMs: segmentDuration,
          });

          if (isContinuousRecordingActive) {
            await startTempRecording(audioSet);
          }

          await onSegmentReady?.(completedRecording);
        } catch (error) {
          console.log('Voice recording max duration rotation failed:', error);
        } finally {
          isRotatingSegment = false;
        }
      })();

      return;
    }

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

    if (!stopOnSilence) {
      return;
    }

    isRotatingSegment = true;

    (async () => {
      try {
        isContinuousRecordingActive = !stopOnSilence;
        const completedRecording = await finalizeCurrentRecording(stopOnSilence);
        console.log('Silence detected. Finalized voice recording:', {
          path: completedRecording.path,
          stopOnSilence,
        });

        if (!isContinuousRecordingActive) {
          await onSilenceDetected?.(completedRecording);
          return;
        }

        await startTempRecording(audioSet);

        await onSilenceDetected?.(completedRecording);
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
  filePath,
  filePaths,
}: UploadVoiceMessageParams): Promise<UploadVoiceMessageResponse> => {
  const RNFS = getRNFS();
  const uploadPaths = filePaths?.length ? filePaths : filePath ? [filePath] : [];
  const formData = new FormData();

  if (uploadPaths.length === 0) {
    throw new Error('No voice recording file found to upload.');
  }

  formData.append('user_id', userId);
  formData.append('space_id', spaceId);
  for (const [index, path] of uploadPaths.entries()) {
    const exists = await RNFS.exists(path);

    if (!exists) {
      throw new Error(`Voice recording file does not exist: ${path}`);
    }

    const stat = await RNFS.stat(path);
    console.log('Uploading voice file:', {
      url: VOICE_MESSAGE_URL,
      path,
      size: stat.size,
      userId,
      spaceId,
    });

    formData.append('file', {
      uri: ensureFileUri(path),
      name: `voice-message-${index + 1}.${AUDIO_FILE_EXTENSION}`,
      type: AUDIO_MIME_TYPE,
    } as unknown as Blob);
  }

  let response;

  try {
    response = await axios.post<UploadVoiceMessageResponse>(
      VOICE_MESSAGE_URL,
      formData,
      {
        timeout: 60000,
      },
    );
  } catch (error) {
    const axiosError = error as AxiosError;

    console.log('Voice upload failed details:', {
      message: axiosError.message,
      code: axiosError.code,
      status: axiosError.response?.status,
      response: axiosError.response?.data,
    });

    throw error;
  }

  for (const path of uploadPaths) {
    if (await RNFS.exists(path)) {
      await RNFS.unlink(path);
    }
  }
  console.log('Voice upload response:', response.data);

  return response.data;
};

export const startListeningSession = async ({
  userId,
  spaceId,
}: ListeningSessionParams) => {
  const response = await axios.post(START_LISTENING_SESSION_URL, {
    user_id: userId,
    space_id: spaceId,
  });

  return response.data;
};

export const endListeningSession = async ({
  userId,
  spaceId,
}: ListeningSessionParams) => {
  const response = await axios.post(END_LISTENING_SESSION_URL, {
    user_id: userId,
    space_id: spaceId,
  });

  return response.data;
};
