import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AUTH_COLORS } from '../styles/colors';

type Props = {
  size?: 'md' | 'lg';
};

const AuthBrandMark = ({ size = 'lg' }: Props) => {
  const isLarge = size === 'lg';

  return (
    <View style={[styles.wrapper, isLarge ? styles.wrapperLg : styles.wrapperMd]}>
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED', '#4338CA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.mark, isLarge ? styles.markLg : styles.markMd]}
      >
        <View style={styles.glow} />
        <Text style={[styles.letter, isLarge ? styles.letterLg : styles.letterMd]}>
          B
        </Text>
      </LinearGradient>
    </View>
  );
};

export default AuthBrandMark;

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
  },

  wrapperLg: {
    marginBottom: 28,
  },

  wrapperMd: {
    marginBottom: 20,
  },

  mark: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 8,
  },

  markLg: {
    width: 76,
    height: 76,
    borderRadius: 24,
  },

  markMd: {
    width: 60,
    height: 60,
    borderRadius: 20,
  },

  glow: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },

  letter: {
    color: AUTH_COLORS.white,
    fontWeight: '800',
  },

  letterLg: {
    fontSize: 34,
    letterSpacing: -1,
  },

  letterMd: {
    fontSize: 28,
    letterSpacing: -0.5,
  },
});
