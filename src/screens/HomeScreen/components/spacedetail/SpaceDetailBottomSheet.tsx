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
import { NotesIcon, TaskIcons } from '../../../../../styles/icons';
import SpaceSheetHeader from './SpaceSheetHeader';
import SpaceOverviewCard from './SpaceOverviewCard';
import SpaceActionList from './SpaceActionList';
import {
  colors,
  ms,
  radii,
  spacing,
  vSpacing,
} from '../../../../theme';

type Props = {
  space: Space | null;
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
    return 'recently';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const countLabel = (count: number, singular: string, plural: string) =>
  `${count} ${count === 1 ? singular : plural}`;

const SpaceDetailBottomSheet = forwardRef<BottomSheetModal, Props>(
  (
    {
      space,
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
    const snapPoints = useMemo(() => ['72%'], []);
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
          opacity={0.4}
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

    const notesCount = stats?.notesCount ?? 0;
    const tasksCount = stats?.tasksCount ?? 0;

    const actions = [
      {
        id: 'notes',
        label: 'Notes',
        subtitle: isStatsLoading
          ? 'Open captured notes'
          : countLabel(notesCount, 'note saved', 'notes saved'),
        icon: (
          <NotesIcon width={ms(16)} height={ms(16)} color={colors.primary} />
        ),
        onPress: handleNotes,
      },
      {
        id: 'tasks',
        label: 'Tasks',
        subtitle: isStatsLoading
          ? 'Open follow-up tasks'
          : countLabel(tasksCount, 'task tracked', 'tasks tracked'),
        icon: (
          <TaskIcons width={ms(16)} height={ms(16)} color={colors.primary} />
        ),
        onPress: handleTasks,
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
        {space ? (
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <SpaceSheetHeader
              title={space.spacename}
              description={space.description}
              createdAt={formatDate(space.createdAt)}
              isListening={space.isListning}
              onClose={handleClose}
            />

            <SpaceOverviewCard
              notesCount={notesCount}
              tasksCount={tasksCount}
              tasksCompleted={stats?.doneTasksCount ?? 0}
              completionRate={stats?.completionPercentage ?? 0}
              isLoading={isStatsLoading}
              isError={isStatsError}
              onRetry={onRetryStats}
            />

            <SpaceActionList
              spaceName={space.spacename}
              actions={actions}
              onAskBuddy={handleBuddy}
            />
          </BottomSheetScrollView>
        ) : null}
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
    backgroundColor: colors.border,
    width: ms(44),
    height: ms(5),
    borderRadius: radii.pill,
  },

  scrollContent: {
    paddingHorizontal: ms(20),
    paddingTop: spacing.xs,
    paddingBottom: Platform.OS === 'ios' ? vSpacing['3xl'] : vSpacing['2xl'],
    gap: spacing['2xl'],
  },
});
