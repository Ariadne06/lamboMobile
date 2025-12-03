import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead, Notification } from '@/utils/notificationService';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications(50);
      // Handle both 'data' and 'notifications' response formats
      const notifList = response.data || response.notifications || [];
      setNotifications(notifList);
      setUnreadCount(response.unread_count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Set empty array on error to prevent undefined
      setNotifications([]);
      setUnreadCount(0);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      try {
        await markNotificationAsRead(notification.notification_id);
        // Update local state
        setNotifications(prev =>
          prev.map(n =>
            n.notification_id === notification.notification_id
              ? { ...n, is_read: true }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate to notification detail screen
    router.push({
      pathname: '/(tabs)/notification-detail',
      params: {
        notification: JSON.stringify(notification)
      }
    } as any);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const formatTime = (dateString: string) => {
    // Parse the UTC date from backend and convert to Manila timezone
    const date = new Date(dateString + 'Z'); // Add 'Z' to ensure it's treated as UTC
    const now = new Date();
    
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    // Format date in Manila timezone
    return date.toLocaleDateString('en-PH', { 
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={item.is_read ? 'notifications-outline' : 'notifications'}
            size={24}
            color={item.is_read ? '#6b7280' : '#FF3D33'}
          />
          {!item.is_read && <View style={styles.unreadDot} />}
        </View>
        
        <View style={styles.textContainer}>
          <ThemedText style={[styles.title, !item.is_read && styles.unreadTitle]}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.body} numberOfLines={2}>
            {item.body}
          </ThemedText>
          <ThemedText style={styles.time}>{formatTime(item.created_at)}</ThemedText>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={64} color="#d1d5db" />
      <ThemedText style={styles.emptyText}>No notifications yet</ThemedText>
      <ThemedText style={styles.emptySubtext}>
        You'll see updates about your requests and account here
      </ThemedText>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Notifications" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3D33" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader title="Notifications" />
      
      {unreadCount > 0 && (
        <View style={styles.markAllContainer}>
          <ThemedText style={styles.unreadCountText}>
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </ThemedText>
          <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
            <ThemedText style={styles.markAllText}>Mark all as read</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={notifications || []}
        renderItem={renderNotification}
        keyExtractor={(item) => item.notification_id.toString()}
        contentContainerStyle={[
          styles.listContainer,
          (!notifications || notifications.length === 0) && styles.emptyListContainer,
        ]}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF3D33']}
            tintColor="#FF3D33"
          />
        }
      />
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
  markAllContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  unreadCountText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: {
    fontSize: 14,
    color: '#FF3D33',
    fontWeight: '600',
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  notificationCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  unreadCard: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
    paddingTop: 2,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3D33',
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  unreadTitle: {
    color: '#111827',
    fontWeight: '700',
  },
  body: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    color: '#9ca3af',
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
