import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Login screen */}
      <Stack.Screen name="login" options={{ headerShown: false }} />
      
      {/* Register flow */}
      <Stack.Screen 
        name="register" 
        options={{ 
          headerShown: false,
        }} 
      />
    </Stack>
  );
}