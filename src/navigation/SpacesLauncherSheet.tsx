import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Easing,
  Keyboard,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetTextInput,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SpaceFolderIcon from '../components/SpaceFolderIcon';
import { useAppSelector } from '../store/hooks';
import { useToast } from '../store/context/ToastContext';
import { useCreateSpaceMutation, useGetUserSpacesQuery, type Space } from '../store/api/home';
import {
  colors,
  fonts,
  fontSize,
  fontWeight,
  ms,
  spacing,
} from '../theme';

const SPACE_PAGE_LIMIT = 20;
const MIN_SPACE_NAME_LENGTH = 3;

type Props = {
  onOpenNotes: (space: Space) => void;
  onOpenTasks: (space: Space) => void;
  onStartListening: (space: Space) => void;
  onClosed: () => void;
};

const spaceMeta = (space: Space) => {
  if (space.isListning) {
    return 'Listening';
  }

  const parts: string[] = [];

  if (typeof space.notesCount === 'number') {
    parts.push(
      `${space.notesCount} ${space.notesCount === 1 ? 'note' : 'notes'}`,
    );
  }

  if (typeof space.tasksCount === 'number') {
    parts.push(
      `${space.tasksCount} ${space.tasksCount === 1 ? 'task' : 'tasks'}`,
    );
  }

  return parts.join(' · ') || 'Open this space';
};

const NoteIcon = () => (
  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 4.5h7.2L18.5 9V19a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V6A1.5 1.5 0 0 1 7 4.5Z"
      stroke={colors.equalInk}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
    <Path
      d="M14 4.6V9h4.4M8.2 12.5h7.6M8.2 16h5.2"
      stroke={colors.equalInk}
      strokeWidth={1.6}
      strokeLinecap="round"
    />
  </Svg>
);

const TaskIcon = () => (
  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 6.5h10.5M8 12h10.5M8 17.5h10.5"
      stroke={colors.equalInk}
      strokeWidth={1.6}
      strokeLinecap="round"
    />
    <Path
      d="m4.2 6.6 1.1 1.1 2-2.2M4.2 12.1l1.1 1.1 2-2.2M4.2 17.6l1.1 1.1 2-2.2"
      stroke={colors.equalInk}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PlusIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5.5v13M5.5 12h13"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const ListenIcon = () => (
  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 4.2a2.8 2.8 0 0 0-2.8 2.8v4.4a2.8 2.8 0 0 0 5.6 0V7A2.8 2.8 0 0 0 12 4.2Z"
      stroke={colors.equalInk}
      strokeWidth={1.6}
    />
    <Path
      d="M7.2 11.4a4.8 4.8 0 0 0 9.6 0M12 16.2v3.2"
      stroke={colors.equalInk}
      strokeWidth={1.6}
      strokeLinecap="round"
    />
  </Svg>
);

