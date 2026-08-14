import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import {
  StagedNoteCard,
  StagedTaskCard,
  useGetStagedNotesBySpaceQuery,
  useGetStagedTasksBySpaceQuery,
  useGetUserSpacesQuery,
} from '../../store/api/home';
import { useToast } from '../../store/context/ToastContext';
import { useAppSelector } from '../../store/hooks';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  radii,
  spacing,
} from '../../theme';
import SharePreviewBottomSheet from './components/SharePreviewBottomSheet';

const BackIcon = () => (
  <Svg width={ms(18)} height={ms(18)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18 9 12l6-6"
      stroke={colors.text}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CheckIcon = () => (
  <Svg width={ms(14)} height={ms(14)} viewBox="0 0 24 24" fill="none">
    <Path
      d="m6 12.5 4 4L18.5 8"
      stroke={colors.white}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ArrowIcon = () => (
  <Svg width={ms(17)} height={ms(17)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12h14m-5-5 5 5-5 5"
      stroke={colors.white}
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ShareScreen = () => {
  const navigation = useNavigation();
  const previewSheetRef = useRef<BottomSheetModal>(null);
  const { showToast } = useToast();
  const userId = useAppSelector(state => state.auth.userId) ?? '';
  const [selectedSpaceId, setSelectedSpaceId] = useState('');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [summary, setSummary] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'notes'>('tasks');
  const [tabBarWidth, setTabBarWidth] = useState(0);
  const tabPosition = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;

  const { data: spacesData, isFetching: isLoadingSpaces } =
    useGetUserSpacesQuery({ userId, limit: 50 }, { skip: !userId });
  const spaces = useMemo(
    () => spacesData?.data?.data?.spaces ?? [],
    [spacesData],
  );
  const selectedSpace = spaces.find(space => space._id === selectedSpaceId);

  const { data: tasksData, isFetching: isLoadingTasks } =
    useGetStagedTasksBySpaceQuery(
      { userId, spaceId: selectedSpaceId, limit: 50 },
      { skip: !userId || !selectedSpaceId },
    );
  const { data: notesData, isFetching: isLoadingNotes } =
    useGetStagedNotesBySpaceQuery(
      { userId, spaceId: selectedSpaceId, limit: 50 },
      { skip: !userId || !selectedSpaceId },
    );

  const tasks = tasksData?.data?.tasks ?? [];
  const notes = notesData?.data?.notes ?? [];
  const selectedTasks = tasks.filter(task => selectedTaskIds.includes(task.id));
  const selectedNotes = notes.filter(note => selectedNoteIds.includes(note.id));
  const selectedCount = selectedTasks.length + selectedNotes.length;
  const allTasksSelected =
    tasks.length > 0 && selectedTaskIds.length === tasks.length;
  const allNotesSelected =
    notes.length > 0 && selectedNoteIds.length === notes.length;
  const tabIndicatorAnimatedStyle = useMemo(
    () => ({
      width: tabBarWidth ? tabBarWidth / 2 - ms(4) : ('49%' as const),
      transform: [
        {
          translateX: tabPosition.interpolate({
            inputRange: [0, 1],
            outputRange: [0, tabBarWidth ? tabBarWidth / 2 : ms(150)],
          }),
        },
      ],
    }),
    [tabBarWidth, tabPosition],
  );

  useEffect(() => {
    if (!selectedSpaceId && spaces.length) {
      setSelectedSpaceId(spaces[0]._id);
    }
  }, [selectedSpaceId, spaces]);

  useEffect(() => {
    setSelectedTaskIds([]);
    setSelectedNoteIds([]);
    setSummary('');
  }, [selectedSpaceId]);

  const toggleSelection = (
    id: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setter(current =>
      current.includes(id)
        ? current.filter(currentId => currentId !== id)
        : [...current, id],
    );
  };

  const changeTab = (tab: 'tasks' | 'notes') => {
    if (tab === activeTab) {
      return;
    }
    Animated.spring(tabPosition, {
      toValue: tab === 'tasks' ? 0 : 1,
      damping: 18,
      stiffness: 180,
      mass: 0.7,
      useNativeDriver: true,
    }).start();
    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: 90,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(tab);
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    });
  };

  const toggleSelectAll = () => {
    if (activeTab === 'tasks') {
      setSelectedTaskIds(
        allTasksSelected ? [] : tasks.map(task => task.id),
      );
      return;
    }
    setSelectedNoteIds(
      allNotesSelected ? [] : notes.map(note => note.id),
    );
  };

  const formattedContent = useMemo(() => {
    if (!selectedSpace) {
      return '';
    }
    const sections = [`# ${selectedSpace.spacename}`];
    if (summary.trim()) {
      sections.push(`\nSummary\n${summary.trim()}`);
    }
    if (selectedTasks.length) {
      sections.push(
        `\nTasks\n${selectedTasks
          .map(task => `• ${task.title}${task.dueDate ? ` — ${task.dueDate}` : ''}`)
          .join('\n')}`,
      );
    }
    if (selectedNotes.length) {
      sections.push(
        `\nNotes\n${selectedNotes
          .map(note => `• ${note.title}${note.bodyPreview ? `\n  ${note.bodyPreview}` : ''}`)
          .join('\n\n')}`,
      );
    }
    return sections.join('\n');
  }, [selectedNotes, selectedSpace, selectedTasks, summary]);

  const openPreview = () => {
    if (!selectedCount) {
      showToast({
        message: 'Select at least one task or note.',
        type: 'error',
      });
      return;
    }
    previewSheetRef.current?.present();
  };

  const shareUpdate = async () => {
    if (isSharing) {
      return;
    }
    if (!selectedSpace || !formattedContent.trim()) {
      showToast({ message: 'Nothing to share yet.', type: 'error' });
      return;
    }

    setIsSharing(true);
    // The native share dialog cannot open while the sheet still holds focus.
    previewSheetRef.current?.dismiss();
    await new Promise<void>(resolve => setTimeout(resolve, 280));

    try {
      const result = await Share.share(
        { title: selectedSpace.spacename, message: formattedContent },
        { dialogTitle: `Share ${selectedSpace.spacename}` },
      );
      if (result.action === Share.sharedAction) {
        showToast({ message: 'Update shared.', type: 'success' });
      }
    } catch (error) {
      showToast({
        message: 'Could not open the share menu.',
        description:
          error instanceof Error ? error.message : 'Please try again.',
        type: 'error',
      });
    } finally {
      setIsSharing(false);
    }
  };

  const renderTask = (task: StagedTaskCard) => {
    const selected = selectedTaskIds.includes(task.id);
    return (
      <TouchableOpacity
        key={task.id}
        activeOpacity={0.76}
        style={[styles.itemCard, selected && styles.itemCardSelected]}
        onPress={() => toggleSelection(task.id, setSelectedTaskIds)}
      >
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected ? <CheckIcon /> : null}
        </View>
        <View style={styles.itemCopy}>
          <Text numberOfLines={1} style={styles.itemTitle}>
            {task.title}
          </Text>
          <Text numberOfLines={1} style={styles.itemDetail}>
            {task.dueDate || task.descriptionPreview || 'No additional details'}
          </Text>
        </View>
        {task.priority ? (
          <View style={styles.metaPill}>
            <Text style={styles.metaPillText}>{task.priority}</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  const renderNote = (note: StagedNoteCard) => {
    const selected = selectedNoteIds.includes(note.id);
    return (
      <TouchableOpacity
        key={note.id}
        activeOpacity={0.76}
        style={[styles.itemCard, selected && styles.itemCardSelected]}
        onPress={() => toggleSelection(note.id, setSelectedNoteIds)}
      >
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected ? <CheckIcon /> : null}
        </View>
        <View style={styles.itemCopy}>
          <Text numberOfLines={1} style={styles.itemTitle}>
            {note.title}
          </Text>
          <Text numberOfLines={2} style={styles.itemDetail}>
            {note.bodyPreview || 'No additional details'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.78}
            onPress={() => navigation.goBack()}
          >
            <BackIcon />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Share space</Text>
            <Text style={styles.headerSubtitle}>Choose what you want to share</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.spaceTitle}>Choose a space</Text>
          <View style={styles.spaceScrollWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.spaceList}
            >
              {isLoadingSpaces ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                spaces.map(space => {
                  const active = space._id === selectedSpaceId;
                  return (
                    <TouchableOpacity
                      key={space._id}
                      activeOpacity={0.78}
                      onPress={() => setSelectedSpaceId(space._id)}
                      style={[styles.spaceChip, active && styles.spaceChipActive]}
                    >
                      <Text
                        style={[
                          styles.spaceChipText,
                          active && styles.spaceChipTextActive,
                        ]}
                      >
                        {space.spacename}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>

          {!isLoadingSpaces && spaces.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No spaces available</Text>
              <Text style={styles.emptyText}>
                Create a space first, then return here to share its work.
              </Text>
            </View>
          ) : null}

          {selectedSpace ? (
            <>
              <View style={styles.selectionHeader}>
                <View>
                  <Text style={styles.selectionTitle}>Select content</Text>
                  <Text style={styles.selectionSubtitle}>
                    Tap any task or note to include it
                  </Text>
                </View>
                <View style={styles.selectedPill}>
                  <Text style={styles.selectedPillText}>{selectedCount} selected</Text>
                </View>
              </View>

              <View
                style={styles.tabBar}
                onLayout={event => setTabBarWidth(event.nativeEvent.layout.width)}
              >
                <Animated.View
                  pointerEvents="none"
                  style={[styles.tabIndicator, tabIndicatorAnimatedStyle]}
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.tabButton}
                  onPress={() => changeTab('tasks')}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === 'tasks' && styles.tabTextActive,
                    ]}
                  >
                    Tasks
                  </Text>
                  <View
                    style={[
                      styles.tabCount,
                      activeTab === 'tasks' && styles.tabCountActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabCountText,
                        activeTab === 'tasks' && styles.tabCountTextActive,
                      ]}
                    >
                      {selectedTaskIds.length}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.tabButton}
                  onPress={() => changeTab('notes')}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === 'notes' && styles.tabTextActive,
                    ]}
                  >
                    Notes
                  </Text>
                  <View
                    style={[
                      styles.tabCount,
                      activeTab === 'notes' && styles.tabCountActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabCountText,
                        activeTab === 'notes' && styles.tabCountTextActive,
                      ]}
                    >
                      {selectedNoteIds.length}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.selectionToolbar}>
                <Text style={styles.selectionStatus}>
                  {activeTab === 'tasks'
                    ? `${selectedTaskIds.length} of ${tasks.length} tasks`
                    : `${selectedNoteIds.length} of ${notes.length} notes`}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={toggleSelectAll}
                  disabled={
                    activeTab === 'tasks' ? !tasks.length : !notes.length
                  }
                >
                  <Text style={styles.selectAllText}>
                    {(activeTab === 'tasks'
                      ? allTasksSelected
                      : allNotesSelected)
                      ? 'Clear all'
                      : 'Select all'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Animated.View style={{ opacity: contentOpacity }}>
                {activeTab === 'tasks' ? (
                  isLoadingTasks ? (
                    <ActivityIndicator
                      style={styles.loader}
                      color={colors.primary}
                    />
                  ) : tasks.length ? (
                    <View style={styles.itemList}>{tasks.map(renderTask)}</View>
                  ) : (
                    <View style={styles.emptySection}>
                      <Text style={styles.emptySectionText}>
                        No tasks in this space.
                      </Text>
                    </View>
                  )
                ) : isLoadingNotes ? (
                  <ActivityIndicator
                    style={styles.loader}
                    color={colors.primary}
                  />
                ) : notes.length ? (
                  <View style={styles.itemList}>{notes.map(renderNote)}</View>
                ) : (
                  <View style={styles.emptySection}>
                    <Text style={styles.emptySectionText}>
                      No notes in this space.
                    </Text>
                  </View>
                )}
              </Animated.View>
            </>
          ) : null}
        </ScrollView>

        {selectedSpace ? (
          <View style={styles.footer}>
            <View style={styles.footerCount}>
              <View style={styles.footerIcon}>
                <Text style={styles.footerIconText}>✓</Text>
              </View>
              <View>
                <Text style={styles.footerLabel}>Selected content</Text>
                <Text style={styles.footerValue}>
                  {selectedTaskIds.length} task
                  {selectedTaskIds.length === 1 ? '' : 's'} ·{' '}
                  {selectedNoteIds.length} note
                  {selectedNoteIds.length === 1 ? '' : 's'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.continueButton,
                !selectedCount && styles.continueButtonDisabled,
              ]}
              onPress={openPreview}
            >
              <Text style={styles.continueButtonText}>Continue to preview</Text>
              <ArrowIcon />
            </TouchableOpacity>
          </View>
        ) : null}
      </SafeAreaView>

      <SharePreviewBottomSheet
        ref={previewSheetRef}
        spaceName={selectedSpace?.spacename ?? ''}
        tasks={selectedTasks}
        notes={selectedNotes}
        summary={summary}
        isSharing={isSharing}
        onChangeSummary={setSummary}
        onShare={shareUpdate}
      />
    </View>
  );
};

export default ShareScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backButton: {
    width: ms(38),
    height: ms(38),
    borderRadius: ms(19),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  headerCopy: {
    marginLeft: spacing.md,
  },
  headerTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    marginTop: spacing.xxs,
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: ms(140),
  },
  spaceTitle: {
    marginBottom: spacing.sm,
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  spaceScrollWrap: {
    alignSelf: 'stretch',
    marginLeft: -layout.screenPadding,
    marginRight: -layout.screenPadding,
  },
  spaceList: {
    gap: spacing.sm,
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.xs,
  },
  spaceChip: {
    minHeight: ms(42),
    paddingHorizontal: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  spaceChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  spaceChipText: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  spaceChipTextActive: {
    color: colors.white,
  },
  emptyCard: {
    marginTop: spacing.xl,
    padding: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  emptyText: {
    marginTop: spacing.xs,
    color: colors.subText,
    fontSize: fontSize.sm,
    lineHeight: ms(18),
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing['2xl'],
    marginBottom: spacing.xl,
  },
  selectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  selectionSubtitle: {
    marginTop: spacing.xxs,
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  selectedPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryLight,
  },
  selectedPillText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  tabBar: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    height: ms(48),
    padding: ms(2),
    borderRadius: radii.lg,
    backgroundColor: colors.inputBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  tabIndicator: {
    position: 'absolute',
    left: ms(2),
    top: ms(2),
    bottom: ms(2),
    borderRadius: radii.md,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
  },
  tabButton: {
    zIndex: 1,
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  tabText: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  tabTextActive: {
    color: colors.primaryDark,
    fontWeight: fontWeight.bold,
  },
  tabCount: {
    minWidth: ms(22),
    height: ms(22),
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.border,
  },
  tabCountActive: {
    backgroundColor: colors.primaryLight,
  },
  tabCountText: {
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  tabCountTextActive: {
    color: colors.primary,
  },
  selectionToolbar: {
    minHeight: ms(46),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  selectionStatus: {
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  selectAllText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  itemList: {
    gap: spacing.sm,
  },
  itemCard: {
    minHeight: ms(66),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  itemCardSelected: {
    borderColor: colors.brandBorder,
    backgroundColor: colors.primarySoft,
  },
  checkbox: {
    width: ms(21),
    height: ms(21),
    borderRadius: ms(7),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderFocus,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  itemCopy: {
    flex: 1,
  },
  itemTitle: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  itemDetail: {
    marginTop: spacing.xxs,
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: ms(17),
  },
  metaPill: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryLight,
  },
  metaPillText: {
    color: colors.primaryDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
  },
  loader: {
    paddingVertical: spacing['2xl'],
  },
  emptySection: {
    padding: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  emptySectionText: {
    color: colors.subText,
    fontSize: fontSize.sm,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  footerCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  footerIcon: {
    width: ms(30),
    height: ms(30),
    borderRadius: ms(10),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    backgroundColor: colors.primaryLight,
  },
  footerIconText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  footerLabel: {
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  footerValue: {
    marginTop: spacing.xxs,
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  continueButton: {
    minHeight: ms(52),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
  },
  continueButtonDisabled: {
    opacity: 0.46,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
});
