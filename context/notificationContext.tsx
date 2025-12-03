import { registerForPushNotificationsAsync, setupNotificationListeners } from '@/utils/pushNotifications';
import { getUserSession } from '@/utils/session';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface NotificationContextType {
  expoPushToken: string | undefined;
  notification: Notifications.Notification | undefined;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Register for push notifications when user logs in
    const initializePushNotifications = async () => {
      const session = await getUserSession();
      if (session) {
        const token = await registerForPushNotificationsAsync();
        setExpoPushToken(token);
      }
    };

    initializePushNotifications();

    // Setup notification listeners
    const cleanup = setupNotificationListeners(
      // When notification is received in foreground
      (notification) => {
        console.log('Notification received:', notification);
        setNotification(notification);
        setRefreshKey(prev => prev + 1); // Trigger refresh of notification bell
      },
      // When notification is tapped
      (response) => {
        console.log('Notification tapped:', response);
        const data = response.notification.request.content.data;
        
        // Handle deep linking
        if (data?.deep_link) {
          try {
            router.push(data.deep_link as any);
          } catch (error) {
            console.error('Error navigating to deep link:', error);
            // Fallback to notifications screen
            router.push('/(tabs)/notifications' as any);
          }
        } else {
          // No deep link, just go to notifications screen
          router.push('/(tabs)/notifications' as any);
        }
      }
    );

    return cleanup;
  }, []);

  const refreshNotifications = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <NotificationContext.Provider value={{ expoPushToken, notification, refreshNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
