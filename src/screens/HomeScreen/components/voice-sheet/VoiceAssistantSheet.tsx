import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  BackHandler,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  Keyboard,
  View,
} from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '../../../../store/context/ToastContext';
import { useAppSelector } from '../../../../store/hooks';
import {
  Space,
  useCreateSpaceMutation,
  useGetUserSpacesQuery,
  useStartListningMutation,
} from '../../../../store/api/home';
import { requestVoiceListeningPermissions } from '../../../../services/voiceRecorderService';
import UpgradePlanPromptModal from '../../../../components/UpgradePlanPromptModal';
import { isPlanLimitError } from '../../../../utils/planLimitError';
import SpaceCard from './SpaceCard';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  mvs,
  radii,
  screenHeight,
  shadows,
  spacing,
} from '../../../../theme';

const FOOTER_HEIGHT = Platform.OS === 'ios' ? mvs(110) : mvs(90);
const MAX_SHEET_HEIGHT = screenHeight * 0.82;

const VoiceAssistantSheet = forwardRef(({ onStart }: any, ref: any) => {
  const navigation = useNavigation<any>();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [spaceName, setSpaceName] = useState('');
  const [cursor, setCursor] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const userId = useAppSelector(state => state.auth.userId) ?? '';
  const { showToast } = useToast();
  const [createSpace, { isLoading: isCreating }] = useCreateSpaceMutation();
  const [startListning, { isLoading: isStarting }] = useStartListningMutation();
  const {
    data: spacesData,
    isFetching: isFetchingSpaces,
    refetch: refetchSpaces,
  } = useGetUserSpacesQuery(
    { userId, limit: 10, cursor },
    { skip: !userId },
  );

  const snapPoints = useMemo(() => [MAX_SHEET_HEIGHT], []);

  const showPlanLimitPrompt = useCallback(() => {
    Keyboard.dismiss();
    setTimeout(() => {
      setShowUpgradePrompt(true);
    }, Platform.OS === 'ios' ? 250 : 120);
  }, []);

  const handleClose = useCallback(() => {
    ref?.current?.dismiss();
  }, [ref]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  useEffect(() => {
    if (!isSheetOpen) {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleClose();
      return true;
    });

    return () => subscription.remove();
  }, [isSheetOpen, handleClose]);

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
        userId,
      }).unwrap();

      if (response?.success) {
        showToast({
          message: response.data?.message || 'Space created successfully.',
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
    } catch (error: any) {
      if (isPlanLimitError(error)) {
        showPlanLimitPrompt();
        return;
      }

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
          await requestVoiceListeningPermissions();

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
        } catch (err: any) {
          showToast({
            message:
              err?.message === 'Microphone permission denied.' ||
              err?.message === 'Notification permission denied.'
                ? err.message
                : 'Start failed. Try again.',
            type: 'error',
          });
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
    <>
      <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableOverDrag={false}
      enableDynamicSizing={false}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.indicator}
      footerComponent={renderFooter}
      onChange={index => setIsSheetOpen(index >= 0)}
      onDismiss={() => {
        setIsSheetOpen(false);
        setSpaceName('');
        setCursor('');
        refetchSpaces();
      }}
    >
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.heading}>Start Voice Session</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subHeading}>
            Choose your workspace and continue.
          </Text>
        </View>

        <View style={styles.inputRow}>
          <BottomSheetTextInput
            placeholder="Create new space..."
            placeholderTextColor={colors.muted}
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
              <Text style={styles.loadMoreText}>Loading more spaces...</Text>
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

      <UpgradePlanPromptModal
        visible={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        onUpgrade={() => {
          setShowUpgradePrompt(false);
          ref?.current?.dismiss();
          navigation.navigate('Plans');
        }}
      />
    </>
  );
});

export default VoiceAssistantSheet;

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing['3xl'],
  },

  sheetBackground: {
    backgroundColor: colors.white,
    borderTopLeftRadius: ms(32),
    borderTopRightRadius: ms(32),
  },

  indicator: {
    backgroundColor: colors.muted,
    width: ms(70),
    height: ms(6),
    borderRadius: radii.pill,
  },

  header: {
    marginBottom: spacing['3xl'],
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  closeButton: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(17),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
  },

  closeIcon: {
    fontSize: ms(22),
    lineHeight: ms(24),
    color: colors.subText,
    fontWeight: fontWeight.medium,
    marginTop: -ms(1),
  },

  heading: {
    flex: 1,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    color: colors.black,
    paddingRight: spacing.xl,
  },

  subHeading: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: ms(20),
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing['4xl'],
  },

  input: {
    flex: 1,
    height: mvs(54),
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: ms(18),
    paddingHorizontal: ms(18),
    color: colors.black,
    fontSize: fontSize.base,
  },

  createBtn: {
    height: mvs(54),
    marginLeft: spacing.xl,
    paddingHorizontal: ms(18),
    borderRadius: ms(18),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    ...shadows.primary,
  },

  createBtnText: {
    color: colors.white,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.base,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: mvs(18),
  },

  sectionTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.black,
  },

  countText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: ms(5),
    borderRadius: radii.pill,
  },

  spaceContainer: {
    gap: spacing.xs,
  },

  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: ms(14),
    paddingBottom: Platform.OS === 'ios' ? mvs(34) : spacing['3xl'],
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },

  startButton: {
    height: mvs(58),
    borderRadius: ms(18),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    ...shadows.primary,
  },

  startButtonText: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },

  loadMoreButton: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    height: mvs(60),
    borderRadius: ms(18),
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
  },

  loadMoreButtonLoading: {
    opacity: 0.7,
    backgroundColor: colors.primaryLight,
    borderColor: colors.borderFocus,
  },

  loadMoreText: {
    color: colors.black,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },

  loadMoreSubtext: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
