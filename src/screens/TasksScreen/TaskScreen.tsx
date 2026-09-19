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
  useGetTaskDateMarkersBySpaceQuery,
  useGetUserSpacesQuery,
} from '../../store/api/home';
import { useGetPlanStatusQuery } from '../../store/api/payments';
import UpgradePlanPromptModal from '../../components/UpgradePlanPromptModal';
import {
  getPlanLimitPrompt,
  getPlanLimitResource,
  isPlanLimitError,
  type PlanLimitResource,
} from '../../utils/planLimitError';
import { hasReachedCountLimit } from '../../utils/planUsage';
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
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

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
  const { tabBarClearance, screenPadding, contentMaxWidth, isTablet } =
    useResponsiveLayout();
  const route = useRoute<RouteProp<MainTabParamList, 'Tasks'>>();
  const taskSheetRef = useRef<BottomSheetModal>(null);
  const addTaskSheetRef = useRef<BottomSheetModal>(null);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [selectedSpaceId, setSelectedSpaceId] = useState('');
  const [tasksCursor, setTasksCursor] = useState('');
  const [loadedTasks, setLoadedTasks] = useState<StagedTaskCard[]>([]);
  const [loadedTasksDateKey, setLoadedTasksDateKey] = useState('');
  const [dayTasksTotal, setDayTasksTotal] = useState(0);
  const appliedTasksCursorsRef = useRef<Set<string>>(new Set());
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
  const [upgradeResource, setUpgradeResource] =
    useState<PlanLimitResource>('tasks');
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
  const { data: planStatus } = useGetPlanStatusQuery(
    { userId },
    { skip: !userId },
  );

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

  const selectedDateKey = useMemo(() => toDateKey(selectedDate), [selectedDate]);
  const markerRange = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const from = toDateKey(new Date(year, month, 1));
    const to = toDateKey(new Date(year, month + 1, 0));
    return { from, to };
  }, [selectedDate]);

  const {
    data: stagedTasksData,
    isFetching: isFetchingTasks,
    isError: isTasksError,
    isSuccess: isTasksSuccess,
    refetch: refetchTasks,
  } = useGetStagedTasksBySpaceQuery(
    {
      userId,
      spaceId: selectedSpaceId,
      limit: TASKS_PAGE_SIZE,
      cursor: tasksCursor,
      date: selectedDateKey,
    },
    { skip: !userId || !selectedSpaceId || !selectedDateKey },
  );

  const { data: taskMarkersData } = useGetTaskDateMarkersBySpaceQuery(
    {
      userId,
      spaceId: selectedSpaceId,
      from: markerRange.from,
      to: markerRange.to,
    },
    { skip: !userId || !selectedSpaceId },
  );

  const isInitialTasksLoading =
    isFetchingTasks &&
    (loadedTasksDateKey !== selectedDateKey || loadedTasks.length === 0) &&
    tasksCursor === '';
  const isLoadingMoreTasks = isFetchingTasks && tasksCursor !== '';

  const spaceLocalTasks = useMemo(
    () =>
      localTasks.filter(
        task =>
          task.spaceId === selectedSpaceId && task.dateKey === selectedDateKey,
      ),
    [localTasks, selectedDateKey, selectedSpaceId],
  );

  const calendarMarkedDateKeys = useMemo(() => {
    const keys = new Set<string>(taskMarkersData?.data?.dates ?? []);
    spaceLocalTasks.forEach(task => {
      keys.add(task.dateKey);
    });
    if (loadedTasksDateKey === selectedDateKey && loadedTasks.length > 0) {
      keys.add(selectedDateKey);
    }
    return keys;
  }, [
    loadedTasks.length,
    loadedTasksDateKey,
    selectedDateKey,
    spaceLocalTasks,
    taskMarkersData?.data?.dates,
  ]);

  const isTaskDoneFromApi = (task: StagedTaskCard) =>
    String(task.operation ?? '').toUpperCase() === 'DONE';

  const isTaskDone = useCallback(
    (task: StagedTaskCard) =>
      taskCompletionOverrides[task.id] ?? isTaskDoneFromApi(task),
    [taskCompletionOverrides],
  );

  const dateScopedTasks =
    loadedTasksDateKey === selectedDateKey ? loadedTasks : [];

  const displayedTasks = useMemo(() => {
    const localForDate = spaceLocalTasks.map(toLocalStagedTask);
    const normalizedQuery = searchQuery.trim().toLowerCase();
    let result = [...localForDate, ...dateScopedTasks];

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
    dateScopedTasks,
    isTaskDone,
    searchQuery,
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
    setLoadedTasksDateKey('');
    setDayTasksTotal(0);
    setNextTasksCursor(null);
    appliedTasksCursorsRef.current = new Set();
  }, [selectedSpaceId, selectedDateKey]);

  useEffect(() => {
    const response = stagedTasksData?.data;

    if (!response || !isTasksSuccess || isFetchingTasks) {
      return;
    }

    if (response.date && response.date !== selectedDateKey) {
      return;
    }

    const cursorKey = tasksCursor || '__root__';

    if (tasksCursor !== '' && appliedTasksCursorsRef.current.has(cursorKey)) {
      setNextTasksCursor(response.nextCursor);
      if (typeof response.total === 'number') {
        setDayTasksTotal(response.total);
      }
      return;
    }

    appliedTasksCursorsRef.current.add(cursorKey);
    setNextTasksCursor(response.nextCursor);
    setLoadedTasksDateKey(selectedDateKey);
    if (typeof response.total === 'number') {
      setDayTasksTotal(response.total);
    }

    if (tasksCursor === '') {
      appliedTasksCursorsRef.current = new Set(['__root__']);
      setLoadedTasks(response.tasks);
      return;
    }

    setLoadedTasks(prev => {
      const existingIds = new Set(prev.map(task => task.id));
      const newTasks = response.tasks.filter(task => !existingIds.has(task.id));
      return newTasks.length > 0 ? [...prev, ...newTasks] : prev;
    });
  }, [
    isFetchingTasks,
    isTasksSuccess,
    selectedDateKey,
    stagedTasksData,
    tasksCursor,
  ]);

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

    if (
      hasReachedCountLimit(
        planStatus?.usage?.tasks,
        planStatus?.plan?.limits?.tasks,
      )
    ) {
      setUpgradeResource('tasks');
      setShowUpgradePrompt(true);
      return;
    }

    requestAnimationFrame(() => {
      addTaskSheetRef.current?.present();
    });
  }, [planStatus?.plan?.limits?.tasks, planStatus?.usage?.tasks, selectedSpaceId, showToast]);

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
          const createdDateKey =
            formatDateKey(
              createdTask.dueDate ||
                createdTask.createdAt ||
                createdTask.updatedAt,
            ) || selectedDateKey;

          if (createdDateKey === selectedDateKey) {
            setLoadedTasks(prev => [
              createdTask,
              ...prev.filter(item => item.id !== createdTask.id),
            ]);
            setLoadedTasksDateKey(selectedDateKey);
            setDayTasksTotal(prev => prev + 1);
          }

          if (userId) {
            dispatch(
              homeApi.util.updateQueryData(
                'getTaskDateMarkersBySpace',
                {
                  userId,
                  spaceId: selectedSpaceId,
                  from: markerRange.from,
                  to: markerRange.to,
                },
                draft => {
                  if (!draft?.data?.dates.includes(createdDateKey)) {
                    draft.data.dates = [...draft.data.dates, createdDateKey].sort();
                  }
                },
              ),
            );
          }
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
          setUpgradeResource(getPlanLimitResource(error) || 'tasks');
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
    [createStagedTask, dispatch, markerRange.from, markerRange.to, selectedDateKey, selectedSpaceId, showToast, userId],
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
        setDayTasksTotal(prev => {
          const next = Math.max(0, prev - 1);
          if (
            next === 0 &&
            userId &&
            selectedSpaceId &&
            loadedTasksDateKey === selectedDateKey
          ) {
            dispatch(
              homeApi.util.updateQueryData(
                'getTaskDateMarkersBySpace',
                {
                  userId,
                  spaceId: selectedSpaceId,
                  from: markerRange.from,
                  to: markerRange.to,
                },
                draft => {
                  draft.data.dates = draft.data.dates.filter(
                    key => key !== selectedDateKey,
                  );
                },
              ),
            );
          }
          return next;
        });

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
      loadedTasksDateKey,
      markerRange.from,
      markerRange.to,
      selectedDateKey,
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
    if (isInitialTasksLoading || (isFetchingTasks && displayedTasks.length === 0)) {
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
    displayedTasks.length,
    isFetchingTasks,
    isInitialTasksLoading,
    isTasksError,
    refetchTasks,
    searchQuery,
    selectedDate,
    selectedSpaceId,
    taskFilter,
  ]);

  const tasksListFooter = useMemo(() => {
    if (displayedTasks.length === 0) {
      return null;
    }

    const loadedCount = dateScopedTasks.length;
    const totalForDay = Math.max(dayTasksTotal, loadedCount);

    return (
      <View style={styles.loadMoreWrap}>
        <Text style={styles.paginationText}>
          Showing {loadedCount}
          {totalForDay > 0 ? ` of ${totalForDay}` : ''} tasks for this day
        </Text>
        {nextTasksCursor ? (
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
        ) : null}
      </View>
    );
  }, [
    dateScopedTasks.length,
    dayTasksTotal,
    displayedTasks.length,
    isLoadingMoreTasks,
    nextTasksCursor,
  ]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View
        style={[styles.headerWrap, { paddingHorizontal: screenPadding }]}
      >
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
        markedDateKeys={calendarMarkedDateKeys}
        onSelectDate={setSelectedDate}
        onAddPress={handleOpenAddTask}
      />

      <FlatList
        data={
          displayedTasks.length === 0 &&
          (isInitialTasksLoading || isTasksError || isFetchingTasks)
            ? []
            : displayedTasks
        }
        keyExtractor={item => item.id}
        renderItem={renderTaskItem}
        ListEmptyComponent={tasksListEmpty}
        ListFooterComponent={tasksListFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: tabBarClearance,
            paddingHorizontal: screenPadding,
            maxWidth: isTablet ? contentMaxWidth : undefined,
            width: '100%',
            alignSelf: 'center',
          },
        ]}
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
        title={getPlanLimitPrompt(upgradeResource).title}
        message={getPlanLimitPrompt(upgradeResource).message}
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
    marginBottom: spacing.md,
  },

  tasksScroll: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
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

  paginationText: {
    marginBottom: spacing.sm,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
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
