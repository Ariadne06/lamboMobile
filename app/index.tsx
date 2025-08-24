import React, { useEffect, useState, useRef } from 'react';
import { router } from 'expo-router';
import { getUserSession, isSessionExpired } from '@/utils/session';
import CustomSplashScreen from '@/components/CustomSplashScreen';

export default function SplashScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const hasChecked = useRef(false); // Prevent multiple checks

  useEffect(() => {
    // Only run once
    if (!hasChecked.current && !isChecking) {
      hasChecked.current = true;
      checkLoginStatus();
    }
  }, [isChecking]);

  const checkLoginStatus = async () => {
    if (isChecking) return; // Prevent multiple simultaneous checks
    
    setIsChecking(true);
    
    try {
      // console.log('Checking authentication status...');
      
      // Wait for splash screen to show for at least 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if session is expired
      const expired = await isSessionExpired();
      if (expired) {
        console.log('Session expired, going to login');
        setShowSplash(false);
        router.replace('/(auth)/login');
        return;
      }

      // Check if user has a saved session
      const session = await getUserSession();
      
      if (session) {
        console.log(` Found session for: ${session.username} (${session.account_type})`);
        
        setShowSplash(false);
        
        // Navigate based on account type and role
        if (session.account_type === 'personnel') {
          if (session.role_name === 'Midwife') {
            router.replace('/(nurse)');
          } else if (session.role_name === 'Barangay Health Worker') {
            router.replace('/(bhw)');
          } else {
            router.replace('/(auth)/login'); // Default to not found
          }
        } else if (session.account_type === 'resident') {
          router.replace('/(tabs)/announcement');
        }
      } else {
        console.log(' No session found, going to login');
        setShowSplash(false);
        router.replace('/(auth)/login');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setShowSplash(false);
      router.replace('/(auth)/login');
    } finally {
      setIsChecking(false);
    }
  };

  const handleSplashFinish = () => {
    // Splash screen animation finished, but we'll control navigation via checkLoginStatus
    // console.log('Splash screen animation finished');
  };

  if (showSplash) {
    return (
      <CustomSplashScreen
        onFinish={handleSplashFinish}
        duration={2000} // Reduced to 2 seconds to match our timeout
        customImage={require('../assets/images/brgylogo.png')}
        title="LAMBO"
        subtitle="Barangay Management System"
        backgroundColor="#f9fafb"
        textColor="#000000"
      />
    );
  }

  // Loading state while checking auth
  return null;
}