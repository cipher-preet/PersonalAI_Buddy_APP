import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { StatusBar } from 'react-native';

import Header from './components/Header';
import TopCard from './components/TopCard';
import QuickActionCard from './components/QuickActionCard';
import SpaceCard from './components/SpaceCard';
import { AddSpace, AiSuggest, HabbitTracker, HomeIcon, MicIcon, MySpcaes, ReminderIcon, VoiceNote } from '../../../styles/icons';

const Home = () => {
  const quickActions = [
    {
      id: 8,
      title: 'AI Suggest',
      icon: <AiSuggest width={18} height={18} color="#7B4DFF" />,
      color: '#7B4DFF',
    },
    {
      id: 2,
      title: 'Reminders',
      icon: <ReminderIcon width={18} height={18} color="#FF9800" />,
      color: '#FF9800',
    },
    {
      id: 3,
      title: 'Voice Note',
      icon: <VoiceNote width={18} height={18} color="#13B5D1" />,
      color: '#13B5D1',
    },
    {
      id: 4,
      title: 'Habbit Tracker',
      icon: <HabbitTracker width={18} height={18} color="#E83E8C" />,
      color: '#E83E8C',
    },
  ];

  const spaces = [
    {
      id: 1,
      title: 'AI Hiring SaaS',
      description:
        'Draft outreach to 5 candidates for the staff engineer role...',
      time: 'Last active 5m ago',
      icon: <MySpcaes width={18} height={18} color="#000000" />,
      conversations: '24 conversations',
      tags: ['AI Memory', 'Voice'],
      color: '#7c4dff65',
    },
    {
      id: 2,
      title: 'Startup Ideas',
      description:
        'Compare market size for vertical tools in legal vs finance...',
      time: 'Last active 1h ago',
      icon: <MySpcaes width={18} height={18} color="#000000" />,
      conversations: '12 conversations',
      tags: ['Research', 'Brainstorm'],
      color: '#13d11981',
    },
    {
      id: 2,
      title: 'Startup Ideas',
      description:
        'Compare market size for vertical tools in legal vs finance...',
      time: 'Last active 1h ago',
      icon: <MySpcaes width={18} height={18} color="#000000" />,
      conversations: '12 conversations',
      tags: ['Research', 'Brainstorm'],
      color: '#9dc3c989',
    },
    {
      id: 2,
      title: 'Startup Ideas',
      description:
        'Compare market size for vertical tools in legal vs finance...',
      time: 'Last active 1h ago',
      icon: <MySpcaes width={18} height={18} color="#000000" />,
      conversations: '12 conversations',
      tags: ['Research', 'Brainstorm'],
      color: '#a5d11364',
    },
    {
      id: 2,
      title: 'Startup Ideas',
      description:
        'Compare market size for vertical tools in legal vs finance...',
      time: 'Last active 1h ago',
      icon: <MySpcaes width={18} height={18} color="#000000" />,
      conversations: '12 conversations',
      tags: ['Research', 'Brainstorm'],
      color: '#d113c458',
    },
    {
      id: 2,
      title: 'Startup Ideas',
      description:
        'Compare market size for vertical tools in legal vs finance...',
      time: 'Last active 1h ago',
      icon: <MySpcaes width={18} height={18} color="#000000" />,
      conversations: '12 conversations',
      tags: ['Research', 'Brainstorm'],
      color: '#be33175e',
    },
    {
      id: 2,
      title: 'Startup Ideas',
      description:
        'Compare market size for vertical tools in legal vs finance...',
      time: 'Last active 1h ago',
      icon: <MySpcaes width={18} height={18} color="#000000" />,
      conversations: '12 conversations',
      tags: ['Research', 'Brainstorm'],
      color: '#1a37bb50',
    },
  ];

  return (
    <LinearGradient
      colors={['#F7F5FF', '#F1EEFF', '#EDF5FF', '#F2FAFF', '#FAFAFD']}
      locations={[0, 0.25, 0.55, 0.82, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <Header />
          <View style={styles.topCardsContainer}>
            <TopCard
              title="Create Space"
              subtitle="New AI memory workspace"
              color="#8B5CF6"
              icon={<AddSpace width={18} height={18} color="#FFFFFF" />}
            />

            <TopCard
              title="Start Listening"
              subtitle="Talk with your assistant"
              color="#15C7E8"
              icon={<MicIcon width={18} height={18} color="#FFFFFF" />}
            />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <Text style={styles.viewAllText}>See all</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickContainer}
          >
            {quickActions.map(item => (
              <QuickActionCard
                key={item.id}
                title={item.title}
                icon={item.icon}
                color={item.color}
              />
            ))}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Spaces</Text>

            <Text style={styles.viewAllText}>View all</Text>
          </View>

          {spaces.map(item => (
            <SpaceCard
              key={item.id}
              title={item.title}
              description={item.description}
              time={item.time}
              icon={item.icon}
              conversations={item.conversations}
              tags={item.tags}
              color={item.color}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Home;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: '#F7F5FF',
    marginTop: 12,
  },

  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  topCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
  },

  sectionHeader: {
    marginTop: 34,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 16,
    color: '#1E2432',
    fontWeight: '700',
  },

  viewAllText: {
    fontSize: 12,
    color: '#7B4DFF',
    fontWeight: '600',
  },

  quickContainer: {
    paddingTop: 18,
    paddingBottom: 6,
  },
});
