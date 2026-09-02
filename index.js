/**
 * @format
 */
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';
import { displayReminderFromRemoteMessage } from './src/services/reminderNotificationService';

try {
  setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
    await displayReminderFromRemoteMessage(remoteMessage);
  });
} catch (error) {
  console.warn('Failed to register FCM background handler', error);
}

AppRegistry.registerComponent(appName, () => App);
