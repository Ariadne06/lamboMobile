import { clearUserSession } from './session';
import { router } from 'expo-router';
import { Alert } from 'react-native';

export const logout = async () => {
  try {
    console.log(' Logging out user...');
    
    // Clear saved session from phone
    await clearUserSession();
    
    // Navigate back to login screen
    router.replace('/(auth)/login');
    
    console.log(' Logout successful');
  } catch (error) {
    console.error(' Logout error:', error);
    Alert.alert('Error', 'Failed to logout properly');
  }
};

export const showLogoutConfirmation = () => {
  Alert.alert(
    'Logout',
    'Are you sure you want to logout?',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: logout,
      },
    ]
  );
};