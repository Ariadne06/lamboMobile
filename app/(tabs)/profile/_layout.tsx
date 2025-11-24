import CustomHeader from '@/components/ui/CustomHeader';
import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        header: ({ options }) => <CustomHeader title={options.title || ''} />,
      }}
    >
      <Stack.Screen 
        name="profile" 
        options={{ 
          title: 'Account Profile',
        }} 
      />
    </Stack>
  );
}
