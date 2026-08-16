import 'react-native-gesture-handler';

import React, { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { enableFreeze, enableScreens } from 'react-native-screens';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { colors } from './src/theme';
import CustomToast from './src/components/CustomToast';
import RootNavigator from './src/navigation/RootNavigator';
import { ToastProvider, useToast } from './src/store/context/ToastContext';
import { store } from './src/store/store';
import { configureGoogleSignIn } from './src/services/googleSignInService';

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
    hideToast,
  } = useToast();

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
    configureGoogleSignIn();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;