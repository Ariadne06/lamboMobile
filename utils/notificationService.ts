import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';
import { getUserSession } from './session';

export interface PushTokenRequest {
  user_type: 'RESIDENT' | 'PERSONNEL';
  resident_id?: number;
  personnel_id?: number;
  expo_push_token: string;
  platform: 'ios' | 'android';
}

export interface Notification {
  notification_id: number;
  user_type: string;
  resident_id?: number;
  personnel_id?: number;
  title: string;
  body: string;
  deep_link?: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  success: boolean;
  data?: Notification[];  // Backend returns 'data'
  notifications?: Notification[];  // Fallback for compatibility
  unread_count: number;
}

/**
 * Register push token with backend
 */
export async function registerPushToken(data: PushTokenRequest): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REGISTER_PUSH_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to register push token');
    }

    return result;
  } catch (error) {
    console.error('Error registering push token:', error);
    throw error;
  }
}

/**
 * Get notifications for current user
 */
export async function getNotifications(limit: number = 50): Promise<NotificationsResponse> {
  try {
    const session = await getUserSession();
    if (!session) {
      throw new Error('No user session found');
    }

    let url = `${API_BASE_URL}${API_ENDPOINTS.GET_NOTIFICATIONS}?limit=${limit}`;
    
    if (session.account_type === 'resident') {
      url += `&user_type=RESIDENT&resident_id=${session.user_id}`;
    } else if (session.account_type === 'personnel') {
      url += `&user_type=PERSONNEL&personnel_id=${session.user_id}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch notifications');
    }

    return result;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: number): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MARK_NOTIFICATION_READ}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notification_id: notificationId }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to mark notification as read');
    }

    return result;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<any> {
  try {
    const session = await getUserSession();
    if (!session) {
      throw new Error('No user session found');
    }

    const data: any = {
      user_type: session.account_type === 'resident' ? 'RESIDENT' : 'PERSONNEL',
    };

    if (session.account_type === 'resident') {
      data.resident_id = session.user_id;
    } else if (session.account_type === 'personnel') {
      data.personnel_id = session.user_id;
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to mark all notifications as read');
    }

    return result;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}
