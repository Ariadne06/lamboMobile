import { View, Text, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import StepIndicator from '@/components/stepindicator';
import RegisterStep2 from '@/components/auth/RegisterStep2';

export default function Step2() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
    
        <StepIndicator currentStep={2} steps={['Personal', 'Address', 'Account']} />
        <Text style={{ fontSize: 20, marginBottom: 10 }}>Step 2: Address</Text>
        
       
        <RegisterStep2 />

          <Pressable onPress={() => router.push('/register/step3')} style={{ marginTop: 20, backgroundColor: '#FF3D33', padding: 12, borderRadius: 6 }}>
            <Text style={{ color: '#fff', textAlign: 'center'}}>Next</Text>
          </Pressable>
        </ScrollView>
    </SafeAreaView>
  );
}



