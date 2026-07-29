import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AuthLayout from './components/AuthLayout';
import ProgressDots from './components/ProgressDots';
import OptionChip from './components/OptionChip';
import { AUTH_COLORS } from './styles/colors';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { useAppDispatch } from '../../store/hooks';
import { setOnboardingProfession } from '../../store/slices/authSlice';

type Props = NativeStackScreenProps<AuthStackParamList, 'OnboardingProfession'>;

const PROFESSIONS = [
  'Student',
  'Working Professional',
  'Entrepreneur',
  'Freelancer',
  'Other',
];

const OnboardingProfessionScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const [selected, setSelected] = useState('');
  const [custom, setCustom] = useState('');

  const handleContinue = () => {
    const value = selected === 'Other' ? custom.trim() : selected;

    if (!value) {
      return;
    }

    dispatch(setOnboardingProfession(value));
    navigation.navigate('OnboardingUsage');
  };

  const canContinue =
    selected && (selected !== 'Other' || custom.trim().length > 0);

  return (
    <AuthLayout>
      <ProgressDots step={1} />

      <Text style={styles.title}>What best describes you?</Text>
      <Text style={styles.subtitle}>
        Tell us about your profession so Buddy can personalize your experience.
      </Text>

      <View style={styles.list}>
        {PROFESSIONS.map(item => (
          <OptionChip
            key={item}
            label={item}
            selected={selected === item}
            onPress={() => setSelected(item)}
          />
        ))}
      </View>

      {selected === 'Other' ? (
        <TextInput
          value={custom}
          onChangeText={setCustom}
          placeholder="Type your profession"
          placeholderTextColor={AUTH_COLORS.muted}
          style={styles.input}
        />
      ) : null}

      <TouchableOpacity
        style={[styles.primaryButton, !canContinue && styles.buttonDisabled]}
        onPress={handleContinue}
        disabled={!canContinue}
        activeOpacity={0.9}
      >
        <Text style={styles.primaryButtonText}>Continue</Text>
      </TouchableOpacity>
    </AuthLayout>
  );
};

export default OnboardingProfessionScreen;

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

  list: {
    flex: 1,
  },

  input: {
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: AUTH_COLORS.white,
    borderWidth: 1,
    borderColor: AUTH_COLORS.border,
    fontSize: 15,
    color: AUTH_COLORS.text,
    marginBottom: 16,
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
