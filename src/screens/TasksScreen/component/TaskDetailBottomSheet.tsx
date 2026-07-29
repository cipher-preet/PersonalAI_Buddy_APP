import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  BackHandler,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { TaskItem } from '../types/task';
import { COLORS } from './styles/color';

type Props = {
  task: TaskItem | null;
};

const TaskDetailBottomSheet = forwardRef<BottomSheetModal, Props>(
  ({ task }, ref) => {
    const snapPoints = useMemo(() => ['88%'], []);
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

    if (!task) {
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
        />
      );
    }

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
          <View style={styles.headerRow}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{task.status}</Text>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.75}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{task.title}</Text>
          <Text style={styles.subtitle}>{task.subtitle}</Text>

          <Text style={styles.meta}>
            Due {task.dueDate} · Updated {task.updatedAt}
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoChip}>
              <Text style={styles.infoChipText}>{task.project}</Text>
            </View>
            <View style={[styles.infoChip, styles.priorityChip]}>
              <Text style={styles.priorityText}>{task.priority}</Text>
            </View>
            <View style={styles.infoChip}>
              <Text style={styles.infoChipText}>{task.assignee}</Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.sectionLabel}>Overview</Text>
            <Text style={styles.summaryText}>{task.summary}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Subtasks</Text>
            {task.subtasks.map((item, index) => (
              <View key={index} style={styles.subtaskRow}>
                <View style={styles.subtaskCheck} />
                <Text style={styles.subtaskText}>{item}</Text>
              </View>
            ))}
          </View>

          {task.sections.map((section, index) => (
            <View key={index} style={styles.detailCard}>
              <Text style={styles.detailTitle}>{section.title}</Text>
              <Text style={styles.detailText}>{section.content}</Text>
            </View>
          ))}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.bodyText}>{task.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Next steps</Text>
            {task.actionItems.map((item, index) => (
              <View key={index} style={styles.actionRow}>
                <View style={styles.actionDot} />
                <Text style={styles.actionText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Related tasks</Text>
            {task.relatedTasks.map((item, index) => (
              <View key={index} style={styles.relatedRow}>
                <View style={styles.relatedDot} />
                <Text style={styles.relatedText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Labels</Text>
            <View style={styles.tagsRow}>
              {task.tags.map(tag => (
                <View key={tag} style={styles.pill}>
                  <Text style={styles.pillText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.createdText}>Created {task.createdAt}</Text>

          <View style={styles.footerSpace} />
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

TaskDetailBottomSheet.displayName = 'TaskDetailBottomSheet';

export default TaskDetailBottomSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  indicator: {
    backgroundColor: '#CBD5E1',
    width: 48,
    height: 5,
    borderRadius: 999,
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 4,
    paddingBottom: Platform.OS === 'ios' ? 40 : 32,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  statusBadge: {
    backgroundColor: COLORS.purpleLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  statusText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeIcon: {
    fontSize: 22,
    lineHeight: 24,
    color: '#6B7280',
    marginTop: -1,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.black,
    lineHeight: 30,
    letterSpacing: -0.3,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray,
    lineHeight: 20,
  },

  meta: {
    marginTop: 8,
    marginBottom: 4,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.gray,
  },

  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    marginBottom: 20,
  },

  infoChip: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },

  infoChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },

  priorityChip: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },

  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },

  summaryCard: {
    backgroundColor: '#FAF8FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0E9FF',
  },

  section: {
    marginBottom: 20,
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 10,
    letterSpacing: 0.2,
  },

  summaryText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4B5563',
    fontWeight: '500',
  },

  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  subtaskCheck: {
    width: 16,
    height: 16,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    marginRight: 10,
    marginTop: 2,
  },

  subtaskText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    fontWeight: '500',
  },

  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  detailTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 6,
  },

  detailText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4B5563',
    fontWeight: '400',
  },

  bodyText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
    fontWeight: '400',
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  actionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 8,
    marginRight: 10,
  },

  actionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
    fontWeight: '500',
  },

  relatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
  },

  relatedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primaryDark,
    marginRight: 10,
  },

  relatedText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  pill: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  pillText: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '600',
  },

  createdText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.gray,
    marginTop: 4,
  },

  footerSpace: {
    height: 16,
  },
});
