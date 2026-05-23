import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ProfileHeader from './components/ProfileHeader';
import ProfileCard from './components/ProfileCard';
import StatsRow from './components/StatsRow';
import WeeklyGoalCard from './components/WeeklyGoalCard';
import QuickActions from './components/QuickActions';
import ActivityCard from './components/ActivityCard';
import SettingsList from './components/SettingsList';

import { COLORS } from './styles/colors';

const ProfileScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <ProfileHeader />

        <ProfileCard />

        <StatsRow />

        <WeeklyGoalCard />

        {/* <QuickActions />  i Think it add on later */}

        <ActivityCard />

        <SettingsList />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,

    paddingVertical: 16,

    paddingBottom: 40,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },
});
