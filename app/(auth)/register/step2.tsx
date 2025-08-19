import { Text, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import StepIndicator from '@/components/stepindicator';
import RegisterStep2 from '@/components/auth/RegisterStep2';
import { ThemedText } from '@/components/ThemedText';

export default function Step2() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50, backgroundColor: '#f3f4f6' }}>
    
        <StepIndicator currentStep={2} steps={['Personal', 'Address', 'Account']} />

        <RegisterStep2 />

          <Pressable onPress={() => router.push('/register/step3')} style={{ marginTop: 20, backgroundColor: '#FF3D33', padding: 12, borderRadius: 6 }}>
            <ThemedText style={{ color: '#fff', textAlign: 'center'}}>Next</ThemedText>
          </Pressable>
        </ScrollView>
    </SafeAreaView>
  );
}



