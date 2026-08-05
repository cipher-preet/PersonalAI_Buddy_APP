import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { COLORS } from '../styles/colors';

const PROFILE = {
  name: 'Preet Kumar',
  email: 'preet.kumar@gmail.com',
  avatar: 'https://i.pravatar.cc/300',
  plan: 'Pro',
};

const PencilIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 20h9M4.5 17.5 17 5l2 2L6.5 19.5 3 21l1.5-3.5Z"
      stroke={COLORS.white}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ProfileCard = () => {
  const handlePhotoPress = () => {};

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.avatarFrame}
            activeOpacity={0.85}
            onPress={handlePhotoPress}
          >
            <Image source={{ uri: PROFILE.avatar }} style={styles.image} />
            <View style={styles.editPhotoBadge}>
              <PencilIcon />
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>{PROFILE.name}</Text>
          <Text style={styles.email}>{PROFILE.email}</Text>

          <View style={styles.planBadge}>
            <Text style={styles.planLabel}>Plan</Text>
            <Text style={styles.planValue}>{PROFILE.plan}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ProfileCard;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },

  container: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E8EAF6',
    shadowColor: '#475569',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },

  profileSection: {
    alignItems: 'center',
  },

  avatarFrame: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 14,
  },

  image: {
    width: 96,
    height: 96,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#DDD6FE',
    backgroundColor: COLORS.lightPurple,
  },

  editPhotoBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  name: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0,
    textAlign: 'center',
  },

  email: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.subText,
    fontWeight: '600',
    textAlign: 'center',
  },

  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },

  planLabel: {
    color: COLORS.subText,
    fontSize: 12,
    fontWeight: '700',
  },

  planValue: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});
