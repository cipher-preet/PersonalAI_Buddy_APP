import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AuthLayout from './components/AuthLayout';
import AuthBrandMark from './components/AuthBrandMark';
import GoogleSignInButton from './components/GoogleSignInButton';
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
import { useAppDispatch } from '../../store/hooks';
import { loginSuccess } from '../../store/slices/authSlice';
import {
  useGoogleLoginMutation,
  useSendOtpMutation,
} from '../../store/api/auth';
import { signInWithGoogle } from '../../services/googleSignInService';
import { useToast } from '../../store/context/ToastContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const usernameInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [focusedField, setFocusedField] = useState<'username' | 'phone' | null>(
    null,
  );
  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
  const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
  const [isGoogleBusy, setIsGoogleBusy] = useState(false);

  const trimmedUsername = username.trim();
  const cleanedPhone = phone.replace(/\D/g, '');
  const isUsernameValid = trimmedUsername.length >= 2;
  const isPhoneValid = cleanedPhone.length >= 10;
  const canContinue = isUsernameValid && isPhoneValid;
  const loading = isSendingOtp || isGoogleLoading || isGoogleBusy;

  const getApiErrorMessage = (error: any, fallback: string) =>
    error?.data?.message || error?.message || fallback;

  const handleContinue = async () => {
    if (!isUsernameValid) {
      showToast({ message: 'Enter your username', type: 'error' });
      return;
    }

    if (!isPhoneValid) {
      showToast({ message: 'Enter a valid mobile number', type: 'error' });
      return;
    }

    try {
      await sendOtp({ phone: cleanedPhone }).unwrap();
      showToast({ message: 'OTP sent to your number', type: 'success' });
      navigation.navigate('Otp', {
        phone: cleanedPhone,
        username: trimmedUsername,
      });
    } catch {
      showToast({
        message: 'Unable to send OTP. Please try again.',
        type: 'error',
      });
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleBusy(true);

    try {
      const googleData = await signInWithGoogle();
      const response = await googleLogin({ idToken: googleData.idToken }).unwrap();
      const payload = {
        token: response.token,
        userId: response.userId,
        isNewUser: response.isNewUser,
        name: response.name ?? googleData.name,
        email: response.email ?? googleData.email,
        avatar: response.avatar ?? googleData.avatar,
      };

      dispatch(
        loginSuccess({
          userId: payload.userId,
          token: payload.token,
          isNewUser: payload.isNewUser,
          email: payload.email,
          name: payload.name,
          avatar: payload.avatar,
        }),
      );

      if (payload.isNewUser) {
        navigation.navigate('OnboardingProfession');
      } else {
        showToast({ message: 'Welcome back!', type: 'success' });
      }
    } catch (error: any) {
      showToast({
        message: getApiErrorMessage(error, 'Google sign-in failed'),
        type: 'error',
      });
    } finally {
      setIsGoogleBusy(false);
    }
  };

  return (
    <AuthLayout scrollable>
      <View style={styles.hero}>
        <AuthBrandMark />
        <Text style={styles.title}>Sign in to MyBuddy</Text>
        <Text style={styles.subtitle}>
          Your personal AI assistant for notes, tasks, and everyday productivity.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Username</Text>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => usernameInputRef.current?.focus()}
          style={[
            styles.textField,
            focusedField === 'username' && styles.textFieldFocused,
          ]}
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
            returnKeyType="next"
            blurOnSubmit={false}
            style={styles.textInput}
            onFocus={() => setFocusedField('username')}
            onBlur={() => setFocusedField(null)}
            onSubmitEditing={() => phoneInputRef.current?.focus()}
          />
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>Mobile number</Text>
        <View
          style={[
            styles.phoneField,
            focusedField === 'phone' && styles.phoneFieldFocused,
          ]}
        >
          <View style={styles.countryChip}>
            <Text style={styles.flag}>🇮🇳</Text>
            <Text style={styles.countryCode}>+91</Text>
          </View>
          <View style={styles.divider} />
          <TextInput
            ref={phoneInputRef}
            value={phone}
            onChangeText={setPhone}
            placeholder="10-digit mobile number"
            placeholderTextColor={AUTH_COLORS.muted}
            keyboardType="phone-pad"
            maxLength={10}
            returnKeyType="done"
            style={styles.phoneInput}
            onFocus={() => setFocusedField('phone')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        <TouchableOpacity
          onPress={handleContinue}
          disabled={!canContinue || loading}
          activeOpacity={0.9}
          style={styles.ctaWrap}
        >
          <LinearGradient
            colors={
              canContinue
                ? [AUTH_COLORS.primaryPurple, AUTH_COLORS.primaryMid, AUTH_COLORS.primary]
                : ['#C4B5FD', '#A78BFA', AUTH_COLORS.borderFocus]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButton}
          >
            {isSendingOtp ? (
              <ActivityIndicator color={AUTH_COLORS.white} />
            ) : (
              <Text style={styles.primaryButtonText}>Continue</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.orLine} />
        </View>

        <GoogleSignInButton
          onPress={handleGoogleLogin}
          loading={isGoogleBusy}
          disabled={loading}
        />
      </View>

      <View style={styles.trustRow}>
        <Text style={styles.trustIcon}>🔒</Text>
        <Text style={styles.trustText}>
          Secure sign-in. We never share your personal data.
        </Text>
      </View>

      <Text style={styles.footer}>
        By continuing, you agree to our{' '}
        <Text style={styles.footerLink}>Terms</Text> and{' '}
        <Text style={styles.footerLink}>Privacy Policy</Text>.
      </Text>
    </AuthLayout>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingTop: mvs(16),
    paddingBottom: mvs(28),
  },

  title: {
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.extrabold,
    color: AUTH_COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.8,
    lineHeight: ms(34),
  },

  subtitle: {
    marginTop: spacing.lg,
    fontSize: fontSize.lg,
    lineHeight: ms(23),
    color: AUTH_COLORS.subText,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    fontWeight: fontWeight.regular,
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
    marginBottom: ms(18),
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

  phoneField: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ms(56),
    borderRadius: radii.lg,
    backgroundColor: AUTH_COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: AUTH_COLORS.border,
    marginBottom: spacing['3xl'],
    overflow: 'hidden',
  },

  phoneFieldFocused: {
    borderColor: AUTH_COLORS.borderFocus,
    backgroundColor: AUTH_COLORS.white,
    shadowColor: AUTH_COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: ms(10),
    elevation: 2,
  },

  countryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl + spacing.xxs,
    gap: spacing.sm,
  },

  flag: {
    fontSize: fontSize.xl,
  },

  countryCode: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: AUTH_COLORS.text,
  },

  divider: {
    width: ms(1),
    height: ms(28),
    backgroundColor: AUTH_COLORS.border,
  },

  textInput: {
    minHeight: ms(54),
    paddingHorizontal: spacing.xl + spacing.xxs,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.medium,
    color: AUTH_COLORS.text,
  },

  phoneInput: {
    flex: 1,
    minHeight: ms(54),
    paddingHorizontal: spacing.xl + spacing.xxs,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.medium,
    color: AUTH_COLORS.text,
    letterSpacing: 0.5,
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

  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: ms(22),
  },

  orLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: AUTH_COLORS.border,
  },

  orText: {
    marginHorizontal: spacing['2xl'],
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: AUTH_COLORS.muted,
    textTransform: 'lowercase',
  },

  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing['4xl'],
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },

  trustIcon: {
    fontSize: fontSize.base,
  },

  trustText: {
    flex: 1,
    fontSize: fontSize.sm,
    lineHeight: ms(18),
    color: AUTH_COLORS.subText,
    fontWeight: fontWeight.medium,
  },

  footer: {
    marginTop: spacing['2xl'],
    fontSize: fontSize.sm,
    lineHeight: ms(19),
    color: AUTH_COLORS.muted,
    textAlign: 'center',
    paddingHorizontal: spacing['2xl'],
  },

  footerLink: {
    color: AUTH_COLORS.primary,
    fontWeight: fontWeight.semibold,
  },
});
