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
      <Stack.Screen
        name="childdetails"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="childimmunization"
        options={{
          headerShown: false, 
        }}
      />
      <Stack.Screen
        name="childsupplements"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="childgrowthmonitoring"
        options={{
          headerShown: false, 
        }}
      />
      <Stack.Screen
        name="childmedicalhistory"
        options={{
          headerShown: false, 
        }}
      />
      <Stack.Screen
        name="generalhealthinfo"
        options={{
          headerShown: false, 
        }}
      />
      <Stack.Screen
        name="immunizationstatus"
        options={{
          headerShown: false, 
        }}
      />
      <Stack.Screen
        name="maternaldetails"
        options={{
          headerShown: false, 
        }}
      />
      <Stack.Screen
        name="maternalmedicalsurgical"
        options={{
          headerShown: false, 
        }}
      />
      <Stack.Screen
        name="maternalimmunization"
        options={{
          headerShown: false, 
        }}
      />
      <Stack.Screen
        name="maternalobstetrical"
        options={{
          headerShown: false, 
        }}
      />
      <Stack.Screen
        name="maternalcheckups"
        options={{
          headerShown: false, 
        }}
      />
      <Stack.Screen
        name="maternalscreenings"
        options={{
          headerShown: false, 
        }}
      />
      <Stack.Screen
        name="maternallabscreening"
        options={{
          headerShown: false, 
        }}
      />
      <Stack.Screen
        name="maternalsupplements"
        options={{
          headerShown: false, 
        }}
      />
      <Stack.Screen
        name="maternaldeliveryoutcome"
        options={{
          headerShown: false, 
        }}
      />
      <Stack.Screen
        name="maternalpostpartum"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}