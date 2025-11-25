import { Stack } from 'expo-router';

export default function DocumentsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Documents & Certificates',
        }} 
      />
      <Stack.Screen 
        name="create-request" 
        options={{ 
          title: 'Create Request',
        }} 
      />
      <Stack.Screen 
        name="requests-list" 
        options={{ 
          title: 'All Requests',
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Request Details',
        }} 
      />
    </Stack>
  );
}
