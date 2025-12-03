import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { markNotificationAsRead, Notification } from '@/utils/notificationService';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

export default function NotificationDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.notification) {
      try {
        const notif = JSON.parse(params.notification as string) as Notification;
        setNotification(notif);
        
        // Mark as read if unread
        if (!notif.is_read) {
          markNotificationAsRead(notif.notification_id).catch(error => {
            console.error('Error marking notification as read:', error);
          });
        }
      } catch (error) {
        console.error('Error parsing notification:', error);
        Alert.alert('Error', 'Failed to load notification details');
      } finally {
        setLoading(false);
      }
    }
  }, [params.notification]);

  const handleDeepLinkPress = () => {
    if (notification?.deep_link) {
      try {
        // Check if it's an internal route or external URL
        if (notification.deep_link.startsWith('http://') || notification.deep_link.startsWith('https://')) {
          // External URL - open in browser
          Linking.openURL(notification.deep_link);
        } else {
          // Internal route - navigate within app
          const deepLink = notification.deep_link.startsWith('/') 
            ? notification.deep_link 
            : `/${notification.deep_link}`;
          router.push(deepLink as any);
        }
      } catch (error) {
        console.error('Error handling deep link:', error);
        Alert.alert('Error', 'Failed to open link');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'Z');
    return date.toLocaleString('en-PH', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Notification" showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3D33" />
        </View>
      </View>
    );
  }

  if (!notification) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Notification" showBackButton />
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#d1d5db" />
          <ThemedText style={styles.emptyText}>Notification not found</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader title="Notification" showBackButton />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Main Card */}
        <View style={styles.card}>
          {/* Icon and Title */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="notifications" size={28} color="#FF3D33" />
            </View>
            <ThemedText style={styles.title}>{notification.title}</ThemedText>
            <View style={styles.dateContainer}>
              <Ionicons name="time-outline" size={14} color="#6b7280" />
              <ThemedText style={styles.date}>{formatDate(notification.created_at)}</ThemedText>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Body */}
          <View style={styles.bodyContainer}>
            <ThemedText style={styles.bodyLabel}>Message</ThemedText>
            <ThemedText style={styles.body}>{notification.body}</ThemedText>
          </View>

          {/* Deep Link Section - Only show if deep_link exists */}
          {notification.deep_link && (
            <>
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.linkSection}
                onPress={handleDeepLinkPress}
                activeOpacity={0.7}
              >
                <View style={styles.linkContent}>
                  <View style={styles.linkIconContainer}>
                    <Ionicons 
                      name={notification.deep_link.startsWith('http') ? 'globe-outline' : 'navigate-outline'} 
                      size={20} 
                      color="#FF3D33" 
                    />
                  </View>
                  <View style={styles.linkTextContainer}>
                    <ThemedText style={styles.linkLabel}>
                      {notification.deep_link.startsWith('http') ? 'External Link' : 'Quick Action'}
                    </ThemedText>
                    <ThemedText style={styles.linkText} numberOfLines={1}>
                      {notification.deep_link.startsWith('http') ? 'Open in browser' : 'Go to page'}
                    </ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, notification.is_read ? styles.readBadge : styles.unreadBadge]}>
            <Ionicons 
              name={notification.is_read ? 'checkmark-circle' : 'ellipse'} 
              size={16} 
              color={notification.is_read ? '#10b981' : '#FF3D33'} 
            />
            <ThemedText style={[styles.statusText, notification.is_read ? styles.readText : styles.unreadText]}>
              {notification.is_read ? 'Read' : 'Unread'}
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  bodyContainer: {
  },
  bodyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  linkSection: {
    marginTop: 4,
  },
  linkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  linkIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  linkTextContainer: {
    flex: 1,
  },
  linkLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  linkText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  readBadge: {
    backgroundColor: '#d1fae5',
  },
  unreadBadge: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  readText: {
    color: '#10b981',
  },
  unreadText: {
    color: '#FF3D33',
  },
});
