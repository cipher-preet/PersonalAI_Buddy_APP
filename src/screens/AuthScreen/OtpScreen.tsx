import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AuthLayout from './components/AuthLayout';
import AuthBrandMark from './components/AuthBrandMark';
import AuthHeaderBar from './components/AuthHeaderBar';
import OtpInputBoxes from './components/OtpInputBoxes';
import { AUTH_COLORS } from './styles/colors';
import {
  fontSize,
  fontWeight,
  layout,
  ms,
  mvs,
  radii,
  spacing,
} from '../../theme';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { useAppDispatch } from '../../store/hooks';
import { loginSuccess } from '../../store/slices/authSlice';
import {
  useSendOtpMutation,
  useVerifyOtpMutation,
} from '../../store/api/auth';
import { useToast } from '../../store/context/ToastContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Otp'>;

const OtpScreen = ({ navigation, route }: Props) => {
  const { phone, username } = route.params;
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [sendOtp, { isLoading: isResending }] = useSendOtpMutation();
  const verifyingRef = useRef(false);
  const submittedOtpRef = useRef('');

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const maskedPhone = `+91 ${phone.slice(0, 2)} •••• ${phone.slice(-4)}`;
  const isComplete = otp.length === 4;
  const loading = isLoading || isResending;

  const getApiErrorMessage = (error: any, fallback: string) =>
    error?.data?.message || error?.message || fallback;

  const handleVerify = useCallback(async () => {
    if (otp.length !== 4 || verifyingRef.current || loading) {
      return;
    }

    verifyingRef.current = true;

    try {
      const result = await verifyOtp({ phone, otp, username }).unwrap();

      dispatch(
        loginSuccess({
          userId: result.userId,
          token: result.token,
          isNewUser: result.isNewUser,
          phone,
          name: result.name ?? username,
          avatar: result.avatar,
        }),
      );

      if (result.isNewUser) {
        navigation.navigate('OnboardingProfession');
      } else {
        showToast({ message: 'Welcome back!', type: 'success' });
      }
    } catch (error: any) {
      showToast({
        message: getApiErrorMessage(error, 'Invalid OTP. Please try again.'),
        type: 'error',
      });
    } finally {
      verifyingRef.current = false;
    }
  }, [dispatch, loading, navigation, otp, phone, showToast, username, verifyOtp]);

  useEffect(() => {
    if (otp.length === 4 && otp !== submittedOtpRef.current) {
      submittedOtpRef.current = otp;
      handleVerify();
    }

    if (otp.length < 4) {
      submittedOtpRef.current = '';
    }
  }, [otp, handleVerify]);

  const handleResend = async () => {
    try {
      await sendOtp({ phone }).unwrap();
      setTimer(30);
      setOtp('');
      submittedOtpRef.current = '';
      showToast({ message: 'A new code has been sent', type: 'success' });
    } catch (error: any) {
      showToast({
        message: getApiErrorMessage(error, 'Unable to resend OTP'),
        type: 'error',
      });
    }
  };

  return (
    <AuthLayout scrollable>
      <AuthHeaderBar
        title="Verification"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.hero}>
        <AuthBrandMark size="md" />
        <Text style={styles.title}>Enter verification code</Text>
        <Text style={styles.subtitle}>
          We sent a 4-digit code to your mobile number
        </Text>

        <View style={styles.phoneBadge}>
          <Text style={styles.phoneText}>{maskedPhone}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={styles.changeLink}>Change</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <OtpInputBoxes value={otp} onChange={setOtp} />

        <View style={styles.timerRow}>
          {timer > 0 ? (
            <View style={styles.timerPill}>
              <Text style={styles.timerText}>
                Resend in 0:{timer.toString().padStart(2, '0')}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleResend}
              disabled={isResending}
              activeOpacity={0.7}
            >
              <Text style={styles.resendLink}>Resend code</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={handleVerify}
          disabled={!isComplete || loading}
          activeOpacity={0.9}
          style={styles.ctaWrap}
        >
          <LinearGradient
            colors={
              isComplete
                ? [AUTH_COLORS.primaryPurple, AUTH_COLORS.primaryMid, AUTH_COLORS.primary]
                : ['#C4B5FD', '#A78BFA', AUTH_COLORS.borderFocus]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButton}
          >
            {loading ? (
              <ActivityIndicator color={AUTH_COLORS.white} />
            ) : (
              <Text style={styles.primaryButtonText}>Verify & Continue</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>
        Didn't receive the code? Check your SMS inbox or try resending after the
        timer ends.
      </Text>
    </AuthLayout>
  );
};

export default OtpScreen;

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

  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: ms(18),
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: AUTH_COLORS.primarySoft,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    gap: spacing.xl,
  },

  phoneText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: AUTH_COLORS.textSecondary,
    letterSpacing: 0.3,
  },

  changeLink: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: AUTH_COLORS.primary,
  },

  card: {
    backgroundColor: AUTH_COLORS.white,
    borderRadius: radii['3xl'],
    paddingVertical: ms(22),
    paddingHorizontal: spacing['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: AUTH_COLORS.shadow,
    shadowOffset: { width: 0, height: ms(12) },
    shadowOpacity: 0.08,
    shadowRadius: ms(24),
    elevation: 4,
    alignItems: 'center',
  },

  timerRow: {
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: spacing['3xl'],
    marginBottom: ms(22),
    minHeight: ms(32),
    justifyContent: 'center',
  },

  timerPill: {
    paddingHorizontal: spacing.xl + spacing.xxs,
    paddingVertical: spacing.sm,
    borderRadius: ms(14),
    backgroundColor: AUTH_COLORS.inputBg,
  },

  timerText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: AUTH_COLORS.subText,
  },

  resendLink: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: AUTH_COLORS.primary,
  },

  ctaWrap: {
    borderRadius: ms(28),
    overflow: 'hidden',
    alignSelf: 'stretch',
    marginHorizontal: spacing.sm,
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

  hint: {
    marginTop: spacing['3xl'],
    fontSize: fontSize.sm,
    lineHeight: ms(18),
    color: AUTH_COLORS.muted,
    textAlign: 'center',
    paddingHorizontal: layout.screenPadding,
  },
});
