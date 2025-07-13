import React from 'react';
import { View, Text, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import StepIndicator from '@/components/stepindicator';
import RegisterStep1 from '@/components/auth/RegisterStep1';



export default function Step1Personal() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
        <StepIndicator currentStep={1} steps={['Personal', 'Address', 'Account']} />
        <Text style={{ fontSize: 20, marginBottom: 10 }}>Step 1: Personal Info</Text>
        
        {/* Form Component */}
        <RegisterStep1 />

        {/* Navigation */}
        <Pressable
          onPress={() => router.push('/register/step2')}
          style={{ marginTop: 20, backgroundColor: '#1e40af', padding: 12, borderRadius: 6 }}
        >
          <Text style={{ color: '#fff', textAlign: 'center' }}>Next</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}



