import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { COLORS } from '../styles/colors';

const PROFILE = {
  name: 'Preet Kumar',
  email: 'preet.kumar@gmail.com',
  avatar: 'https://i.pravatar.cc/300',
  tasks: 124,
  focus: '42h',
  projects: 12,
};

const ProfileCard = () => {
  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <View style={styles.cardHeader}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Premium</Text>
          </View>
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Active</Text>
          </View>
        </View>

        <View style={styles.profileRow}>
          <Image source={{ uri: PROFILE.avatar }} style={styles.image} />
          <View style={styles.info}>
            <Text style={styles.name}>{PROFILE.name}</Text>
            <Text style={styles.email}>{PROFILE.email}</Text>
            <TouchableOpacity style={styles.button} activeOpacity={0.85}>
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{PROFILE.tasks}</Text>
            <Text style={styles.metricLabel}>Tasks</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{PROFILE.focus}</Text>
            <Text style={styles.metricLabel}>Focus</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{PROFILE.projects}</Text>
            <Text style={styles.metricLabel}>Projects</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default ProfileCard;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 18,
  },

  container: {
    borderRadius: 22,
    padding: 18,
    overflow: 'hidden',
  },

  glowTop: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },

  glowBottom: {
    position: 'absolute',
    bottom: -40,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },

  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },

  liveText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 10,
    fontWeight: '700',
  },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  image: {
    width: 72,
    height: 72,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    marginRight: 14,
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.3,
  },

  email: {
    marginTop: 4,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.82)',
    fontWeight: '500',
  },

  button: {
    alignSelf: 'flex-start',
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },

  buttonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },

  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },

  metricItem: {
    flex: 1,
    alignItems: 'center',
  },

  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  metricValue: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },

  metricLabel: {
    marginTop: 2,
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    fontWeight: '600',
  },
});
