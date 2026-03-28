import React, { FunctionComponent, useEffect, useRef } from 'react';
import { LogBox, Text, } from 'react-native';
import 'react-native-gesture-handler';
import AppNavigator from './src/navigators/AppNavigator';
import { TextInput } from 'react-native';
import 'react-native-reanimated';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/services/queryClient';
import NotificationService from './src/services/NotificationService';

LogBox.ignoreAllLogs();
(Text as any).defaultProps = (Text as any).defaultProps || {};



(Text as any).defaultProps.allowFontScaling = false;

(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};

(TextInput as any).defaultProps.allowFontScaling = false;

(TextInput as any).defaultProps.underlineColorAndroid = "transparent";


const App: FunctionComponent<any> = () => {
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    initNotifications();

    return () => {
      // Cleanup listeners on unmount
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const initNotifications = async () => {
    try {
      // Step 1: iOS ke liye register
      await NotificationService.registerAppWithFCM();

      // Step 2: Permission maango
      const granted = await NotificationService.requestPermission();
      if (!granted) {
        console.log('Notification permission denied — stopping init');
        return;
      }

      // Step 3: Android notification channel banao
      await NotificationService.createChannel();

      // Step 4: FCM token lo
      await NotificationService.getFcmToken();

      // Step 5: Foreground listeners setup karo
      const unsubscribe = NotificationService.setupListeners();
      unsubscribeRef.current = unsubscribe;

      console.log('Notifications initialized successfully');
    } catch (error) {
      console.log('Notification init error:', error);
    }
  };


  return (
    <QueryClientProvider client={queryClient}>
      <AppNavigator />
    </QueryClientProvider>
  )
}



export default App;


