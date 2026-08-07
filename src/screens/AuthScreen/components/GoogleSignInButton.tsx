import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AUTH_COLORS } from '../styles/colors';
import {
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../theme';

type Props = {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

const GoogleSignInButton = ({ onPress, loading, disabled }: Props) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={AUTH_COLORS.text} />
      ) : (
        <>
          <View style={styles.iconCircle}>
            <Text style={styles.iconG}>G</Text>
          </View>
          <Text style={styles.label}>Continue with Google</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default GoogleSignInButton;

const styles = StyleSheet.create({
  button: {
    height: ms(56),
    borderRadius: ms(28),
    backgroundColor: AUTH_COLORS.white,
    borderWidth: 1,
    borderColor: AUTH_COLORS.googleBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    shadowColor: AUTH_COLORS.shadow,
    shadowOffset: { width: 0, height: ms(2) },
    shadowOpacity: 0.04,
    shadowRadius: ms(8),
    elevation: 1,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  iconCircle: {
    width: ms(22),
    height: ms(22),
    borderRadius: ms(11),
    backgroundColor: AUTH_COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AUTH_COLORS.border,
  },

  iconG: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.extrabold,
    color: '#4285F4',
  },

  label: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: AUTH_COLORS.text,
    letterSpacing: -0.2,
  },
});
