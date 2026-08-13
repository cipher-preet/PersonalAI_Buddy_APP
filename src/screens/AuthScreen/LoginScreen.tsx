import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';

import AuthLayout from './components/AuthLayout';
import AuthBrandMark from './components/AuthBrandMark';
import GoogleSignInButton from './components/GoogleSignInButton';
import {
  colors,
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
  useCheckPhoneMutation,
  useGoogleLoginMutation,
  useSendOtpMutation,
} from '../../store/api/auth';
import { signInWithGoogle } from '../../services/googleSignInService';
import { useToast } from '../../store/context/ToastContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const PhoneIcon = ({ color = colors.primary }: { color?: string }) => (
  <Svg width={ms(18)} height={ms(18)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7.5 3.75h9A1.75 1.75 0 0 1 18.25 5.5v13a1.75 1.75 0 0 1-1.75 1.75h-9A1.75 1.75 0 0 1 5.75 18.5v-13A1.75 1.75 0 0 1 7.5 3.75Z"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
    <Path
      d="M10.5 17.25h3"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
    />
  </Svg>
);

const LoginScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const phoneInputRef = useRef<TextInput>(null);
  const [phone, setPhone] = useState('');
  const [focusedField, setFocusedField] = useState(false);
  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
  const [checkPhone, { isLoading: isCheckingPhone }] = useCheckPhoneMutation();
  const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
  const [isGoogleBusy, setIsGoogleBusy] = useState(false);

  const cleanedPhone = phone.replace(/\D/g, '');
  const isPhoneValid = cleanedPhone.length >= 10;
  const canContinue = isPhoneValid;
  const loading =
    isSendingOtp || isCheckingPhone || isGoogleLoading || isGoogleBusy;

  const getApiErrorMessage = (error: any, fallback: string) =>
    error?.data?.message || error?.message || fallback;

  const focusPhoneInput = () => {
    phoneInputRef.current?.focus();
  };

  const handleContinue = async () => {
    if (!isPhoneValid) {
      showToast({ message: 'Enter a valid mobile number', type: 'error' });
      focusPhoneInput();
      return;
    }

    try {
      const phoneStatus = await checkPhone({ phone: cleanedPhone }).unwrap();

      if (!phoneStatus.exists) {
        navigation.navigate('Username', { phone: cleanedPhone });
        return;
      }

      await sendOtp({ phone: cleanedPhone }).unwrap();
      showToast({ message: 'OTP sent to your number', type: 'success' });
      navigation.navigate('Otp', { phone: cleanedPhone });
    } catch (error: any) {
      showToast({
        message: getApiErrorMessage(
          error,
          'Unable to continue. Please try again.',
        ),
        type: 'error',
      });
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleBusy(true);

    try {
      const googleData = await signInWithGoogle();
      const response = await googleLogin({
        idToken: googleData.idToken,
      }).unwrap();
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
    <AuthLayout
      scrollable
      variant="white"
      contentStyle={styles.layoutContent}
    >
      <View style={styles.hero}>
        <AuthBrandMark size="md" />
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>
          Enter your mobile number to sign in to Buddy and continue where you
          left off.
        </Text>
      </View>

      <Text style={styles.fieldLabel}>Mobile number</Text>
      <Pressable
        onPress={focusPhoneInput}
        style={[styles.inputField, focusedField && styles.inputFieldFocused]}
      >
        <View style={styles.iconChip} pointerEvents="none">
          <PhoneIcon />
        </View>
        <Text style={styles.countryCode} pointerEvents="none">
          +91
        </Text>
        <View style={styles.inputDivider} pointerEvents="none" />
        <TextInput
          ref={phoneInputRef}
          value={phone}
          onChangeText={text => setPhone(text.replace(/[^\d]/g, ''))}
          placeholder="10-digit mobile number"
          placeholderTextColor={colors.muted}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          maxLength={10}
          returnKeyType="done"
          editable={!loading}
          style={styles.input}
          onFocus={() => setFocusedField(true)}
          onBlur={() => setFocusedField(false)}
          onSubmitEditing={handleContinue}
          underlineColorAndroid="transparent"
        />
      </Pressable>

      <TouchableOpacity
        onPress={handleContinue}
        disabled={loading}
        activeOpacity={0.9}
        style={[
          styles.primaryButton,
          canContinue && !loading && styles.primaryButtonReady,
          (!canContinue || loading) && styles.primaryButtonDisabled,
        ]}
      >
        {isSendingOtp || isCheckingPhone ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.primaryButtonText}>Continue</Text>
        )}
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <GoogleSignInButton
        onPress={handleGoogleLogin}
        loading={isGoogleBusy}
        disabled={loading}
      />

      <Text style={styles.footer}>
        By clicking Continue, I have read and agree with the{' '}
        <Text style={styles.footerLink}>Term Sheet</Text>,{' '}
        <Text style={styles.footerLink}>Privacy Policy</Text>.
      </Text>
    </AuthLayout>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  layoutContent: {
    justifyContent: 'flex-start',
    paddingTop: mvs(36),
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

  fieldLabel: {
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },

  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    height: layout.inputHeight,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing['3xl'],
  },

  inputFieldFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },

  iconChip: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(10),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },

  countryCode: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginRight: spacing.sm,
  },

  inputDivider: {
    width: StyleSheet.hairlineWidth,
    height: ms(20),
    backgroundColor: colors.border,
    marginRight: spacing.md,
  },

  input: {
    flex: 1,
    height: '100%',
    paddingVertical: Platform.OS === 'ios' ? spacing.md : 0,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.text,
    includeFontPadding: false,
  },

  primaryButton: {
    height: layout.buttonHeight,
    borderRadius: radii.lg,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['3xl'],
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

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing['3xl'],
    gap: spacing.md,
  },

  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },

  dividerText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.subText,
  },

  footer: {
    marginTop: spacing['5xl'],
    fontSize: fontSize.sm,
    lineHeight: ms(20),
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },

  footerLink: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    textDecorationLine: 'underline',
  },
});
