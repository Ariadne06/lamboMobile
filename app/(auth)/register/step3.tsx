import { View, Text, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import StepIndicator from '@/components/stepindicator';
import RegisterStep3 from '@/components/auth/RegisterStep3';

export default function Step3() {
  return (
    <View style={{ padding: 20 }}>
      <StepIndicator currentStep={3} steps={['Personal', 'Address', 'Account']} />
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Step 3: Account Info</Text>
      
      {/* Form Component */}
      <RegisterStep3 />

      {/* Navigation */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
        <Pressable onPress={() => router.back()} style={{ backgroundColor: '#1e40af', padding: 12, borderRadius: 6  }}>
          <Text style={{ color: '#fff' }}>Back</Text>
        </Pressable>
      </View>
    </View>
  );
}


