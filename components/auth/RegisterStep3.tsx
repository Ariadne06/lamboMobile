import React from 'react';
import {
  View,
  TextInput,
  Alert,
  Pressable,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRegister } from '@/context/registercontext';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';

export default function RegisterStep3() {
  const { formData, setFormData } = useRegister();

  const handleNext = () => {
    if (!formData.username || !formData.password || !formData.confirm_password) {
      Alert.alert('Missing Info', 'Please fill out all fields.');
      return;
    }
    if (formData.password !== formData.confirm_password) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
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
            <TextInput
              placeholder="Username"
              value={formData.username}
              onChangeText={text => setFormData({ ...formData, username: text })}
              style={styles.input}
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Password</ThemedText>
            <TextInput
              placeholder="Password"
              value={formData.password}
              onChangeText={text => setFormData({ ...formData, password: text })}
              style={styles.input}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Confirm Password</ThemedText>
            <TextInput
              placeholder="Confirm Password"
              value={formData.confirm_password}
              onChangeText={text => setFormData({ ...formData, confirm_password: text })}
              style={styles.input}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <Pressable
            onPress={handleNext}
            style={styles.nextButton}
          >
            <ThemedText style={styles.nextButtonText}>
              Next: Choose Document
            </ThemedText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
    fontSize: 15,
    width: '100%',
    marginBottom: 2,
    textAlign: 'left',
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 4,
    marginLeft: 2,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    backgroundColor: 'transparent',
  },
  nextButton: {
    backgroundColor: '#FF3D33',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});