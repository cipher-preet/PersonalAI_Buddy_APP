import React, { memo } from 'react';
import { Image, StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { colors, fontSize, fontWeight, ms, spacing } from '../theme';

const APP_ICON = require('../assets/images/app-icon.png');

type Props = {
  size?: number;
  showWordmark?: boolean;
  showTagline?: boolean;
  style?: StyleProp<ViewStyle>;
};

const BrandLogo = ({
  size = ms(32),
  showWordmark = false,
  showTagline = false,
  style,
}: Props) => (
  <View style={[styles.row, style]}>
    <Image
      source={APP_ICON}
      style={[
        styles.icon,
        { width: size, height: size, borderRadius: size * 0.26 },
      ]}
      accessibilityLabel="KukuNotes logo"
    />
    {showWordmark ? (
      <View style={styles.textBlock}>
        <Text style={[styles.wordmark, { fontSize: size * 0.5 }]}>
          Kuku<Text style={styles.wordmarkAccent}>Notes</Text>
        </Text>
        {showTagline ? (
          <Text style={styles.tagline}>CAPTURE • ORGANIZE • GROW</Text>
        ) : null}
      </View>
    ) : null}
  </View>
);

export default memo(BrandLogo);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  icon: {
    backgroundColor: colors.brandNavy,
  },

  textBlock: {
    marginLeft: spacing.md,
  },

  wordmark: {
    fontWeight: fontWeight.extrabold,
    color: colors.text,
    letterSpacing: -0.3,
  },

  wordmarkAccent: {
    color: colors.primaryPurple,
  },

  tagline: {
    marginTop: ms(2),
    fontSize: fontSize.xs - 1,
    fontWeight: fontWeight.semibold,
    color: colors.muted,
    letterSpacing: 1.2,
  },
});
