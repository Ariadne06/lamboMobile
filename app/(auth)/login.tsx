import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/ThemedText';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
   
    console.log('Login button pressed');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
       
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

       
        <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
    
          <ThemedText style={styles.label}>Email Address</ThemedText>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

        
          <ThemedText style={styles.label}>Password</ThemedText>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

      
          <Pressable onPress={() => console.log('Forgot password pressed')}>
            <ThemedText style={styles.forgotPassword}>Forgot Password?</ThemedText>
          </Pressable>

        
          <Pressable onPress={handleLogin} style={styles.loginButton}>
            <ThemedText style={styles.loginButtonText}>Sign In</ThemedText>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={{ alignItems: 'center', marginTop: 30 }}>
          <ThemedText style={{ color: '#6b7280', marginBottom: 10 }}>
            Don't have an account?
          </ThemedText>
          <ThemedText 
            style={{ color: '#FF3D33', fontWeight: 'bold' }}
            onPress={() => router.push('/(auth)/register')}
          >
            Register here
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 15,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  forgotPassword: {
    color: '#FF3D33',
    textAlign: 'right' as const,
    marginBottom: 24,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#FF3D33',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center' as const,
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },

  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
  },


}; 