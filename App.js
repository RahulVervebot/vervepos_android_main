
import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import AppStack from './src/AppStack';
import AuthStack from './src/AuthStack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OneSignal from 'react-native-onesignal';
import {LogBox} from 'react-native';
LogBox.ignoreLogs(['EventEmitter.removeListener']);
const App = () => {
  const [profile, setProfile] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [userToken, setUserToken] = React.useState(null);

  OneSignal.promptForPushNotificationsWithUserResponse(response => {
    console.log("User accepted notifications:", response);
  });
  OneSignal.setNotificationWillShowInForegroundHandler(notificationReceivedEvent => {
    console.log("Notification received in foreground:", notificationReceivedEvent);
  
    let notification = notificationReceivedEvent.getNotification();
    notificationReceivedEvent.complete(notification); // 👈 This will show it
  });


  
  console.log('profile ============= ', profile);
  return profile !== null ? <AuthStack /> : <AppStack />;
};

export default App;