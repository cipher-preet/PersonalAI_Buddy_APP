import React, { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
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
import { useAppDispatch } from '../../store/hooks';
import { setOnboardingUsage } from '../../store/slices/authSlice';

type Props = NativeStackScreenProps<AuthStackParamList, 'OnboardingUsage'>;

const USAGE_OPTIONS = [
  'Voice notes & memory spaces',
  'Task and project planning',
  'AI chat assistant',
  'Meeting summaries',
  'All of the above',
];

const OnboardingUsageScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const [selected, setSelected] = useState('');

  const handleContinue = () => {
    if (!selected) {
      return;
    }

    dispatch(setOnboardingUsage(selected));
    navigation.navigate('OnboardingSource');
  };

  return (
    <AuthLayout>
      <ProgressDots step={2} />

      <Text style={styles.title}>How will you use MyBuddy?</Text>
      <Text style={styles.subtitle}>
        Choose what you want to get done so we can tailor your home experience.
      </Text>

      {USAGE_OPTIONS.map(item => (
        <OptionChip
          key={item}
          label={item}
          selected={selected === item}
          onPress={() => setSelected(item)}
        />
      ))}

      <TouchableOpacity
        style={[styles.primaryButton, !selected && styles.buttonDisabled]}
        onPress={handleContinue}
        disabled={!selected}
        activeOpacity={0.9}
      >
        <Text style={styles.primaryButtonText}>Continue</Text>
      </TouchableOpacity>
    </AuthLayout>
  );
};

export default OnboardingUsageScreen;

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
