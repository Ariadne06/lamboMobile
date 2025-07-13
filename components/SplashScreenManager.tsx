import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import CustomSplashScreen from './CustomSplashScreen';

interface SplashScreenManagerProps {
  children: React.ReactNode;
  customImage?: any;
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
  textColor?: string;
  duration?: number;
}

export default function SplashScreenManager({
  children,
  customImage,
  title,
  subtitle,
  backgroundColor,
  textColor,
  duration = 3000
}: SplashScreenManagerProps) {
  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        // Keep the splash screen visible while we fetch resources
        await SplashScreen.preventAutoHideAsync();
        
        // Simulate loading time (you can add actual resource loading here)
        // For example: loading fonts, initializing APIs, etc.
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Set ready state
        setIsReady(true);
        
      } catch (e) {
        console.warn('Error preparing app:', e);
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  const handleSplashFinish = async () => {
    setShowSplash(false);
    // Hide the native splash screen
    await SplashScreen.hideAsync();
  };

  // Show custom splash screen
  if (showSplash) {
    return (
      <CustomSplashScreen
        onFinish={handleSplashFinish}
        duration={duration}
        customImage={customImage}
        title={title}
        subtitle={subtitle}
        backgroundColor={backgroundColor}
        textColor={textColor}
      />
    );
  }

  // Show main app content
  return <>{children}</>;
} 