import CustomHeader from '@/components/ui/CustomHeader';
import { Stack } from 'expo-router';

export default function MaternalHealthLayout() {
  return (
    <Stack
      screenOptions={{
        header: ({ options }) => <CustomHeader title={options.title || ''} />,
      }}
    >
      <Stack.Screen name="checkups" options={{ title: 'Check Ups' }} />
      <Stack.Screen name="deliveryoutcome" options={{ title: 'Delivery Outcome' }} />
      <Stack.Screen name="immunization" options={{ title: 'Immunization' }} />
      <Stack.Screen name="labscreeningiron" options={{ title: 'Lab Screening + Iron' }} />
      <Stack.Screen name="medicalsurgical" options={{ title: 'Medical/Surgical History' }} />
      <Stack.Screen name="obstetricalhistory" options={{ title: 'Obstetrical History' }} />
      <Stack.Screen name="postpartumvisit" options={{ title: 'Postpartum Visit' }} />
      <Stack.Screen name="screenings" options={{ title: 'Screenings' }} />
      <Stack.Screen name="supplements" options={{ title: 'Supplements' }} />
    </Stack>
  );
}
