import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';
import { getUserSession } from '@/utils/session';
import MotherSearchModal from './MotherSearchModal';

// ✅ Types defined in the file
interface MotherResult {
  maternal_id: number;
  full_name: string;
  dob: string;
  age_years: number;
  family_code?: string;
  complete_address?: string;
  phone_number?: string;
  nhts_status: boolean;
}

const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#EC4899',
    primaryLight: '#FDF2F8',
    success: '#10B981',
    danger: '#EF4444',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

export default function CreateMaternalRecordScreen() {
  const router = useRouter();
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [selectedMother, setSelectedMother] = useState<MotherResult | null>(null);
  const [addressLandmark, setAddressLandmark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleBackPress = () => {
    router.back();
  };

  const handleMotherSelect = (mother: MotherResult) => {
    setSelectedMother(mother);
    setSearchModalVisible(false);
  };

  const handleClearSelection = () => {
    Alert.alert(
      'Clear Selection',
      'Are you sure you want to clear the selected mother?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setSelectedMother(null);
            setAddressLandmark('');
          },
        },
      ]
    );
  };

  const validateForm = (): boolean => {
    if (!selectedMother) {
      Alert.alert('Missing Information', 'Please select a mother to create a record for.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const session = await getUserSession();

      if (!session?.user_id) {
        Alert.alert('Error', 'User session not found. Please log in again.');
        return;
      }

      const payload = {
        maternal_id: selectedMother!.maternal_id,
        address_landmark: addressLandmark.trim() || null,
        personnel_id: session.user_id,
      };

      console.log('Creating maternal record:', payload);

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.MATERNAL_RECORD_CREATE}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          'Success!',
          `Maternal health record created successfully for ${selectedMother!.full_name}.`,
          [
            {
              text: 'View Record',
              onPress: () => {
                router.replace(`/(bhw)/maternal-health/${data.maternal_health_id}` as any);
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to create maternal record.');
      }
    } catch (error) {
      console.error('Create maternal record error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        title="Create Maternal Record"
        showBackButton={true}
        onBackPress={handleBackPress}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Instructions Card */}
          <View style={styles.instructionsCard}>
            <View style={styles.instructionsHeader}>
              <MaterialIcons name="info-outline" size={20} color={theme.colors.primary} />
              <ThemedText style={styles.instructionsTitle}>Getting Started</ThemedText>
            </View>
            <ThemedText style={styles.instructionsText}>
              Search for a female resident (WRA: 15-49 years old) to create a maternal health record.
            </ThemedText>
          </View>

          {/* Mother Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="pregnant-woman" size={20} color={theme.colors.textPrimary} />
              <ThemedText style={styles.sectionTitle}>Select Mother</ThemedText>
              <View style={styles.requiredBadge}>
                <ThemedText style={styles.requiredText}>Required</ThemedText>
              </View>
            </View>

            {selectedMother ? (
              <View style={styles.selectedMotherCard}>
                <View style={styles.selectedMotherHeader}>
                  <View style={styles.selectedMotherAvatar}>
                    <MaterialIcons name="pregnant-woman" size={24} color={theme.colors.primary} />
                  </View>
                  <View style={styles.selectedMotherInfo}>
                    <ThemedText style={styles.selectedMotherName}>
                      {selectedMother.full_name}
                    </ThemedText>
                    <ThemedText style={styles.selectedMotherMeta}>
                      {selectedMother.age} years old • DOB: {selectedMother.dob}
                    </ThemedText>
                    {selectedMother.family_code && (
                      <ThemedText style={styles.selectedMotherFamily}>
                        Family: {selectedMother.family_code}
                      </ThemedText>
                    )}
                  </View>
                  <TouchableOpacity onPress={handleClearSelection} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={24} color={theme.colors.danger} />
                  </TouchableOpacity>
                </View>

                {selectedMother.complete_address && (
                  <View style={styles.selectedMotherDetail}>
                    <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
                    <ThemedText style={styles.selectedMotherDetailText}>
                      {selectedMother.complete_address}
                    </ThemedText>
                  </View>
                )}

                {selectedMother.phone_number && (
                  <View style={styles.selectedMotherDetail}>
                    <Ionicons name="call-outline" size={16} color={theme.colors.textSecondary} />
                    <ThemedText style={styles.selectedMotherDetailText}>
                      {selectedMother.phone_number}
                    </ThemedText>
                  </View>
                )}
              </View>
            ) : (
              <TouchableOpacity
                style={styles.searchButton}
                onPress={() => setSearchModalVisible(true)}
              >
                <Ionicons name="search" size={20} color={theme.colors.primary} />
                <ThemedText style={styles.searchButtonText}>Search for Mother</ThemedText>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Address Landmark (Optional) */}
          {selectedMother && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="location-outline" size={20} color={theme.colors.textPrimary} />
                <ThemedText style={styles.sectionTitle}>Address Landmark</ThemedText>
                <View style={styles.optionalBadge}>
                  <ThemedText style={styles.optionalText}>Optional</ThemedText>
                </View>
              </View>

              <TextInput
                style={styles.textInput}
                placeholder="e.g., Near the church, beside the school..."
                value={addressLandmark}
                onChangeText={setAddressLandmark}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <ThemedText style={styles.helperText}>
                Add a landmark to help locate the mother's residence during home visits.
              </ThemedText>
            </View>
          )}
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!selectedMother || submitting) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!selectedMother || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                <ThemedText style={styles.submitButtonText}>Create Maternal Record</ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Mother Search Modal */}
      <MotherSearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onSelect={handleMotherSelect}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  instructionsCard: {
    backgroundColor: theme.colors.primaryLight,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}20`,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  instructionsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  instructionsText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  requiredBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  requiredText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.danger,
  },
  optionalBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  optionalText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  searchButtonText: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  selectedMotherCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedMotherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  selectedMotherAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  selectedMotherInfo: {
    flex: 1,
  },
  selectedMotherName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  selectedMotherMeta: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  selectedMotherFamily: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  selectedMotherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: theme.spacing.sm,
  },
  selectedMotherDetailText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    fontSize: 15,
    color: theme.colors.textPrimary,
    minHeight: 80,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.sm,
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.textMuted,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});