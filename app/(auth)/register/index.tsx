import React from 'react';
import {Text, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import StepIndicator from '@/components/stepindicator';
import RegisterStep1 from '@/components/auth/RegisterStep1';
import { ThemedText } from '@/components/ThemedText';

export default function Step1Personal() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50, backgroundColor: '#f3f4f6' }}>
        <StepIndicator currentStep={1} steps={['Personal', 'Address', 'Account']} />
        <RegisterStep1 />
      </ScrollView>
    </SafeAreaView>
  );
}



