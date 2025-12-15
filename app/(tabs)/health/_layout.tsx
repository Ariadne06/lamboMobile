import { Stack } from 'expo-router';

export default function HealthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Main health dashboard */}
      <Stack.Screen name="index" options={{ title: 'Health Records' }} />
      
      {/* Child Health Routes - Use actual file names WITHOUT hyphens */}
      <Stack.Screen 
        name="child/[child_health_id]/index" 
        options={{ title: 'Child Health Overview' }} 
      />
      <Stack.Screen 
        name="child/[child_health_id]/growthmonitoring" 
        options={{ title: 'Growth Monitoring' }} 
      />
      <Stack.Screen 
        name="child/[child_health_id]/immunization" 
        options={{ title: 'Immunization' }} 
      />
      <Stack.Screen 
        name="child/[child_health_id]/medicalsurgical" 
        options={{ title: 'Medical/Surgical History' }} 
      />
      <Stack.Screen 
        name="child/[child_health_id]/supplements" 
        options={{ title: 'Supplements' }} 
      />
      
      {/* Maternal Health Routes - Use actual file names WITHOUT hyphens */}
      <Stack.Screen 
        name="maternal/[maternal_health_id]/index" 
        options={{ title: 'Maternal Health Overview' }} 
      />
      <Stack.Screen 
        name="maternal/[maternal_health_id]/checkups" 
        options={{ title: 'Prenatal Checkups' }} 
      />
      <Stack.Screen 
        name="maternal/[maternal_health_id]/obstetricalhistory" 
        options={{ title: 'Obstetrical History' }} 
      />
      <Stack.Screen 
        name="maternal/[maternal_health_id]/immunization" 
        options={{ title: 'Immunization' }} 
      />
      <Stack.Screen 
        name="maternal/[maternal_health_id]/laboratory-screening" 
        options={{ title: 'Lab & Iron Screening' }} 
      />
      <Stack.Screen 
        name="maternal/[maternal_health_id]/supplements" 
        options={{ title: 'Supplements' }} 
      />
      <Stack.Screen 
        name="maternal/[maternal_health_id]/medical-surgical-history" 
        options={{ title: 'Medical/Surgical History' }} 
      />
      <Stack.Screen 
        name="maternal/[maternal_health_id]/pregnancy-outcome" 
        options={{ title: 'Delivery Outcome' }} 
      />
      <Stack.Screen 
        name="maternal/[maternal_health_id]/postpartum-visits" 
        options={{ title: 'Postpartum Visit' }} 
      />
    </Stack>
  );
}