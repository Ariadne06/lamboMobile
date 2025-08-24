import { Text, ScrollView, SafeAreaView } from 'react-native';
import StepIndicator from '@/components/stepindicator';
import RegisterStep3 from '@/components/auth/RegisterStep3';
import { ThemedText } from '@/components/ThemedText';

export default function Step3() {
  return (
     <SafeAreaView style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50, backgroundColor: '#f3f4f6' }}>
        <StepIndicator currentStep={3} steps={['Personal', 'Address', 'Account']} />
        <RegisterStep3 />
    </ScrollView>
    </SafeAreaView>
  );
}


