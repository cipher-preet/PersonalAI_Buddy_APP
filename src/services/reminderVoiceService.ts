import AudioRecorderPlayer, {
  PlayBackType,
} from 'react-native-audio-recorder-player';
import axios, { AxiosError } from 'axios';

import { BUDDY_ENDPOINTS } from '../config/apiConfig';
import {
  requestMicrophonePermission,
  startVoiceRecordingWithSilenceDetection,
  stopVoiceRecording,
  type VoiceRecordingResult,
} from './voiceRecorderService';

type RNFSType = typeof import('react-native-fs');

declare const require: (moduleName: string) => RNFSType;

const audioPlayer = AudioRecorderPlayer;
const REMINDER_VOICE_URL = `${BUDDY_ENDPOINTS.reminderVoiceBase}/voice/turn`;
const REMINDER_PROMPT_URL = `${BUDDY_ENDPOINTS.reminderVoiceBase}/voice/prompt`;
const TURN_TIMEOUT_MS = 45000;
const PROMPT_TIMEOUT_MS = 20000;

export type ReminderVoiceStatus =
  | 'need_more'
  | 'ready'
  | 'out_of_context'
  | 'unclear';

export type ReminderVoiceCollected = {
  title?: string | null;
  description?: string | null;
  dateKey?: string | null;
  dateLabel?: string | null;
  timeLabel?: string | null;
  repeat?: 'once' | 'daily' | 'weekly' | 'weekdays' | 'monthly' | null;
  language?: 'en' | 'hi' | null;
};

export type ReminderVoicePayload = {
  title: string;
  description: string;
  dateKey: string;
  dateLabel: string;
  timeLabel: string;
  repeat: 'once' | 'daily' | 'weekly' | 'weekdays' | 'monthly';
  source: 'ai';
  aiCalling: boolean;
  notification: boolean;
  beeping: boolean;
};

export type ReminderVoiceTurnResult = {
  status: ReminderVoiceStatus;
  transcript: string;
  replyText: string;
  replyKind: string;
  collected: ReminderVoiceCollected;
  reminder: ReminderVoicePayload | null;
  replyAudioBase64?: string | null;
  replyAudioContentType?: string | null;
  language?: 'en' | 'hi';
};

export type ReminderVoicePrompt = {
  kind: string;
  text: string;
  audioBase64?: string | null;
  contentType?: string | null;
};

type PromptCache = {
  prompt: ReminderVoicePrompt;
  fetchedAt: number;
};

let greetingCache: PromptCache | null = null;

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

const ensureFileUri = (path: string) =>
  path.startsWith('file://') ? path : `file://${path}`;

const getDeviceTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  } catch {
    return 'Asia/Kolkata';
  }
};

const getDeviceLanguage = () => {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale || '';
    return locale.toLowerCase().startsWith('hi') ? 'hi' : 'en';
  } catch {
    return 'en';
  }
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
  const detail = axiosError.response?.data?.detail;
  const message = axiosError.response?.data?.message;

  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  return axiosError.message || fallback;
};

export const prefetchReminderGreeting = async (): Promise<ReminderVoicePrompt | null> => {
  if (greetingCache && Date.now() - greetingCache.fetchedAt < 30 * 60 * 1000) {
    return greetingCache.prompt;
  }

  try {
    const response = await axios.get<{ success?: boolean; data: ReminderVoicePrompt }>(
      REMINDER_PROMPT_URL,
      {
        params: { kind: 'greeting', language: getDeviceLanguage() },
        timeout: PROMPT_TIMEOUT_MS,
      },
    );

    if (response.data?.data?.text) {
      greetingCache = {
        prompt: response.data.data,
        fetchedAt: Date.now(),
      };
      return greetingCache.prompt;
    }
  } catch (error) {
    console.log('Reminder greeting prefetch failed:', getErrorMessage(error, 'prefetch failed'));
  }

  return greetingCache?.prompt ?? {
    kind: 'greeting',
    text: 'Please tell me what reminder I should set.',
    audioBase64: null,
    contentType: null,
  };
};

export const stopReminderPlayback = async () => {
  try {
    await audioPlayer.stopPlayer();
  } catch {
    // Player may already be idle.
  }

  try {
    audioPlayer.removePlayBackListener();
  } catch {
    // Listener may already be gone.
  }
};

export const playReminderAudio = async (
  audioBase64?: string | null,
  contentType?: string | null,
) => {
  if (!audioBase64) {
    return;
  }

  const RNFS = getRNFS();
  const extension = (contentType || '').includes('wav') ? 'wav' : 'mp3';
  const path = `${RNFS.CachesDirectoryPath}/buddy_reminder_tts_${Date.now()}.${extension}`;

  await stopReminderPlayback();
  await RNFS.writeFile(path, audioBase64, 'base64');

  await new Promise<void>((resolve, reject) => {
    let settled = false;
    const safetyTimer = setTimeout(() => {
      finish();
    }, 15000);

    const finish = async () => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(safetyTimer);
      await stopReminderPlayback();
      if (await RNFS.exists(path)) {
        await RNFS.unlink(path);
      }
      resolve();
    };

    audioPlayer.addPlayBackListener((event: PlayBackType) => {
      if (
        typeof event.duration === 'number' &&
        event.duration > 0 &&
        event.currentPosition >= event.duration - 80
      ) {
        finish();
      }
    });

    audioPlayer
      .startPlayer(ensureFileUri(path))
      .catch(error => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(safetyTimer);
        stopReminderPlayback().finally(() => reject(error));
      });
  });
};

export const startReminderListening = async ({
  onSilenceDetected,
  onMetering,
}: {
  onSilenceDetected: (recording: VoiceRecordingResult) => void | Promise<void>;
  onMetering?: (metering: number) => void;
}) => {
  const hasPermission = await requestMicrophonePermission();

  if (!hasPermission) {
    throw new Error('Microphone permission is required to set a voice reminder.');
  }

  await stopReminderPlayback();

  return startVoiceRecordingWithSilenceDetection({
    stopOnSilence: true,
    onMetering,
    onSilenceDetected,
  });
};

export const stopReminderListening = async () => {
  try {
    return await stopVoiceRecording();
  } catch {
    return null;
  }
};

export const submitReminderVoiceTurn = async ({
  userId,
  filePath,
  collected,
  signal,
}: {
  userId: string;
  filePath: string;
  collected: ReminderVoiceCollected;
  signal?: AbortSignal;
}): Promise<ReminderVoiceTurnResult> => {
  const RNFS = getRNFS();
  const exists = await RNFS.exists(filePath);

  if (!exists) {
    throw new Error('Voice recording file is missing.');
  }

  const formData = new FormData();
  formData.append('userId', userId);
  formData.append('timezone', getDeviceTimezone());
  formData.append('collected', JSON.stringify(collected ?? {}));
  formData.append('file', {
    uri: ensureFileUri(filePath),
    name: 'reminder-voice.m4a',
    type: 'audio/mp4',
  } as unknown as Blob);

  try {
    const response = await axios.post<{
      success?: boolean;
      data: ReminderVoiceTurnResult;
    }>(REMINDER_VOICE_URL, formData, {
      timeout: TURN_TIMEOUT_MS,
      signal,
    });

    if (!response.data?.data) {
      throw new Error('Reminder voice response was empty.');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, 'Unable to understand that reminder. Please try again.'),
    );
  } finally {
    if (await RNFS.exists(filePath)) {
      await RNFS.unlink(filePath);
    }
  }
};
