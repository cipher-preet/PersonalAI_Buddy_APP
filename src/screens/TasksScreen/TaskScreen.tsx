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
import ProgressCard from './component/ProgressCard';
import SectionHeader from './component/SectionHeader';
import TaskCard from './component/TaskCard';
import TaskDetailBottomSheet from './component/TaskDetailBottomSheet';
import { COLORS } from './component/styles/color';
import { TaskItem } from './types/task';
import type { TaskFilter } from './types/filter';
import { useAppSelector } from '../../store/hooks';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import {
  StagedTaskCard,
  useGetStagedTasksBySpaceQuery,
  useGetUserSpacesQuery,
} from '../../store/api/home';

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
  const [taskPendingDelete, setTaskPendingDelete] = useState<TaskItem | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('newest');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const userId = useAppSelector(state => state.auth.userId) ?? '';

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

  const handleConfirmDeleteTask = useCallback(() => {
    if (!taskPendingDelete) {
      return;
    }

    setLoadedTasks(prev =>
      prev.filter(task => task.id !== taskPendingDelete.id),
    );

    setTaskCompletionOverrides(prev => {
      const next = { ...prev };
      delete next[taskPendingDelete.id];
      return next;
    });

    if (selectedTask?.id === taskPendingDelete.id) {
      taskSheetRef.current?.dismiss();
      setSelectedTask(null);
    }

    setTaskPendingDelete(null);
  }, [selectedTask, taskPendingDelete]);

  const doneTasksCount = loadedTasks.filter(task => isTaskDone(task)).length;

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
          <ActivityIndicator size="small" color={COLORS.primaryDark} />
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
              onDelete={() => setTaskPendingDelete(item)}
            />
          );
        })}

        {nextTasksCursor ? (
          <TouchableOpacity
            activeOpacity={0.78}
            disabled={isLoadingMoreTasks}
            style={[
              styles.loadMoreButton,
              isLoadingMoreTasks && styles.loadMoreButtonDisabled,
            ]}
            onPress={() => setTasksCursor(nextTasksCursor)}
          >
            {isLoadingMoreTasks ? (
              <ActivityIndicator size="small" color={COLORS.primaryDark} />
            ) : null}
            <Text style={styles.loadMoreText}>
              {isLoadingMoreTasks ? 'Loading more tasks...' : 'Load more tasks'}
            </Text>
          </TouchableOpacity>
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <CategoryTabs
          spaces={spaces}
          selectedSpaceId={selectedSpaceId}
          isLoading={isFetchingSpaces}
          isError={isSpacesError}
          getTaskCount={spaceId => taskCountBySpaceId.get(spaceId) ?? 0}
          onRetry={refetchSpaces}
          onSelectSpace={setSelectedSpaceId}
        />

        <ProgressCard
          totalTasks={loadedTasks.length}
          doneTasks={doneTasksCount}
        />

        <SectionHeader />

        {renderTaskList()}
      </ScrollView>

      <TaskDetailBottomSheet ref={taskSheetRef} task={selectedTask} />

      <DeleteConfirmationModal
        visible={Boolean(taskPendingDelete)}
        itemType="task"
        itemTitle={taskPendingDelete?.title}
        onCancel={() => setTaskPendingDelete(null)}
        onConfirm={handleConfirmDeleteTask}
      />

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
    backgroundColor: COLORS.background,
    paddingTop: 16,
    paddingBottom: 40,
  },

  headerWrap: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  stateBox: {
    minHeight: 120,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  stateText: {
    marginTop: 8,
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },

  emptyTitle: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: '800',
  },

  errorText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '700',
  },

  retryButton: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: COLORS.purpleLight,
  },

  retryText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '800',
  },

  loadMoreButton: {
    minHeight: 52,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  loadMoreButtonDisabled: {
    opacity: 0.7,
  },

  loadMoreText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '800',
  },
});
