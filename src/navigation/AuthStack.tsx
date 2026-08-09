import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/AuthScreen/LoginScreen';
import OtpScreen from '../screens/AuthScreen/OtpScreen';
import UsernameScreen from '../screens/AuthScreen/UsernameScreen';
import OnboardingProfessionScreen from '../screens/AuthScreen/OnboardingProfessionScreen';
import OnboardingUsageScreen from '../screens/AuthScreen/OnboardingUsageScreen';
import OnboardingSourceScreen from '../screens/AuthScreen/OnboardingSourceScreen';
import { useAppSelector } from '../store/hooks';

export type AuthStackParamList = {
  Login: undefined;
  Username: { phone: string };
  Otp: { phone: string; username?: string };
  OnboardingProfession: undefined;
  OnboardingUsage: undefined;
  OnboardingSource: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack = () => {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const hasCompletedOnboarding = useAppSelector(
    state => state.auth.hasCompletedOnboarding,
  );

  const initialRouteName =
    isAuthenticated && !hasCompletedOnboarding
      ? 'OnboardingProfession'
      : 'Login';

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Username" component={UsernameScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Screen
        name="OnboardingProfession"
        component={OnboardingProfessionScreen}
      />
      <Stack.Screen name="OnboardingUsage" component={OnboardingUsageScreen} />
      <Stack.Screen name="OnboardingSource" component={OnboardingSourceScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
