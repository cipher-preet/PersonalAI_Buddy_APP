import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { colors, ms, radii, spacing } from '../../../theme';

type Props = {
  size?: 'md' | 'lg';
};

const APP_ICON = require('../../../assets/images/app-icon.png');

const AuthBrandMark = ({ size = 'lg' }: Props) => {
  const isLarge = size === 'lg';

  return (
    <View style={[styles.wrapper, isLarge ? styles.wrapperLg : styles.wrapperMd]}>
      <View style={[styles.frame, isLarge ? styles.frameLg : styles.frameMd]}>
        <Image
          source={APP_ICON}
          style={[styles.icon, isLarge ? styles.iconLg : styles.iconMd]}
          resizeMode="cover"
          accessibilityLabel="Buddy app icon"
        />
      </View>
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
    marginBottom: 0,
  },

  frame: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.brandBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: ms(8) },
    shadowOpacity: 0.18,
    shadowRadius: ms(16),
    elevation: 5,
    overflow: 'hidden',
  },

  frameLg: {
    width: ms(84),
    height: ms(84),
    borderRadius: radii['2xl'],
    padding: ms(4),
  },

  frameMd: {
    width: ms(72),
    height: ms(72),
    borderRadius: radii.xl,
    padding: ms(3),
  },

  icon: {
    width: '100%',
    height: '100%',
  },

  iconLg: {
    borderRadius: ms(18),
  },

  iconMd: {
    borderRadius: ms(14),
  },
});
