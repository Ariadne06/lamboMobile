import { Text, ScrollView, SafeAreaView } from 'react-native';
import StepIndicator from '@/components/stepindicator';
import RegisterStep3 from '@/components/auth/RegisterStep3';
import { ThemedText } from '@/components/ThemedText';

export default function Step3() {
  return (
     <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
        <StepIndicator currentStep={3} steps={['Personal', 'Address', 'Account']} />
        <ThemedText style={{ fontSize: 20, marginBottom: 10 }}>Step 3: Account Info</ThemedText>
        <RegisterStep3 />
    </ScrollView>
    </SafeAreaView>
  );
}


