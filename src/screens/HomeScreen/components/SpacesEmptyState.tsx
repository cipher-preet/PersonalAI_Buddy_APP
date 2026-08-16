import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AddSpace, MySpcaes } from '../../../../styles/icons';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  mvs,
  radii,
  spacing,
} from '../../../theme';

type Props = {
  onCreatePress: () => void;
};

const SpacesEmptyState = ({ onCreatePress }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconRing}>
        <View style={styles.iconInner}>
          <MySpcaes width={ms(28)} height={ms(28)} color={colors.primary} />
        </View>
      </View>

      <Text style={styles.title}>No spaces yet</Text>
      <Text style={styles.subtitle}>
        Create your first workspace to organize notes, tasks, and voice memories
        with Buddy.
      </Text>

      <TouchableOpacity
        onPress={onCreatePress}
        activeOpacity={0.9}
        style={styles.buttonWrap}
      >
        <LinearGradient
          colors={[
            colors.primaryPurple,
            colors.primaryPurpleDark,
            colors.primary,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <AddSpace width={ms(16)} height={ms(16)} color={colors.white} />
          <Text style={styles.buttonText}>Create your first space</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default SpacesEmptyState;

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    paddingVertical: spacing['4xl'],
    paddingHorizontal: spacing['4xl'],
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii['3xl'],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primaryLight,
    borderStyle: 'dashed',
  },

  iconRing: {
    width: ms(72),
    height: ms(72),
    borderRadius: ms(36),
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: mvs(18),
  },

  iconInner: {
    width: ms(52),
    height: ms(52),
    borderRadius: ms(18),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: ms(17),
    fontWeight: fontWeight.extrabold,
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: spacing.md,
  },

  subtitle: {
    fontSize: fontSize.md,
    lineHeight: ms(20),
    fontWeight: fontWeight.medium,
    color: colors.subText,
    textAlign: 'center',
    marginBottom: mvs(22),
    paddingHorizontal: spacing.md,
  },

  buttonWrap: {
    borderRadius: radii.lg,
    overflow: 'hidden',
  },

  button: {
    height: mvs(48),
    paddingHorizontal: spacing['3xl'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    borderRadius: radii.lg,
  },

  buttonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
});
