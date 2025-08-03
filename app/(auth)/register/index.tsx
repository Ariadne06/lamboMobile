import React from 'react';
import {Text, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import StepIndicator from '@/components/stepindicator';
import RegisterStep1 from '@/components/auth/RegisterStep1';
import { ThemedText } from '@/components/ThemedText';



export default function Step1Personal() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
        <StepIndicator currentStep={1} steps={['Personal', 'Address', 'Account']} />
        <ThemedText style={{ fontSize: 20, marginBottom: 10 }}>Step 1: Personal Info</ThemedText>

        <RegisterStep1 />

        <Pressable
          onPress={() => router.push('/register/step2')}
          style={{ marginTop: 5, backgroundColor: '#FF3D33', padding: 12, borderRadius: 6 }}
        >
          <ThemedText style={{ color: '#fff', textAlign: 'center' }}>Next</ThemedText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}



