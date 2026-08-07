import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import MainTabs from './MainTabs';
import AuthStack from './AuthStack';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useCheckAuthQuery } from '../store/api/auth';
import { checkAuthSuccess, logout } from '../store/slices/authSlice';
import { colors } from '../theme';

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

  const showMainApp = isAuthenticated && hasCompletedOnboarding;

  return (
    <NavigationContainer>
      {isFetching && !isAuthenticated ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} />
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

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
