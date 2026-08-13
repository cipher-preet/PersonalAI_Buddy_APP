import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../navigation/types';

import Header from './component/Header';
import TasksFilterMenu from './component/TasksFilterMenu';
import CategoryTabs from './component/CategoryTabs';
import TaskCard from './component/TaskCard';
import TaskDetailBottomSheet from './component/TaskDetailBottomSheet';
import { TaskItem } from './types/task';
import type { TaskFilter } from './types/filter';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useToast } from '../../store/context/ToastContext';
import {
  homeApi,
  StagedTaskCard,
  useDeleteStagedTaskMutation,
  useGetStagedTasksBySpaceQuery,
  useGetUserSpacesQuery,
} from '../../store/api/home';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  mvs,
  radii,
  spacing,
} from '../../theme';

const TaskScreen = () => {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const route = useRoute<RouteProp<MainTabParamList, 'Tasks'>>();
  const taskSheetRef = useRef<BottomSheetModal>(null);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [selectedSpaceId, setSelectedSpaceId] = useState('');
  const [tasksCursor, setTasksCursor] = useState('');
  const [loadedTasks, setLoadedTasks] = useState<StagedTaskCard[]>([]);
  const [nextTasksCursor, setNextTasksCursor] = useState<string | null>(null);
  const [taskCompletionOverrides, setTaskCompletionOverrides] = useState<
    Record<string, boolean>
  >({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('newest');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const userId = useAppSelector(state => state.auth.userId) ?? '';
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [deleteStagedTask] = useDeleteStagedTaskMutation();

  const {
    data: spacesData,
    isFetching: isFetchingSpaces,
    isError: isSpacesError,
    refetch: refetchSpaces,
  } = useGetUserSpacesQuery({ userId, limit: 50 }, { skip: !userId });

  const spaces = useMemo(
    () => spacesData?.data?.data?.spaces ?? [],
    [spacesData],
  );
  const isSpacesInitialLoading = isFetchingSpaces && spaces.length === 0;
  const selectedSpace = spaces.find(space => space._id === selectedSpaceId);
  const taskCountBySpaceId = useMemo(
    () =>
      new Map(
        spaces.map(space => [
          space._id,
          typeof space.tasksCount === 'number' ? space.tasksCount : 0,
        ]),
      ),
    [spaces],
  );

  const {
    data: stagedTasksData,
    isFetching: isFetchingTasks,
    isError: isTasksError,
    refetch: refetchTasks,
  } = useGetStagedTasksBySpaceQuery(
    {
      userId,
      spaceId: selectedSpaceId,
      limit: 20,
      cursor: tasksCursor,
    },
    { skip: !userId || !selectedSpaceId },
  );

  const isInitialTasksLoading = isFetchingTasks && loadedTasks.length === 0;
  const isLoadingMoreTasks = isFetchingTasks && loadedTasks.length > 0;

  const isTaskDoneFromApi = (task: StagedTaskCard) =>
    String(task.operation ?? '').toUpperCase() === 'DONE';

  const isTaskDone = useCallback(
    (task: StagedTaskCard) =>
      taskCompletionOverrides[task.id] ?? isTaskDoneFromApi(task),
    [taskCompletionOverrides],
  );

  const displayedTasks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    let result = [...loadedTasks];

    if (normalizedQuery) {
      result = result.filter(task => {
        const title = task.title?.toLowerCase() ?? '';
        const preview = task.descriptionPreview?.toLowerCase() ?? '';
        return (
          title.includes(normalizedQuery) || preview.includes(normalizedQuery)
        );
      });
    }

    if (taskFilter === 'done') {
      result = result.filter(task => isTaskDone(task));
    } else if (taskFilter === 'pending') {
      result = result.filter(task => !isTaskDone(task));
    }

    result.sort((left, right) => {
      const leftTime = new Date(
        left.updatedAt || left.createdAt || 0,
      ).getTime();
      const rightTime = new Date(
        right.updatedAt || right.createdAt || 0,
      ).getTime();

      return taskFilter === 'oldest'
        ? leftTime - rightTime
        : rightTime - leftTime;
    });

    return result;
  }, [isTaskDone, loadedTasks, searchQuery, taskFilter]);

  useFocusEffect(
    useCallback(() => {
      const spaceId = route.params?.spaceId;

      if (!spaceId) {
        return;
      }

      setSelectedSpaceId(spaceId);
      navigation.setParams({ spaceId: undefined });
    }, [navigation, route.params?.spaceId]),
  );

  useEffect(() => {
    if (spaces.length === 0) {
      return;
    }

    const selectedStillExists = spaces.some(
      space => space._id === selectedSpaceId,
    );

    if (!selectedSpaceId || !selectedStillExists) {
      setSelectedSpaceId(spaces[0]._id);
    }
  }, [selectedSpaceId, spaces]);

  useEffect(() => {
    setTasksCursor('');
    setLoadedTasks([]);
    setNextTasksCursor(null);
  }, [selectedSpaceId]);

  useEffect(() => {
    const response = stagedTasksData?.data;

    if (!response) {
      return;
    }

    setNextTasksCursor(response.nextCursor);

    if (tasksCursor === '') {
      setLoadedTasks(response.tasks);
      return;
    }

    setLoadedTasks(prev => {
      const existingIds = new Set(prev.map(task => task.id));
      const newTasks = response.tasks.filter(task => !existingIds.has(task.id));

      return newTasks.length > 0 ? [...prev, ...newTasks] : prev;
    });
  }, [stagedTasksData, tasksCursor]);

  const handleOpenTask = useCallback((task: TaskItem) => {
    setSelectedTask(task);
    requestAnimationFrame(() => {
      taskSheetRef.current?.present();
    });
  }, []);

  const handleToggleTaskComplete = useCallback(
    (task: StagedTaskCard) => {
      setTaskCompletionOverrides(prev => ({
        ...prev,
        [task.id]: !(prev[task.id] ?? isTaskDoneFromApi(task)),
      }));
    },
    [],
  );

  const getApiErrorMessage = (error: any, fallback: string) =>
    error?.data?.message || error?.message || fallback;

  const handleDeleteTask = useCallback(
    async (task: TaskItem) => {
      try {
        const response = await deleteStagedTask({
          taskId: task.id,
        }).unwrap();

        setLoadedTasks(prev => prev.filter(item => item.id !== task.id));

        setTaskCompletionOverrides(prev => {
          const next = { ...prev };
          delete next[task.id];
          return next;
        });

        if (selectedSpaceId && userId) {
          dispatch(
            homeApi.util.updateQueryData(
              'getUserSpaces',
              { userId, limit: 50 },
              draft => {
                const space = draft?.data?.data?.spaces?.find(
                  item => item._id === selectedSpaceId,
                );
                if (
                  space &&
                  typeof space.tasksCount === 'number' &&
                  space.tasksCount > 0
                ) {
                  space.tasksCount -= 1;
                }
              },
            ),
          );
        }

        if (selectedTask?.id === task.id) {
          taskSheetRef.current?.dismiss();
          setSelectedTask(null);
        }

        showToast({
          message:
            response?.data?.message ||
            response?.message ||
            'Task deleted successfully.',
          type: 'success',
        });
      } catch (error: any) {
        showToast({
          message: getApiErrorMessage(error, 'Unable to delete task.'),
          type: 'error',
        });
      }
    },
    [
      deleteStagedTask,
      dispatch,
      selectedSpaceId,
      selectedTask,
      showToast,
      userId,
    ],
  );

  const formatDate = (value: string | null) => {
    if (!value) {
      return 'Recently';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const toTaskItem = (task: StagedTaskCard): TaskItem => {
    const done = isTaskDone(task);
    const status = done ? 'Done' : 'Not Done';
    const body = task.body || task.descriptionPreview || '';
    const preview = task.descriptionPreview || body;
    const workspaceName = selectedSpace?.spacename || 'Space';
    const confidencePercent =
      typeof task.confidence === 'number'
        ? Math.round(task.confidence * 100)
        : null;

    return {
      id: task.id,
      title: task.title || 'Untitled task',
      subtitle: preview,
      tags: [
        status,
        task.priority || 'Normal Priority',
        confidencePercent ? `CONF ${confidencePercent}%` : '',
      ].filter(Boolean),
      status,
      priority: task.priority || 'Normal Priority',
      dueDate: task.dueDate ? formatDate(task.dueDate) : 'No due date',
      updatedAt: formatDate(task.updatedAt || task.createdAt),
      createdAt: formatDate(task.createdAt),
      project: workspaceName,
      assignee: 'You',
      summary: body,
      evidence: task.evidence ?? null,
    };
  };

  const renderTaskList = () => {
    if (isInitialTasksLoading) {
      return (
        <View style={styles.stateBox}>
          <ActivityIndicator size="small" color={colors.primaryDark} />
          <Text style={styles.stateText}>Loading tasks...</Text>
        </View>
      );
    }

    if (isTasksError) {
      return (
        <View style={styles.stateBox}>
          <Text style={styles.errorText}>Unable to load tasks.</Text>
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.retryButton}
            onPress={refetchTasks}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!selectedSpaceId) {
      return (
        <View style={styles.stateBox}>
          <Text style={styles.emptyTitle}>Select a space</Text>
          <Text style={styles.stateText}>Space tasks will appear here.</Text>
        </View>
      );
    }

    if (loadedTasks.length === 0) {
      return (
        <View style={styles.stateBox}>
          <Text style={styles.emptyTitle}>No tasks yet</Text>
          <Text style={styles.stateText}>This space has no staged tasks.</Text>
        </View>
      );
    }

    if (displayedTasks.length === 0) {
      return (
        <View style={styles.stateBox}>
          <Text style={styles.emptyTitle}>No matching tasks</Text>
          <Text style={styles.stateText}>
            Try a different search term or clear your filters.
          </Text>
        </View>
      );
    }

    return (
      <>
        {displayedTasks.map(task => {
          const item = toTaskItem(task);
          const completed = isTaskDone(task);

          return (
            <TaskCard
              key={item.id}
              item={item}
              completed={completed}
              onPress={() => handleOpenTask(item)}
              onToggleComplete={() => handleToggleTaskComplete(task)}
              onDelete={() => handleDeleteTask(item)}
            />
          );
        })}

        {nextTasksCursor ? (
          <View style={styles.loadMoreWrap}>
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={isLoadingMoreTasks}
              style={[
                styles.loadMoreButton,
                isLoadingMoreTasks && styles.loadMoreButtonDisabled,
              ]}
              onPress={() => setTasksCursor(nextTasksCursor)}
            >
              {isLoadingMoreTasks ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.loadMoreText}>Load more</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : null}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerWrap}>
        <Header
          searchQuery={searchQuery}
          taskFilter={taskFilter}
          isSearchActive={isSearchActive}
          onSearchQueryChange={setSearchQuery}
          onSearchOpen={() => setIsSearchActive(true)}
          onSearchClose={() => {
            setIsSearchActive(false);
            setSearchQuery('');
          }}
          onFilterPress={() => setFilterMenuVisible(true)}
        />
      </View>

      <CategoryTabs
        spaces={spaces}
        selectedSpaceId={selectedSpaceId}
        isLoading={isSpacesInitialLoading}
        isError={isSpacesError}
        getTaskCount={spaceId => taskCountBySpaceId.get(spaceId) ?? 0}
        onRetry={refetchSpaces}
        onSelectSpace={setSelectedSpaceId}
        onNavigateNotes={() => navigation.navigate('Notes')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        style={styles.tasksScroll}
      >
        {renderTaskList()}
      </ScrollView>

      <TaskDetailBottomSheet ref={taskSheetRef} task={selectedTask} />

      <TasksFilterMenu
        visible={filterMenuVisible}
        taskFilter={taskFilter}
        onClose={() => setFilterMenuVisible(false)}
        onSelect={setTaskFilter}
      />
    </SafeAreaView>
  );
};

export default TaskScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: mvs(16),
    paddingBottom: mvs(40),
  },

  headerWrap: {
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.lg,
  },

  tasksScroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: layout.tabBarClearance,
  },

  stateBox: {
    minHeight: mvs(120),
    marginBottom: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },

  stateText: {
    marginTop: spacing.md,
    color: colors.gray,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },

  emptyTitle: {
    color: colors.black,
    fontSize: fontSize.base,
    fontWeight: fontWeight.extrabold,
  },

  errorText: {
    color: colors.errorDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: ms(14),
    paddingVertical: ms(7),
    borderRadius: radii.pill,
    backgroundColor: colors.purpleLight,
  },

  retryText: {
    color: colors.primaryDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold,
  },

  loadMoreWrap: {
    alignItems: 'center',
    marginTop: spacing.xl,
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
});
