import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import MainTabs from './MainTabs';
import AuthStack from './AuthStack';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useCheckAuthQuery } from '../store/api/auth';
import { checkAuthSuccess, logout } from '../store/slices/authSlice';

const RootNavigator = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const hasCompletedOnboarding = useAppSelector(
    state => state.auth.hasCompletedOnboarding,
  );
  const { data, isFetching, isError } = useCheckAuthQuery();

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
        }),
      );
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (isError && !isAuthenticated) {
      dispatch(logout());
    }
  }, [dispatch, isAuthenticated, isError]);

  const showMainApp = isAuthenticated && hasCompletedOnboarding;

  return (
    <NavigationContainer>
      {isFetching && !isAuthenticated ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F7F7FB',
          }}
        >
          <ActivityIndicator color="#7C3AED" />
        </View>
      ) : showMainApp ? (
        <MainTabs />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;
