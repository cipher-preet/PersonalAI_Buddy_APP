import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import LinearGradient from 'react-native-linear-gradient';

import Header from './component/Header';
import CategoryPill from './component/CategoryPill';
import SectionHeader from './component/SectionHeader';
import WorkspaceCard from './component/WorkspaceCard';
import AIActionCard from './component/AIActionCard';
import NoteCard from './component/NoteCard';
import { MindMapIcon, SummaryIcon, TaskIcons } from '../../../styles/icons';

const categories = ['All Notes', 'Recent', 'Favorites', 'Shared', 'Important'];

const aiCards = [
  {
    id: 1,
    title: 'Generate Summary',
    icon: <SummaryIcon width={18} height={18} color="#6E7B87" />,
  },
  {
    id: 2,
    title: 'Convert to Tasks',
    icon: <TaskIcons width={18} height={18} color="#6E7B87" />,
  },
  {
    id: 3,
    title: 'Create Mind Map',
    icon: <MindMapIcon width={18} height={18} color="#6E7B87" />,
  },
];

const notes = [
  {
    tag: 'SUMMARY',
    title: 'Interview Notes: Senior ML Engineer',
    desc: 'Strong background in Python and distributed training...',
    time: '10:42 AM',
  },
  {
    tag: 'FEATURES',
    title: 'Automated Resume Screening Logic',
    desc: 'Drafting the initial rule engine for parsing keywords...',
    time: 'Yesterday',
  },
  {
    tag: 'DRAFT',
    title: 'Weekly Sync Agenda',
    desc: 'Topics to cover: Q4 OKRs progress and infra migration...',
    time: 'Oct 12',
  },
];

const Notes = () => {
  return (
    <LinearGradient
      colors={['#F7F5FF', '#F1EEFF', '#EDF5FF', '#F2FAFF', '#FAFAFD']}
      locations={[0, 0.25, 0.55, 0.82, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Header />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
          >
            {categories.map((item, index) => (
              <CategoryPill key={index} item={item} active={index === 0} />
            ))}
          </ScrollView>

          <SectionHeader title="Workspaces" action="View all" />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.workspaceContainer}
          >
            <WorkspaceCard />
            <WorkspaceCard />
            <WorkspaceCard />
            <WorkspaceCard />
          </ScrollView>

          <SectionHeader title="AI Suggestions" />

          <View style={styles.aiContainer}>
            <AIActionCard cards={aiCards} />
          </View>

          <SectionHeader title="Recent Notes" action="View all" />

          {notes.map((item, index) => (
            <NoteCard key={index} item={item} />
          ))}

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Notes;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 18,
  },

  categoryContainer: {
    paddingTop: 26,
    paddingBottom: 10,
  },

  workspaceContainer: {
    paddingBottom: 6,
  },

  aiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
