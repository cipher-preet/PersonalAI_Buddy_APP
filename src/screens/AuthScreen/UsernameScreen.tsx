import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Circle, Path } from 'react-native-svg';

import AuthLayout from './components/AuthLayout';
import AuthBrandMark from './components/AuthBrandMark';
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
import { useSendOtpMutation } from '../../store/api/auth';
import { useToast } from '../../store/context/ToastContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Username'>;

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

const UserIcon = ({ color = colors.primary }: { color?: string }) => (
  <Svg width={ms(18)} height={ms(18)} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="3.25" stroke={color} strokeWidth={1.7} />
    <Path
      d="M5.75 18.25c1.4-2.55 3.55-3.85 6.25-3.85s4.85 1.3 6.25 3.85"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
    />
  </Svg>
);

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

  const focusUsernameInput = () => {
    usernameInputRef.current?.focus();
  };

  const handleContinue = async () => {
    if (!isUsernameValid) {
      showToast({ message: 'Enter your username', type: 'error' });
      focusUsernameInput();
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
        message: getApiErrorMessage(
          error,
          'Unable to send OTP. Please try again.',
        ),
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
        <Text style={styles.title}>Your name</Text>
        <Text style={styles.subtitle}>
          Add your name so Buddy can personalize your experience.
        </Text>
      </View>

      <Text style={styles.fieldLabel}>Full name</Text>
      <Pressable
        onPress={focusUsernameInput}
        style={[styles.inputField, isFocused && styles.inputFieldFocused]}
      >
        <View style={styles.iconChip} pointerEvents="none">
          <UserIcon />
        </View>
        <TextInput
          ref={usernameInputRef}
          value={username}
          onChangeText={setUsername}
          placeholder="What should we call you?"
          placeholderTextColor={colors.muted}
          autoCapitalize="words"
          autoCorrect={false}
          textContentType="name"
          autoComplete="name"
          returnKeyType="done"
          editable={!isLoading}
          style={styles.input}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSubmitEditing={handleContinue}
          underlineColorAndroid="transparent"
        />
      </Pressable>

      <TouchableOpacity
        onPress={handleContinue}
        disabled={!isUsernameValid || isLoading}
        activeOpacity={0.9}
        style={[
          styles.primaryButton,
          isUsernameValid && !isLoading && styles.primaryButtonReady,
          (!isUsernameValid || isLoading) && styles.primaryButtonDisabled,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.primaryButtonText}>Continue</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.footer}>
        You can update your name later from your profile settings.
      </Text>
    </AuthLayout>
  );
};

export default UsernameScreen;

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

  fieldLabel: {
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.subText,
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
