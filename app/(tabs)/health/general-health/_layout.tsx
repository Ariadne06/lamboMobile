import { Stack } from 'expo-router';

export default function GeneralHealthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // ✅ Disable header globally for this stack
      }}
    >
      <Stack.Screen 
        name="genhealth" 
        options={{ 
          title: 'General Health',
          headerShown: false, // ✅ Explicitly disable for this screen too
        }} 
      />
    </Stack>
  );
}