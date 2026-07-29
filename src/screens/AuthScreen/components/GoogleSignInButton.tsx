import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AUTH_COLORS } from '../styles/colors';

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
    height: 56,
    borderRadius: 28,
    backgroundColor: AUTH_COLORS.white,
    borderWidth: 1,
    borderColor: AUTH_COLORS.googleBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: AUTH_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  iconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },

  iconG: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4285F4',
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: AUTH_COLORS.text,
    letterSpacing: -0.2,
  },
});
