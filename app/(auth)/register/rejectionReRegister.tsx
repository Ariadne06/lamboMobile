import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RejectionReRegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const message = params.message as string || 'Your application was rejected. Please re-register.';

  const handleReRegister = () => {
    // Go to registration start (clear form, etc.)
    router.replace('/(auth)/register/userType');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <Ionicons name="close-circle" size={80} color="#ef4444" />
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ef4444', marginTop: 16, marginBottom: 8 }}>
          Registration Rejected
        </Text>
        <Text style={{ fontSize: 16, color: '#64748b', textAlign: 'center', marginBottom: 24 }}>
          {message}
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#FF3D33',
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            width: 220,
          }}
          onPress={handleReRegister}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
            Start New Registration
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}