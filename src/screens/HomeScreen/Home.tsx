import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { StatusBar } from 'react-native';

import Header from './components/Header';
import TopCard from './components/TopCard';
import QuickActionCard from './components/QuickActionCard';
import SpaceCard from './components/SpaceCard';
import {
  AddSpace,
  AiSuggest,
  HabbitTracker,
  MicIcon,
  MySpcaes,
  ReminderIcon,
  VoiceNote,
} from '../../../styles/icons';
import VoiceAssistantSheet from './components/voice-sheet/VoiceAssistantSheet';

import { useToast } from '../../store/context/ToastContext';

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import CreateSpaceBottomSheet from './components/addspcesheet/CreateSpaceBottomSheet';
import {
  Space,
  useStartListningMutation,
  useGetUserActiveSpaceQuery,
  useGetUserSpacesQuery,
} from '../../store/api/home';
import {
  endListeningSession,
  startListeningSession,
  startVoiceRecordingWithSilenceDetection,
  stopVoiceRecording,
  uploadVoiceMessage,
} from '../../services/voiceRecorderService';

const STATIC_USER_ID = '6a21be267be2c45e7960c4ab';
const SPACE_PAGE_LIMIT = 10;
const SPACE_COLORS = [
  '#7C4DFF65',
  '#13D11981',
  '#9DC3C989',
  '#A5D11364',
  '#D113C458',
  '#BE33175E',
  '#1A37BB50',
  '#FF980066',
];

const getSpaceColor = (id: string) => {
  const hash = id.split('').reduce((total, char) => {
    return total + char.charCodeAt(0);
  }, 0);

  return SPACE_COLORS[hash % SPACE_COLORS.length];
};

