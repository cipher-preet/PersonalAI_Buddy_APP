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
      accentColor = '#E9D5FF',
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
        icon: <NotesIcon width={16} height={16} color="#4338CA" />,
        onPress: handleNotes,
      },
      {
        id: 'tasks',
        label: 'Open Tasks',
        icon: <TaskIcons width={16} height={16} color="#4338CA" />,
        onPress: handleTasks,
      },
      {
        id: 'buddy',
        label: 'Ask Buddy',
        icon: <AIChatIcons width={17} height={17} color="#FFFFFF" />,
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
    backgroundColor: '#F7F7FB',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  indicator: {
    backgroundColor: '#CBD5E1',
    width: 56,
    height: 5,
    borderRadius: 999,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 2,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
    gap: 16,
  },
});
