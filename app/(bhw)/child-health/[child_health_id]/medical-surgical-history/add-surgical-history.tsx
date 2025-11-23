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
import DateTimePicker from '@react-native-community/datetimepicker';

const theme = {
  colors: {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#2563EB',
    warning: '#F59E0B',
    warningLight: '#FFF3CD',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    disabled: '#D1D5DB',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

export default function AddSurgicalHistoryScreen() {
  const { child_health_id } = useLocalSearchParams<{ child_health_id: string }>();
  const router = useRouter();

  const [userSession, setUserSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [childInfo, setChildInfo] = useState<any>(null);
  
  const [surgicalHistoryName, setSurgicalHistoryName] = useState('');
  const [dateOfSurgery, setDateOfSurgery] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadData();
  }, [child_health_id]);

  const handleBackPress = () => {
    router.push(`/(bhw)/child-health/${child_health_id}/medical-surgical-history` as any);
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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateOfSurgery(selectedDate);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Select surgery date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const validateForm = () => {
    const trimmed = surgicalHistoryName.trim();
    
    if (!trimmed) {
      Alert.alert('Required', 'Please enter the surgical procedure name');
      return false;
    }

    if (trimmed.length < 2) {
      Alert.alert('Invalid', 'Surgical procedure name must be at least 2 characters');
      return false;
    }

    if (!dateOfSurgery) {
      Alert.alert('Required', 'Please select the date of surgery');
      return false;
    }

    if (dateOfSurgery > new Date()) {
      Alert.alert('Invalid Date', 'Surgery date cannot be in the future');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    Alert.alert(
      'Confirm',
      `Add "${surgicalHistoryName.trim()}" performed on ${formatDate(dateOfSurgery)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add', onPress: submitSurgicalHistory }
      ]
    );
  };

  const submitSurgicalHistory = async () => {
    try {
      setSubmitting(true);
      const personnelId = userSession?.user_id || 1;

      const payload = {
        personnel_id: personnelId,
        surgical_history_name: surgicalHistoryName.trim(),
        date_of_surgery: dateOfSurgery!.toISOString().split('T')[0],
      };

      console.log('📤 Submitting surgical history:', payload);

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CHILD_SURGICAL_HISTORY_ADD(parseInt(child_health_id))}`,
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
          'Surgical history added successfully!',
          [
            {
              text: 'Add Another',
              onPress: () => {
                setSurgicalHistoryName('');
                setDateOfSurgery(null);
              },
            },
            {
              text: 'View List',
              onPress: () => router.push(`/(bhw)/child-health/${child_health_id}/medical-surgical-history` as any),
            },
          ]
        );
      } else {
        const errorMessage = data.error || 'Failed to add surgical history';
        
        // Handle duplicate error
        if (response.status === 409 || errorMessage.includes('already been recorded')) {
          Alert.alert(
            'Duplicate Record',
            'This surgical procedure has already been recorded for this date.',
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
        <CustomHeader title="Add Surgical History" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.warning} />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Add Surgical History" onBackPress={handleBackPress} />

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
              <MaterialIcons name="local-hospital" size={20} color={theme.colors.warning} />
              <View style={styles.childInfo}>
                <ThemedText style={styles.childName}>{childInfo.child_full_name}</ThemedText>
                <ThemedText style={styles.childSubtext}>Surgical History</ThemedText>
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
                  Enter the surgical procedure name (e.g., Appendectomy, Tonsillectomy)
                </ThemedText>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                <ThemedText style={styles.instructionText}>
                  Select the exact date when the surgery was performed
                </ThemedText>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                <ThemedText style={styles.instructionText}>
                  Duplicate surgeries for the same date cannot be added
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Input Form */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="edit-note" size={20} color={theme.colors.warning} />
              <ThemedText style={styles.cardTitle}>Surgical Procedure Details</ThemedText>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Procedure Name *</ThemedText>
              <TextInput
                style={styles.input}
                value={surgicalHistoryName}
                onChangeText={setSurgicalHistoryName}
                placeholder="e.g., Appendectomy, Cleft Lip Repair"
                placeholderTextColor={theme.colors.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <ThemedText style={styles.helperText}>
                Character count: {surgicalHistoryName.trim().length}
              </ThemedText>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Date of Surgery *</ThemedText>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <ThemedText style={[
                  styles.dateButtonText,
                  dateOfSurgery && styles.dateButtonTextFilled
                ]}>
                  {formatDate(dateOfSurgery)}
                </ThemedText>
                <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={dateOfSurgery || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}

            {/* Examples */}
            <View style={styles.examplesContainer}>
              <ThemedText style={styles.examplesTitle}>Common Examples:</ThemedText>
              <View style={styles.examplesGrid}>
                {['Appendectomy', 'Tonsillectomy', 'Hernia Repair', 'Circumcision', 'Cleft Lip Repair'].map((example) => (
                  <TouchableOpacity
                    key={example}
                    style={styles.exampleChip}
                    onPress={() => setSurgicalHistoryName(example)}
                  >
                    <ThemedText style={styles.exampleText}>{example}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (submitting || !surgicalHistoryName.trim() || !dateOfSurgery) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={submitting || !surgicalHistoryName.trim() || !dateOfSurgery}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              <ThemedText style={styles.submitButtonText}>Add Surgical History</ThemedText>
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
    backgroundColor: theme.colors.warningLight,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.warning,
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
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    fontSize: 15,
    color: theme.colors.textPrimary,
    minHeight: 100,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    minHeight: 50,
  },
  dateButtonText: {
    fontSize: 15,
    color: theme.colors.textMuted,
  },
  dateButtonTextFilled: {
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  examplesContainer: {
    marginTop: theme.spacing.md,
  },
  examplesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  examplesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  exampleChip: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  exampleText: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    fontWeight: '500',
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
    backgroundColor: theme.colors.warning,
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