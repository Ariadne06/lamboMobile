import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TextInput,
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
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';
import { getUserSession } from '@/utils/session';
import { useFocusEffect } from '@react-navigation/native';

const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#2563EB',
    primaryLight: '#EFF6FF',
    success: '#10B981',
    successLight: '#ECFDF5',
    warning: '#F59E0B',
    danger: '#EF4444',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    disabled: '#D1D5DB',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

export default function AddGrowthRecordScreen() {
  const { child_health_id } = useLocalSearchParams<{ child_health_id: string }>();
  const router = useRouter();

  const [userSession, setUserSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [childInfo, setChildInfo] = useState<any>(null);

  const [formData, setFormData] = useState({
    weight_kg: '',
    height_cm: '',
    temp_c: '',
    resp_rate: '',
    pulse_rate: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [child_health_id]);

  const handleBackPress = () => {
    router.push(`/(bhw)/child-health/${child_health_id}/growth-monitoring` as any);
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
      const response = await fetch(
        `${API_BASE_URL}/household_api/child-health-records/${child_health_id}/`
      );
      const data = await response.json();

      if (data.success) {
        setChildInfo(data.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load child information');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
    return Math.max(0, ageInMonths);
  };

  const validateForm = () => {
  if (!formData.weight_kg || parseFloat(formData.weight_kg) <= 0) {
    Alert.alert('Required', 'Please enter a valid weight');
    return false;
  }

  if (!formData.height_cm || parseFloat(formData.height_cm) <= 0) {
    Alert.alert('Required', 'Please enter a valid height');
    return false;
  }

  if (!formData.temp_c || parseFloat(formData.temp_c) < 30 || parseFloat(formData.temp_c) > 45) {
    Alert.alert('Required', 'Please enter a valid temperature (30-45°C)');
    return false;
  }

  if (!formData.resp_rate || parseInt(formData.resp_rate) < 10 || parseInt(formData.resp_rate) > 100) {
    Alert.alert('Required', 'Please enter a valid respiratory rate (10-100 bpm)');
    return false;
  }

  if (!formData.pulse_rate || parseInt(formData.pulse_rate) < 40 || parseInt(formData.pulse_rate) > 200) {
    Alert.alert('Required', 'Please enter a valid pulse rate (40-200 bpm)');
    return false;
  }

  return true;
};

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const personnelId = userSession?.user_id || 1;

      // ❌ REMOVE age calculation - SQL function does it
      // const ageInMonths = calculateAge(childInfo.dob);

      const payload = {
        personnel_id: personnelId,
        // ❌ REMOVE: age_in_months: ageInMonths,
        weight_kg: parseFloat(formData.weight_kg),
        height_cm: parseFloat(formData.height_cm),
        temp_c: parseFloat(formData.temp_c), // ✅ NOW REQUIRED
        resp_rate: parseInt(formData.resp_rate), // ✅ NOW REQUIRED
        pulse_rate: parseInt(formData.pulse_rate), // ✅ NOW REQUIRED
        notes: formData.notes || null,
      };

      console.log('📤 Submitting growth record:', payload);

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CHILD_GROWTH_MONITORING_ADD}${child_health_id}/growth-monitoring/add/`,
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
          'Growth monitoring record added!',
          [
            {
              text: 'OK',
              onPress: () => router.push(`/(bhw)/child-health/${child_health_id}/growth-monitoring` as any),
            },
          ]
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to add record');
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
        <CustomHeader title="Add Growth Record" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.success} />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Add Growth Record" onBackPress={handleBackPress} />

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
              <MaterialIcons name="child-care" size={20} color={theme.colors.success} />
              <View style={styles.childInfo}>
                <ThemedText style={styles.childName}>{childInfo.child_full_name}</ThemedText>
                <ThemedText style={styles.childAge}>
                  Current Age: {calculateAge(childInfo.dob)} months
                </ThemedText>
              </View>
            </View>
          )}

          {/* Required Measurements */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="monitor-weight" size={20} color={theme.colors.primary} />
              <ThemedText style={styles.cardTitle}>Required Measurements</ThemedText>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Weight (kg) *</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.weight_kg}
                onChangeText={(value) => updateFormData('weight_kg', value)}
                placeholder="e.g., 12.5"
                keyboardType="decimal-pad"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Height (cm) *</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.height_cm}
                onChangeText={(value) => updateFormData('height_cm', value)}
                placeholder="e.g., 85.5"
                keyboardType="decimal-pad"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="favorite" size={20} color={theme.colors.danger} />
              <ThemedText style={styles.cardTitle}>Vital Signs (Required)</ThemedText>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Temperature (°C) *</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.temp_c}
                onChangeText={(value) => updateFormData('temp_c', value)}
                placeholder="e.g., 36.5"
                keyboardType="decimal-pad"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Respiratory Rate (bpm) *</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.resp_rate}
                onChangeText={(value) => updateFormData('resp_rate', value)}
                placeholder="e.g., 30"
                keyboardType="number-pad"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Pulse Rate (bpm) *</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.pulse_rate}
                onChangeText={(value) => updateFormData('pulse_rate', value)}
                placeholder="e.g., 110"
                keyboardType="number-pad"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
          </View>

          {/* Notes */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="document-text-outline" size={20} color={theme.colors.textSecondary} />
              <ThemedText style={styles.cardTitle}>Notes (Optional)</ThemedText>
            </View>

            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(value) => updateFormData('notes', value)}
              placeholder="Any additional observations..."
              multiline
              numberOfLines={4}
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <ThemedText style={styles.submitButtonText}>Save Growth Record</ThemedText>
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
    backgroundColor: theme.colors.successLight,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.success,
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
  childAge: {
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
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
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
    backgroundColor: theme.colors.success,
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