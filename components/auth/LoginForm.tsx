import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';
import { storeUserSession } from '@/utils/session';

export default function LoginForm() {
  // CHANGED: username instead of email 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Missing Info', 'Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      // console.log(' Attempting login with Django backend...');
      
      // REPLACED: Django API call instead of Supabase
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
      console.log(' Login response:', data);

      // Replace the navigation section in handleLogin:

      if (data.success && data.status === 'success') {
        // Store user info for later use (optional)
        console.log(' Login successful:', {
          accountType: data.account_type,
          userId: data.user_id,
          username: data.username,
          roleName: data.role_name,
          sessionToken: data.session_token
        });
        
        // SAVE session to phone storage
        await storeUserSession({
          account_type: data.account_type,
          user_id: data.user_id,
          username: data.username,
          role_name: data.role_name,
          role_id: data.role_id,
          session_token: data.session_token,
          login_time: new Date().toISOString(),
        });
        
        // FIXED: Navigate based on account type and role
        if (data.account_type === 'personnel') {
          if (data.role_name === 'Nurse') {
            router.replace('/(nurse)');     
          } else if (data.role_name === 'BHW') {
            router.replace('/(bhw)');       
          } else {
            router.replace('/(nurse)');     
          }
        } else if (data.account_type === 'resident') {
          router.replace('/(tabs)/announcement');        
        }
        
        Alert.alert('Success', 'Login successful!');
        
      } else if (data.status === 'require_password_change') {
        Alert.alert(
          'Password Change Required', 
          'You need to change your password before continuing.',
          [
            {
              text: 'OK',
              onPress: () => {
                // TODO: Navigate to password change screen
                console.log('Need to implement password change screen');
                // router.push({
                //   pathname: '/(auth)/changePassword',
                //   params: {
                //     account_type: data.account_type,
                //     user_id: data.user_id,
                //     username: data.username
                //   }
                // });
              }
            }
          ]
        );
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
      
    } catch (error) {
      console.error(' Login error:', error);
      Alert.alert('Error', 'Network error occurred. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {/* CHANGED: Username instead of Email */}
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
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />

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

// UPDATED: Styles 
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

};