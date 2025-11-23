import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';
import { ClearancePurpose, fetchClearancePurposes } from '@/utils/documentService';
import { getUserSession } from '@/utils/session';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function CreateRequestScreen() {
  const router = useRouter();
  const [purpose, setPurpose] = useState('');
  const [selectedPurposeId, setSelectedPurposeId] = useState<number | null>(null);
  const [cost, setCost] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  
  // API data states
  const [clearancePurposes, setClearancePurposes] = useState<ClearancePurpose[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from API on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const purposes = await fetchClearancePurposes();
        setClearancePurposes(purposes);
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', 'Failed to load clearance purposes. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Update cost calculation based on selected purpose
  useEffect(() => {
    const selectedPurpose = clearancePurposes.find(p => p.purpose_name === purpose);
    if (selectedPurpose && selectedPurpose.fee_amount) {
      setCost(parseFloat(selectedPurpose.fee_amount));
      setSelectedPurposeId(selectedPurpose.other_clearance_id);
    } else {
      setCost(0);
      setSelectedPurposeId(null);
    }
  }, [purpose, clearancePurposes]);

  const handleSubmit = async () => {
    // Validation
    if (!purpose || !selectedPurposeId) {
      Alert.alert('Validation Error', 'Please select a purpose');
      return;
    }

    setSubmitting(true);
    try {
      // Get user_id from session
      const session = await getUserSession();
      if (!session || !session.user_id) {
        Alert.alert('Error', 'Unable to identify user. Please login again.');
        router.replace('/(auth)/login');
        return;
      }

      console.log('📤 Submitting clearance application:', {
        resident_id: session.user_id,
        other_clearance_id: selectedPurposeId,
      });

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CREATE_CLEARANCE_APPLICATION}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resident_id: session.user_id,
          other_clearance_id: selectedPurposeId,
        }),
      });

      const data = await response.json();
      console.log('📥 API Response:', data);

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to submit request');
      }

      // Success
      Alert.alert(
        '✅ Success',
        `Your clearance application has been submitted successfully!\n\nApplication ID: ${data.application_id || data.id || 'N/A'}\n\nYou will receive a notification once your request is processed.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Error submitting request:', error);
      Alert.alert(
        '❌ Submission Failed',
        error.message || 'Failed to submit your clearance request. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF3D33" />
        <ThemedText style={{ marginTop: 10 }}>Loading clearance purposes...</ThemedText>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader title="Create Request" />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.form}>
        {/* Purpose */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>Select Purpose *</ThemedText>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={purpose}
              onValueChange={setPurpose}
              style={styles.picker}
              dropdownIconColor="#FF3D33"
            >
              <Picker.Item label="Select purpose" value="" />
              {clearancePurposes.map((item) => (
                <Picker.Item label={item.purpose_name} value={item.purpose_name} key={item.other_clearance_id} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Fee Preview */}
        {purpose && (
          <View style={styles.feePreviewBox}>
            <View style={styles.feePreviewHeader}>
              <ThemedText style={styles.feePreviewTitle}>Payment Summary</ThemedText>
            </View>
            <View style={styles.feePreviewDivider} />
            <View style={styles.feePreviewRow}>
              <ThemedText style={styles.feePreviewLabel}>Purpose:</ThemedText>
              <ThemedText style={styles.feePreviewValue}>{purpose}</ThemedText>
            </View>
            <View style={styles.feePreviewRow}>
              <ThemedText style={styles.feePreviewLabel}>Processing Fee:</ThemedText>
              <ThemedText style={styles.feePreviewAmount}>₱{cost.toFixed(2)}</ThemedText>
            </View>
            <View style={styles.feePreviewDivider} />
            <View style={styles.feePreviewRow}>
              <ThemedText style={styles.feePreviewTotalLabel}>Total Amount:</ThemedText>
              <ThemedText style={styles.feePreviewTotalAmount}>₱{cost.toFixed(2)}</ThemedText>
            </View>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <ThemedText style={styles.submitButtonText}>Submit Request</ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 12,
    marginTop: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
    color: '#1e293b',
  },
  pickerWrapper: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    color: '#1e293b',
  },
  feePreviewBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  feePreviewHeader: {
    marginBottom: 12,
  },
  feePreviewTitle: {
    fontSize: 16,
    color: '#334155',
    fontWeight: 'bold',
  },
  feePreviewDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  feePreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  feePreviewLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    flex: 1,
  },
  feePreviewValue: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
    flex: 1.5,
    textAlign: 'right',
  },
  feePreviewAmount: {
    fontSize: 14,
    color: '#FF3D33',
    fontWeight: '600',
  },
  feePreviewTotalLabel: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  feePreviewTotalAmount: {
    fontSize: 20,
    color: '#FF3D33',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#FF3D33',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    elevation: 1,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
});
