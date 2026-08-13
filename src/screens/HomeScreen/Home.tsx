import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import Header from './components/Header';
import TopCard from './components/TopCard';
import SpaceCard from './components/SpaceCard';
import SpacesEmptyState from './components/SpacesEmptyState';
import {
  AddSpace,
  MicIcon,
} from '../../../styles/icons';
import VoiceAssistantSheet from './components/voice-sheet/VoiceAssistantSheet';

import { useToast } from '../../store/context/ToastContext';
import { useAppSelector } from '../../store/hooks';

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { MainTabParamList } from '../../navigation/types';
import CreateSpaceBottomSheet from './components/addspcesheet/CreateSpaceBottomSheet';
import {
  Space,
  useStartListningMutation,
  useDeleteSpaceMutation,
  useGetUserActiveSpaceQuery,
  useGetUserSpacesQuery,
} from '../../store/api/home';
import {
  endListeningSession,
  requestVoiceListeningPermissions,
  startListeningSession,
  startBackgroundListeningNotification,
  startVoiceRecordingWithSilenceDetection,
  stopBackgroundListeningNotification,
  stopVoiceRecording,
  uploadVoiceMessage,
  VoiceRecordingResult,
} from '../../services/voiceRecorderService';
import {
  ConversationStatusEvent,
  subscribeToConversationStatusEvents,
} from '../../services/conversationStatusEvents';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  mvs,
  radii,
  spacing,
  vSpacing,
} from '../../theme';

const SPACE_PAGE_LIMIT = 10;

type SpaceProcessingState = {
  status?: string;
  extractionRunStatus?: string;
  conversationId?: string;
  updatedAt: number;
};

const TERMINAL_PROCESSING_STATUSES = new Set([
  'COMPLETED',
  'PARTIAL',
  'FAILED',
  'PUBLISHED',
]);

const STATUS_LABELS: Record<string, string> = {
  RECORDING: 'Listening',
  STOP_REQUESTED: 'Stopping',
  WAITING_FOR_TRANSCRIPTS: 'Transcribing',
  READY_FOR_PROCESSING: 'Queued',
  PROCESSING: 'Processing',
  VALIDATING: 'Validating',
  READY_TO_PUBLISH: 'Publishing',
  PUBLISHED: 'Published',
  COMPLETED: 'Done',
  PARTIAL: 'Partial',
  RETRY_PENDING: 'Retrying',
  FAILED: 'Failed',
};

const getStatusLabel = (status?: string) => {
  if (!status) {
    return undefined;
  }

  return STATUS_LABELS[status] || status.replace(/_/g, ' ');
};

const getPrimaryProcessingStatus = (state?: SpaceProcessingState) =>
  state?.extractionRunStatus || state?.status;

const isTerminalProcessingStatus = (state?: SpaceProcessingState) => {
  const primaryStatus = getPrimaryProcessingStatus(state);

  return primaryStatus ? TERMINAL_PROCESSING_STATUSES.has(primaryStatus) : false;
};

const getSpaceProcessingDescription = (state?: SpaceProcessingState) => {
  const label = getStatusLabel(getPrimaryProcessingStatus(state));

  return label ? `Current conversation: ${label}` : undefined;
};

