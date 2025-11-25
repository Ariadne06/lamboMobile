import { Stack } from 'expo-router';

export default function TransactionsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Transaction History',
        }} 
      />
      <Stack.Screen 
        name="transactions-list" 
        options={{ 
          title: 'All Transactions',
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Transaction Details',
        }} 
      />
    </Stack>
  );
}