const SpaceRow = ({
  space,
  onNotes,
  onTasks,
  onListen,
}: {
  space: Space;
  onNotes: (space: Space) => void;
  onTasks: (space: Space) => void;
  onListen: (space: Space) => void;
}) => {
  const meta = spaceMeta(space);
  const listening = Boolean(space.isListning);

  return (
    <View style={styles.row}>
      <View style={styles.rowTop}>
        <View style={styles.rowIcon}>
          <SpaceFolderIcon
            size={ms(28)}
            color={colors.equalGreen}
            listening={listening}
          />
        </View>
        <View style={styles.rowCopy}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {space.spacename}
          </Text>
          <Text
            style={[styles.rowMeta, listening && styles.rowMetaLive]}
            numberOfLines={1}
          >
            {meta}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.chip}
          activeOpacity={0.75}
          onPress={() => onNotes(space)}
          accessibilityRole="button"
          accessibilityLabel={`Notes in ${space.spacename}`}
        >
          <NoteIcon />
          <Text style={styles.chipText}>Notes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.chip}
          activeOpacity={0.75}
          onPress={() => onTasks(space)}
          accessibilityRole="button"
          accessibilityLabel={`Tasks in ${space.spacename}`}
        >
          <TaskIcon />
          <Text style={styles.chipText}>Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chip, styles.chipTint]}
          activeOpacity={0.75}
          onPress={() => onListen(space)}
          accessibilityRole="button"
          accessibilityLabel={
            listening
              ? `Listening in ${space.spacename}`
              : `Start listening in ${space.spacename}`
          }
        >
          <ListenIcon />
          <Text style={styles.chipText}>
            {listening ? 'Listening' : 'Start listening'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const SpacesLauncherSheet = forwardRef<BottomSheetModal, Props>(
  ({ onOpenNotes, onOpenTasks, onStartListening, onClosed }, ref) => {
    const insets = useSafeAreaInsets();
    const { showToast } = useToast();
    const userId = useAppSelector(state => state.auth.userId) ?? '';
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [hasOpened, setHasOpened] = useState(false);
    const [cursor, setCursor] = useState('');
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [composing, setComposing] = useState(false);
    const [spaceName, setSpaceName] = useState('');
    const [spaceNameError, setSpaceNameError] = useState('');
    const [headerWidth, setHeaderWidth] = useState(0);
    const slide = useRef(new Animated.Value(0)).current;
    const inputRef = useRef<React.ElementRef<typeof BottomSheetTextInput>>(null);
    const [createSpace, { isLoading: isCreating }] = useCreateSpaceMutation();
    const { data, isFetching, isError, refetch } = useGetUserSpacesQuery(
      { userId, limit: SPACE_PAGE_LIMIT, cursor },
      { skip: !userId || !hasOpened },
    );

    useEffect(() => {
      const response = data?.data?.data;

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
    }, [cursor, data]);

    const handleClose = useCallback(() => {
      if (ref && 'current' in ref) {
        ref.current?.dismiss();
      }
    }, [ref]);

    const resetComposer = useCallback(() => {
      setComposing(false);
      setSpaceName('');
      setSpaceNameError('');
      slide.setValue(0);
    }, [slide]);

    const openComposer = useCallback(() => {
      setComposing(true);
      setSpaceNameError('');
      Animated.timing(slide, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          inputRef.current?.focus();
        }
      });
    }, [slide]);

    const closeComposer = useCallback(() => {
      Keyboard.dismiss();
      Animated.timing(slide, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setComposing(false);
          setSpaceName('');
          setSpaceNameError('');
        }
      });
    }, [slide]);

    const handleCreate = useCallback(async () => {
      const trimmedName = spaceName.trim();

      if (!trimmedName) {
        setSpaceNameError('Enter a space name.');
        return;
      }

      if (trimmedName.length < MIN_SPACE_NAME_LENGTH) {
        setSpaceNameError(
          `Use at least ${MIN_SPACE_NAME_LENGTH} characters.`,
        );
        return;
      }

      setSpaceNameError('');

      try {
        const response = await createSpace({
          spacename: trimmedName,
          userId,
        }).unwrap();

        if (!response?.success) {
          showToast({ message: 'Unable to create space', type: 'error' });
          return;
        }

        showToast({
          message: response.data?.message || 'Space created',
          type: 'success',
        });
        Keyboard.dismiss();
        setCursor('');
        resetComposer();
      } catch (error: any) {
        const message = error?.data?.message || error?.message;
        setSpaceNameError(
          typeof message === 'string' && message
            ? message
            : 'Create space failed. Try again.',
        );
      }
    }, [createSpace, resetComposer, showToast, spaceName, userId]);

    useEffect(() => {
      if (!isSheetOpen) {
        return undefined;
      }

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (composing) {
            closeComposer();
            return true;
          }

          handleClose();
          return true;
        },
      );

      return () => subscription.remove();
    }, [closeComposer, composing, handleClose, isSheetOpen]);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
          opacity={0.45}
        />
      ),
      [],
    );

    const handleSheetChange = useCallback((index: number) => {
      setIsSheetOpen(index >= 0);
    }, []);

    const handleAnimate = useCallback((_from: number, to: number) => {
      if (to >= 0) {
        setHasOpened(true);
      }
    }, []);

    const travel = headerWidth || 360;
    const buttonShift = slide.interpolate({
      inputRange: [0, 1],
      outputRange: [0, travel],
    });
    const inputShift = slide.interpolate({
      inputRange: [0, 1],
      outputRange: [-travel, 0],
    });

    const listHeader = (
      <View style={styles.headerBlock}>
        <View
          style={styles.header}
          onLayout={event => {
            const nextWidth = event.nativeEvent.layout.width;
            setHeaderWidth(current =>
              current === nextWidth ? current : nextWidth,
            );
          }}
        >
          <Animated.View
            pointerEvents={composing ? 'none' : 'auto'}
            style={[
              styles.headerLayer,
              { transform: [{ translateX: buttonShift }] },
            ]}
          >
            <TouchableOpacity
              style={styles.headerButton}
              activeOpacity={0.85}
              onPress={openComposer}
              accessibilityRole="button"
              accessibilityLabel="Create space"
            >
              <PlusIcon color={colors.equalInk} />
              <Text style={styles.headerButtonText}>Create space</Text>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View
            pointerEvents={composing ? 'auto' : 'none'}
            style={[
              styles.headerLayer,
              styles.composer,
              { transform: [{ translateX: inputShift }] },
            ]}
          >
            <BottomSheetTextInput
              ref={inputRef}
              value={spaceName}
              onChangeText={value => {
                setSpaceName(value);
                if (spaceNameError) {
                  setSpaceNameError('');
                }
              }}
              placeholder="Space name"
              placeholderTextColor={colors.muted}
              style={styles.composerInput}
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
            <TouchableOpacity
              style={[styles.createPill, isCreating && styles.createPillBusy]}
              activeOpacity={0.85}
              onPress={handleCreate}
              disabled={isCreating}
              accessibilityRole="button"
              accessibilityLabel="Create space"
            >
              <Text style={styles.createPillText}>
                {isCreating ? 'Creating' : 'Create'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
        {spaceNameError ? (
          <Text style={styles.composerError}>{spaceNameError}</Text>
        ) : null}
      </View>
    );

    const listEmpty = () => {
      if (!userId) {
        return (
          <View style={styles.statusBlock}>
            <Text style={styles.statusTitle}>Sign in to see spaces</Text>
            <Text style={styles.statusText}>
              Your spaces show up here after you sign in.
            </Text>
          </View>
        );
      }

      if (isError) {
        return (
          <View style={styles.statusBlock}>
            <Text style={styles.statusTitle}>Could not load spaces</Text>
            <Text style={styles.statusText}>
              Check your connection and try again.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                refetch();
              }}
              accessibilityRole="button"
              accessibilityLabel="Try loading spaces again"
            >
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        );
      }

      if (isFetching || !data) {
        return (
          <View style={styles.statusBlock}>
            <ActivityIndicator color={colors.equalGreen} />
            <Text style={styles.statusText}>Loading spaces...</Text>
          </View>
        );
      }

      return (
        <View style={styles.statusBlock}>
          <Text style={styles.statusTitle}>No spaces yet</Text>
          <Text style={styles.statusText}>
            Create a space and it will show up here.
          </Text>
        </View>
      );
    };

    const listFooter = () => {
      if (isFetching && spaces.length > 0) {
        return (
          <View style={styles.footer}>
            <ActivityIndicator color={colors.equalGreen} />
          </View>
        );
      }

      if (!nextCursor) {
        return <View style={styles.footerSpacer} />;
      }

      return (
        <TouchableOpacity
          style={styles.moreButton}
          activeOpacity={0.75}
          disabled={isFetching}
          onPress={() => setCursor(nextCursor)}
          accessibilityRole="button"
          accessibilityLabel="Load more spaces"
        >
          <Text style={styles.moreText}>Load more</Text>
        </TouchableOpacity>
      );
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={['76%']}
        enableDynamicSizing={false}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handle}
        onChange={handleSheetChange}
        onAnimate={handleAnimate}
        onDismiss={() => {
          setIsSheetOpen(false);
          resetComposer();
          onClosed();
        }}
      >
        <BottomSheetFlatList
          style={styles.list}
          data={spaces}
          keyExtractor={(item: Space) => item._id}
          renderItem={({ item }: { item: Space }) => (
            <SpaceRow
              space={item}
              onNotes={onOpenNotes}
              onTasks={onOpenTasks}
              onListen={onStartListening}
            />
          )}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={listEmpty}
          ListFooterComponent={listFooter}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(insets.bottom, spacing['3xl']) },
          ]}
          showsVerticalScrollIndicator={false}
        />
      </BottomSheetModal>
    );
  },
);

