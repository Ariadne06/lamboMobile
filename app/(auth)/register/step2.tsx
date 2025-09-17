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
        </ScrollView>
    </SafeAreaView>
  );
}



