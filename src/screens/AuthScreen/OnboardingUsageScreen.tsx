import React, { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
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
import { setOnboardingUsage } from '../../store/slices/authSlice';

type Props = NativeStackScreenProps<AuthStackParamList, 'OnboardingUsage'>;

const USAGE_OPTIONS = [
  'Voice notes & memory spaces',
  'Task and project planning',
  'AI chat assistant',
  'Meeting summaries',
  'All of the above',
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

      <ProgressDots step={2} />

      <Text style={styles.title}>How will you use Buddy?</Text>
      <Text style={styles.subtitle}>
        Choose what you want to get done so we can tailor your home experience.
      </Text>

      <View style={styles.list}>
        {USAGE_OPTIONS.map(item => (
          <OptionChip
            key={item}
            label={item}
            selected={selected === item}
            onPress={() => setSelected(item)}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.primaryButton,
          selected && styles.primaryButtonReady,
          !selected && styles.buttonDisabled,
        ]}
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
