import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';

import { NotificationProvider } from '@/context/notificationContext';
import { RegisterProvider } from '@/context/registercontext';
import { useColorScheme } from '@/hooks/useColorScheme';


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RegisterProvider>
          <NotificationProvider>
            <Stack screenOptions={{ headerShown: false }}>
              {/* Root entry point */}
              <Stack.Screen name="index" options={{ headerShown: false }} />
              
              {/* Authentication group - Let Expo Router handle nested routes automatically */}
              <Stack.Screen 
                name="(auth)" 
                options={{ 
                  headerShown: false,
                }} 
              />
              
              {/* Main app screens */}
              <Stack.Screen 
                name="(tabs)" 
                options={{ 
                  headerShown: false,
                  gestureEnabled: false // Prevent going back to auth
                }} 
              />
              
              <Stack.Screen 
                name="(nurse)" 
                options={{ 
                  headerShown: false,
                  gestureEnabled: false 
                }} 
              />
              
              <Stack.Screen 
                name="(bhw)" 
                options={{ 
                  headerShown: false,
                  gestureEnabled: false 
                }} 
              />
              
              {/* Other standalone screens */}
              <Stack.Screen name="+not-found" options={{ headerShown: false }} />
            </Stack>
          </NotificationProvider>
        </RegisterProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}