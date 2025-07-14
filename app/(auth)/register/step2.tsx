import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import StepIndicator from '@/components/stepindicator';
import RegisterStep2 from '@/components/auth/RegisterStep2';

export default function Step2() {
  return (
    <View style={{ padding: 20 }}>
      <StepIndicator currentStep={2} steps={['Personal', 'Address', 'Account']} />
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Step 2: Address</Text>
      
      {/* Form Component */}
      <RegisterStep2 />

      {/* Navigation */}
      {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}> */}
        {/* <Pressable onPress={() => router.back()} style={{ backgroundColor: '#FF3D33', padding: 12, borderRadius: 6 }}>
          <Text style={{ color: '#fff' }}>Back</Text>
        </Pressable> */}

        <Pressable onPress={() => router.push('/register/step3')} style={{ marginTop: 20, backgroundColor: '#FF3D33', padding: 12, borderRadius: 6 }}>
          <Text style={{ color: '#fff', textAlign: 'center'}}>Next</Text>
        </Pressable>
      {/* </View> */}
    </View>
  );
}



