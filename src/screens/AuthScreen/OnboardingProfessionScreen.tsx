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
import {
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../theme';
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

  list: {
    flex: 1,
  },

  input: {
    height: ms(52),
    borderRadius: ms(14),
    paddingHorizontal: spacing['2xl'],
    backgroundColor: AUTH_COLORS.white,
    borderWidth: 1,
    borderColor: AUTH_COLORS.border,
    fontSize: fontSize.lg,
    color: AUTH_COLORS.text,
    marginBottom: spacing['2xl'],
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
