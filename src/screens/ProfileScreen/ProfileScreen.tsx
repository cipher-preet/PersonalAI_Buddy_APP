import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

import ProfileHeader from './components/ProfileHeader';
import ProfileCard from './components/ProfileCard';
import WeeklyGoalCard from './components/WeeklyGoalCard';
import ActivityCard from './components/ActivityCard';
import SettingsList from './components/SettingsList';

import { COLORS } from './styles/colors';

const ProfileScreen = () => {
  return (
    <LinearGradient
      colors={[
        COLORS.gradientStart,
        COLORS.gradientMid,
        COLORS.gradientEnd,
        COLORS.gradientEnd,
      ]}
      locations={[0, 0.25, 0.7, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <ProfileHeader />
          <ProfileCard />
          <WeeklyGoalCard />
          <ActivityCard />
          <SettingsList />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 120,
  },
});
