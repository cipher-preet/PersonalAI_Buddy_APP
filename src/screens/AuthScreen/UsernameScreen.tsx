import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AuthLayout from './components/AuthLayout';
import AuthBrandMark from './components/AuthBrandMark';
import AuthHeaderBar from './components/AuthHeaderBar';
import { AUTH_COLORS } from './styles/colors';
import {
  fontSize,
  fontWeight,
  ms,
  mvs,
  radii,
  spacing,
} from '../../theme';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { useSendOtpMutation } from '../../store/api/auth';
import { useToast } from '../../store/context/ToastContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Username'>;

const UsernameScreen = ({ navigation, route }: Props) => {
  const { phone } = route.params;
  const { showToast } = useToast();
  const usernameInputRef = useRef<TextInput>(null);
  const [username, setUsername] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [sendOtp, { isLoading }] = useSendOtpMutation();

  const trimmedUsername = username.trim().replace(/\s+/g, ' ');
  const isUsernameValid = trimmedUsername.length >= 2;

  const getApiErrorMessage = (error: any, fallback: string) =>
    error?.data?.message || error?.message || fallback;

  const handleContinue = async () => {
    if (!isUsernameValid) {
      showToast({ message: 'Enter your username', type: 'error' });
      return;
    }

    try {
      await sendOtp({ phone }).unwrap();
      showToast({ message: 'OTP sent to your number', type: 'success' });
      navigation.navigate('Otp', {
        phone,
        username: trimmedUsername,
      });
    } catch (error: any) {
      showToast({
        message: getApiErrorMessage(error, 'Unable to send OTP. Please try again.'),
        type: 'error',
      });
    }
  };

  return (
    <AuthLayout scrollable>
      <AuthHeaderBar title="Your name" onBack={() => navigation.goBack()} />

      <View style={styles.hero}>
        <AuthBrandMark size="md" />
        <Text style={styles.title}>What should we call you?</Text>
        <Text style={styles.subtitle}>
          Add your username to finish setting up your Buddy account.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Username</Text>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => usernameInputRef.current?.focus()}
          style={[styles.textField, isFocused && styles.textFieldFocused]}
        >
          <TextInput
            ref={usernameInputRef}
            value={username}
            onChangeText={setUsername}
            placeholder="What should we call you?"
            placeholderTextColor={AUTH_COLORS.muted}
            autoCapitalize="words"
            autoCorrect={false}
            textContentType="name"
            returnKeyType="done"
            style={styles.textInput}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmitEditing={handleContinue}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleContinue}
          disabled={!isUsernameValid || isLoading}
          activeOpacity={0.9}
          style={styles.ctaWrap}
        >
          <LinearGradient
            colors={
              isUsernameValid
                ? [AUTH_COLORS.primaryPurple, AUTH_COLORS.primaryMid, AUTH_COLORS.primary]
                : ['#C4B5FD', '#A78BFA', AUTH_COLORS.borderFocus]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButton}
          >
            {isLoading ? (
              <ActivityIndicator color={AUTH_COLORS.white} />
            ) : (
              <Text style={styles.primaryButtonText}>Continue</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
};

export default UsernameScreen;

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingTop: mvs(8),
    paddingBottom: mvs(24),
  },

  title: {
    fontSize: ms(26),
    fontWeight: fontWeight.extrabold,
    color: AUTH_COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.6,
    lineHeight: ms(32),
  },

  subtitle: {
    marginTop: spacing.md,
    fontSize: fontSize.lg,
    lineHeight: ms(22),
    color: AUTH_COLORS.subText,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },

  card: {
    backgroundColor: AUTH_COLORS.white,
    borderRadius: radii['3xl'],
    padding: ms(22),
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: AUTH_COLORS.shadow,
    shadowOffset: { width: 0, height: ms(12) },
    shadowOpacity: 0.08,
    shadowRadius: ms(24),
    elevation: 4,
  },

  sectionLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: AUTH_COLORS.textSecondary,
    marginBottom: spacing.lg,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },

  textField: {
    height: ms(56),
    borderRadius: radii.lg,
    backgroundColor: AUTH_COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: AUTH_COLORS.border,
    marginBottom: spacing['3xl'],
    justifyContent: 'center',
  },

  textFieldFocused: {
    borderColor: AUTH_COLORS.borderFocus,
    backgroundColor: AUTH_COLORS.white,
    shadowColor: AUTH_COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: ms(10),
    elevation: 2,
  },

  textInput: {
    minHeight: ms(54),
    paddingHorizontal: spacing.xl + spacing.xxs,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.medium,
    color: AUTH_COLORS.text,
  },

  ctaWrap: {
    borderRadius: ms(28),
    overflow: 'hidden',
    shadowColor: AUTH_COLORS.primaryPurpleDark,
    shadowOffset: { width: 0, height: ms(6) },
    shadowOpacity: 0.25,
    shadowRadius: ms(12),
    elevation: 4,
  },

  primaryButton: {
    height: ms(56),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ms(28),
  },

  primaryButtonText: {
    color: AUTH_COLORS.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.2,
  },
});
