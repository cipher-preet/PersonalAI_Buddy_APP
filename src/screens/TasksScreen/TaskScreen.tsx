import React, { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import Header from './component/Header';
import CategoryTabs from './component/CategoryTabs';
import ProgressCard from './component/ProgressCard';
import SectionHeader from './component/SectionHeader';
import TaskCard from './component/TaskCard';
import TaskDetailBottomSheet from './component/TaskDetailBottomSheet';

import { COLORS } from './component/styles/color';
import { TaskItem } from './types/task';

export const categories = [
  { id: 'all', label: 'All Tasks', count: 146 },
  { id: 'ai', label: 'AI Project', count: 42 },
  { id: 'mobile', label: 'Mobile App', count: 38 },
  { id: 'backend', label: 'Backend', count: 24 },
];

export const tasks: TaskItem[] = [
  {
    id: '1',
    title: 'Code review of new functions',
    subtitle: 'Quality of the code',
    tags: ['Need Project', 'AI Priority'],
    status: 'In Progress',
    priority: 'High Priority',
    dueDate: 'Today, 6:00 PM',
    updatedAt: 'Today',
    createdAt: 'Mar 16, 2026',
    project: 'AI Project',
    assignee: 'Preet Kumar',
    summary:
      'Review newly added utility functions in the voice upload module. Focus on error handling, type safety, and alignment with existing service patterns.',
    subtasks: [
      'Review voiceRecorderService.ts changes',
      'Check API error mapping in baseApi',
      'Validate silence detection edge cases',
      'Confirm upload retry logic is covered',
    ],
    sections: [
      {
        title: 'Scope',
        content:
          'PR #48 introduces chunked upload support and refactors the recording lifecycle. Review should cover both happy path and failure recovery when network drops mid-upload.',
      },
      {
        title: 'Review criteria',
        content:
          'Look for consistent naming, no leaked listeners, proper cleanup on unmount, and whether new constants belong in a shared config file.',
      },
      {
        title: 'Dependencies',
        content:
          'Blocked until CI passes on Android emulator tests. Coordinate with backend team if upload endpoint contract changed.',
      },
    ],
    description:
      'The author added onSegmentReady callbacks and queue-based upload handling. Pay special attention to race conditions when user stops listening while a chunk is still uploading.\n\nApprove if tests pass and no P1 comments remain. Request changes if error toasts are too generic or if file paths are not sanitized.',
    actionItems: [
      'Leave inline comments on PR #48',
      'Run manual test on physical Android device',
      'Approve or request changes by EOD',
    ],
    relatedTasks: [
      'Add unit tests for voice upload queue',
      'Document voice recording API',
    ],
  },
  {
    id: '2',
    title: 'Install new versions of software',
    subtitle: 'Infrastructure upgrade',
    tags: ['System Setup', 'Tomorrow'],
    status: 'Pending',
    priority: 'Medium',
    dueDate: 'Tomorrow, 10:00 AM',
    updatedAt: 'Yesterday',
    createdAt: 'Mar 15, 2026',
    project: 'Backend',
    assignee: 'DevOps Squad',
    summary:
      'Upgrade Node.js runtime and key dependencies on staging before rolling to production. Includes React Native build tools and CI runner image updates.',
    subtasks: [
      'Backup staging environment snapshots',
      'Update Node.js to v22 LTS on CI runners',
      'Bump react-native and metro versions',
      'Run full regression suite on staging',
      'Schedule production window with on-call',
    ],
    sections: [
      {
        title: 'Upgrade plan',
        content:
          'Start with CI images, then staging app servers. Production rollout only after 24-hour soak test with no critical alerts.',
      },
      {
        title: 'Rollback strategy',
        content:
          'Keep previous Docker image tags for 7 days. Rollback trigger: build failure rate > 10% or p95 API latency increase > 25%.',
      },
      {
        title: 'Communication',
        content:
          'Notify #engineering 24 hours before production change. Post status updates every 30 minutes during the maintenance window.',
      },
    ],
    description:
      'This upgrade addresses security patches and improves Metro bundler performance. Breaking changes documented in the internal migration guide.\n\nMaintenance window: Tuesday 10:00–12:00 AM UTC. Customer-facing downtime not expected if staging validation succeeds.',
    actionItems: [
      'Confirm backup completion',
      'Share migration checklist with team',
      'Book production maintenance slot',
    ],
    relatedTasks: [
      'Update CI pipeline config',
      'Refresh dependency audit report',
    ],
  },
  {
    id: '3',
    title: 'Design Buddy chat input states',
    subtitle: 'Mobile App UI polish',
    tags: ['Design', 'Mobile App'],
    status: 'In Review',
    priority: 'High Priority',
    dueDate: 'Mar 20, 2026',
    updatedAt: 'Today',
    createdAt: 'Mar 14, 2026',
    project: 'Mobile App',
    assignee: 'Priya Sharma',
    summary:
      'Finalize keyboard, focus, and send-button states for the Buddy chat composer. Ensure consistency with Notes and Home bottom sheets.',
    subtasks: [
      'Empty, focused, and typing states for input',
      'Keyboard open layout on iOS and Android',
      'Send button active/inactive visuals',
      'Mic button placeholder interaction',
    ],
    sections: [
      {
        title: 'Design goals',
        content:
          'Clean, minimal composer that stays above the keyboard without clipping. Match indigo accent (#4338CA) and soft shadows used across the app.',
      },
      {
        title: 'Deliverables',
        content:
          'Figma frames for all states, redlines for spacing, and a short Loom walkthrough for engineering handoff.',
      },
    ],
    description:
      'Reference the Notes detail sheet and Home voice modal for interaction patterns. Prioritize readability and thumb reach on smaller devices.\n\nFeedback from last review: reduce vertical padding when keyboard is open and center placeholder text in single-line mode.',
    actionItems: [
      'Share updated Figma link in Slack',
      'Schedule design review with engineering',
      'Export assets for send/mic icons',
    ],
    relatedTasks: [
      'Implement Buddy chat screen',
      'Fix Android keyboard overlap',
    ],
  },
  {
    id: '4',
    title: 'Prepare marketing meeting slides',
    subtitle: 'Q4 campaign review deck',
    tags: ['Meeting', 'Marketing'],
    status: 'Not Started',
    priority: 'Medium',
    dueDate: 'Mar 21, 2026',
    updatedAt: '2 days ago',
    createdAt: 'Mar 12, 2026',
    project: 'Marketing',
    assignee: 'Preet Kumar',
    summary:
      'Build slide deck for tomorrow\'s marketing meeting covering Q3 ROI, budget reallocation, and product launch messaging framework.',
    subtasks: [
      'Slide 1: Q3 performance highlights',
      'Slide 2: Channel ROI breakdown',
      'Slide 3: Q4 budget proposal',
      'Slide 4: Launch messaging draft',
      'Slide 5: Next steps and discussion',
    ],
    sections: [
      {
        title: 'Audience',
        content:
          'Marketing leadership, product, and finance stakeholders. Keep slides visual with speaker notes for detail.',
      },
      {
        title: 'Data sources',
        content:
          'Pull metrics from analytics dashboard and finance spreadsheet shared last week. Cite sources on each chart slide.',
      },
    ],
    description:
      'Target 12–15 slides max. Use brand template v2. Include one backup slide on competitor positioning.\n\nDry run scheduled for 4:30 PM today. Send draft to Sarah for feedback before 2:00 PM.',
    actionItems: [
      'Download latest brand template',
      'Request ROI data from analytics',
      'Send draft to Sarah for review',
    ],
    relatedTasks: [
      'Interview Notes: Marketing meeting',
      'Q4 OKR Dashboard update',
    ],
  },
];

const TaskScreen = () => {
  const taskSheetRef = useRef<BottomSheetModal>(null);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  const handleOpenTask = useCallback((task: TaskItem) => {
    setSelectedTask(task);
    requestAnimationFrame(() => {
      taskSheetRef.current?.present();
    });
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Header />

        <CategoryTabs />

        <ProgressCard />

        <SectionHeader />

        {tasks.map(item => (
          <TaskCard
            key={item.id}
            item={item}
            onPress={() => handleOpenTask(item)}
          />
        ))}
      </ScrollView>

      <TaskDetailBottomSheet ref={taskSheetRef} task={selectedTask} />
    </SafeAreaView>
  );
};

export default TaskScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingVertical: 16,
    paddingBottom: 40,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});
