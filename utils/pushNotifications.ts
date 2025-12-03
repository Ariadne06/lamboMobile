import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { registerPushToken } from './notificationService';
import { getUserSession } from './session';

// Configure how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Register device for push notifications and send token to backend
 * @returns Promise<string | undefined> - The Expo push token or undefined if registration failed
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token: string | undefined;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    
    if (!projectId) {
      console.error('Project ID not found');
      return;
    }

    try {
      // Try to get Expo push token - Firebase may cause warnings but we can still get Expo token
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('✅ Expo Push Token:', token);
    } catch (e: any) {
      // Handle Firebase/FCM errors gracefully
      if (e.message && e.message.includes('Firebase')) {
        console.warn('⚠️ Firebase not configured. Push notifications will use Expo servers only.');
        console.warn('To enable full push notifications, configure Firebase Cloud Messaging (FCM).');
        // Try to proceed without Firebase - Expo push may still work
        try {
          token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
          console.log('✅ Expo Push Token (without Firebase):', token);
        } catch (retryError) {
          console.error('❌ Could not get Expo token even without Firebase:', retryError);
          return undefined;
        }
      } else {
        console.error('❌ Error getting push token:', e);
        return undefined;
      }
    }

    // Register token with backend if we got one
    if (token) {
      try {
        // Get user session to determine user type
        const session = await getUserSession();
        if (session) {
          // Register token with backend
          const platform = Platform.OS === 'ios' ? 'ios' : 'android';
          
          if (session.account_type === 'resident') {
            await registerPushToken({
              user_type: 'RESIDENT',
              resident_id: session.user_id,
              expo_push_token: token,
              platform: platform,
            });
          } else if (session.account_type === 'personnel') {
            await registerPushToken({
              user_type: 'PERSONNEL',
              personnel_id: session.user_id,
              expo_push_token: token,
              platform: platform,
            });
          }
          
          console.log('✅ Push token registered with backend');
        }
      } catch (registerError) {
        console.error('❌ Error registering token with backend:', registerError);
      }
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

/**
 * Set up notification listeners
 * @param onNotificationReceived - Callback when notification is received (app in foreground)
 * @param onNotificationTapped - Callback when notification is tapped (opens app)
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationTapped?: (response: Notifications.NotificationResponse) => void
) {
  // Listener for when notification is received while app is in foreground
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received in foreground:', notification);
    if (onNotificationReceived) {
      onNotificationReceived(notification);
    }
  });

  // Listener for when user taps on a notification
  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification tapped:', response);
    if (onNotificationTapped) {
      onNotificationTapped(response);
    }
  });

  // Return cleanup function
  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}

/**
 * Get badge count (unread notifications)
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear all notifications from notification tray
 */
export async function clearAllNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
}
