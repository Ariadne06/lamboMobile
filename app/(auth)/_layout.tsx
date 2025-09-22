import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Login screen */}
      <Stack.Screen name="login" options={{ headerShown: false }} />

      {/* Password change screen */}
      <Stack.Screen name="changePassword" options={{ headerShown: false }} />
      
      {/* Register flow */}
      <Stack.Screen 
        name="register" 
        options={{ 
          headerShown: false,
        }} 
      />

      {/* Forgot Password screen */}
      <Stack.Screen 
        name="forgotPassword" 
        options={{ 
          headerShown: false,
        }} 
      />
    </Stack>
  );
}
