import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Info', 'Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        Alert.alert('Login Failed', error.message);
      } else {
        Alert.alert('Success', 'Login successful!');
        // Navigate to main app after successful login
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {/* Email Input */}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Password Input */}
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Forgot Password Link */}
      <Pressable onPress={() => Alert.alert('Info', 'Forgot password feature coming soon!')}>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </Pressable>

      {/* Login Button */}
      <Pressable
        onPress={handleLogin}
        disabled={loading}
        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Sign In</Text>
        )}
      </Pressable>

      {/* Social Login Options (Optional) */}
      <View style={styles.socialContainer}>
        <Text style={styles.socialText}>Or continue with</Text>
        
        <Pressable 
          style={styles.socialButton}
          onPress={() => Alert.alert('Info', 'Google login coming soon!')}
        >
          <Text style={styles.socialButtonText}>Google</Text>
        </Pressable>
      </View>
    </View>
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
    color: '#1e40af',
    textAlign: 'right' as const,
    marginBottom: 24,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#1e40af',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center' as const,
    marginBottom: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  socialContainer: {
    alignItems: 'center' as const,
    marginTop: 20,
  },
  socialText: {
    color: '#6b7280',
    marginBottom: 16,
    fontSize: 14,
  },
  socialButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  socialButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500' as const,
  },
}; 