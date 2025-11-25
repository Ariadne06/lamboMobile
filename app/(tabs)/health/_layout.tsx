import CustomHeader from '@/components/ui/CustomHeader';
import { Stack } from 'expo-router';

export default function HealthLayout() {
  return (
    <Stack
      screenOptions={{
        header: ({ options }) => <CustomHeader title={options.title || ''} />,
      }}
    >
      <Stack.Screen 
        name="health-records" 
        options={{ 
          title: 'Health Records',
        }} 
      />
      <Stack.Screen 
        name="child" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="maternal" 
        options={{ 
          headerShown: false,
        }} 
      />
    </Stack>
  );
}
