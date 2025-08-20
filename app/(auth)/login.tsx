import React from 'react';
import { View, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/ThemedText';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
        
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 40, marginTop: 40 }}>
          <Image
            source={require('../../assets/images/brgylogo.png')}  
            style={{ width: 120, height: 120, marginBottom: 20 }}
            contentFit="contain"
          />
          <ThemedText style={{ fontSize: 16, color: '#6b7280', textAlign: 'center' }}>
            Sign in to your account
          </ThemedText>
        </View>

        {/* Login Form Container */}
        <View style={{ 
          backgroundColor: '#fff', 
          padding: 20, 
          borderRadius: 12, 
          shadowColor: '#000', 
          shadowOffset: { width: 0, height: 2 }, 
          shadowOpacity: 0.1, 
          shadowRadius: 4, 
          elevation: 3 
        }}>
          {/* REPLACED: Use LoginForm component instead of inline form */}
          <LoginForm />
        </View>

        {/* Footer */}
        <View style={{ alignItems: 'center', marginTop: 30 }}>
          <ThemedText style={{ color: '#6b7280', marginBottom: 10 }}>
            Don&apos;t have an account?
          </ThemedText>
          <Pressable onPress={() => router.push('/(auth)/register/userType')}>
            <ThemedText style={{ color: '#FF3D33', fontWeight: 'bold' }}>
              Register here
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}