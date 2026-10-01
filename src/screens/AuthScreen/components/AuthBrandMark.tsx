import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, fontWeight, ms, radii, spacing } from '../../../theme';

type Props = {
  size?: 'md' | 'lg';
  showWordmark?: boolean;
};

const APP_ICON = require('../../../assets/images/app-icon.png');

const AuthBrandMark = ({ size = 'lg', showWordmark = false }: Props) => {
  const isLarge = size === 'lg';

  return (
    <View style={[styles.wrapper, isLarge ? styles.wrapperLg : styles.wrapperMd]}>
      <View style={[styles.frame, isLarge ? styles.frameLg : styles.frameMd]}>
        <Image
          source={APP_ICON}
          style={styles.icon}
          resizeMode="cover"
          accessibilityLabel="KukuNotes app icon"
        />
      </View>
      {showWordmark ? (
        <Text style={styles.wordmark} accessibilityRole="header">
          Kuku<Text style={styles.wordmarkAccent}>Notes</Text>
        </Text>
      ) : null}
    </View>
  );
};

export default AuthBrandMark;

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
    alignItems: 'center',
  },

  wrapperLg: {
    marginBottom: spacing['4xl'],
  },

  wrapperMd: {
    marginBottom: 0,
  },

  frame: {
    backgroundColor: '#0B1546',
    overflow: 'hidden',
    shadowColor: colors.primaryPurpleDark,
    shadowOffset: { width: 0, height: ms(6) },
    shadowOpacity: 0.25,
    shadowRadius: ms(12),
    elevation: 6,
  },

  frameLg: {
    width: ms(84),
    height: ms(84),
    borderRadius: radii['2xl'],
  },

  frameMd: {
    width: ms(72),
    height: ms(72),
    borderRadius: radii.xl,
  },

  icon: {
    width: '100%',
    height: '100%',
  },

  wordmark: {
    marginTop: spacing.md,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.extrabold,
    color: colors.text,
    letterSpacing: -0.4,
  },

  wordmarkAccent: {
    color: colors.primaryPurple,
  },
});
