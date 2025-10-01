import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '@/constants/apiConfig';
import { ErrorModal } from '@/components/ui/ErrorModal';

export default function RejectionReRegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const message =
    (params.message as string) || 'Your application was rejected. Please re-register.';
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    message: '',
    icon: 'close-circle' as keyof typeof Ionicons.glyphMap,
    iconColor: '#ef4444',
  });
  const [processing, setProcessing] = useState(false);
  const reviewNotes = params.review_notes as string | undefined;

  const handleReRegister = async () => {
    try {
      Alert.alert(
        'Confirm Re-Register',
        'This will delete your previous registration so you can start over. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, Re-Register',
            style: 'destructive',
            onPress: async () => {
              try {
                setProcessing(true);
                const response = await fetch(`${API_BASE_URL}/api/re-register-resident/`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    resident_id: Array.isArray(params.resident_id)
                      ? params.resident_id[0]
                      : (params.resident_id as string),
                  }),
                });
                const data = await response.json();
                if (data.success) {
                  Alert.alert(
                    'Re-Registration Complete',
                    'Your previous registration has been deleted. You may now register again.',
                    [
                      {
                        text: 'OK',
                        onPress: () => router.replace('/(auth)/register/userType'),
                      },
                    ]
                  );
                } else {
                  setErrorModal({
                    visible: true,
                    title: 'Re-Registration Failed',
                    message: data.message || 'Failed to re-register. Please try again.',
                    icon: 'close-circle',
                    iconColor: '#ef4444',
                  });
                }
              } catch {
                setErrorModal({
                  visible: true,
                  title: 'Network Error',
                  message: 'Network error occurred. Please try again.',
                  icon: 'close-circle',
                  iconColor: '#ef4444',
                });
              } finally {
                setProcessing(false);
              }
            },
          },
        ]
      );
    } catch {
      setErrorModal({
        visible: true,
        title: 'Unexpected Error',
        message: 'Something went wrong. Please try again.',
        icon: 'close-circle',
        iconColor: '#ef4444',
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={[styles.content, styles.centerContent]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Ionicons name="close-circle" size={80} color="#ef4444" />
          <Text style={styles.title}>Registration Rejected</Text>
        </View>
        
        {reviewNotes && (
          <View style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <Ionicons name="information-circle" size={18} color="#ea580c" />
              <Text style={styles.notesTitle}>Review Notes</Text>
            </View>
            <Text style={styles.notesText}>{reviewNotes}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.dangerBtn, processing && styles.btnDisabled]}
          onPress={handleReRegister}
          disabled={processing}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Start a new registration"
          accessibilityState={{ disabled: processing, busy: processing }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.dangerBtnText}>Start New Registration</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.title}
        message={errorModal.message}
        icon={errorModal.icon}
        iconColor={errorModal.iconColor}
        actions={[
          {
            text: 'OK',
            onPress: () => setErrorModal((prev) => ({ ...prev, visible: false })),
          },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 16,
    flexGrow: 1,
  },
  centerContent: {
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ef4444',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  dangerBtn: {
    backgroundColor: '#FF3D33',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  dangerBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.7,
  },
  notesCard: {
    width: '100%',
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fdba74',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
    marginBottom: 6,
  },
  notesTitle: {
    color: '#ea580c',
    fontWeight: 'bold',
    fontSize: 14,
  },
  notesText: {
    color: '#ea580c',
    fontSize: 15,
    lineHeight: 20,
  },
});
