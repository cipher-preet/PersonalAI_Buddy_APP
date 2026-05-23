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

const ProfileCard = () => {
  return (
    <LinearGradient
      colors={['#4E1D94', '#7B4DFF', '#A855F7']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.container}>

      <Image
        source={{
          uri: 'https://i.pravatar.cc/300',
        }}
        style={styles.image}
      />

      <View style={styles.badge}>
        <Text style={styles.badgeText}>Premium Member</Text>
      </View>

      <Text style={styles.name}>Preet Kumar</Text>

      <Text style={styles.email}>
        preet.kumar@gmail.com
      </Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>
          Edit Profile
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default ProfileCard;

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,

    paddingVertical: 24,
    alignItems: 'center',

    marginBottom: 18,
  },

  image: {
    width: 70,
    height: 70,
    borderRadius: 35,

    borderWidth: 3,
    borderColor: COLORS.white,

    marginBottom: 10,
  },

  badge: {
    backgroundColor: 'rgba(255,255,255,0.18)',

    paddingHorizontal: 12,
    paddingVertical: 5,

    borderRadius: 999,

    marginBottom: 10,
  },

  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },

  name: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
  },

  email: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    marginBottom: 16,
  },

  button: {
    backgroundColor: 'rgba(255,255,255,0.22)',

    paddingHorizontal: 20,
    paddingVertical: 10,

    borderRadius: 14,
  },

  buttonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
});