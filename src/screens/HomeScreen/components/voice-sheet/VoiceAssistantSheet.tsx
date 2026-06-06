import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useToast } from '../../../../store/context/ToastContext';
import {
  Space,
  useCreateSpaceMutation,
  useGetUserSpacesQuery,
  useStartListningMutation,
} from '../../../../store/api/home';
import SpaceCard from './SpaceCard';

const STATIC_USER_ID = '6a21be267be2c45e7960c4ab';

const FOOTER_HEIGHT = Platform.OS === 'ios' ? 110 : 90;

const VoiceAssistantSheet = forwardRef(({ onStart }: any, ref: any) => {
  const snapPoints = useMemo(() => ['80%'], []);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [spaceName, setSpaceName] = useState('');
  const [cursor, setCursor] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const { showToast } = useToast();
  const [createSpace, { isLoading: isCreating }] = useCreateSpaceMutation();
  const [startListning, { isLoading: isStarting }] = useStartListningMutation();
  const {
    data: spacesData,
    isFetching: isFetchingSpaces,
    refetch: refetchSpaces,
  } = useGetUserSpacesQuery({ userId: STATIC_USER_ID, limit: 10, cursor });

  useEffect(() => {
    const response = spacesData?.data?.data;
    if (!response) {
      return;
    }

    const fetchedSpaces = response.spaces || [];
    setNextCursor(response.nextCursor || null);

    if (cursor === '') {
      setSpaces(fetchedSpaces);
      if (fetchedSpaces.length > 0) {
        setSelectedSpace(fetchedSpaces[0]);
      }
    } else {
      setSpaces(prev => {
        const existingIds = new Set(prev.map(p => p._id));
        const newItems = fetchedSpaces.filter(s => !existingIds.has(s._id));
        return newItems.length > 0 ? [...prev, ...newItems] : prev;
      });
    }
  }, [spacesData, cursor]);

  const handleCreateSpace = async () => {
    const trimmedName = spaceName.trim();
    if (!trimmedName) {
      showToast({ message: 'Please enter a space name.', type: 'error' });
      return;
    }

    try {
      const response = await createSpace({
        spacename: trimmedName,
        userId: STATIC_USER_ID,
      }).unwrap();

      if (response?.success) {
        showToast({
          message: response.data || 'Space created successfully.',
          type: 'success',
        });
        setSpaceName('');
        setCursor('');
        setSpaces([]);
        refetchSpaces();
      } else {
        showToast({
          message: response.message || 'Unable to create space.',
          type: 'error',
        });
      }
    } catch (error) {
      showToast({
        message: 'Create space failed. Please try again.',
        type: 'error',
      });
      console.log('Create space failed:', error);
    }
  };

  const renderFooter = useCallback(
    (props: any) => {
      const handleStartSession = async () => {
        if (!selectedSpace) {
          showToast({ message: 'Please select a space.', type: 'error' });
          return;
        }

        try {
          const res = await startListning({
            spaceId: selectedSpace._id,
            isListning: true,
          }).unwrap();
          if (res?.success) {
            showToast({ message: 'Started listening.', type: 'success' });
            ref?.current?.dismiss();
            onStart?.({ space: selectedSpace, mode: 'voice', response: res });
          } else {
            showToast({
              message: res?.data?.message || 'Unable to start.',
              type: 'error',
            });
          }
        } catch (err) {
          showToast({ message: 'Start failed. Try again.', type: 'error' });
          console.log('startListning error:', err);
        }
      };

      return (
        <BottomSheetFooter {...props} bottomInset={0}>
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.startButton}
              onPress={handleStartSession}
              disabled={isStarting}
            >
              <Text style={styles.startButtonText}>
                {isStarting ? 'Starting...' : 'Start Session'}
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetFooter>
      );
    },
    [selectedSpace, onStart, isStarting, startListning, showToast, ref],
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.indicator}
      footerComponent={renderFooter}
    >
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>Start Voice Session</Text>
          <Text style={styles.subHeading}>
            Choose your workspace and continue.
          </Text>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            placeholder="Create new space..."
            placeholderTextColor="#9CA3AF"
            value={spaceName}
            onChangeText={setSpaceName}
            style={styles.input}
          />
          <TouchableOpacity
            style={styles.createBtn}
            onPress={handleCreateSpace}
            activeOpacity={0.85}
            disabled={isCreating}
          >
            <Text style={styles.createBtnText}>
              {isCreating ? 'Creating...' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Spaces</Text>
          <Text style={styles.countText}>{spaces.length}</Text>
        </View>

        <View style={styles.spaceContainer}>
          {spaces.map(item => (
            <SpaceCard
              key={item._id}
              item={item}
              selected={selectedSpace?._id === item._id}
              onPress={() => setSelectedSpace(item)}
            />
          ))}
        </View>

        {nextCursor ? (
          <TouchableOpacity
            style={[
              styles.loadMoreButton,
              isFetchingSpaces && styles.loadMoreButtonLoading,
            ]}
            onPress={() => setCursor(nextCursor)}
            disabled={isFetchingSpaces}
            activeOpacity={0.7}
          >
            {isFetchingSpaces ? (
              <>
                <Text style={styles.loadMoreText}>Loading more spaces...</Text>
              </>
            ) : (
              <>
                <Text style={styles.loadMoreText}>Load More Spaces</Text>
                <Text style={styles.loadMoreSubtext}>
                  Show additional workspaces
                </Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}

        <View style={{ height: FOOTER_HEIGHT }} />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

export default VoiceAssistantSheet;

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },

  sheetBackground: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },

  indicator: {
    backgroundColor: '#CBD5E1',
    width: 70,
    height: 6,
    borderRadius: 999,
  },

  header: { marginBottom: 28 },

  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },

  subHeading: {
    marginTop: 8,
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },

  input: {
    flex: 1,
    height: 54,
    backgroundColor: '#F7F8FD',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    paddingHorizontal: 18,
    color: '#111827',
    fontSize: 14,
  },

  createBtn: {
    height: 54,
    marginLeft: 12,
    paddingHorizontal: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5B5BFF',
    shadowColor: '#4F46E5',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 4,
  },

  createBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },

  countText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  spaceContainer: { gap: 4 },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  startButton: {
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4338CA',
    shadowColor: '#4338CA',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 5,
  },

  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  loadMoreButton: {
    marginTop: 24,
    marginBottom: 8,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },

  loadMoreButtonLoading: {
    opacity: 0.7,
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },

  loadMoreText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },

  loadMoreSubtext: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
});
