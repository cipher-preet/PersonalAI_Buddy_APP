import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  endListeningSession,
  requestVoiceListeningPermissions,
  startBackgroundListeningNotification,
  startListeningSession,
  startVoiceRecordingWithSilenceDetection,
  stopBackgroundListeningNotification,
  stopVoiceRecording,
  uploadVoiceMessage,
  type VoiceRecordingResult,
} from '../services/voiceRecorderService';
import {
  useGetUserActiveSpaceQuery,
  useStartListningMutation,
  type Space,
} from '../store/api/home';
import { useGetPlanStatusQuery } from '../store/api/payments';
import { useListening } from '../store/context/ListeningContext';
import { useToast } from '../store/context/ToastContext';
import { useAppSelector } from '../store/hooks';
import {
  getPlanLimitPrompt,
  getPlanLimitResource,
  isPlanLimitError,
  type PlanLimitResource,
} from '../utils/planLimitError';
import { UNLIMITED_LIMIT, getRecordingRemainingMs } from '../utils/planUsage';
import { devLog } from '../utils/logger';

type RecordingContext = {
  spaceId: string;
  mode: string;
  conversationId?: string;
};

export const useSpaceListening = () => {
  const navigation = useNavigation<any>();
  const userId = useAppSelector(state => state.auth.userId) ?? '';
  const { showToast } = useToast();
  const {
    startListeningSession: registerListeningBar,
    clearListeningSession,
  } = useListening();
  const [startListning] = useStartListningMutation();
  const { data: activeSpaceData, refetch: refetchPlanRelated } =
    useGetUserActiveSpaceQuery({ userId }, { skip: !userId });
  const { data: planStatus, refetch: refetchPlanStatus } = useGetPlanStatusQuery(
    { userId },
    { skip: !userId },
  );

  const recordingContextRef = useRef<RecordingContext | null>(null);
  const uploadQueueRef = useRef<Promise<void>>(Promise.resolve());
  const pendingVoiceUploadsRef = useRef(0);
  const listeningStartedAtRef = useRef<number | null>(null);
  const stopListeningRef = useRef<(spaceId?: string) => Promise<void>>(
    async () => undefined,
  );
  const exhaustedPromptedRef = useRef(false);
  const forceStoppedListeningRef = useRef(false);
  const busyRef = useRef(false);

  const [isListening, setIsListening] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeResource, setUpgradeResource] =
    useState<PlanLimitResource>('recordingHours');

  const activeSpace =
    activeSpaceData?.data && Array.isArray(activeSpaceData.data)
      ? activeSpaceData.data[0]
      : null;
  const isVoiceActive = isListening || activeSpace?.isListning === true;
  const remainingMs = getRecordingRemainingMs(planStatus, 0);
  const upgradePrompt = getPlanLimitPrompt(upgradeResource);

  const enqueueRecordedVoiceUpload = useCallback(
    (recording: VoiceRecordingResult) => {
      const recordingContext = recordingContextRef.current;

      if (!recordingContext) {
        return Promise.resolve();
      }

      pendingVoiceUploadsRef.current += 1;
      const uploadTask = uploadQueueRef.current
        .catch(() => undefined)
        .then(async () => {
          try {
            await uploadVoiceMessage({
              userId,
              spaceId: recordingContext.spaceId,
              mode: recordingContext.mode,
              filePath: recording.path,
              fileDurationMs: recording.durationMs,
            });
            if (userId) {
              refetchPlanStatus();
            }
          } catch (error) {
            showToast({
              message: 'Voice upload failed. Try again.',
              type: 'error',
            });
            devLog('Voice upload failed:', error);
          } finally {
            pendingVoiceUploadsRef.current = Math.max(
              0,
              pendingVoiceUploadsRef.current - 1,
            );
          }
        });

      uploadQueueRef.current = uploadTask;
      return uploadTask;
    },
    [refetchPlanStatus, showToast, userId],
  );

  const beginRecording = useCallback(
    async (space: Space) => {
      const mode = 'voice';

      try {
        recordingContextRef.current = { spaceId: space._id, mode };
        listeningStartedAtRef.current = Date.now();

        await requestVoiceListeningPermissions();
        await startBackgroundListeningNotification({
          spaceName: space.spacename,
        });

        const listeningSession = await startListeningSession({
          userId,
          spaceId: space._id,
        });

        recordingContextRef.current = {
          spaceId: space._id,
          mode,
          conversationId: listeningSession.data?.conversation_id,
        };

        await startVoiceRecordingWithSilenceDetection({
          onSegmentReady: async recording => {
            await enqueueRecordedVoiceUpload(recording);
          },
          onSilenceDetected: async recording => {
            await enqueueRecordedVoiceUpload(recording);
          },
          stopOnSilence: false,
        });

        setIsListening(true);
        forceStoppedListeningRef.current = false;
        registerListeningBar({
          spaceName: space.spacename || 'Space',
          startedAt: listeningStartedAtRef.current,
          onStop: () => stopListeningRef.current(),
        });
        showToast({ message: 'Recording started. Speak now.', type: 'success' });
      } catch (error) {
        devLog('START ERROR:', error);
        const failedContext = recordingContextRef.current;
        recordingContextRef.current = null;
        setIsListening(false);
        clearListeningSession();
        await stopBackgroundListeningNotification().catch(() => undefined);
        if (failedContext?.spaceId) {
          await endListeningSession({
            userId,
            spaceId: failedContext.spaceId,
          }).catch(() => undefined);
        }
        try {
          await startListning({
            spaceId: space._id,
            isListning: false,
          }).unwrap();
        } catch (statusError) {
          devLog('Unable to reset listening status:', statusError);
        }
        if (isPlanLimitError(error)) {
          setUpgradeResource(getPlanLimitResource(error) || 'recordingHours');
          setShowUpgradePrompt(true);
          return;
        }
        showToast({
          message: 'Unable to start microphone recording.',
          type: 'error',
        });
      }
    },
    [
      clearListeningSession,
      enqueueRecordedVoiceUpload,
      registerListeningBar,
      showToast,
      startListning,
      userId,
    ],
  );

  const stopListening = useCallback(async (spaceId?: string) => {
    const recordingContext = recordingContextRef.current;
    const targetSpaceId =
      recordingContext?.spaceId || activeSpace?._id || spaceId || '';

    try {
      if (recordingContext) {
        const recording = await stopVoiceRecording();
        await stopBackgroundListeningNotification().catch(() => undefined);
        const finalUpload = enqueueRecordedVoiceUpload(recording);
        await finalUpload.catch(uploadError => {
          devLog('Final voice upload failed before stop:', uploadError);
        });
        await endListeningSession({
          userId,
          spaceId: recordingContext.spaceId,
        });
      } else if (targetSpaceId) {
        await stopBackgroundListeningNotification().catch(() => undefined);
        await endListeningSession({
          userId,
          spaceId: targetSpaceId,
        }).catch(() => undefined);
      }

      if (!targetSpaceId) {
        return;
      }

      const res = await startListning({
        spaceId: targetSpaceId,
        isListning: false,
      }).unwrap();
      recordingContextRef.current = null;
      setIsListening(false);
      forceStoppedListeningRef.current = true;
      clearListeningSession();
      showToast({
        message: res?.success
          ? 'Stopped listening.'
          : res?.data?.message || 'Unable to stop.',
        type: res?.success ? 'success' : 'error',
      });
    } catch (error) {
      await stopBackgroundListeningNotification().catch(() => undefined);
      showToast({ message: 'Stop failed. Try again.', type: 'error' });
      devLog('stopListening error:', error);
    } finally {
      if (userId) {
        refetchPlanStatus();
      }
    }
  }, [
    activeSpace?._id,
    clearListeningSession,
    enqueueRecordedVoiceUpload,
    refetchPlanStatus,
    showToast,
    startListning,
    userId,
  ]);

  stopListeningRef.current = stopListening;

  useEffect(() => {
    if (!isVoiceActive || forceStoppedListeningRef.current) {
      if (!isVoiceActive) {
        listeningStartedAtRef.current = null;
        exhaustedPromptedRef.current = false;
        forceStoppedListeningRef.current = false;
      }
      return;
    }

    if (!listeningStartedAtRef.current) {
      const startedAt = activeSpace?.listeningStartedAt
        ? new Date(activeSpace.listeningStartedAt).getTime()
        : Date.now();
      listeningStartedAtRef.current = Number.isNaN(startedAt)
        ? Date.now()
        : startedAt;
      registerListeningBar({
        spaceName: activeSpace?.spacename || 'Space',
        startedAt: listeningStartedAtRef.current,
        onStop: () => stopListeningRef.current(),
      });
    }
  }, [
    activeSpace?.listeningStartedAt,
    activeSpace?.spacename,
    isVoiceActive,
    registerListeningBar,
  ]);

  useEffect(() => {
    if (!isVoiceActive) {
      return undefined;
    }

    const checkExhausted = () => {
      const elapsed = listeningStartedAtRef.current
        ? Math.max(0, Date.now() - listeningStartedAtRef.current)
        : 0;
      const left = getRecordingRemainingMs(planStatus, elapsed);
      if (
        left === UNLIMITED_LIMIT ||
        left > 0 ||
        exhaustedPromptedRef.current
      ) {
        return;
      }

      exhaustedPromptedRef.current = true;
      setUpgradeResource('recordingHours');
      setShowUpgradePrompt(true);
      void stopListeningRef.current();
    };

    checkExhausted();
    const timer = setInterval(checkExhausted, 5000);
    return () => clearInterval(timer);
  }, [isVoiceActive, planStatus]);

  const toggleSpaceListening = useCallback(
    async (space: Space) => {
      if (busyRef.current) {
        return;
      }

      const listeningSpaceId =
        recordingContextRef.current?.spaceId || activeSpace?._id || '';
      const listeningHere =
        space.isListning || (isVoiceActive && space._id === listeningSpaceId);

      if (listeningHere) {
        busyRef.current = true;
        try {
          await stopListeningRef.current(space._id);
        } finally {
          busyRef.current = false;
        }
        return;
      }

      if (isVoiceActive) {
        showToast({
          message: `Stop listening in ${
            activeSpace?.spacename || 'the other space'
          } first.`,
          type: 'error',
        });
        return;
      }

      if (remainingMs !== UNLIMITED_LIMIT && remainingMs <= 0) {
        setUpgradeResource('recordingHours');
        setShowUpgradePrompt(true);
        return;
      }

      busyRef.current = true;
      try {
        await requestVoiceListeningPermissions();
        const res = await startListning({
          spaceId: space._id,
          isListning: true,
        }).unwrap();

        if (!res?.success) {
          showToast({
            message: res?.data?.message || 'Unable to start.',
            type: 'error',
          });
          return;
        }

        await beginRecording(space);
        refetchPlanRelated();
      } catch (error: any) {
        if (isPlanLimitError(error)) {
          setUpgradeResource(getPlanLimitResource(error) || 'recordingHours');
          setShowUpgradePrompt(true);
          return;
        }

        showToast({
          message:
            error?.message === 'Microphone permission denied.' ||
            error?.message === 'Notification permission denied.'
              ? error.message
              : 'Start failed. Try again.',
          type: 'error',
        });
      } finally {
        busyRef.current = false;
      }
    },
    [
      activeSpace?._id,
      activeSpace?.spacename,
      beginRecording,
      isVoiceActive,
      refetchPlanRelated,
      remainingMs,
      showToast,
      startListning,
    ],
  );

  return {
    toggleSpaceListening,
    upgradePrompt: {
      visible: showUpgradePrompt,
      title: upgradePrompt.title,
      message: upgradePrompt.message,
      onClose: () => setShowUpgradePrompt(false),
      onUpgrade: () => {
        setShowUpgradePrompt(false);
        navigation.navigate('Plans');
      },
    },
  };
};
