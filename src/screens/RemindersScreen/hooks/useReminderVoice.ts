import { useCallback, useEffect, useRef, useState } from 'react';

import type { ReminderDraft } from '../components/ReminderDetailBottomSheet';
import {
  playReminderAudio,
  prefetchReminderGreeting,
  startReminderListening,
  stopReminderListening,
  stopReminderPlayback,
  submitReminderVoiceTurn,
  type ReminderVoiceCollected,
  type ReminderVoicePayload,
} from '../../../services/reminderVoiceService';

export type ReminderVoicePhase =
  | 'idle'
  | 'speaking'
  | 'listening'
  | 'thinking'
  | 'saving'
  | 'error';

type Options = {
  userId: string;
  onSave: (draft: ReminderDraft) => Promise<void>;
};

const EMPTY_COLLECTED: ReminderVoiceCollected = {};

const toDraft = (reminder: ReminderVoicePayload): ReminderDraft => ({
  title: reminder.title,
  description: reminder.description || reminder.title,
  dateKey: reminder.dateKey,
  dateLabel: reminder.dateLabel,
  timeLabel: reminder.timeLabel,
  repeat: reminder.repeat || 'once',
  aiCalling: reminder.aiCalling,
  notification: reminder.notification,
  beeping: reminder.beeping,
  source: 'ai',
});

const useReminderVoice = ({ userId, onSave }: Options) => {
  const sessionRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const collectedRef = useRef<ReminderVoiceCollected>(EMPTY_COLLECTED);
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<ReminderVoicePhase>('idle');
  const [statusText, setStatusText] = useState('Listening…');
  const [hintText, setHintText] = useState('Speak your reminder.');
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    prefetchReminderGreeting().catch(() => undefined);
  }, []);

  const resetSession = useCallback(async () => {
    sessionRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    collectedRef.current = EMPTY_COLLECTED;
    await stopReminderListening();
    await stopReminderPlayback();
  }, []);

  const stopSession = useCallback(async () => {
    await resetSession();
    setVisible(false);
    setPhase('idle');
    setErrorText('');
  }, [resetSession]);

  const listenForTurn = useCallback(
    async (sessionId: number) => {
      if (sessionId !== sessionRef.current) {
        return;
      }

      setPhase('listening');
      setStatusText('Listening…');
      setHintText('Speak your reminder. I’ll ask if anything is missing.');

      const handleRecording = async (path: string) => {
        if (sessionId !== sessionRef.current) {
          return;
        }

        setPhase('thinking');
        setStatusText('Understanding…');
        setHintText('Transcribing and checking date and time.');

        const controller = new AbortController();
        abortRef.current = controller;

        try {
          const result = await submitReminderVoiceTurn({
            userId,
            filePath: path,
            collected: collectedRef.current,
            signal: controller.signal,
          });

          if (sessionId !== sessionRef.current) {
            return;
          }

          collectedRef.current = result.collected || collectedRef.current;
          setHintText(result.replyText);

          if (result.status === 'ready' && result.reminder) {
            setPhase('speaking');
            setStatusText('Reminder ready');
            await playReminderAudio(
              result.replyAudioBase64,
              result.replyAudioContentType,
            );

            if (sessionId !== sessionRef.current) {
              return;
            }

            setPhase('saving');
            setStatusText('Saving reminder…');
            await onSave(toDraft(result.reminder));

            if (sessionId !== sessionRef.current) {
              return;
            }

            await stopSession();
            return;
          }

          setPhase('speaking');
          setStatusText(
            result.status === 'out_of_context'
              ? 'Let’s stay on reminders'
              : 'Need a bit more',
          );
          await playReminderAudio(
            result.replyAudioBase64,
            result.replyAudioContentType,
          );

          if (sessionId !== sessionRef.current) {
            return;
          }

          await listenForTurn(sessionId);
        } catch (error: any) {
          if (sessionId !== sessionRef.current || controller.signal.aborted) {
            return;
          }

          setPhase('error');
          setStatusText('Something went wrong');
          setErrorText(
            error?.message || 'Unable to process that reminder. Please try again.',
          );
          setHintText('Tap retry, or close to cancel.');
        }
      };

      try {
        await startReminderListening({
          onSilenceDetected: async recording => {
            await handleRecording(recording.path);
          },
        });
      } catch (error: any) {
        if (sessionId !== sessionRef.current) {
          return;
        }

        setPhase('error');
        setStatusText('Microphone unavailable');
        setErrorText(
          error?.message || 'Microphone permission is required to set a voice reminder.',
        );
      }
    },
    [onSave, stopSession, userId],
  );

  const startSession = useCallback(async () => {
    if (!userId) {
      setVisible(true);
      setPhase('error');
      setStatusText('Sign in required');
      setErrorText('Sign in to set a voice reminder.');
      return;
    }

    await resetSession();
    const sessionId = sessionRef.current;
    collectedRef.current = EMPTY_COLLECTED;
    setVisible(true);
    setErrorText('');
    setPhase('speaking');
    setStatusText('Buddy is speaking');
    setHintText('Please tell me what reminder I should set.');

    try {
      const greeting = await prefetchReminderGreeting();
      if (sessionId !== sessionRef.current) {
        return;
      }

      setHintText(
        greeting?.text || 'Please tell me what reminder I should set.',
      );
      await playReminderAudio(greeting?.audioBase64, greeting?.contentType);
    } catch {
      // Continue listening even if greeting audio fails.
    }

    if (sessionId !== sessionRef.current) {
      return;
    }

    await listenForTurn(sessionId);
  }, [listenForTurn, resetSession, userId]);

  const retryTurn = useCallback(async () => {
    if (!visible) {
      return;
    }

    setErrorText('');
    await listenForTurn(sessionRef.current);
  }, [listenForTurn, visible]);

  const handleStopListening = useCallback(async () => {
    if (phase === 'saving') {
      return;
    }

    if (phase !== 'listening') {
      await stopSession();
      return;
    }

    const sessionId = sessionRef.current;
    const recording = await stopReminderListening();

    if (!recording?.path) {
      await stopSession();
      return;
    }

    setPhase('thinking');
    setStatusText('Understanding…');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await submitReminderVoiceTurn({
        userId,
        filePath: recording.path,
        collected: collectedRef.current,
        signal: controller.signal,
      });

      if (sessionId !== sessionRef.current) {
        return;
      }

      collectedRef.current = result.collected || collectedRef.current;
      setHintText(result.replyText);

      if (result.status === 'ready' && result.reminder) {
        setPhase('speaking');
        await playReminderAudio(
          result.replyAudioBase64,
          result.replyAudioContentType,
        );
        if (sessionId !== sessionRef.current) {
          return;
        }
        setPhase('saving');
        await onSave(toDraft(result.reminder));
        await stopSession();
        return;
      }

      setPhase('speaking');
      await playReminderAudio(
        result.replyAudioBase64,
        result.replyAudioContentType,
      );
      if (sessionId !== sessionRef.current) {
        return;
      }
      await listenForTurn(sessionId);
    } catch (error: any) {
      if (sessionId !== sessionRef.current) {
        return;
      }
      setPhase('error');
      setStatusText('Something went wrong');
      setErrorText(
        error?.message || 'Unable to process that reminder. Please try again.',
      );
    }
  }, [listenForTurn, onSave, phase, stopSession, userId]);

  return {
    visible,
    phase,
    statusText,
    hintText,
    errorText,
    startSession,
    stopSession,
    retryTurn,
    handleStopListening,
  };
};

export default useReminderVoice;
