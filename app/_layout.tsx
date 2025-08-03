import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import "../global.css";

import { useColorScheme } from '@/hooks/useColorScheme';
import SplashScreenManager from '@/components/SplashScreenManager';
import { AuthProvider } from '@/context/authContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    PoppinsRegular: require('../assets/fonts/Poppins/Poppins-Regular.ttf'),
    PoppinsBold: require('../assets/fonts/Poppins/Poppins-Bold.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <SplashScreenManager
        customImage={require('../assets/images/brgylogo.png')}
        title="Barangay Cansaga"
        subtitle="Resident Management System"
        backgroundColor={colorScheme === 'dark' ? '#ffffff' : '#1e40af'}
        textColor={colorScheme === 'dark' ? '#000000' : '#ffffff'}
        duration={3000}
      >
        <ThemeProvider value={DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </SplashScreenManager>
    </AuthProvider>
  );
}
