import { Stack } from 'expo-router';

export default function BHWMenuLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="householdmenu" />
      <Stack.Screen name="addhousehold" />
      <Stack.Screen name="viewhousehold" />
      {/* <Stack.Screen name="residentlist" /> */}
    </Stack>
  );
}