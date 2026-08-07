import React, { useState } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AuthLayout from './components/AuthLayout';
import ProgressDots from './components/ProgressDots';
import OptionChip from './components/OptionChip';
import { AUTH_COLORS } from './styles/colors';
import {
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../theme';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  completeOnboarding,
  setOnboardingSource,
} from '../../store/slices/authSlice';
import { useCompleteOnboardingMutation } from '../../store/api/auth';
import { useToast } from '../../store/context/ToastContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'OnboardingSource'>;

const SOURCE_OPTIONS = [
  'Social media',
  'Friend or colleague',
  'App Store / Play Store',
  'Google search',
  'YouTube / Podcast',
  'Other',
];

const OnboardingSourceScreen = (_props: Props) => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { userId, onboarding } = useAppSelector(state => state.auth);
  const [selected, setSelected] = useState('');
  const [completeOnboardingApi, { isLoading }] = useCompleteOnboardingMutation();

  const handleFinish = async () => {
    if (!selected || !userId) {
      return;
    }

    dispatch(setOnboardingSource(selected));

    try {
      await completeOnboardingApi({
        userId,
        profession: onboarding.profession,
        usageGoal: onboarding.usageGoal,
        source: selected,
      }).unwrap();
    } catch {
      // Continue with local onboarding completion if API is unavailable.
    }

    dispatch(completeOnboarding());
    showToast({ message: 'Welcome to MyBuddy!', type: 'success' });
  };

  return (
    <AuthLayout>
      <ProgressDots step={3} />

      <Text style={styles.title}>Where did you hear about MyBuddy?</Text>
      <Text style={styles.subtitle}>
        This helps us understand how people discover the app.
      </Text>

      {SOURCE_OPTIONS.map(item => (
        <OptionChip
          key={item}
          label={item}
          selected={selected === item}
          onPress={() => setSelected(item)}
        />
      ))}

      <TouchableOpacity
        style={[styles.primaryButton, !selected && styles.buttonDisabled]}
        onPress={handleFinish}
        disabled={!selected || isLoading}
        activeOpacity={0.9}
      >
        {isLoading ? (
          <ActivityIndicator color={AUTH_COLORS.white} />
        ) : (
          <Text style={styles.primaryButtonText}>Get Started</Text>
        )}
      </TouchableOpacity>
    </AuthLayout>
  );
};

export default OnboardingSourceScreen;

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.extrabold,
    color: AUTH_COLORS.text,
    marginBottom: spacing.md,
  },

  subtitle: {
    fontSize: fontSize.base,
    lineHeight: ms(22),
    color: AUTH_COLORS.subText,
    marginBottom: ms(22),
  },

  primaryButton: {
    height: ms(54),
    borderRadius: radii.lg,
    backgroundColor: AUTH_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  primaryButtonText: {
    color: AUTH_COLORS.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
});
