import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  BackHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL } from '@/constants/apiConfig';
import { getUserSession } from '@/utils/session';

const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#DC3545',
    primaryLight: '#FCE8EC',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    error: '#EF4444',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

export default function AddMedicalHistoryScreen() {
  const { maternal_health_id } = useLocalSearchParams<{ maternal_health_id: string }>();
  const router = useRouter();

  const [userSession, setUserSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [maternalName, setMaternalName] = useState('');
  const [medicalCondition, setMedicalCondition] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [maternal_health_id]);

  const handleBackPress = () => {
    router.push(`/(bhw)/maternal-health/${maternal_health_id}/medical-surgical-history` as any);
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBackPress();
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [maternal_health_id])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const session = await getUserSession();
      setUserSession(session);

      const response = await fetch(
        `${API_BASE_URL}/household_api/maternal-health-records/${maternal_health_id}/`
      );
      const data = await response.json();

      if (data.success) {
        setMaternalName(data.data.full_name || '');
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load maternal information');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!medicalCondition.trim()) {
      setError('Medical condition is required');
      return false;
    }

    if (medicalCondition.trim().length < 3) {
      setError('Medical condition must be at least 3 characters');
      return false;
    }

    if (medicalCondition.trim().length > 500) {
      setError('Medical condition must be less than 500 characters');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', error);
      return;
    }

    Alert.alert(
      'Confirm',
      `Add medical condition?\n\n"${medicalCondition.trim()}"`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add', onPress: submitRecord }
      ]
    );
  };

  const submitRecord = async () => {
    try {
      setSubmitting(true);
      const personnelId = userSession?.user_id || 1;

      const payload = {
        personnel_id: personnelId,
        medical_condition: medicalCondition.trim(),
      };

      console.log('📤 Submitting medical condition:', payload);

      const response = await fetch(
        `${API_BASE_URL}/household_api/maternal-health-records/${maternal_health_id}/medical-conditions/add/`,
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
          'Medical condition added successfully',
          [
            {
              text: 'Add Another',
              onPress: () => {
                setMedicalCondition('');
                setError('');
              }
            },
            {
              text: 'View Records',
              onPress: () => handleBackPress(),
              style: 'default'
            }
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to add medical condition');
      }
    } catch (error) {
      console.error('❌ Submit error:', error);
      Alert.alert('Error', 'Network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Add Medical Condition" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Add Medical Condition" onBackPress={handleBackPress} />

      {/* Maternal Name Banner */}
      {maternalName && (
        <View style={styles.bannerCard}>
          <Ionicons name="woman" size={24} color={theme.colors.primary} />
          <View style={styles.bannerInfo}>
            <ThemedText style={styles.maternalName}>{maternalName}</ThemedText>
            <ThemedText style={styles.bannerSubtext}>Add Medical Condition</ThemedText>
          </View>
        </View>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Info Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.primaryLight }]}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.infoTitle}>Medical Condition Information</ThemedText>
          </View>
          <ThemedText style={styles.infoText}>
            Record any pre-existing medical conditions, chronic illnesses, or health concerns that may affect the pregnancy.
          </ThemedText>
          <ThemedText style={styles.infoExample}>
            Examples: Diabetes, Hypertension, Asthma, Heart Disease, Thyroid Disorder, etc.
          </ThemedText>
        </View>

        {/* Medical Condition Input */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="medical" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Medical Condition *</ThemedText>
          </View>

          <TextInput
            style={[styles.textArea, error && styles.inputError]}
            value={medicalCondition}
            onChangeText={(text) => {
              setMedicalCondition(text);
              setError('');
            }}
            placeholder="Enter medical condition or illness (e.g., Gestational Diabetes)"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor={theme.colors.textMuted}
            maxLength={500}
          />

          {error ? (
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          ) : (
            <ThemedText style={styles.helperText}>
              {medicalCondition.length}/500 characters
            </ThemedText>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Ionicons name="add-circle" size={20} color="#FFFFFF" />
          <ThemedText style={styles.submitButtonText}>
            {submitting ? 'Adding...' : 'Add Medical Condition'}
          </ThemedText>
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
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.md,
  },
  bannerInfo: {
    flex: 1,
  },
  maternalName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  bannerSubtext: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
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
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  infoExample: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  textArea: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    fontSize: 15,
    color: theme.colors.textPrimary,
    minHeight: 120,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    textAlign: 'right',
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
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});