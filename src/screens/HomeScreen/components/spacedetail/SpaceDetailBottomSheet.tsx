import React, {
  forwardRef,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { BackHandler, StyleSheet } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Space, SpaceStats } from '../../../../store/api/home';
import { NotesIcon, TaskIcons } from '../../../../../styles/icons';
import SpaceSheetHeader from './SpaceSheetHeader';
import SpaceActionList from './SpaceActionList';
import SpaceListeningCard from './SpaceListeningCard';
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
  isListeningHere?: boolean;
  isListeningElsewhere?: boolean;
  elsewhereSpaceName?: string;
  isListeningBusy?: boolean;
  onToggleListening: () => void;
  onNavigateNotes: () => void;
  onNavigateTasks: () => void;
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
      isListeningHere = false,
      isListeningElsewhere = false,
      elsewhereSpaceName,
      isListeningBusy = false,
      onToggleListening,
      onNavigateNotes,
      onNavigateTasks,
    },
    ref,
  ) => {
    const insets = useSafeAreaInsets();
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
          opacity={0.45}
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

    const handleListening = () => {
      onToggleListening();
    };

    const notesCount = stats?.notesCount ?? 0;
    const tasksCount = stats?.tasksCount ?? 0;

    const actions = [
      {
        id: 'notes',
        label: 'Notes',
        subtitle: isStatsLoading
          ? 'Open notes'
          : countLabel(notesCount, 'note', 'notes'),
        icon: (
          <NotesIcon width={ms(18)} height={ms(18)} color={colors.primary} />
        ),
        onPress: handleNotes,
      },
      {
        id: 'tasks',
        label: 'Tasks',
        subtitle: isStatsLoading
          ? 'Open tasks'
          : countLabel(tasksCount, 'task', 'tasks'),
        icon: (
          <TaskIcons width={ms(18)} height={ms(18)} color={colors.primary} />
        ),
        onPress: handleTasks,
      },
    ];

    return (
      <BottomSheetModal
        ref={ref}
        enableDynamicSizing
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.indicator}
        onChange={index => setIsSheetOpen(index >= 0)}
      >
        {space ? (
          <BottomSheetView
            style={[
              styles.content,
              {
                paddingBottom:
                  vSpacing.xl + Math.max(insets.bottom, spacing.md),
              },
            ]}
          >
            <SpaceSheetHeader
              title={space.spacename}
              description={space.description}
              createdAt={formatDate(space.createdAt)}
              isListening={isListeningHere || space.isListning}
              onClose={handleClose}
            />

            <SpaceListeningCard
              isListeningHere={isListeningHere}
              isListeningElsewhere={isListeningElsewhere}
              elsewhereSpaceName={elsewhereSpaceName}
              isBusy={isListeningBusy}
              onPress={handleListening}
            />

            <SpaceActionList actions={actions} />
          </BottomSheetView>
        ) : null}
      </BottomSheetModal>
    );
  },
);

export default SpaceDetailBottomSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.white,
    borderTopLeftRadius: ms(24),
    borderTopRightRadius: ms(24),
  },

  indicator: {
    backgroundColor: colors.border,
    width: ms(36),
    height: ms(4),
    borderRadius: radii.pill,
  },

  content: {
    paddingHorizontal: spacing['3xl'],
    paddingTop: spacing.sm,
    gap: spacing['2xl'],
  },
});
