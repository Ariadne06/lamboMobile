import { Stack } from 'expo-router';
import CustomHeader from '@/components/ui/CustomHeader';

export default function MenuLayout() {
  return (
    <Stack screenOptions={{  header: ({ options }) => <CustomHeader title={options.title || ''} /> }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="businessinfo"
        options={{
          title: 'Business Info', 
      }}
      />
      <Stack.Screen
        name="healthrecords"
        options={{
          title: 'Health Records',
      }}
      />
      <Stack.Screen
        name="householdinformation"
        options={{
          title: 'Household Information', 
      }}
      />
      <Stack.Screen
        name="transactionhistory"
        options={{
          title: 'Transaction History',
      }}
      />
      <Stack.Screen
        name="cncrequest"
        options={{
          title: 'Certificate and Clearance Request',
      }}
      />

      <Stack.Screen
        name="profile"
        options={{
          title: 'Account Profile',
      }}
      />

    </Stack>
  );
}