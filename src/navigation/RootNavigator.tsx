import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
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
import { baseApi, chatApi } from '../store/api';
import { hydrateAuthSession, store } from '../store/store';
import { useToast } from '../store/context/ToastContext';
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
import { renderScreenWithBoundary } from '../components/AppErrorBoundary';
import { setActiveCallSyncUser } from '../services/callSyncService';

const AppStack = createNativeStackNavigator<AppStackParamList>();

const AuthenticatedApp = () => (
  <AppStack.Navigator
    screenOptions={{ headerShown: false }}
    screenLayout={renderScreenWithBoundary}
  >
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

const getErrorStatus = (error: unknown) =>
  error && typeof error === 'object' && 'status' in error
    ? (error as { status: unknown }).status
    : undefined;

const RootNavigator = () => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const authToken = useAppSelector(state => state.auth.token);
  const userId = useAppSelector(state => state.auth.userId);
  const hasCompletedOnboarding = useAppSelector(
    state => state.auth.hasCompletedOnboarding,
  );
  const [isHydrated, setIsHydrated] = useState(false);
  const {
    data,
    error: authError,
    isError,
    refetch,
  } = useCheckAuthQuery(undefined, {
    skip: !isHydrated,
  });
  const [registerDeviceToken] = useRegisterDeviceTokenMutation();
  const showMainApp = isAuthenticated && hasCompletedOnboarding;
  const wasAuthenticatedRef = useRef(isAuthenticated);

  useEffect(() => {
    void setActiveCallSyncUser(isAuthenticated ? userId : null).catch(
      () => undefined,
    );
  }, [isAuthenticated, userId]);

  // Reading the saved session is a local file read (a few ms), so the app opens
  // straight into the right screen; the server check below runs in background.
  useEffect(() => {
    let mounted = true;
    hydrateAuthSession()
      .catch(() => false)
      .finally(() => {
        if (mounted) {
          setIsHydrated(true);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSessionExpired = useCallback(() => {
    if (!store.getState().auth.isAuthenticated) {
      return;
    }
    dispatch(logout());
    showToast({
      message: 'Session expired',
      description: 'Please sign in again to continue.',
      type: 'info',
    });
  }, [dispatch, showToast]);

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
    } else if (data && !data.authenticated) {
      handleSessionExpired();
    }
  }, [data, dispatch, handleSessionExpired]);

  // Only a definitive rejection signs the user out. Network failures, timeouts
  // and server errors keep the saved session and re-check on next foreground.
  useEffect(() => {
    if (!isError) {
      return;
    }
    const status = getErrorStatus(authError);
    if (status === 401 || status === 403) {
      handleSessionExpired();
    }
  }, [authError, handleSessionExpired, isError]);

  useEffect(() => {
    if (!isError || !isAuthenticated) {
      return;
    }
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        refetch();
      }
    });
    return () => subscription.remove();
  }, [isAuthenticated, isError, refetch]);

  // Drop cached API data on sign-out so the next account never sees it.
  useEffect(() => {
    if (wasAuthenticatedRef.current && !isAuthenticated) {
      dispatch(baseApi.util.resetApiState());
      dispatch(chatApi.util.resetApiState());
    }
    wasAuthenticatedRef.current = isAuthenticated;
  }, [dispatch, isAuthenticated]);

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
      {!isHydrated ? (
        <View style={styles.blank} />
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
  blank: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
