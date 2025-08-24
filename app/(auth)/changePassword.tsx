import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { changePersonnelPassword } from '@/utils/passwordService';

export default function ChangePasswordScreen() {
  const params = useLocalSearchParams();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordChange = async () => {
    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing Information', 'Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Invalid Password', 'New password must be at least 8 characters long.');
      return;
    }

    if (oldPassword === newPassword) {
      Alert.alert('Invalid Password', 'New password must be different from your current password.');
      return;
    }

    setLoading(true);

    try {
      const result = await changePersonnelPassword({
        personnel_id: parseInt(params.user_id as string),
        old_password: oldPassword,
        new_password: newPassword,
      });

      if (result.success) {
        Alert.alert(
          'Success', 
          'Password changed successfully! Please login with your new password.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back to login
                router.replace('/(auth)/login');
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to change password');
      }

    } catch (error) {
    //console log message
    //   console.error('Password change error:', error);
      
        // Extract the actual error message
        let errorMessage = 'Network error occurred. Please try again.';
        
        if (error instanceof Error) {
        const message = error.message;
        
        // Handle specific backend error messages
        if (message.includes('Personnel not found')) {
            errorMessage = 'Account not found. Please contact support.';
        } else if (message.includes('Incorrect current password')) {
            errorMessage = 'The current password you entered is incorrect. Please try again.';
        } else if (message.includes('New password must be at least 8 characters')) {
            errorMessage = 'New password must be at least 8 characters long.';
        } else if (message.includes('New password must be different')) {
            errorMessage = 'New password must be different from your current password.';
        } else if (message.includes('HTTP error! status:')) {
            // For HTTP errors, check if it's a network issue or server error
            if (message.includes('status: 400')) {
            errorMessage = 'Invalid request. Please check your input and try again.';
            } else if (message.includes('status: 500')) {
            errorMessage = 'Server error occurred. Please try again later.';
            } else {
            errorMessage = 'Connection error. Please check your internet connection.';
            }
        } else if (!message.includes('HTTP error') && !message.includes('Network request failed')) {
            // If it's not a network error, use the actual error message
            errorMessage = message;
        }
        }
    
    Alert.alert('Error', errorMessage);

    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
        
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 40, marginTop: 40 }}>
          <MaterialIcons name="lock-reset" size={80} color="#FF3D33" />
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FF3D33', marginTop: 20 }}>
            Change Password
          </Text>
          <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center', marginTop: 10 }}>
            You must change your default password before continuing
          </Text>
        </View>

        {/* Form Container */}
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

          {/* Username Display */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 5 }}>
              Username
            </Text>
            <View style={{ 
              backgroundColor: '#f3f4f6', 
              padding: 15, 
              borderRadius: 8, 
              borderWidth: 1, 
              borderColor: '#e5e7eb' 
            }}>
              <Text style={{ fontSize: 16, color: '#6b7280' }}>
                {params.username}
              </Text>
            </View>
          </View>

          {/* Old Password */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 5 }}>
              Current Password
            </Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                placeholder="Enter your current password"
                value={oldPassword}
                onChangeText={setOldPassword}
                style={{
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  padding: 15,
                  paddingRight: 50,
                  fontSize: 16,
                  backgroundColor: '#fff',
                }}
                secureTextEntry={!showOldPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <Pressable
                onPress={() => setShowOldPassword(!showOldPassword)}
                style={{
                  position: 'absolute',
                  right: 15,
                  top: 15,
                  padding: 5,
                }}
              >
                <MaterialIcons 
                  name={showOldPassword ? "visibility-off" : "visibility"} 
                  size={20} 
                  color="#6b7280" 
                />
              </Pressable>
            </View>
          </View>

          {/* New Password */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 5 }}>
              New Password
            </Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                placeholder="Enter your new password (min 8 characters)"
                value={newPassword}
                onChangeText={setNewPassword}
                style={{
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  padding: 15,
                  paddingRight: 50,
                  fontSize: 16,
                  backgroundColor: '#fff',
                }}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <Pressable
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={{
                  position: 'absolute',
                  right: 15,
                  top: 15,
                  padding: 5,
                }}
              >
                <MaterialIcons 
                  name={showNewPassword ? "visibility-off" : "visibility"} 
                  size={20} 
                  color="#6b7280" 
                />
              </Pressable>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 5 }}>
              Confirm New Password
            </Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={{
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  padding: 15,
                  paddingRight: 50,
                  fontSize: 16,
                  backgroundColor: '#fff',
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: 15,
                  top: 15,
                  padding: 5,
                }}
              >
                <MaterialIcons 
                  name={showConfirmPassword ? "visibility-off" : "visibility"} 
                  size={20} 
                  color="#6b7280" 
                />
              </Pressable>
            </View>
          </View>

          {/* Password Requirements */}
          <View style={{ 
            backgroundColor: '#f0f9ff', 
            padding: 15, 
            borderRadius: 8, 
            marginBottom: 24,
            borderLeftWidth: 4,
            borderLeftColor: '#0ea5e9'
          }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#0c4a6e', marginBottom: 8 }}>
              Password Requirements:
            </Text>
            <Text style={{ fontSize: 13, color: '#075985', marginBottom: 4 }}>
              • At least 8 characters long
            </Text>
            <Text style={{ fontSize: 13, color: '#075985', marginBottom: 4 }}>
              • Must be different from current password
            </Text>
            <Text style={{ fontSize: 13, color: '#075985' }}>
              • Confirm password must match new password
            </Text>
          </View>

          {/* Change Password Button */}
          <Pressable
            onPress={handlePasswordChange}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#9ca3af' : '#FF3D33',
              padding: 15,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 15,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                Change Password
              </Text>
            )}
          </Pressable>

          {/* Cancel Button */}
          <Pressable
            onPress={() => router.replace('/(auth)/login')}
            disabled={loading}
            style={{
              backgroundColor: '#f3f4f6',
              padding: 15,
              borderRadius: 8,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#d1d5db',
            }}
          >
            <Text style={{ color: '#374151', fontSize: 16, fontWeight: '600' }}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}