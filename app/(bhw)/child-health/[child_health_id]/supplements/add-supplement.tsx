import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  BackHandler,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';
import { getUserSession } from '@/utils/session';
import { useFocusEffect } from '@react-navigation/native';

const theme = {
  colors: {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#2563EB',
    vitaminA: '#F59E0B',
    vitaminALight: '#FEF3C7',
    deworming: '#8B5CF6',
    dewormingLight: '#EDE9FE',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    disabled: '#D1D5DB',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

export default function AddSupplementScreen() {
  const { child_health_id } = useLocalSearchParams<{ child_health_id: string }>();
  const router = useRouter();

  const [userSession, setUserSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [childInfo, setChildInfo] = useState<any>(null);
  const [supplements, setSupplements] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    supplement_id: null as number | null,
    age_in_months: 0,
  });

  useEffect(() => {
    loadData();
  }, [child_health_id]);

  const handleBackPress = () => {
    router.push(`/(bhw)/child-health/${child_health_id}/supplements` as any);
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBackPress();
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [child_health_id])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const session = await getUserSession();
      setUserSession(session);

      // Get child info
      const childResponse = await fetch(
        `${API_BASE_URL}/household_api/child-health-records/${child_health_id}/`
      );
      const childData = await childResponse.json();

      if (childData.success) {
        setChildInfo(childData.data);
        
        // Calculate current age in months
        const currentAge = calculateAgeInMonths(childData.data.dob);
        setFormData(prev => ({ ...prev, age_in_months: currentAge }));
      }

      // Get supplements list
      const supplementsResponse = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CHILD_HEALTH_SUPPLEMENTS}`
      );
      setSupplements(await supplementsResponse.json());

    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAgeInMonths = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
    return Math.max(0, ageInMonths);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.supplement_id) {
      Alert.alert('Required', 'Please select a supplement type');
      return false;
    }

    if (formData.age_in_months < 0) {
      Alert.alert('Invalid', 'Age cannot be negative');
      return false;
    }

    if (formData.age_in_months > 60) {
      Alert.alert('Invalid', 'Age exceeds program limits (>60 months)');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const selectedSupplement = supplements.find(s => s.supplement_id === formData.supplement_id);
    
    Alert.alert(
      'Confirm',
      `Add ${selectedSupplement?.supplement_name} given at ${formData.age_in_months} months old?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add', onPress: submitSupplement }
      ]
    );
  };

  const submitSupplement = async () => {
    try {
      setSubmitting(true);
      const personnelId = userSession?.user_id || 1;

      const payload = {
        personnel_id: personnelId,
        supplement_id: formData.supplement_id,
        age_in_months: formData.age_in_months,
      };

      console.log('📤 Submitting supplement:', payload);

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CHILD_SUPPLEMENTS_ADD(parseInt(child_health_id))}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert(
          'Success',
          'Supplement record added successfully!',
          [
            {
              text: 'Add Another',
              onPress: () => {
                setFormData({
                  supplement_id: null,
                  age_in_months: calculateAgeInMonths(childInfo.dob),
                });
              },
            },
            {
              text: 'View List',
              onPress: () => router.push(`/(bhw)/child-health/${child_health_id}/supplements` as any),
            },
          ]
        );
      } else {
        const errorMessage = data.error || 'Failed to add supplement';
        
        if (response.status === 409 || errorMessage.includes('already been given')) {
          Alert.alert(
            'Duplicate Record',
            'This supplement has already been given at this age.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Error', errorMessage);
        }
      }
    } catch (error) {
      console.error('❌ Submit error:', error);
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Add Supplement" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.vitaminA} />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Add Supplement" onBackPress={handleBackPress} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Child Info */}
          {childInfo && (
            <View style={styles.childInfoCard}>
              <MaterialIcons name="vaccines" size={20} color={theme.colors.vitaminA} />
              <View style={styles.childInfo}>
                <ThemedText style={styles.childName}>{childInfo.child_full_name}</ThemedText>
                <ThemedText style={styles.childSubtext}>
                  Current age: {formData.age_in_months} months
                </ThemedText>
              </View>
            </View>
          )}

          {/* Instructions */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
              <ThemedText style={styles.cardTitle}>Important</ThemedText>
            </View>

            <View style={styles.instructionList}>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                <ThemedText style={styles.instructionText}>
                  Select the supplement type (Vitamin A or Deworming Tablet)
                </ThemedText>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                <ThemedText style={styles.instructionText}>
                  Age is automatically calculated from the child&apos;s date of birth
                </ThemedText>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                <ThemedText style={styles.instructionText}>
                  Duplicate supplements for the same age cannot be added
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Form */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="edit-note" size={20} color={theme.colors.vitaminA} />
              <ThemedText style={styles.cardTitle}>Supplement Details</ThemedText>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Supplement Type *</ThemedText>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.supplement_id}
                  onValueChange={(value) => updateFormData('supplement_id', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select supplement" value={null} />
                  {supplements.map((supplement) => (
                    <Picker.Item
                      key={supplement.supplement_id}
                      label={supplement.supplement_name}
                      value={supplement.supplement_id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Age When Given</ThemedText>
              <View style={styles.ageDisplay}>
                <MaterialIcons name="child-care" size={20} color={theme.colors.textSecondary} />
                <ThemedText style={styles.ageText}>
                  {formData.age_in_months} months old
                </ThemedText>
              </View>
              <ThemedText style={styles.helperText}>
                Age is calculated automatically based on child&apos;s date of birth
              </ThemedText>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[styles.submitButton, (submitting || !formData.supplement_id) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting || !formData.supplement_id}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              <ThemedText style={styles.submitButtonText}>Add Supplement</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  bottomSpacer: {
    height: theme.spacing.xxl,
  },
  childInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.vitaminALight,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.vitaminA,
    gap: theme.spacing.md,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  childSubtext: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  instructionList: {
    gap: theme.spacing.md,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  instructionText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  pickerContainer: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  picker: {
    color: theme.colors.textPrimary,
    backgroundColor: 'transparent',
  },
  ageDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  ageText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.vitaminA,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.disabled,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});