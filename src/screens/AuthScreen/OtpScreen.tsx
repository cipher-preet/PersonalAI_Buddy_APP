import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';

import AuthLayout from './components/AuthLayout';
import AuthBrandMark from './components/AuthBrandMark';
import OtpInputBoxes from './components/OtpInputBoxes';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  mvs,
  radii,
  spacing,
  layout
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

const BackIcon = () => (
  <Svg width={ms(20)} height={ms(20)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 6l-6 6 6 6"
      stroke={colors.text}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

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

  const maskedPhone = `+91 ${phone.slice(0, 2)}••••${phone.slice(-4)}`;
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
          name: result.name ?? username ?? 'Buddy User',
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
    <AuthLayout
      scrollable
      variant="white"
      contentStyle={styles.layoutContent}
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        activeOpacity={0.75}
        style={styles.backButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <BackIcon />
      </TouchableOpacity>

      <View style={styles.hero}>
        <AuthBrandMark size="md" />
        <Text style={styles.title}>Verification</Text>
        <Text style={styles.subtitle}>
          Enter the 4-digit code we sent to your mobile number.
        </Text>

        <View style={styles.phoneRow}>
          <Text style={styles.phoneText}>{maskedPhone}</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.changeLink}>Change</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.fieldLabel}>One-time password</Text>
      <OtpInputBoxes value={otp} onChange={setOtp} />

      <View style={styles.timerRow}>
        {timer > 0 ? (
          <Text style={styles.timerText}>
            Resend code in{' '}
            <Text style={styles.timerValue}>
              0:{timer.toString().padStart(2, '0')}
            </Text>
          </Text>
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
        style={[
          styles.primaryButton,
          isComplete && !loading && styles.primaryButtonReady,
          (!isComplete || loading) && styles.primaryButtonDisabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.primaryButtonText}>Verify & Continue</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.footer}>
        Didn't get the code? Check your SMS inbox or wait for the timer to
        finish, then resend.
      </Text>
    </AuthLayout>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  layoutContent: {
    justifyContent: 'flex-start',
    paddingTop: mvs(8),
  },

  backButton: {
    width: ms(40),
    height: ms(40),
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },

  hero: {
    alignItems: 'center',
    marginBottom: spacing['4xl'],
  },

  title: {
    marginTop: spacing['2xl'],
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.extrabold,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.7,
  },

  subtitle: {
    marginTop: spacing.md,
    fontSize: fontSize.base,
    lineHeight: ms(22),
    color: colors.subText,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    fontWeight: fontWeight.medium,
  },

  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.md,
  },

  phoneText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },

  changeLink: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },

  fieldLabel: {
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.subText,
  },

  timerRow: {
    alignItems: 'center',
    marginTop: spacing['3xl'],
    marginBottom: spacing['3xl'],
    minHeight: ms(24),
    justifyContent: 'center',
  },

  timerText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.subText,
  },

  timerValue: {
    fontWeight: fontWeight.bold,
    color: colors.text,
  },

  resendLink: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },

  primaryButton: {
    height: layout.buttonHeight,
    borderRadius: radii.lg,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonReady: {
    backgroundColor: colors.primary,
  },

  primaryButtonDisabled: {
    opacity: 0.45,
  },

  primaryButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },

  footer: {
    marginTop: spacing['5xl'],
    fontSize: fontSize.sm,
    lineHeight: ms(20),
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
});
