import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import StepIndicator from '@/components/stepindicator';
import RegisterStep3 from '@/components/auth/RegisterStep3';

export default function Step3() {
  return (
     <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
        <StepIndicator currentStep={3} steps={['Personal', 'Address', 'Account']} />
        <Text style={{ fontSize: 20, marginBottom: 10 }}>Step 3: Account Info</Text>  
        <RegisterStep3 />
    </ScrollView>
    </SafeAreaView>
  );
}


