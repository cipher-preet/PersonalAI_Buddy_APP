import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';

import AuthLayout from './components/AuthLayout';
import ProgressDots from './components/ProgressDots';
import OptionChip from './components/OptionChip';
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
import { setOnboardingProfession } from '../../store/slices/authSlice';

type Props = NativeStackScreenProps<AuthStackParamList, 'OnboardingProfession'>;

const PROFESSIONS = [
  'Student',
  'Working Professional',
  'Entrepreneur',
  'Freelancer',
  'Other',
];

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

const OnboardingProfessionScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const [selected, setSelected] = useState('');
  const [custom, setCustom] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleContinue = () => {
    const value = selected === 'Other' ? custom.trim() : selected;

    if (!value) {
      return;
    }

    dispatch(setOnboardingProfession(value));
    navigation.navigate('OnboardingUsage');
  };

  const canContinue =
    Boolean(selected) && (selected !== 'Other' || custom.trim().length > 0);

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
        <Pressable
          onPress={() => undefined}
          style={[styles.inputField, isFocused && styles.inputFieldFocused]}
        >
          <TextInput
            value={custom}
            onChangeText={setCustom}
            placeholder="Type your profession"
            placeholderTextColor={colors.muted}
            style={styles.input}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            underlineColorAndroid="transparent"
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />
        </Pressable>
      ) : null}

      <TouchableOpacity
        style={[
          styles.primaryButton,
          canContinue && styles.primaryButtonReady,
          !canContinue && styles.buttonDisabled,
        ]}
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
  layoutContent: {
    justifyContent: 'flex-start',
    paddingTop: mvs(8),
    paddingBottom: mvs(28),
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

  title: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.extrabold,
    color: colors.text,
    letterSpacing: -0.7,
    marginBottom: spacing.md,
  },

  subtitle: {
    fontSize: fontSize.base,
    lineHeight: ms(22),
    color: colors.subText,
    fontWeight: fontWeight.medium,
    marginBottom: spacing['3xl'],
  },

  list: {
    marginBottom: spacing.md,
  },

  inputField: {
    height: layout.inputHeight,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing['3xl'],
    justifyContent: 'center',
  },

  inputFieldFocused: {
    borderColor: colors.primary,
  },

  input: {
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
    marginTop: spacing.xl,
  },

  primaryButtonReady: {
    backgroundColor: colors.primary,
  },

  buttonDisabled: {
    opacity: 0.45,
  },

  primaryButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
});
