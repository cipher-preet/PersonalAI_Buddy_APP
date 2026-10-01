import 'react-native-gesture-handler';

import React, { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { enableFreeze, enableScreens } from 'react-native-screens';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { colors } from './src/theme';
import AppErrorBoundary from './src/components/AppErrorBoundary';
import CustomToast from './src/components/CustomToast';
import { onErrorReported, reportError } from './src/utils/crashHandler';
import RootNavigator from './src/navigation/RootNavigator';
import { ListeningProvider } from './src/store/context/ListeningContext';
import { ToastProvider, useToast, useToastState } from './src/store/context/ToastContext';
import { store } from './src/store/store';
import { configureGoogleSignIn } from './src/services/googleSignInService';
import { setupReminderNotifications } from './src/services/reminderNotificationService';

enableScreens(true);
enableFreeze(true);

const APP_BACKGROUND = colors.background;
const rootStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: APP_BACKGROUND,
  },
});

const AppContent = () => {
  const {
    toastVisible,
    toastMessage,
    toastDescription,
    toastType,
    toastDuration,
  } = useToastState();
  const { hideToast, showToast } = useToast();

  useEffect(() => {
    let lastShownAt = 0;
    return onErrorReported((_error, context) => {
      if (context.source !== 'global' || __DEV__) {
        return;
      }
      const now = Date.now();
      if (now - lastShownAt < 4000) {
        return;
      }
      lastShownAt = now;
      showToast({
        message: 'Something went wrong',
        description: 'Please try that again.',
        type: 'error',
      });
    });
  }, [showToast]);

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={APP_BACKGROUND}
        translucent={false}
      />
      <GestureHandlerRootView style={rootStyles.root}>
        <BottomSheetModalProvider>
          <RootNavigator />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
      <CustomToast
        visible={toastVisible}
        message={toastMessage}
        description={toastDescription}
        type={toastType}
        duration={toastDuration}
        onHide={hideToast}
      />
    </>
  );
};

const App = () => {
  useEffect(() => {
    try {
      configureGoogleSignIn();
    } catch (error) {
      reportError(error, { source: 'global' });
    }

    try {
      return setupReminderNotifications();
    } catch (error) {
      reportError(error, { source: 'global' });
      return undefined;
    }
  }, []);

  return (
    <AppErrorBoundary variant="app">
      <Provider store={store}>
        <SafeAreaProvider>
          <ToastProvider>
            <ListeningProvider>
              <AppContent />
            </ListeningProvider>
          </ToastProvider>
        </SafeAreaProvider>
      </Provider>
    </AppErrorBoundary>
  );
};

export default App;