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
      <Stack.Screen
        name="residentlist"
        options={{
          title: 'Resident List',
        }}
      />
      <Stack.Screen
        name="householdlist"
        options={{
          title: 'Household List',
        }}
      />
      <Stack.Screen
        name="maternalrecord"
        options={{
          headerShown: false, 
        }}
      />
      <Stack.Screen
        name="childhealthrecord"
        options={{
          headerShown: false, 
        }}
      />

    </Stack>
  );
}