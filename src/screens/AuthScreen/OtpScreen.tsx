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
  const { phone } = route.params;
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
      const result = await verifyOtp({ phone, otp }).unwrap();

      dispatch(
        loginSuccess({
          userId: result.userId,
          token: result.token,
          isNewUser: result.isNewUser,
          phone,
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
  }, [dispatch, loading, navigation, otp, phone, showToast, verifyOtp]);

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
                ? ['#8B5CF6', '#7C3AED', '#4338CA']
                : ['#C4B5FD', '#A78BFA', '#A5B4FC']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButton}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
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
    paddingTop: 8,
    paddingBottom: 24,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: AUTH_COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.6,
    lineHeight: 32,
  },

  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: AUTH_COLORS.subText,
    textAlign: 'center',
    paddingHorizontal: 12,
  },

  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: AUTH_COLORS.primarySoft,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    gap: 12,
  },

  phoneText: {
    fontSize: 14,
    fontWeight: '600',
    color: AUTH_COLORS.textSecondary,
    letterSpacing: 0.3,
  },

  changeLink: {
    fontSize: 13,
    fontWeight: '700',
    color: AUTH_COLORS.primary,
  },

  card: {
    backgroundColor: AUTH_COLORS.white,
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: AUTH_COLORS.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
    alignItems: 'center',
  },

  timerRow: {
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: 20,
    marginBottom: 22,
    minHeight: 32,
    justifyContent: 'center',
  },

  timerPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: AUTH_COLORS.inputBg,
  },

  timerText: {
    fontSize: 13,
    fontWeight: '600',
    color: AUTH_COLORS.subText,
  },

  resendLink: {
    fontSize: 14,
    fontWeight: '700',
    color: AUTH_COLORS.primary,
  },

  ctaWrap: {
    borderRadius: 28,
    overflow: 'hidden',
    alignSelf: 'stretch',
    marginHorizontal: 6,
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

  hint: {
    marginTop: 20,
    fontSize: 12,
    lineHeight: 18,
    color: AUTH_COLORS.muted,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
