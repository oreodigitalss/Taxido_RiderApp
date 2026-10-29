/**
 * @format
 */

import {AppRegistry, LogBox} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';

try {
    messaging().setBackgroundMessageHandler(async () => {});
} catch (error) {
    console.warn('Firebase messaging background handler was not registered.', error);
}

LogBox.ignoreAllLogs();
AppRegistry.registerComponent(appName, () => App);
