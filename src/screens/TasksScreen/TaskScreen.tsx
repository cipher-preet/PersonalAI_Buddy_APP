import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
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
import AddTaskBottomSheet from './component/AddTaskBottomSheet';
import NotesCalendarStrip, {
  toDateKey,
} from '../NotesScreen/component/NotesCalendarStrip';
import { LocalTask, TaskItem } from './types/task';
import type { TaskFilter } from './types/filter';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useToast } from '../../store/context/ToastContext';
import {
  homeApi,
  StagedTaskCard,
  useCreateStagedTaskMutation,
  useDeleteStagedTaskMutation,
  useGetStagedTasksBySpaceQuery,
  useGetUserSpacesQuery,
} from '../../store/api/home';
import UpgradePlanPromptModal from '../../components/UpgradePlanPromptModal';
import { isPlanLimitError } from '../../utils/planLimitError';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  listPerf,
  ms,
  mvs,
  radii,
  spacing,
} from '../../theme';

const TASKS_PAGE_SIZE = 20;

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

const formatDateKey = (value: string | null) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return toDateKey(date);
};

const formatFullDate = (date: Date) =>
  date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

const toLocalStagedTask = (task: LocalTask): StagedTaskCard => ({
  id: task.id,
  title: task.title,
  body: task.description,
  descriptionPreview: task.description || 'No description added.',
  evidence: null,
  operation: null,
  priority: null,
  dueDate: task.dateKey,
  confidence: null,
  createdAt: task.createdAt,
  updatedAt: task.createdAt,
});

const isLocalTaskId = (id: string) => id.startsWith('local-');

