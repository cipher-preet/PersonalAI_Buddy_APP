import React, { useState } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  View,
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

const OnboardingSourceScreen = ({ navigation }: Props) => {
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
    showToast({ message: 'Welcome to Buddy!', type: 'success' });
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

      <ProgressDots step={3} />

      <Text style={styles.title}>Where did you hear about Buddy?</Text>
      <Text style={styles.subtitle}>
        This helps us understand how people discover the app.
      </Text>

      <View style={styles.list}>
        {SOURCE_OPTIONS.map(item => (
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
          selected && !isLoading && styles.primaryButtonReady,
          (!selected || isLoading) && styles.buttonDisabled,
        ]}
        onPress={handleFinish}
        disabled={!selected || isLoading}
        activeOpacity={0.9}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.primaryButtonText}>Get Started</Text>
        )}
      </TouchableOpacity>
    </AuthLayout>
  );
};

export default OnboardingSourceScreen;

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
