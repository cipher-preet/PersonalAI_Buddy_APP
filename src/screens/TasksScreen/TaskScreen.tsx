import React from 'react';
import { ScrollView, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from './component/Header';
import CategoryTabs from './component/CategoryTabs';
import ProgressCard from './component/ProgressCard';
import TaskStatsGrid from './component/TaskStatsGrid';
import AIInsightCard from './component/AIInsightCard';
import SectionHeader from './component/SectionHeader';
import TaskCard from './component/TaskCard';

import { COLORS } from './component/styles/color';

export const categories = ['All', 'AI Project', 'Mobile App', 'Backend'];

export const stats = [
  {
    title: 'Today',
    value: '12',
    icon: 'calendar',
  },
  {
    title: 'Upcoming',
    value: '34',
    icon: 'calendar',
  },
  {
    title: 'Priority',
    value: '5',
    icon: 'flash',
  },
  {
    title: 'Completed',
    value: '123',
    icon: 'check',
  },
];

export const tasks = [
  {
    title: 'Code review of new functions',
    subtitle: 'Quality of the code',
    tags: ['Need Project', 'AI Priority'],
  },
  {
    title: 'Install new versions of software',
    subtitle: 'Infrastructure upgrade',
    tags: ['System Setup', 'Tomorrow'],
  },
  {
    title: 'Install new versions of software',
    subtitle: 'Infrastructure upgrade',
    tags: ['System Setup', 'Tomorrow'],
  },
  {
    title: 'Install new versions of software',
    subtitle: 'Infrastructure upgrade',
    tags: ['System Setup', 'Tomorrow'],
  },
];

const TaskScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Header />

        <CategoryTabs />

        <ProgressCard />

        <TaskStatsGrid />

        <AIInsightCard />

        <SectionHeader />

        {tasks.map((item, index) => (
          <TaskCard key={index} item={item} />
        ))}
      </ScrollView>
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
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
});
