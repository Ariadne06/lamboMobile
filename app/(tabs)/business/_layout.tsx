import CustomHeader from '@/components/ui/CustomHeader';
import { Stack } from 'expo-router';

export default function BusinessLayout() {
  return (
    <Stack
      screenOptions={{
        header: ({ options }) => <CustomHeader title={options.title || ''} />,
      }}
    >
      <Stack.Screen 
        name="business" 
        options={{ 
          title: 'Business Info',
        }} 
      />
      <Stack.Screen 
        name="detail" 
        options={{ 
          title: 'Business Details',
        }} 
      />
    </Stack>
  );
}
