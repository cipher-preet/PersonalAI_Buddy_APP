import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { BackHandler, Platform, StyleSheet } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { Space, SpaceStats } from '../../../../store/api/home';
import {
  AIChatIcons,
  NotesIcon,
  TaskIcons,
} from '../../../../../styles/icons';
import SpaceSheetHeader from './SpaceSheetHeader';
import SpaceOverviewCard from './SpaceOverviewCard';
import SpaceActionList from './SpaceActionList';
import {
  colors,
  layout,
  ms,
  radii,
  spacing,
  vSpacing,
} from '../../../../theme';

type Props = {
  space: Space | null;
  accentColor?: string;
  stats?: SpaceStats;
  isStatsLoading?: boolean;
  isStatsError?: boolean;
  onRetryStats?: () => void;
  onNavigateNotes: () => void;
  onNavigateTasks: () => void;
  onAskBuddy: () => void;
};

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const SpaceDetailBottomSheet = forwardRef<BottomSheetModal, Props>(
  (
    {
      space,
      accentColor = colors.primarySoft,
      stats,
      isStatsLoading = false,
      isStatsError = false,
      onRetryStats,
      onNavigateNotes,
      onNavigateTasks,
      onAskBuddy,
    },
    ref,
  ) => {
    const snapPoints = useMemo(() => ['56%'], []);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const handleClose = useCallback(() => {
      if (ref && 'current' in ref) {
        ref.current?.dismiss();
      }
    }, [ref]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
          opacity={0.38}
        />
      ),
      [],
    );

    useEffect(() => {
      if (!isSheetOpen) {
        return;
      }

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          handleClose();
          return true;
        },
      );

      return () => subscription.remove();
    }, [isSheetOpen, handleClose]);

    const handleNotes = () => {
      handleClose();
      onNavigateNotes();
    };

    const handleTasks = () => {
      handleClose();
      onNavigateTasks();
    };

    const handleBuddy = () => {
      handleClose();
      onAskBuddy();
    };

    if (!space) {
      return (
        <BottomSheetModal
          ref={ref}
          index={0}
          snapPoints={snapPoints}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          backgroundStyle={styles.sheetBackground}
          handleIndicatorStyle={styles.indicator}
          onChange={index => setIsSheetOpen(index >= 0)}
        >
          <></>
        </BottomSheetModal>
      );
    }

    const actions = [
      {
        id: 'notes',
        label: 'Open Notes',
        icon: (
          <NotesIcon width={ms(16)} height={ms(16)} color={colors.primary} />
        ),
        onPress: handleNotes,
      },
      {
        id: 'tasks',
        label: 'Open Tasks',
        icon: (
          <TaskIcons width={ms(16)} height={ms(16)} color={colors.primary} />
        ),
        onPress: handleTasks,
      },
      {
        id: 'buddy',
        label: 'Ask Buddy',
        icon: (
          <AIChatIcons
            width={ms(17)}
            height={ms(17)}
            color={colors.white}
          />
        ),
        onPress: handleBuddy,
        variant: 'primary' as const,
      },
    ];

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.indicator}
        onChange={index => setIsSheetOpen(index >= 0)}
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <SpaceSheetHeader
            title={space.spacename}
            description={space.description}
            createdAt={formatDate(space.createdAt)}
            isListening={space.isListining}
            accentColor={accentColor}
            onClose={handleClose}
          />

          <SpaceOverviewCard
            notesCount={stats?.notesCount ?? 0}
            tasksCount={stats?.tasksCount ?? 0}
            tasksCompleted={stats?.doneTasksCount ?? 0}
            completionRate={stats?.completionPercentage ?? 0}
            isLoading={isStatsLoading}
            isError={isStatsError}
            onRetry={onRetryStats}
          />

          <SpaceActionList actions={actions} />
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

export default SpaceDetailBottomSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.background,
    borderTopLeftRadius: ms(28),
    borderTopRightRadius: ms(28),
  },

  indicator: {
    backgroundColor: colors.muted,
    width: ms(56),
    height: ms(5),
    borderRadius: radii.pill,
  },

  scrollContent: {
    paddingHorizontal: ms(18),
    paddingTop: spacing.xxs,
    paddingBottom: Platform.OS === 'ios' ? vSpacing['3xl'] : vSpacing['2xl'],
    gap: layout.sectionGap,
  },
});
