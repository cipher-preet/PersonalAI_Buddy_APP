import 'react-native-gesture-handler';

import React from 'react';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import RootNavigator from './src/navigation/RootNavigator';

const App = () => {
  return (
    <GestureHandlerRootView
      style={{ flex: 1 }}
    >
      <BottomSheetModalProvider>
        <RootNavigator />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

export default App;