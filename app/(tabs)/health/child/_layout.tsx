import CustomHeader from '@/components/ui/CustomHeader';
import { Stack } from 'expo-router';

export default function ChildHealthLayout() {
  return (
    <Stack
      screenOptions={{
        header: ({ options }) => <CustomHeader title={options.title || ''} />,
      }}
    >
      <Stack.Screen name="growthmonitoring" options={{ title: 'Growth Monitoring' }} />
      <Stack.Screen name="immunization" options={{ title: 'Immunization' }} />
      <Stack.Screen name="medicalsurgical" options={{ title: 'Medical/Surgical History' }} />
      <Stack.Screen name="supplements" options={{ title: 'Supplements' }} />
    </Stack>
  );
}
