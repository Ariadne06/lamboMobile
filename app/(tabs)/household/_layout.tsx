import CustomHeader from '@/components/ui/CustomHeader';
import { Stack } from 'expo-router';

export default function HouseholdLayout() {
  return (
    <Stack
      screenOptions={{
        header: ({ options }) => <CustomHeader title={options.title || ''} />,
      }}
    >
      <Stack.Screen 
        name="household" 
        options={{ 
          title: 'Household Information',
        }} 
      />
    </Stack>
  );
}
