import React, { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AuthLayout from './components/AuthLayout';
import ProgressDots from './components/ProgressDots';
import OptionChip from './components/OptionChip';
import { AUTH_COLORS } from './styles/colors';
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
    fontSize: 24,
    fontWeight: '800',
    color: AUTH_COLORS.text,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: AUTH_COLORS.subText,
    marginBottom: 22,
  },

  primaryButton: {
    height: 54,
    borderRadius: 16,
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
    fontSize: 15,
    fontWeight: '700',
  },
});