SpacesLauncherSheet.displayName = 'SpacesLauncherSheet';

export default SpacesLauncherSheet;

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  sheetBackground: {
    backgroundColor: colors.sheet,
    borderTopLeftRadius: ms(28),
    borderTopRightRadius: ms(28),
  },
  handle: {
    width: ms(42),
    height: ms(4),
    borderRadius: ms(2),
    backgroundColor: '#D0D5DD',
  },
  listContent: {
    paddingHorizontal: spacing['3xl'],
  },
  headerBlock: {
    paddingTop: 4,
    paddingBottom: 16,
  },
  header: {
    height: 52,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  headerLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 52,
  },
  headerButton: {
    alignSelf: 'flex-start',
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  headerButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 18,
    color: colors.equalInk,
  },
  composer: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 6,
  },
  composerInput: {
    flex: 1,
    minWidth: 0,
    height: 50,
    paddingVertical: 0,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.equalInk,
  },
  createPill: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createPillBusy: {
    opacity: 0.7,
  },
  createPillText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 18,
    color: colors.onPrimary,
  },
  composerError: {
    marginTop: 8,
    paddingHorizontal: 8,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.error,
  },
  row: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    marginBottom: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.equalLine,
    backgroundColor: colors.white,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    width: ms(42),
    height: ms(42),
    borderRadius: ms(14),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.equalGreenSoft,
    marginRight: spacing.xl,
  },
  rowCopy: {
    flex: 1,
    marginRight: spacing.md,
  },
  rowTitle: {
    color: colors.equalInk,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.2,
  },
  rowMeta: {
    marginTop: spacing.xxs,
    color: colors.equalMuted,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  rowMetaLive: {
    color: colors.primaryText,
  },
  actions: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipTint: {
    backgroundColor: '#F4EEFF',
    borderColor: 'transparent',
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.equalInk,
  },
  statusBlock: {
    alignItems: 'center',
    paddingHorizontal: spacing['3xl'],
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['5xl'],
  },
  statusTitle: {
    color: colors.equalInk,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  statusText: {
    marginTop: spacing.md,
    color: colors.equalMuted,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
    lineHeight: ms(20),
  },
  retryButton: {
    marginTop: spacing['3xl'],
    paddingHorizontal: spacing['4xl'],
    paddingVertical: spacing.xl,
    borderRadius: ms(20),
    backgroundColor: colors.equalGreenSoft,
  },
  retryText: {
    color: colors.primaryText,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  footer: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  footerSpacer: {
    height: spacing['2xl'],
  },
  moreButton: {
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing['3xl'],
    paddingHorizontal: spacing['4xl'],
    paddingVertical: spacing.xl,
  },
  moreText: {
    color: colors.primaryText,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
});
