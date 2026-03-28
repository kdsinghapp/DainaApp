import messaging from '@react-native-firebase/messaging';
import { Platform, Alert } from 'react-native';
import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import notifee, { AndroidImportance } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationService {

  registerAppWithFCM = async (): Promise<void> => {
    try {
      if (Platform.OS === 'ios') {
        await messaging().registerDeviceForRemoteMessages();
        console.log('iOS: Registered for remote messages');
      }
    } catch (error) {
      console.log('registerAppWithFCM error:', error);
    }
  };

 requestPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        
        // ✅ String directly use karo — library version issue bypass
        const permission = 'android.permission.POST_NOTIFICATIONS' as any;
        
        const currentStatus = await check(permission);

        if (currentStatus === RESULTS.GRANTED) {
          console.log('Android: Permission already granted');
          return true;
        }

        if (currentStatus === RESULTS.BLOCKED) {
          Alert.alert(
            'Notification Permission Required',
            'Please enable notifications from App Settings.',
            [{ text: 'OK' }]
          );
          return false;
        }

        const result = await request(permission);
        console.log('Android 13+ permission result:', result);
        return result === RESULTS.GRANTED;

      } else {
        // Android 12 aur neeche — permission ki zaroorat nahi
        console.log('Android < 13: No permission needed');
        return true;
      }

    } else {
      // iOS
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      return enabled;
    }
  } catch (error) {
    console.log('requestPermission error:', error);
    return false;
  }
};

checkPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      // ✅ Same fix here
      const permission = 'android.permission.POST_NOTIFICATIONS' as any;
      const status = await check(permission);
      return status === RESULTS.GRANTED;
    }
    const authStatus = await messaging().hasPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  } catch (error) {
    console.log('checkPermission error:', error);
    return false;
  }
};
  

  getFcmToken = async (): Promise<string | null> => {
    try {
      const hasPermission = await this.checkPermission();
      if (!hasPermission) {
        console.log('getFcmToken: No notification permission');
        return null;
      }

      const cachedToken = await AsyncStorage.getItem('fcmToken');
      if (cachedToken) {
        console.log('Using cached FCM token:', cachedToken);
        return cachedToken;
      }

      let retries = 3;
      while (retries > 0) {
        try {
          const fcmToken = await messaging().getToken();
          if (fcmToken) {
            await AsyncStorage.setItem('fcmToken', fcmToken);
            console.log('New FCM Token:', fcmToken);
            return fcmToken;
          }
        } catch (err: any) {
            const fcmToken = await messaging().getToken();
          if (fcmToken) {
            await AsyncStorage.setItem('fcmToken', fcmToken);
            console.log('New FCM Token:', fcmToken);
            return fcmToken;
          }
          console.log(`FCM token fetch failed. Retries left: ${retries} | Error: ${err?.message}`);
          if (retries > 0) {
            await new Promise(res => setTimeout(res, 2000));
          }
        }
      }

      console.log('FCM token fetch failed after all retries');
      return null;

    } catch (error) {
      console.log('getFcmToken error:', error);
      return null;
    }
  };

  createChannel = async (): Promise<void> => {
    try {
      if (Platform.OS === 'android') {
        await notifee.createChannel({
          id: 'default',
          name: 'Default Channel',
          importance: AndroidImportance.HIGH,
        });
        console.log('Android notification channel created');
      }
    } catch (error) {
      console.log('createChannel error:', error);
    }
  };

  displayLocalNotification = async (remoteMessage: any): Promise<void> => {
    try {
      const { notification, data } = remoteMessage;

      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });

      await notifee.displayNotification({
        title: notification?.title || data?.title || 'Notification',
        body: notification?.body || data?.body || '',
        android: {
          channelId,
          importance: AndroidImportance.HIGH,
          pressAction: { id: 'default' },
        },
        ios: {
          sound: 'default',
        },
      });
    } catch (error) {
      console.log('displayLocalNotification error:', error);
    }
  };

  setupListeners = (): (() => void) => {
    // Foreground message handler
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('FCM foreground message received:', JSON.stringify(remoteMessage));
      await this.displayLocalNotification(remoteMessage);
    });

    // Token refresh handler
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(async token => {
      console.log('FCM token refreshed:', token);
      await AsyncStorage.setItem('fcmToken', token);
    });

    // App was in background and user tapped notification
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('App opened from background via notification:', remoteMessage.notification);
    });

    // App was in quit state and user tapped notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('App opened from quit state via notification:', remoteMessage.notification);
        }
      });

    return () => {
      unsubscribeForeground();
      unsubscribeTokenRefresh();
    };
  };

  onBackgroundMessage = async (remoteMessage: any): Promise<void> => {
    try {
      console.log('Background message received:', remoteMessage);
      if (!remoteMessage.notification && remoteMessage.data) {
        await notifee.displayNotification({
          title: remoteMessage.data.title || 'Notification',
          body: remoteMessage.data.body || '',
          android: {
            channelId: 'default',
            importance: AndroidImportance.HIGH,
            pressAction: { id: 'default' },
          },
        });
      }
    } catch (error) {
      console.log('onBackgroundMessage error:', error);
    }
  };
}

export default new NotificationService();