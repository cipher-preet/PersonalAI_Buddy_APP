import 'react-native-gesture-handler';

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import CustomToast from './src/components/CustomToast';
import RootNavigator from './src/navigation/RootNavigator';
import { ToastProvider, useToast } from './src/store/context/ToastContext';
import { store } from './src/store/store';
import { configureGoogleSignIn } from './src/services/googleSignInService';

const APP_BACKGROUND = '#F7F7FB';

const AppContent = () => {
  const { toastVisible, toastMessage, toastType, hideToast } = useToast();

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={APP_BACKGROUND}
        translucent={false}
      />
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: APP_BACKGROUND }}>
        <BottomSheetModalProvider>
          <RootNavigator />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
      <CustomToast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
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