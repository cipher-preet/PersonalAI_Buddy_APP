import React, { useState } from 'react';
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
  const [phone, setPhone] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
  const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
  const [isGoogleBusy, setIsGoogleBusy] = useState(false);

  const cleanedPhone = phone.replace(/\D/g, '');
  const isPhoneValid = cleanedPhone.length >= 10;
  const loading = isSendingOtp || isGoogleLoading || isGoogleBusy;

  const getApiErrorMessage = (error: any, fallback: string) =>
    error?.data?.message || error?.message || fallback;

  const handleContinue = async () => {
    if (!isPhoneValid) {
      showToast({ message: 'Enter a valid mobile number', type: 'error' });
      return;
    }

    try {
      await sendOtp({ phone: cleanedPhone }).unwrap();
      showToast({ message: 'OTP sent to your number', type: 'success' });
      navigation.navigate('Otp', { phone: cleanedPhone });
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
      };

      dispatch(
        loginSuccess({
          userId: payload.userId,
          token: payload.token,
          isNewUser: payload.isNewUser,
          email: payload.email,
          name: payload.name,
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
        <Text style={styles.sectionLabel}>Mobile number</Text>
        <View
          style={[
            styles.phoneField,
            isFocused && styles.phoneFieldFocused,
          ]}
        >
          <View style={styles.countryChip}>
            <Text style={styles.flag}>🇮🇳</Text>
            <Text style={styles.countryCode}>+91</Text>
          </View>
          <View style={styles.divider} />
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="10-digit mobile number"
            placeholderTextColor={AUTH_COLORS.muted}
            keyboardType="phone-pad"
            maxLength={10}
            style={styles.input}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </View>

        <TouchableOpacity
          onPress={handleContinue}
          disabled={!isPhoneValid || loading}
          activeOpacity={0.9}
          style={styles.ctaWrap}
        >
          <LinearGradient
            colors={
              isPhoneValid
                ? ['#8B5CF6', '#7C3AED', '#4338CA']
                : ['#C4B5FD', '#A78BFA', '#A5B4FC']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButton}
          >
            {isSendingOtp ? (
              <ActivityIndicator color="#FFFFFF" />
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
    paddingTop: 16,
    paddingBottom: 28,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: AUTH_COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.8,
    lineHeight: 34,
  },

  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 23,
    color: AUTH_COLORS.subText,
    textAlign: 'center',
    paddingHorizontal: 8,
    fontWeight: '400',
  },

  card: {
    backgroundColor: AUTH_COLORS.white,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: AUTH_COLORS.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: AUTH_COLORS.textSecondary,
    marginBottom: 10,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },

  phoneField: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 16,
    backgroundColor: AUTH_COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: AUTH_COLORS.border,
    marginBottom: 20,
    overflow: 'hidden',
  },

  phoneFieldFocused: {
    borderColor: AUTH_COLORS.borderFocus,
    backgroundColor: AUTH_COLORS.white,
    shadowColor: AUTH_COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2,
  },

  countryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 6,
  },

  flag: {
    fontSize: 16,
  },

  countryCode: {
    fontSize: 15,
    fontWeight: '700',
    color: AUTH_COLORS.text,
  },

  divider: {
    width: 1,
    height: 28,
    backgroundColor: AUTH_COLORS.border,
  },

  input: {
    flex: 1,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '500',
    color: AUTH_COLORS.text,
    letterSpacing: 0.5,
  },

  ctaWrap: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },

  primaryButton: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },

  primaryButtonText: {
    color: AUTH_COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },

  orLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: AUTH_COLORS.border,
  },

  orText: {
    marginHorizontal: 16,
    fontSize: 13,
    fontWeight: '500',
    color: AUTH_COLORS.muted,
    textTransform: 'lowercase',
  },

  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingHorizontal: 12,
    gap: 8,
  },

  trustIcon: {
    fontSize: 14,
  },

  trustText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: AUTH_COLORS.subText,
    fontWeight: '500',
  },

  footer: {
    marginTop: 16,
    fontSize: 12,
    lineHeight: 19,
    color: AUTH_COLORS.muted,
    textAlign: 'center',
    paddingHorizontal: 16,
  },

  footerLink: {
    color: AUTH_COLORS.primary,
    fontWeight: '600',
  },
});
