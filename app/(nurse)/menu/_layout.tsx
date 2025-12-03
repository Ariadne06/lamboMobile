import { Stack } from 'expo-router';
import CustomHeader from '@/components/ui/CustomHeader';

export default function NurseMenuLayout() {
  return (
    <Stack screenOptions={{ header: ({ options }) => <CustomHeader title={options.title || ''} /> }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />

    </Stack>
  );
}