const formatCreatedAt = (createdAt: string) => {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `Created ${date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
};

type VoiceStartData = {
  space?: Space;
  mode?: string;
};

type RecordingContext = {
  spaceId: string;
  mode: string;
};

const Home = () => {
  // const bottomSheetRef = useRef<any>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const spaceSheetRef = useRef<BottomSheetModal>(null);

  const recordingContextRef = useRef<RecordingContext | null>(null);
  const uploadQueueRef = useRef<Promise<void>>(Promise.resolve());
  const pendingVoiceUploadsRef = useRef(0);

  const [isListening, setIsListening] = useState(false);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [cursor, setCursor] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const { showToast } = useToast();
  const [startListning] = useStartListningMutation();
  const { data: activeSpaceData, isFetching: isFetchingActiveSpace } =
    useGetUserActiveSpaceQuery({ userId: STATIC_USER_ID });
  const { data: spacesData, isFetching: isFetchingSpaces } =
    useGetUserSpacesQuery({
      userId: STATIC_USER_ID,
      limit: SPACE_PAGE_LIMIT,
      cursor,
    });
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

  const quickActions = [
    {
      id: 8,
      title: 'AI Suggest',
      icon: <AiSuggest width={18} height={18} color="#7B4DFF" />,
      color: '#7B4DFF',
    },
    {
      id: 2,
      title: 'Reminders',
      icon: <ReminderIcon width={18} height={18} color="#FF9800" />,
      color: '#FF9800',
    },
    {
      id: 3,
      title: 'Voice Note',
      icon: <VoiceNote width={18} height={18} color="#13B5D1" />,
      color: '#13B5D1',
    },
    {
      id: 4,
      title: 'Habbit Tracker',
      icon: <HabbitTracker width={18} height={18} color="#E83E8C" />,
      color: '#E83E8C',
    },
  ];

  const updateUploadingState = (delta: number) => {
    pendingVoiceUploadsRef.current = Math.max(
      0,
      pendingVoiceUploadsRef.current + delta,
    );
    setIsUploadingVoice(pendingVoiceUploadsRef.current > 0);
  };

  const enqueueRecordedVoiceUpload = (filePath: string) => {
    const recordingContext = recordingContextRef.current;

    if (!recordingContext) {
      console.log('Voice upload skipped: missing recording context.');
      return Promise.resolve();
    }

    updateUploadingState(1);
    console.log('Voice upload queued:', {
      filePath,
      spaceId: recordingContext.spaceId,
      mode: recordingContext.mode,
    });

    const uploadTask = uploadQueueRef.current
      .catch(() => undefined)
      .then(async () => {
        try {
          await uploadVoiceMessage({
            userId: STATIC_USER_ID,
            spaceId: recordingContext.spaceId,
            mode: recordingContext.mode,
            filePath,
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
    const selectedSpace = data?.space;
    const mode = data?.mode || 'voice';

    if (!selectedSpace?._id) {
      showToast({ message: 'Please select a space.', type: 'error' });
      return;
    }

    try {
      recordingContextRef.current = {
        spaceId: selectedSpace._id,
        mode,
      };
      await startListeningSession({
        userId: STATIC_USER_ID,
        spaceId: selectedSpace._id,
      });

      await startVoiceRecordingWithSilenceDetection({
        onSegmentReady: async recording => {
          showToast({
            message: 'Sending voice chunk...',
            type: 'success',
          });
          await enqueueRecordedVoiceUpload(recording.path);
        },
        onSilenceDetected: async recording => {
          showToast({
            message: 'Sending voice chunk...',
            type: 'success',
          });
          await enqueueRecordedVoiceUpload(recording.path);
        },
        stopOnSilence: false,
      });

      setIsListening(true);
      showToast({ message: 'Recording started. Speak now.', type: 'success' });
    } catch (error) {
      console.log('START ERROR:', error);
      recordingContextRef.current = null;
      setIsListening(false);
      try {
        await endListeningSession({
          userId: STATIC_USER_ID,
          spaceId: selectedSpace._id,
        });
        await startListning({
          spaceId: selectedSpace._id,
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

  const isUserListening = activeSpace?.isListining === true;
  const isVoiceActive = isListening || isUserListening;

  /**
   * OPEN BOTTOM SHEET
   */

  const openVoiceSheet = () => {
    bottomSheetRef.current?.present();
  };

  const handleStopListening = async () => {
    const recordingContext = recordingContextRef.current;

    try {
      if (recordingContext) {
        const recording = await stopVoiceRecording();
        showToast({
          message: 'Recording stopped. Sending final voice...',
          type: 'success',
        });

        await enqueueRecordedVoiceUpload(recording.path);
        await uploadQueueRef.current.catch(() => undefined);

        await endListeningSession({
          userId: STATIC_USER_ID,
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
        await endListeningSession({
          userId: STATIC_USER_ID,
          spaceId: activeSpace._id,
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
      showToast({ message: 'Stop failed. Try again.', type: 'error' });
      console.log('stopListening error:', err);
    }
  };

  const openSpaceSheet = () => {
    spaceSheetRef.current?.present();
  };

  return (
    <LinearGradient
      colors={['#F9F7FF', '#EFF3FF', '#F7FAFF', '#FFFFFF']}
      locations={[0, 0.2, 0.65, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <Header />
          <View style={styles.topCardsContainer}>
            <TopCard
              title="Create Space"
              subtitle="New AI memory workspace"
              color="#8B5CF6"
              icon={<AddSpace width={18} height={18} color="#FFFFFF" />}
              onPress={() => {
                openSpaceSheet();
              }}
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
              color="#15C7E8"
              icon={<MicIcon width={18} height={18} color="#FFFFFF" />}
              onPress={() => {
                if (isVoiceActive) {
                  handleStopListening();
                  return;
                }
                openVoiceSheet();
              }}
            />
          </View>

          <CreateSpaceBottomSheet ref={spaceSheetRef} />

          <VoiceAssistantSheet
            ref={bottomSheetRef}
            onStart={handleStartListening}
          />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <Text style={styles.viewAllText}>See all</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickContainer}
          >
            {quickActions.map(item => (
              <QuickActionCard
                key={item.id}
                title={item.title}
                icon={item.icon}
                color={item.color}
              />
            ))}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Spaces</Text>

            <Text style={styles.viewAllText}>View all</Text>
          </View>

          {isInitialSpacesLoading ? (
            <View style={styles.spacesLoader}>
              <ActivityIndicator size="large" color="#4338CA" />
              <Text style={styles.spacesLoaderText}>Loading spaces...</Text>
            </View>
          ) : (
            spaces.map(item => (
              <SpaceCard
                key={item._id}
                title={item.spacename}
                description={
                  item.description || formatCreatedAt(item.createdAt)
                }
                time={formatCreatedAt(item.createdAt)}
                icon={<MySpcaes width={18} height={18} color="#000000" />}
                color={getSpaceColor(item._id)}
              />
            ))
          )}

          {nextCursor ? (
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
                <ActivityIndicator size="small" color="#4338CA" />
              ) : null}
              <View style={styles.loadMoreTextGroup}>
                <Text style={styles.loadMoreText}>
                  {isFetchingSpaces
                    ? 'Loading more spaces'
                    : 'Load More Spaces'}
                </Text>
                <Text style={styles.loadMoreSubText}>
                  Continue browsing your workspaces
                </Text>
              </View>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
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
    backgroundColor: '#F9F7FF',
    paddingTop: 4,
  },

  scrollContainer: {
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  topCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
  },

  sectionHeader: {
    marginTop: 34,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 16,
    color: '#1E2432',
    fontWeight: '700',
  },

  viewAllText: {
    fontSize: 12,
    color: '#7B4DFF',
    fontWeight: '600',
  },

  quickContainer: {
    paddingTop: 18,
    paddingBottom: 6,
  },

  spacesLoader: {
    minHeight: 150,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },

  spacesLoaderText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },

  loadMoreButton: {
    minHeight: 64,
    borderRadius: 22,
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    paddingHorizontal: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE5FF',
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },

  loadMoreButtonDisabled: {
    opacity: 0.7,
  },

  loadMoreTextGroup: {
    marginLeft: 12,
  },

  loadMoreText: {
    color: '#4338CA',
    fontSize: 14,
    fontWeight: '700',
  },

  loadMoreSubText: {
    marginTop: 3,
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
});
