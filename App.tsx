import 'react-native-gesture-handler';

import React from 'react';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import CustomToast from './src/components/CustomToast';
import RootNavigator from './src/navigation/RootNavigator';
import { ToastProvider, useToast } from './src/store/context/ToastContext';
import { store } from './src/store/store';

const AppContent = () => {
  const { toastVisible, toastMessage, toastType, hideToast } = useToast();

  return (
    <>
      <GestureHandlerRootView
        style={{ flex: 1 }}
      >
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
  return (
    <Provider store={store}>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </Provider>
  );
};

export default App;