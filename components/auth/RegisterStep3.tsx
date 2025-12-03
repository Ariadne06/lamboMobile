import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  Alert,
  Pressable,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRegister } from '@/context/registercontext';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';
import RegistrationReviewModal from '@/components/ui/RegistrationReviewModal';

export default function RegisterStep3() {
  const { 
    formData, 
    setFormData, 
    sitioOptions, 
    religionOptions, 
    civilStatusOptions, 
    educationOptions, 
    occupationOptions, 
    nationalityOptions, 
    employmentStatusOptions 
  } = useRegister();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'available' | 'taken' | 'checking' | null>(null);
  const [usernameMessage, setUsernameMessage] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce timer for username checking
  useEffect(() => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Reset if username is too short
    if (!formData.username || formData.username.trim().length < 3) {
      setUsernameStatus(null);
      setUsernameMessage('');
      setIsCheckingUsername(false);
      return;
    }

    // Debounce: wait 1 second after user stops typing
    const timer = setTimeout(() => {
      checkUsernameAvailability(formData.username.trim());
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [formData.username]);

  const checkUsernameAvailability = async (username: string) => {
    abortControllerRef.current = new AbortController();
    setIsCheckingUsername(true);
    setUsernameStatus('checking');
    
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CHECK_USERNAME}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
        signal: abortControllerRef.current.signal,
      });

      const data = await response.json();
      
      if (data.available) {
        setUsernameStatus('available');
        setUsernameMessage('✓ Username is available');
      } else {
        setUsernameStatus('taken');
        setUsernameMessage('✗ Username is already taken');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Username check was cancelled');
        return;
      }
      
      console.error('Username check error:', error);
      setUsernameStatus(null);
      setUsernameMessage('Could not verify username');
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleNext = () => {
    // Username validation
    if (!formData.username?.trim()) {
      Alert.alert('Missing Info', 'Please enter a username.');
      return;
    }
    
    if (formData.username.length < 3) {
      Alert.alert('Invalid Username', 'Username must be at least 3 characters long.');
      return;
    }

    // Check if username is taken
    if (usernameStatus === 'taken') {
      Alert.alert('Username Taken', 'This username is already taken. Please choose another one.');
      return;
    }

    // Password validation
    if (!formData.password?.trim()) {
      Alert.alert('Missing Info', 'Please enter a password.');
      return;
    }
    
    if (formData.password.length < 8) {
      Alert.alert('Invalid Password', 'Password must be at least 8 characters long.');
      return;
    }
    
    // Confirm password validation
    if (!formData.confirm_password?.trim()) {
      Alert.alert('Missing Info', 'Please confirm your password.');
      return;
    }
    
    if (formData.password !== formData.confirm_password) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    
    // Show review modal instead of navigating directly
    setShowReviewModal(true);
  };

  const handleConfirmReview = () => {
    setShowReviewModal(false);
    router.push('/(auth)/register/chooseDocument');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <View style={styles.formCard}>
          <ThemedText style={styles.formTitle}>Account Information</ThemedText>
          <ThemedText style={styles.formSubtitle}>Set your username and password</ThemedText>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Username</ThemedText>
            <View style={styles.usernameContainer}>
              <TextInput
                placeholder="Username"
                value={formData.username}
                onChangeText={text => setFormData({ ...formData, username: text })}
                style={styles.input}
                autoCapitalize="none"
              />
              {isCheckingUsername && (
                <ActivityIndicator 
                  size="small" 
                  color="#FF3D33" 
                  style={styles.checkingIndicator}
                />
              )}
            </View>
            
            {usernameMessage && !isCheckingUsername && (
              <ThemedText 
                style={[
                  styles.usernameMessage,
                  usernameStatus === 'available' ? styles.availableMessage : styles.takenMessage
                ]}
              >
                {usernameMessage}
              </ThemedText>
            )}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Password</ThemedText>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Password"
                value={formData.password}
                onChangeText={text => setFormData({ ...formData, password: text })}
                style={styles.passwordInput}
                secureTextEntry={!showPassword} 
                autoCapitalize="none"
              />
              
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Confirm Password</ThemedText>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Confirm Password"
                value={formData.confirm_password}
                onChangeText={text => setFormData({ ...formData, confirm_password: text })}
                style={styles.passwordInput}
                secureTextEntry={!showConfirmPassword} 
              />
             
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          <Pressable
            onPress={handleNext}
            style={[
              styles.nextButton,
              usernameStatus === 'taken' && styles.disabledButton
            ]}
            disabled={usernameStatus === 'taken'}
          >
            <ThemedText style={styles.nextButtonText}>
              Review & Continue
            </ThemedText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Review Modal */}
      <RegistrationReviewModal
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onConfirm={handleConfirmReview}
        formData={formData}
        sitioOptions={sitioOptions}
        religionOptions={religionOptions}
        civilStatusOptions={civilStatusOptions}
        educationOptions={educationOptions}
        occupationOptions={occupationOptions}
        nationalityOptions={nationalityOptions}
        employmentStatusOptions={employmentStatusOptions}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    margin: 16,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#FF3D33',
    marginBottom: 2,
    textAlign: 'center' as const,
    letterSpacing: 0.5,
  },
  formSubtitle: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 18,
    textAlign: 'center' as const,
  },
  inputGroup: {
    marginBottom: 14,
    width: '100%',
  },
  usernameContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    paddingRight: 40,
    backgroundColor: '#f9fafb',
    fontSize: 15,
    width: '100%',
    textAlign: 'left',
  },
  checkingIndicator: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  usernameMessage: {
    fontSize: 13,
    marginTop: 4,
    marginLeft: 2,
  },
  availableMessage: {
    color: '#10b981',
  },
  takenMessage: {
    color: '#ef4444',
  },
  passwordContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    marginBottom: 2,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 15,
  },
  eyeButton: {
    padding: 12,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 4,
    marginLeft: 2,
  },
  nextButton: {
    backgroundColor: '#FF3D33',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});