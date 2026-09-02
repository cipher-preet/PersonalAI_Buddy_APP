import { createNavigationContainerRef } from '@react-navigation/native';

import type { AppStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<AppStackParamList>();

export const navigateToAlertScreen = <Name extends keyof AppStackParamList>(
  name: Name,
  params: AppStackParamList[Name],
) => {
  if (!navigationRef.isReady()) {
    return false;
  }

  navigationRef.navigate(name as never, params as never);
  return true;
};

export const dismissAlertScreen = (name: 'ReminderCall' | 'ReminderAlarm') => {
  if (!navigationRef.isReady()) {
    return;
  }

  const current = navigationRef.getCurrentRoute()?.name;
  if (current === name) {
    navigationRef.goBack();
  }
};
