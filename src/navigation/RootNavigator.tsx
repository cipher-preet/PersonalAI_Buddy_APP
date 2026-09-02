import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainTabs from './MainTabs';
import AuthStack from './AuthStack';
import { navigationRef } from './navigationRef';
import type { AppStackParamList } from './types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useCheckAuthQuery } from '../store/api/auth';
import { useRegisterDeviceTokenMutation } from '../store/api/home';
import { checkAuthSuccess, logout } from '../store/slices/authSlice';
import {
  getDevicePlatform,
  getFcmToken,
  subscribeToFcmTokenRefresh,
} from '../services/fcmTokenService';
import {
  consumePendingReminderAlert,
  setupReminderAlertNavigation,
} from '../services/reminderAlertService';
import ReminderCallScreen from '../screens/ReminderAlerts/ReminderCallScreen';
import ReminderAlarmScreen from '../screens/ReminderAlerts/ReminderAlarmScreen';
import { colors } from '../theme';

const AppStack = createNativeStackNavigator<AppStackParamList>();

const AuthenticatedApp = () => (
  <AppStack.Navigator screenOptions={{ headerShown: false }}>
    <AppStack.Screen name="Main" component={MainTabs} />
    <AppStack.Screen
      name="ReminderCall"
      component={ReminderCallScreen}
      options={{
        presentation: 'fullScreenModal',
        animation: 'fade',
        gestureEnabled: false,
      }}
    />
    <AppStack.Screen
      name="ReminderAlarm"
      component={ReminderAlarmScreen}
      options={{
        presentation: 'fullScreenModal',
        animation: 'fade',
        gestureEnabled: false,
      }}
    />
  </AppStack.Navigator>
);

const RootNavigator = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const authToken = useAppSelector(state => state.auth.token);
  const hasCompletedOnboarding = useAppSelector(
    state => state.auth.hasCompletedOnboarding,
  );
  const { data, isFetching, isError } = useCheckAuthQuery();
  const [registerDeviceToken] = useRegisterDeviceTokenMutation();
  const showMainApp = isAuthenticated && hasCompletedOnboarding;

  useEffect(() => {
    if (data?.authenticated) {
      dispatch(
        checkAuthSuccess({
          userId: data.userId,
          isNewUser: data.isNewUser,
          hasCompletedOnboarding: data.hasCompletedOnboarding,
          phone: data.phone,
          email: data.email,
          name: data.name,
          avatar: data.avatar,
        }),
      );
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (isError && !isAuthenticated) {
      dispatch(logout());
    }
  }, [dispatch, isAuthenticated, isError]);

  useEffect(() => {
    if (!isAuthenticated || !authToken) {
      return;
    }

    let cancelled = false;

    const syncDeviceToken = async (nextToken?: string) => {
      const token = nextToken ?? (await getFcmToken());
      if (!token || cancelled) {
        return;
      }

      try {
        await registerDeviceToken({
          token,
          platform: getDevicePlatform(),
        }).unwrap();
      } catch (error) {
        console.warn('Failed to register device token', error);
      }
    };

    void syncDeviceToken();
    const unsubscribe = subscribeToFcmTokenRefresh(token => {
      void syncDeviceToken(token);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [authToken, isAuthenticated, registerDeviceToken]);

  useEffect(() => {
    if (!showMainApp) {
      return;
    }
    return setupReminderAlertNavigation();
  }, [showMainApp]);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        if (showMainApp) {
          void consumePendingReminderAlert();
        }
      }}
    >
      {isFetching && !isAuthenticated ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : showMainApp ? (
        <AuthenticatedApp />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