const TaskScreen = () => {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const route = useRoute<RouteProp<MainTabParamList, 'Tasks'>>();
  const taskSheetRef = useRef<BottomSheetModal>(null);
  const addTaskSheetRef = useRef<BottomSheetModal>(null);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [selectedSpaceId, setSelectedSpaceId] = useState('');
  const [tasksCursor, setTasksCursor] = useState('');
  const [loadedTasks, setLoadedTasks] = useState<StagedTaskCard[]>([]);
  const [localTasks, setLocalTasks] = useState<LocalTask[]>([]);
  const [nextTasksCursor, setNextTasksCursor] = useState<string | null>(null);
  const [taskCompletionOverrides, setTaskCompletionOverrides] = useState<
    Record<string, boolean>
  >({});
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('newest');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const userId = useAppSelector(state => state.auth.userId) ?? '';
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [createStagedTask, { isLoading: isCreatingTask }] =
    useCreateStagedTaskMutation();
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
      limit: TASKS_PAGE_SIZE,
      cursor: tasksCursor,
    },
    { skip: !userId || !selectedSpaceId },
  );

  const isInitialTasksLoading = isFetchingTasks && loadedTasks.length === 0;
  const isLoadingMoreTasks = isFetchingTasks && loadedTasks.length > 0;
  const selectedDateKey = useMemo(() => toDateKey(selectedDate), [selectedDate]);

  const spaceLocalTasks = useMemo(
    () => localTasks.filter(task => task.spaceId === selectedSpaceId),
    [localTasks, selectedSpaceId],
  );

  const markedDateKeys = useMemo(() => {
    const keys = new Set<string>();

    spaceLocalTasks.forEach(task => {
      keys.add(task.dateKey);
    });

    loadedTasks.forEach(task => {
      const key = formatDateKey(
        task.dueDate || task.createdAt || task.updatedAt,
      );
      if (key) {
        keys.add(key);
      }
    });

    return keys;
  }, [loadedTasks, spaceLocalTasks]);

  const isTaskDoneFromApi = (task: StagedTaskCard) =>
    String(task.operation ?? '').toUpperCase() === 'DONE';

  const isTaskDone = useCallback(
    (task: StagedTaskCard) =>
      taskCompletionOverrides[task.id] ?? isTaskDoneFromApi(task),
    [taskCompletionOverrides],
  );

  const displayedTasks = useMemo(() => {
    const localForDate = spaceLocalTasks
      .filter(task => task.dateKey === selectedDateKey)
      .map(toLocalStagedTask);

    const apiForDate = loadedTasks.filter(task => {
      const key = formatDateKey(
        task.dueDate || task.createdAt || task.updatedAt,
      );
      return key === selectedDateKey;
    });

    const normalizedQuery = searchQuery.trim().toLowerCase();
    let result = [...localForDate, ...apiForDate];

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
  }, [
    isTaskDone,
    loadedTasks,
    searchQuery,
    selectedDateKey,
    spaceLocalTasks,
    taskFilter,
  ]);

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

  const handleOpenAddTask = useCallback(() => {
    if (!selectedSpaceId) {
      showToast({
        message: 'Select a space before adding a task.',
        type: 'info',
      });
      return;
    }

    requestAnimationFrame(() => {
      addTaskSheetRef.current?.present();
    });
  }, [selectedSpaceId, showToast]);

  const getApiErrorMessage = (error: any, fallback: string) =>
    error?.data?.message || error?.message || fallback;

  const handleSaveTask = useCallback(
    async (title: string, description: string) => {
      if (!selectedSpaceId) {
        showToast({
          message: 'Select a space before adding a task.',
          type: 'info',
        });
        throw new Error('Missing space');
      }

      try {
        const response = await createStagedTask({
          spaceId: selectedSpaceId,
          title,
          description,
          date: selectedDateKey,
        }).unwrap();

        const createdTask = response?.data?.task;

        if (createdTask) {
          setLoadedTasks(prev => [
            createdTask,
            ...prev.filter(item => item.id !== createdTask.id),
          ]);
        }

        if (userId) {
          dispatch(
            homeApi.util.updateQueryData(
              'getUserSpaces',
              { userId, limit: 50 },
              draft => {
                const space = draft?.data?.data?.spaces?.find(
                  item => item._id === selectedSpaceId,
                );
                if (space) {
                  space.tasksCount =
                    (typeof space.tasksCount === 'number'
                      ? space.tasksCount
                      : 0) + 1;
                }
              },
            ),
          );
        }

        showToast({
          message: response?.data?.message || 'Task saved.',
          type: 'success',
        });
      } catch (error: any) {
        if (isPlanLimitError(error)) {
          setShowUpgradePrompt(true);
          throw error;
        }

        showToast({
          message: getApiErrorMessage(error, 'Unable to save task.'),
          type: 'error',
        });
        throw error;
      }
    },
    [createStagedTask, dispatch, selectedDateKey, selectedSpaceId, showToast, userId],
  );

  const handleToggleTaskComplete = useCallback(
    (task: StagedTaskCard) => {
      setTaskCompletionOverrides(prev => ({
        ...prev,
        [task.id]: !(prev[task.id] ?? isTaskDoneFromApi(task)),
      }));
    },
    [],
  );

  const handleDeleteTask = useCallback(
    async (task: TaskItem) => {
      if (isLocalTaskId(task.id)) {
        setLocalTasks(prev => prev.filter(item => item.id !== task.id));
        setTaskCompletionOverrides(prev => {
          const next = { ...prev };
          delete next[task.id];
          return next;
        });

        if (selectedTask?.id === task.id) {
          taskSheetRef.current?.dismiss();
          setSelectedTask(null);
        }

        showToast({
          message: 'Task deleted.',
          type: 'success',
        });
        return;
      }

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

  const toTaskItem = useCallback(
    (task: StagedTaskCard): TaskItem => {
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
    },
    [isTaskDone, selectedSpace?.spacename],
  );

  const renderTaskItem = useCallback(
    ({ item: task }: { item: StagedTaskCard }) => {
      const item = toTaskItem(task);
      const completed = isTaskDone(task);

      return (
        <TaskCard
          item={item}
          completed={completed}
          onPress={() => handleOpenTask(item)}
          onToggleComplete={() => handleToggleTaskComplete(task)}
          onDelete={() => handleDeleteTask(item)}
        />
      );
    },
    [handleDeleteTask, handleOpenTask, handleToggleTaskComplete, isTaskDone, toTaskItem],
  );

  const tasksListEmpty = useMemo(() => {
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

    if (loadedTasks.length === 0 && spaceLocalTasks.length === 0) {
      return (
        <View style={styles.stateBox}>
          <Text style={styles.emptyTitle}>No tasks yet</Text>
          <Text style={styles.stateText}>
            Tap + to add a task for this day.
          </Text>
        </View>
      );
    }

    if (searchQuery.trim() || taskFilter === 'done' || taskFilter === 'pending') {
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
      <View style={styles.stateBox}>
        <Text style={styles.emptyTitle}>No tasks on this day</Text>
        <Text style={styles.stateText}>
          Tap + to add a task for {formatFullDate(selectedDate)}.
        </Text>
      </View>
    );
  }, [
    isInitialTasksLoading,
    isTasksError,
    loadedTasks.length,
    refetchTasks,
    searchQuery,
    selectedDate,
    selectedSpaceId,
    spaceLocalTasks.length,
    taskFilter,
  ]);

  const tasksListFooter = useMemo(() => {
    if (displayedTasks.length === 0 || !nextTasksCursor) {
      return null;
    }

    return (
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
    );
  }, [displayedTasks.length, isLoadingMoreTasks, nextTasksCursor]);

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

      <NotesCalendarStrip
        selectedDate={selectedDate}
        markedDateKeys={markedDateKeys}
        onSelectDate={setSelectedDate}
        onAddPress={handleOpenAddTask}
      />

      <FlatList
        data={
          displayedTasks.length === 0 &&
          (isInitialTasksLoading || isTasksError)
            ? []
            : displayedTasks
        }
        keyExtractor={item => item.id}
        renderItem={renderTaskItem}
        ListEmptyComponent={tasksListEmpty}
        ListFooterComponent={tasksListFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        style={styles.tasksScroll}
        {...listPerf}
      />

      <TaskDetailBottomSheet ref={taskSheetRef} task={selectedTask} />

      <AddTaskBottomSheet
        ref={addTaskSheetRef}
        dateLabel={formatFullDate(selectedDate)}
        isSaving={isCreatingTask}
        onSave={handleSaveTask}
      />

      <TasksFilterMenu
        visible={filterMenuVisible}
        taskFilter={taskFilter}
        onClose={() => setFilterMenuVisible(false)}
        onSelect={setTaskFilter}
      />

      <UpgradePlanPromptModal
        visible={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        onUpgrade={() => {
          setShowUpgradePrompt(false);
          addTaskSheetRef.current?.dismiss();
          navigation.navigate('Plans' as never);
        }}
      />
    </SafeAreaView>
  );
};

export default TaskScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: layout.screenTop,
  },

  headerWrap: {
    paddingHorizontal: spacing['2xl'],
    marginBottom: spacing.md,
  },

  tasksScroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: layout.tabBarClearance,
  },

  stateBox: {
    minHeight: mvs(120),
    marginBottom: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  stateText: {
    marginTop: spacing.sm,
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
    borderWidth: StyleSheet.hairlineWidth,
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
