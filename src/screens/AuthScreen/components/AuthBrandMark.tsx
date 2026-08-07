import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AUTH_COLORS } from '../styles/colors';
import { fontSize, fontWeight, ms, radii, spacing } from '../../../theme';

type Props = {
  size?: 'md' | 'lg';
};

const AuthBrandMark = ({ size = 'lg' }: Props) => {
  const isLarge = size === 'lg';

  return (
    <View style={[styles.wrapper, isLarge ? styles.wrapperLg : styles.wrapperMd]}>
      <LinearGradient
        colors={[
          AUTH_COLORS.primaryPurple,
          AUTH_COLORS.primaryMid,
          AUTH_COLORS.primary,
        ]}
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
    marginBottom: spacing['4xl'],
  },

  wrapperMd: {
    marginBottom: spacing['3xl'],
  },

  mark: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: AUTH_COLORS.primaryPurpleDark,
    shadowOffset: { width: 0, height: ms(10) },
    shadowOpacity: 0.28,
    shadowRadius: ms(20),
    elevation: 8,
  },

  markLg: {
    width: ms(76),
    height: ms(76),
    borderRadius: radii['3xl'],
  },

  markMd: {
    width: ms(60),
    height: ms(60),
    borderRadius: radii.xl,
  },

  glow: {
    position: 'absolute',
    top: ms(-10),
    right: ms(-10),
    width: ms(40),
    height: ms(40),
    borderRadius: ms(20),
    backgroundColor: 'rgba(255,255,255,0.22)',
  },

  letter: {
    color: AUTH_COLORS.white,
    fontWeight: fontWeight.extrabold,
  },

  letterLg: {
    fontSize: ms(34),
    letterSpacing: -1,
  },

  letterMd: {
    fontSize: fontSize['5xl'],
    letterSpacing: -0.5,
  },
});