const formatCreatedAt = (createdAt: string) => {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

type VoiceStartData = {
  space?: Space;
  mode?: string;
};

type RecordingContext = {
  spaceId: string;
  mode: string;
  conversationId?: string;
};

type TabParamList = MainTabParamList;

const Home = () => {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const spaceSheetRef = useRef<BottomSheetModal>(null);

  const recordingContextRef = useRef<RecordingContext | null>(null);
  const uploadQueueRef = useRef<Promise<void>>(Promise.resolve());
  const pendingVoiceUploadsRef = useRef(0);
  const processingCleanupTimersRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});

  const [isListening, setIsListening] = useState(false);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spaceProcessing, setSpaceProcessing] = useState<
    Record<string, SpaceProcessingState>
  >({});
  const [deletingSpaceId, setDeletingSpaceId] = useState('');
  const [cursor, setCursor] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const userId = useAppSelector(state => state.auth.userId) ?? '';
  const authToken = useAppSelector(state => state.auth.token);
  const { showToast } = useToast();
  const [startListning] = useStartListningMutation();
  const [deleteSpace, { isLoading: isDeletingSpace }] =
    useDeleteSpaceMutation();
  const {
    data: activeSpaceData,
    isFetching: isFetchingActiveSpace,
    refetch: refetchActiveSpace,
  } = useGetUserActiveSpaceQuery({ userId }, { skip: !userId });
  const {
    data: spacesData,
    isFetching: isFetchingSpaces,
    refetch: refetchSpaces,
  } = useGetUserSpacesQuery(
    {
      userId,
      limit: SPACE_PAGE_LIMIT,
      cursor,
    },
    { skip: !userId },
  );
  const isInitialSpacesLoading = isFetchingSpaces && spaces.length === 0;

  useEffect(() => {
    const response = spacesData?.data?.data;
    if (!response) {
      return;
    }

    const fetchedSpaces = response.spaces || [];
    setNextCursor(response.nextCursor || null);

    if (cursor === '') {
      setSpaces(fetchedSpaces);
      return;
    }

    setSpaces(prev => {
      const existingIds = new Set(prev.map(space => space._id));
      const newItems = fetchedSpaces.filter(
        space => !existingIds.has(space._id),
      );

      return newItems.length > 0 ? [...prev, ...newItems] : prev;
    });
  }, [spacesData, cursor]);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    const cleanupProcessingState = (spaceId: string) => {
      const existingTimer = processingCleanupTimersRef.current[spaceId];

      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      processingCleanupTimersRef.current[spaceId] = setTimeout(() => {
        setSpaceProcessing(prev => {
          const next = { ...prev };
          delete next[spaceId];
          return next;
        });

        delete processingCleanupTimersRef.current[spaceId];
      }, 8000);
    };

    const handleStatusChange = (event: ConversationStatusEvent) => {
      if (event.userId && event.userId !== userId) {
        return;
      }

      if (!event.spaceId) {
        return;
      }

      const nextState: SpaceProcessingState = {
        status: event.status,
        extractionRunStatus: event.extractionRunStatus,
        conversationId: event.conversationId,
        updatedAt: Date.now(),
      };

      setSpaceProcessing(prev => ({
        ...prev,
        [event.spaceId as string]: nextState,
      }));

      refetchActiveSpace();
      refetchSpaces();

      if (isTerminalProcessingStatus(nextState)) {
        cleanupProcessingState(event.spaceId);
      }
    };

    const unsubscribe = subscribeToConversationStatusEvents({
      userId,
      token: authToken,
      onStatusChange: handleStatusChange,
      onError: error => {
        console.log('Conversation status SSE error:', error);
      },
    });

    return () => {
      unsubscribe();
      Object.values(processingCleanupTimersRef.current).forEach(clearTimeout);
      processingCleanupTimersRef.current = {};
    };
  }, [
    authToken,
    refetchActiveSpace,
    refetchSpaces,
    userId,
  ]);

  const updateUploadingState = (delta: number) => {
    pendingVoiceUploadsRef.current = Math.max(
      0,
      pendingVoiceUploadsRef.current + delta,
    );
    setIsUploadingVoice(pendingVoiceUploadsRef.current > 0);
  };

  const enqueueRecordedVoiceUpload = (recording: VoiceRecordingResult) => {
    const recordingContext = recordingContextRef.current;

    if (!recordingContext) {
      console.log('Voice upload skipped: missing recording context.');
      return Promise.resolve();
    }

    updateUploadingState(1);
    console.log('Voice upload queued:', {
      filePath: recording.path,
      durationMs: recording.durationMs,
      spaceId: recordingContext.spaceId,
      mode: recordingContext.mode,
    });

    const uploadTask = uploadQueueRef.current
      .catch(() => undefined)
      .then(async () => {
        try {
          await uploadVoiceMessage({
            userId: userId,
            spaceId: recordingContext.spaceId,
            mode: recordingContext.mode,
            filePath: recording.path,
            fileDurationMs: recording.durationMs,
          });

          showToast({ message: 'Voice message uploaded.', type: 'success' });
        } catch (error) {
          showToast({
            message: 'Voice upload failed. Try again.',
            type: 'error',
          });
          console.log('Voice upload failed:', error);
        } finally {
          updateUploadingState(-1);
        }
      });

    uploadQueueRef.current = uploadTask;

    return uploadTask;
  };

  const handleStartListening = async (data: VoiceStartData) => {
    const voiceSpace = data?.space;
    const mode = data?.mode || 'voice';

    if (!voiceSpace?._id) {
      showToast({ message: 'Please select a space.', type: 'error' });
      return;
    }

    try {
      recordingContextRef.current = {
        spaceId: voiceSpace._id,
        mode,
      };

      await requestVoiceListeningPermissions();

      await startBackgroundListeningNotification({
        spaceName: voiceSpace.spacename,
      });

      const listeningSession = await startListeningSession({
        userId,
        spaceId: voiceSpace._id,
      });

      recordingContextRef.current = {
        spaceId: voiceSpace._id,
        mode,
        conversationId: listeningSession.data?.conversation_id,
      };

      await startVoiceRecordingWithSilenceDetection({
        onSegmentReady: async recording => {
          showToast({
            message: 'Sending voice chunk...',
            type: 'success',
          });
          await enqueueRecordedVoiceUpload(recording);
        },
        onSilenceDetected: async recording => {
          showToast({
            message: 'Sending voice chunk...',
            type: 'success',
          });
          await enqueueRecordedVoiceUpload(recording);
        },
        stopOnSilence: false,
      });

      setIsListening(true);
      showToast({ message: 'Recording started. Speak now.', type: 'success' });
    } catch (error) {
      console.log('START ERROR:', error);
      const failedContext = recordingContextRef.current;
      recordingContextRef.current = null;
      setIsListening(false);
      await stopBackgroundListeningNotification().catch(serviceError => {
        console.log('Unable to stop listening notification:', serviceError);
      });
      if (failedContext?.spaceId) {
        await endListeningSession({
          userId,
          spaceId: failedContext.spaceId,
        }).catch(serviceError => {
          console.log('Unable to end failed listening session:', serviceError);
        });
      }
      try {
        await startListning({
          spaceId: voiceSpace._id,
          isListning: false,
        }).unwrap();
      } catch (statusError) {
        console.log('Unable to reset listening status:', statusError);
      }
      showToast({
        message: 'Unable to start microphone recording.',
        type: 'error',
      });
    }
  };

  // Get active space from query response (array with first item or empty)
  const activeSpace =
    activeSpaceData?.data && Array.isArray(activeSpaceData.data)
      ? activeSpaceData.data[0]
      : null;

  const isUserListening = activeSpace?.isListning === true;
  const isVoiceActive = isListening || isUserListening;

  /**
   * OPEN BOTTOM SHEET
   */

  const openVoiceSheet = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const handleStopListening = async () => {
    const recordingContext = recordingContextRef.current;

    try {
      if (recordingContext) {
        const recording = await stopVoiceRecording();
        await stopBackgroundListeningNotification().catch(serviceError => {
          console.log('Unable to stop listening notification:', serviceError);
        });
        showToast({
          message: 'Recording stopped. Sending final voice...',
          type: 'success',
        });

        const finalUpload = enqueueRecordedVoiceUpload(recording);
        await finalUpload.catch(uploadError => {
          console.log('Final voice upload failed before stop:', uploadError);
        });

        await endListeningSession({
          userId,
          spaceId: recordingContext.spaceId,
        });

        const res = await startListning({
          spaceId: recordingContext.spaceId,
          isListning: false,
        }).unwrap();

        if (res?.success) {
          showToast({ message: 'Stopped listening.', type: 'success' });
        } else {
          showToast({
            message: res?.data?.message || 'Unable to stop.',
            type: 'error',
          });
        }

        recordingContextRef.current = null;
        setIsListening(false);
        return;
      }

      if (activeSpace?._id) {
        await stopBackgroundListeningNotification().catch(serviceError => {
          console.log('Unable to stop listening notification:', serviceError);
        });
        await endListeningSession({
          userId,
          spaceId: activeSpace._id,
        }).catch(serviceError => {
          console.log('Unable to end listening session:', serviceError);
        });
        const res = await startListning({
          spaceId: activeSpace._id,
          isListning: false,
        }).unwrap();
        if (res?.success) {
          showToast({ message: 'Stopped listening.', type: 'success' });
          setIsListening(false);
        } else {
          showToast({
            message: res?.data?.message || 'Unable to stop.',
            type: 'error',
          });
        }
      }
    } catch (err) {
      await stopBackgroundListeningNotification().catch(serviceError => {
        console.log('Unable to stop listening notification:', serviceError);
      });
      showToast({ message: 'Stop failed. Try again.', type: 'error' });
      console.log('stopListening error:', err);
    }
  };

  const openSpaceSheet = useCallback(() => {
    spaceSheetRef.current?.present();
  }, []);

  const handleDeleteSpace = useCallback(
    async (space: Space) => {
      if (isDeletingSpace || deletingSpaceId) {
        return;
      }

      const deletingActiveRecording =
        recordingContextRef.current?.spaceId === space._id ||
        activeSpace?._id === space._id;

      if (deletingActiveRecording) {
        showToast({
          message: 'Stop listening before deleting this space.',
          type: 'error',
        });
        return;
      }

      try {
        setDeletingSpaceId(space._id);

        const response = await deleteSpace({
          spaceId: space._id,
        }).unwrap();

        setSpaces(prev => prev.filter(item => item._id !== space._id));

        showToast({
          message:
            response?.data?.message ||
            response?.message ||
            'Space deleted successfully.',
          type: 'success',
        });
      } catch (error: any) {
        showToast({
          message:
            error?.data?.message || error?.message || 'Unable to delete space.',
          type: 'error',
        });
      } finally {
        setDeletingSpaceId('');
      }
    },
    [activeSpace?._id, deleteSpace, deletingSpaceId, isDeletingSpace, showToast],
  );

  const handleAskBuddy = useCallback(() => {
    navigation.navigate('AI');
  }, [navigation]);

  const renderSpaceItem = useCallback(
    ({ item }: { item: Space }) => {
      const processingState = spaceProcessing[item._id];
      const processingDescription =
        getSpaceProcessingDescription(processingState);

      return (
        <SpaceCard
          spaceId={item._id}
          title={item.spacename}
          description={
            processingDescription ||
            item.description ||
            'AI memory workspace for notes and tasks'
          }
          badgeText={getStatusLabel(
            getPrimaryProcessingStatus(processingState),
          )}
          time={formatCreatedAt(item.createdAt)}
          isListening={item.isListning}
          isDeleting={deletingSpaceId === item._id}
          onDelete={() => handleDeleteSpace(item)}
          onOpenNotes={() =>
            navigation.navigate('Notes', { spaceId: item._id })
          }
          onOpenTasks={() =>
            navigation.navigate('Tasks', { spaceId: item._id })
          }
          onAskBuddy={handleAskBuddy}
        />
      );
    },
    [
      deletingSpaceId,
      handleAskBuddy,
      handleDeleteSpace,
      navigation,
      spaceProcessing,
    ],
  );

  const keyExtractor = useCallback((item: Space) => item._id, []);

  const listHeader = useMemo(
    () => (
      <View>
        <Header />
        <View style={styles.topCardsContainer}>
          <TopCard
            title="Create Space"
            subtitle="New AI memory workspace"
            color={colors.primaryPurple}
            icon={
              <AddSpace width={ms(18)} height={ms(18)} color={colors.white} />
            }
            onPress={openSpaceSheet}
          />

          <TopCard
            title={isVoiceActive ? 'Stop Listening' : 'Start Listening'}
            subtitle={
              isUploadingVoice
                ? 'Uploading voice message...'
                : isFetchingActiveSpace
                  ? 'Checking active space...'
                  : isVoiceActive
                    ? `In: ${activeSpace?.spacename || 'Space'}`
                    : 'Buddy is Ready to Listen.'
            }
            color={colors.accentCyan}
            active={isVoiceActive}
            activeColor={colors.accentCyan}
            icon={
              <MicIcon width={ms(18)} height={ms(18)} color={colors.white} />
            }
            onPress={() => {
              if (isVoiceActive) {
                handleStopListening();
                return;
              }
              openVoiceSheet();
            }}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Spaces</Text>
        </View>

        {isInitialSpacesLoading ? (
          <View style={styles.spacesLoader}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.spacesLoaderText}>Loading spaces...</Text>
          </View>
        ) : null}

        {!isInitialSpacesLoading && spaces.length === 0 ? (
          <SpacesEmptyState onCreatePress={openSpaceSheet} />
        ) : null}
      </View>
    ),
    [
      activeSpace?.spacename,
      handleStopListening,
      isFetchingActiveSpace,
      isInitialSpacesLoading,
      isUploadingVoice,
      isVoiceActive,
      openSpaceSheet,
      openVoiceSheet,
      spaces.length,
    ],
  );

  const listFooter = useMemo(() => {
    if (!(spaces.length > 0 && nextCursor)) {
      return <View style={styles.listFooterSpacer} />;
    }

    return (
      <View style={styles.loadMoreWrap}>
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={isFetchingSpaces}
          style={[
            styles.loadMoreButton,
            isFetchingSpaces && styles.loadMoreButtonDisabled,
          ]}
          onPress={() => setCursor(nextCursor)}
        >
          {isFetchingSpaces ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.loadMoreText}>Load more</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }, [isFetchingSpaces, nextCursor, spaces.length]);

  return (
    <LinearGradient
      colors={[
        colors.gradientStart,
        colors.gradientMid,
        colors.background,
        colors.gradientEnd,
      ]}
      locations={[0, 0.2, 0.65, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <FlatList
          data={isInitialSpacesLoading || spaces.length === 0 ? [] : spaces}
          keyExtractor={keyExtractor}
          renderItem={renderSpaceItem}
          ListHeaderComponent={listHeader}
          ListFooterComponent={listFooter}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
          bounces
          overScrollMode="never"
          decelerationRate="normal"
          scrollEventThrottle={16}
          removeClippedSubviews={Platform.OS === 'android'}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={7}
          updateCellsBatchingPeriod={50}
          nestedScrollEnabled
        />

        <CreateSpaceBottomSheet ref={spaceSheetRef} />
        <VoiceAssistantSheet
          ref={bottomSheetRef}
          onStart={handleStartListening}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Home;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: colors.gradientStart,
    paddingTop: mvs(4),
  },

  scrollContainer: {
    paddingTop: vSpacing.xl,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: layout.tabBarClearance,
    flexGrow: 1,
  },

  listFooterSpacer: {
    height: spacing.md,
  },

  loadMoreWrap: {
    alignItems: 'center',
    marginTop: spacing['2xl'],
    marginBottom: spacing.sm,
  },

  loadMoreButton: {
    minHeight: ms(36),
    paddingHorizontal: layout.screenPadding,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },

  loadMoreButtonDisabled: {
    opacity: 0.7,
  },

  loadMoreText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  topCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: mvs(28),
  },

  sectionHeader: {
    marginTop: mvs(34),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: fontSize.xl,
    color: colors.text,
    fontWeight: fontWeight.bold,
  },

  spacesLoader: {
    minHeight: mvs(150),
    marginTop: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii['3xl'],
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },

  spacesLoaderText: {
    marginTop: spacing.xl,
    color: colors.subText,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});
