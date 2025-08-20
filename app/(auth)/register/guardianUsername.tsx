import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useRegister } from '@/context/registercontext';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '@/constants/apiConfig';

const BRAND = '#FF3D33';
const INK = '#1e293b';
const MUTED = '#64748b';
const CANVAS = '#f4f6f8';
const SURFACE = '#ffffff';
const BORDER = '#e5e7eb';
const NOTE_BG = '#fff7ed';
const NOTE_BORDER = '#ff6b35';

export default function GuardianUsername() {
  const [guardianUsername, setGuardianUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const { setFormData } = useRegister();
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);

  const handleVerifyGuardian = async () => {
    if (!guardianUsername.trim()) {
      Alert.alert('Error', 'Please enter a guardian username');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-guardian/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guardian_username: guardianUsername.trim() }),
      });
      const data = await response.json();

      if (response.ok && data.exists) {
        setFormData((prev: any) => ({
          ...prev,
          guardian_username: guardianUsername.trim(),
          guardian_type: null, // set next step later
        }));
        Alert.alert('Guardian Found', 'Guardian username verified successfully.', [
          { text: 'Continue', onPress: () => router.push('/(auth)/register/guardianDocumentType') },
        ]);
      } else {
        Alert.alert(
          'Guardian Not Found',
          'The guardian username you entered does not exist in our system or is not verified. Please check the username and try again.'
        );
      }
    } catch (error) {
      console.error('Guardian verification error:', error);
      Alert.alert('Error', 'Failed to verify guardian username. Please check your internet connection and try again.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Ensures the keyboard doesn't force a blur/re-layout */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Ensures taps on input persist even inside scrollable areas */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.page}>
            {/* Top Bar */}
            <View style={styles.topbar}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Go back">
                <Ionicons name="arrow-back" size={22} color={INK} />
              </TouchableOpacity>
              <ThemedText style={styles.topbarTitle}>Guardian Verification</ThemedText>
              <View style={{ width: 32 }} />
            </View>

            {/* Content Column */}
            <View style={styles.content}>
              {/* Intro */}
              <View style={styles.hero}>
                <View style={styles.heroIcon}>
                  <Ionicons name="person-circle-outline" size={60} color={BRAND} />
                </View>
                <ThemedText style={styles.title}>Verify your Guardian</ThemedText>
                <ThemedText style={styles.subtitle}>
                  Enter your guardian’s username to confirm they’re registered and verified.
                </ThemedText>
              </View>

              {/* Field Card */}
              <View style={styles.card}>
                <Text style={styles.label}>Guardian Username</Text>

                <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
                  {/* Make the icon non-interactive so it never steals taps */}
                  <Ionicons
                    name="at-outline"
                    size={18}
                    color={focused ? BRAND : '#9aa2ad'}
                    style={styles.inputIcon}
                    pointerEvents="none"
                  />
                  <TextInput
                    ref={inputRef}
                    style={styles.input}
                    placeholder="e.g. juan.delacruz"
                    value={guardianUsername}
                    onChangeText={setGuardianUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholderTextColor="#9aa2ad"
                    // Hints to the OS—does not change functionality
                    textContentType="username"
                    autoComplete="username"
                    returnKeyType="done"
                    testID="guardian-username-input"
                  />
                </View>

                <Text style={styles.helperText}>Use the exact username your guardian used during registration.</Text>
              </View>

              {/* Primary Action */}
              <TouchableOpacity
                style={[styles.verifyButton, loading && styles.disabledButton]}
                onPress={handleVerifyGuardian}
                disabled={loading}
                activeOpacity={0.9}
                accessibilityLabel="Verify guardian username"
                testID="verify-guardian-button"
              >
                {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.verifyButtonText}>Verify Guardian</Text>}
              </TouchableOpacity>

              {/* Info Callout */}
              <View style={styles.infoNote} accessibilityRole="summary">
                <Ionicons name="information-circle-outline" size={20} color={NOTE_BORDER} />
                <Text style={styles.infoText}>
                  Your guardian must already be registered and verified in the system for this step to succeed.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CANVAS },
  scrollContent: { flexGrow: 1 },
  page: { flex: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },

  // Top bar
  topbar: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backButton: { height: 32, width: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  topbarTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: INK, letterSpacing: 0.2 },

  // Center column
  content: { width: '100%', maxWidth: 560, alignSelf: 'center' },

  // Intro/Hero
  hero: { alignItems: 'center', marginTop: 8, marginBottom: 24, paddingHorizontal: 8 },
  heroIcon: {
    marginBottom: 10,
    backgroundColor: '#ffe9e7',
    height: 64,
    width: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', color: INK, marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 14.5, color: MUTED, textAlign: 'center', lineHeight: 20, paddingHorizontal: 10 },

  // Card container for field
  card: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
    marginBottom: 16,
  },

  // Label + input
  label: { fontSize: 14.5, fontWeight: '700', color: INK, marginBottom: 8, letterSpacing: 0.2 },
  inputWrap: {
    position: 'relative',
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  // Keep focus ring but avoid layout-janky elevation/shadows on Android
  inputWrapFocused: {
    borderColor: BRAND,
  },
  inputIcon: { position: 'absolute', left: 12, top: 16 },
  input: { paddingVertical: 14, paddingHorizontal: 40, fontSize: 16, color: '#374151' },
  helperText: { fontSize: 13, color: '#6b7280', marginTop: 8, lineHeight: 18 },

  // Primary button
  verifyButton: {
    backgroundColor: BRAND,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
  disabledButton: { backgroundColor: '#9ca3af', shadowOpacity: 0 },
  verifyButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },

  // Info callout
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NOTE_BG,
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: NOTE_BORDER,
  },
  infoText: { flex: 1, fontSize: 13.5, color: '#b45309', marginLeft: 10, lineHeight: 19 },
});
