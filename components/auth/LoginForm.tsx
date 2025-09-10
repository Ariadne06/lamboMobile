import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';
import { storeUserSession } from '@/utils/session';
import { Ionicons } from '@expo/vector-icons';

export default function LoginForm() {
  // CHANGED: username instead of email 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Missing Info', 'Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MOBILE_LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (data.success && data.status === 'success') {
        // Store user info and navigate normally
        await storeUserSession({
          account_type: data.account_type,
          user_id: data.user_id,
          username: data.username,
          role_name: data.role_name,
          role_id: data.role_id,
          session_token: data.session_token,
          login_time: new Date().toISOString(),
        });
        
        // Navigate based on account type and role
        if (data.account_type === 'personnel') {
          if (data.role_name === 'Midwife') {
            router.replace('/(nurse)');     
          } else if (data.role_name === 'Barangay Health Worker') {
            router.replace('/(bhw)');       
          } else {
            Alert.alert('Access Denied', 'Your role is not authorized for mobile access.');
            return;     
          }
        } else if (data.account_type === 'resident') {
            router.replace('/(tabs)/announcement');        
          }      
        } else if (data.status === 'not_verified') {
            router.push({
            pathname: '/(auth)/register/verificationStatus',
            params: {
              isVerified: 'false',
              message: data.message || 'Your account is pending verification. Please wait for approval.',
                  }
            });
        } else if (data.status === 'require_password_change') {
        // Handle password change requirement
        Alert.alert(
          'Password Change Required', 
          'You must change your default password before continuing.',
          [
            {
              text: 'Change Password',
              onPress: () => {
                router.push({
                  pathname: '/(auth)/changePassword',
                  params: {
                    account_type: data.account_type,
                    user_id: data.user_id,
                    username: data.username,
                    role_name: data.role_name
                  }
                });
              }
            }
          ]
        );
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Network error occurred. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {/*  Username Input */}
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />

      {/* Password Input */}
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.passwordInput}
          secureTextEntry={!showPassword} 
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />
        
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color="#6b7280"
          />
        </TouchableOpacity>
      </View>

      {/* Forgot Password Link */}
      <Pressable onPress={() => Alert.alert('Info', 'Forgot password feature coming soon!')}>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </Pressable>

      {/* UPDATED: Login Button */}
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
  loginButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },

    passwordContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  eyeButton: {
    padding: 15,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },

};